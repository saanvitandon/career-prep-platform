import express from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not configured.");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: 60000,
  },
});

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const isPdf =
      file.mimetype === "application/pdf" &&
      file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return callback(new Error("Please upload a PDF file."));
    }

    callback(null, true);
  },
});

const GEMINI_MODEL = "gemini-3.8-flash";

function clampScore(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(number)));
}

function cleanStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseGeminiJson(responseText) {
  if (!responseText || typeof responseText !== "string") {
    throw new Error("Gemini returned an empty response.");
  }

  let text = responseText.trim();

  // Handle JSON surrounded by Markdown code fences, if present.
  text = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Gemini returned an invalid JSON response.");
  }
}

async function generateJson(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("The Gemini API key is not configured.");
  }

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  return parseGeminiJson(response.text);
}

async function extractPdfText(file) {
  if (!file) {
    const error = new Error("Please select a PDF file.");
    error.status = 400;
    throw error;
  }

  if (file.buffer.subarray(0, 5).toString() !== "%PDF-") {
    const error = new Error("The uploaded file is not a valid PDF.");
    error.status = 400;
    throw error;
  }

  const parser = new PDFParse({
    data: file.buffer,
  });

  try {
    const result = await parser.getText();
    const text = result.text?.trim() || "";

    if (!text) {
      const error = new Error(
        "No readable text was found. This PDF may be scanned or image-based."
      );
      error.status = 422;
      throw error;
    }

    return text;
  } finally {
    await parser.destroy().catch(() => {});
  }
}

function getErrorStatus(error) {
  return Number.isInteger(error.status) ? error.status : 500;
}

// ---------------------------------------------------------
// Extract text from an uploaded PDF.
// POST /api/resume/extract
// ---------------------------------------------------------

router.post(
  "/extract",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    try {
      const extractedText = await extractPdfText(req.file);

      return res.json({
        success: true,
        fileName: req.file.originalname,
        characterCount: extractedText.length,
        text: extractedText,
      });
    } catch (error) {
      console.error("Resume extraction error:", error);

      return res.status(getErrorStatus(error)).json({
        success: false,
        message:
          error.message || "Unable to read this PDF. Please try another file.",
      });
    }
  }
);

// ---------------------------------------------------------
// AI-powered resume analysis.
// POST /api/resume/analyze
// ---------------------------------------------------------

router.post(
  "/analyze",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    try {
      const resumeText = await extractPdfText(req.file);

      const prompt = `
You are an experienced resume reviewer helping a job seeker improve
their resume.

Analyze the resume text provided below.

Evaluate:
1. ATS readability and organization.
2. Presence and clarity of common resume sections.
3. Relevance and clarity of skills.
4. Strength of project and work-experience descriptions.
5. Use of action verbs and measurable achievements.
6. Contact information and professional presentation.
7. Specific, realistic improvements the candidate could make.

Rules:
- Do not invent qualifications, experience, or achievements.
- Do not assume missing information is present.
- Be constructive and specific.
- Base the feedback only on the supplied resume.
- Return a score from 0 to 100 representing your estimated
  resume-readiness, not a guaranteed ATS result.
- Treat this as an approximate AI assessment, not a score from
  a particular applicant tracking system.
- Return valid JSON only.

Required JSON structure:
{
  "atsScore": 0,
  "summary": "A concise summary of the assessment",
  "strengths": [
    "Specific strength supported by the resume"
  ],
  "improvements": [
    "Specific, actionable improvement"
  ]
}

Resume text:
${resumeText}
`;

      const result = await generateJson(prompt);

      const score = clampScore(result.atsScore);
      const strengths = cleanStringArray(result.strengths);
      const improvements = cleanStringArray(result.improvements);

      const summary =
        typeof result.summary === "string" && result.summary.trim()
          ? result.summary.trim()
          : "The resume was reviewed using AI. Review the feedback below.";

      if (strengths.length === 0) {
        strengths.push(
          "The resume was successfully processed. Review the assessment for opportunities to improve it."
        );
      }

      if (improvements.length === 0) {
        improvements.push(
          "Compare your resume with the requirements of your target role and make any relevant improvements supported by your actual experience."
        );
      }

      const saved = await pool.query(
        `INSERT INTO resume_analyses
          (user_id, file_name, ats_score, strengths, improvements)
         VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)
         RETURNING id, file_name, ats_score, strengths,
                   improvements, created_at`,
        [
          req.user.userId,
          req.file.originalname,
          score,
          JSON.stringify(strengths),
          JSON.stringify(improvements),
        ]
      );

      const row = saved.rows[0];

      return res.json({
        success: true,
        analysis: {
          id: row.id,
          fileName: row.file_name,
          atsScore: row.ats_score,
          summary,
          strengths: row.strengths,
          improvements: row.improvements,
          createdAt: row.created_at,
          method: "gemini",
        },
      });
    } catch (error) {
      console.error("AI resume analysis error:", error);

      const status = getErrorStatus(error);

      return res.status(status).json({
        success: false,
        message:
          status < 500
            ? error.message
            : "Unable to analyze this resume. Please try again.",
      });
    }
  }
);

// ---------------------------------------------------------
// AI-powered resume/job-description matching.
// POST /api/resume/match
// ---------------------------------------------------------

router.post(
  "/match",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a PDF resume.",
        });
      }

      const jobDescription = req.body.jobDescription?.trim();

      if (!jobDescription || jobDescription.length < 30) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a job description with at least 30 characters.",
        });
      }

      if (jobDescription.length > 20000) {
        return res.status(400).json({
          success: false,
          message: "The job description must not exceed 20,000 characters.",
        });
      }

      const resumeText = await extractPdfText(req.file);

      const prompt = `
You are an experienced recruiter and resume-to-job-description
matching assistant.

Compare the candidate's resume with the job description.

Assess:
1. Overall fit for the role.
2. Relevant skills explicitly demonstrated in the resume.
3. Required or preferred skills that appear to be missing.
4. Relevant experience and project evidence.
5. Qualifications and responsibilities that align.
6. Practical recommendations to improve the resume for this role.

Important rules:
- Evaluate meaning and context, not just exact keyword matches.
- Recognize equivalent terminology when the evidence supports it.
- Do not claim the candidate has a skill merely because the job
  description requests it.
- Do not invent experience, qualifications, or achievements.
- Distinguish an explicitly missing skill from one that is simply
  not demonstrated in the resume.
- Be fair to candidates whose experience is described using
  different wording.
- Scores are estimates based on the supplied text, not predictions
  of hiring outcomes.
- Return valid JSON only.

Return this JSON structure:
{
  "matchScore": 0,
  "skillsMatchScore": 0,
  "keywordMatchScore": 0,
  "matchedSkills": [
    "Relevant skill supported by the resume"
  ],
  "missingSkills": [
    "Relevant job requirement not demonstrated in the resume"
  ],
  "recommendations": [
    "Specific, actionable recommendation"
  ]
}

Scoring guidance:
- matchScore: overall alignment between the resume and role.
- skillsMatchScore: alignment of demonstrated skills with the
  skills and competencies required for the role.
- keywordMatchScore: how well relevant terminology and concepts
  from the job description are represented in the resume.
- All three scores must be integers between 0 and 100.
- matchedSkills and missingSkills should contain concise skill
  names or competencies, not long paragraphs.
- Do not penalize a resume solely because it uses a reasonable
  synonym instead of the exact wording in the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;

      const result = await generateJson(prompt);

      const matchScore = clampScore(result.matchScore);
      const skillsMatchScore = clampScore(result.skillsMatchScore);
      const keywordMatchScore = clampScore(result.keywordMatchScore);

      const matchedSkills = cleanStringArray(result.matchedSkills);
      const missingSkills = cleanStringArray(result.missingSkills);
      const recommendations = cleanStringArray(result.recommendations);

      if (recommendations.length === 0) {
        recommendations.push(
          "Review the job requirements and highlight relevant experience and skills that you can accurately demonstrate."
        );
      }

      const saved = await pool.query(
        `INSERT INTO resume_matches (
           user_id,
           file_name,
           job_description,
           match_score,
           skills_match_score,
           keyword_match_score,
           matched_skills,
           missing_skills,
           recommendations
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb)
         RETURNING id, file_name, match_score, skills_match_score,
                   keyword_match_score, matched_skills, missing_skills,
                   recommendations, created_at`,
        [
          req.user.userId,
          req.file.originalname,
          jobDescription,
          matchScore,
          skillsMatchScore,
          keywordMatchScore,
          JSON.stringify(matchedSkills),
          JSON.stringify(missingSkills),
          JSON.stringify(recommendations),
        ]
      );

      const row = saved.rows[0];

      return res.json({
        success: true,
        result: {
          id: row.id,
          fileName: row.file_name,
          matchScore: row.match_score,
          skillsMatchScore: row.skills_match_score,
          keywordMatchScore: row.keyword_match_score,
          matchedSkills: row.matched_skills,
          missingSkills: row.missing_skills,
          recommendations: row.recommendations,
          createdAt: row.created_at,
        },
      });
    } catch (error) {
      console.error("AI resume matching error:", error);

      const status = getErrorStatus(error);

      return res.status(status).json({
        success: false,
        message:
          status < 500
            ? error.message
            : "Unable to match this resume. Please try again.",
      });
    }
  }
);

export default router;