import express from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { timeout: 60000 },
});

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
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

// Extract text from an uploaded PDF.
router.post(
  "/extract",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    let parser;

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a PDF resume.",
        });
      }

      if (req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
        return res.status(400).json({
          success: false,
          message: "The uploaded file is not a valid PDF.",
        });
      }

      parser = new PDFParse({ data: req.file.buffer });
      const result = await parser.getText();
      const extractedText = result.text?.trim() || "";

      if (!extractedText) {
        return res.status(422).json({
          success: false,
          message:
            "No readable text was found. This PDF may be scanned or image-based.",
        });
      }

      return res.json({
        success: true,
        fileName: req.file.originalname,
        characterCount: extractedText.length,
        text: extractedText,
      });
    } catch (error) {
      console.error("Resume extraction error:", error.message);

      return res.status(422).json({
        success: false,
        message: "Unable to read this PDF. Please try another file.",
      });
    } finally {
      if (parser) {
        await parser.destroy().catch(() => {});
      }
    }
  }
);

// Analyze a resume and save the result in PostgreSQL.
router.post(
  "/analyze",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    let parser;

    // DEBUG LOG: check whether the frontend reaches this route.
    console.log("ANALYZE ROUTE HIT");

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a PDF resume.",
        });
      }

      if (req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
        return res.status(400).json({
          success: false,
          message: "The uploaded file is not a valid PDF.",
        });
      }

      parser = new PDFParse({ data: req.file.buffer });
      const result = await parser.getText();
      const resumeText = result.text?.trim() || "";

      console.log("Resume extracted. Characters:", resumeText.length);

      if (!resumeText) {
        return res.status(422).json({
          success: false,
          message:
            "No readable text found in this PDF. It may be scanned or image-based.",
        });
      }

      const text = resumeText.toLowerCase();
      const strengths = [];
      const improvements = [];
      let score = 40;

      // Check for common resume sections.
      const sections = [
        { name: "education", pattern: /\beducation\b/ },
        {
          name: "experience",
          pattern: /\b(experience|internship|employment)\b/,
        },
        { name: "skills", pattern: /\bskills\b/ },
        { name: "projects", pattern: /\bprojects\b/ },
      ];

      const foundSections = sections.filter((section) =>
        section.pattern.test(text)
      );

      score += foundSections.length * 8;

      if (foundSections.some((s) => s.name === "education")) {
        strengths.push("An education section is present.");
      } else {
        improvements.push("Add a clearly labelled Education section.");
      }

      if (foundSections.some((s) => s.name === "experience")) {
        strengths.push(
          "The resume includes an experience-related section."
        );
      } else {
        improvements.push(
          "Add relevant internships, work experience, or practical experience where applicable."
        );
      }

      if (foundSections.some((s) => s.name === "skills")) {
        strengths.push("A dedicated skills section is present.");
      } else {
        improvements.push(
          "Add a Skills section listing relevant technical and professional skills."
        );
      }

      if (foundSections.some((s) => s.name === "projects")) {
        strengths.push("The resume includes a projects section.");
      } else {
        improvements.push(
          "Consider adding relevant projects with your contributions and technologies used."
        );
      }

      // Check contact information.
      const hasEmail =
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(
          resumeText
        );

      const hasPhone = /(?:\+?\d[\d\s().-]{8,}\d)/.test(
        resumeText
      );

      if (hasEmail) {
        score += 5;
        strengths.push("An email address appears to be included.");
      } else {
        improvements.push(
          "Include a professional email address in your contact information."
        );
      }

      if (hasPhone) {
        score += 3;
      }

      // Check measurable results and action-oriented language.
      const hasNumbers = /\b\d+(?:\.\d+)?%?\b/.test(resumeText);

      const actionVerbs =
        /\b(built|developed|designed|implemented|created|improved|optimized|automated|led|managed|analyzed|deployed|delivered|reduced|increased)\b/i;

      if (hasNumbers) {
        score += 5;
        strengths.push(
          "The resume contains numerical details. Ensure they demonstrate meaningful outcomes."
        );
      } else {
        improvements.push(
          "Where accurate, quantify project outcomes and achievements with numbers or measurable results."
        );
      }

      if (actionVerbs.test(resumeText)) {
        score += 5;
        strengths.push(
          "Action-oriented language appears in the resume."
        );
      } else {
        improvements.push(
          "Start bullet points with clear action verbs describing your contributions."
        );
      }

      // Detect skills using the existing skill dictionary.
      const detectedSkills = findSkills(resumeText);

      if (detectedSkills.length >= 5) {
        score += 8;
        strengths.push(
          `Several relevant skills were detected, including ${detectedSkills
            .slice(0, 5)
            .join(", ")}.`
        );
      } else if (detectedSkills.length > 0) {
        score += 4;
        improvements.push(
          "Consider highlighting additional relevant skills that you genuinely possess."
        );
      } else {
        improvements.push(
          "Make relevant technical and professional skills easier to identify."
        );
      }

      // Check readable content length.
      if (resumeText.length >= 1500) {
        score += 5;
        strengths.push(
          "The resume contains substantial readable content."
        );
      } else if (resumeText.length < 700) {
        improvements.push(
          "The resume contains limited text. Check whether important experience, projects, and achievements are missing."
        );
      }

      score = Math.max(0, Math.min(100, score));

      const summary =
        `Your estimated resume-readiness score is ${score}/100. ` +
        `This rule-based review detected ${foundSections.length} of 4 common resume sections. ` +
        "Use the feedback below to identify areas worth reviewing.";

      if (strengths.length === 0) {
        strengths.push(
          "The resume was successfully read and is ready for a more detailed review."
        );
      }

      if (improvements.length === 0) {
        improvements.push(
          "Review the resume against each job description and tailor relevant experience without adding inaccurate claims."
        );
      }

      console.log("Saving resume analysis to PostgreSQL...");

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

      console.log("Resume analysis saved. ID:", row.id);

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
          method: "rule-based",
        },
      });
    } catch (error) {
      console.error("Resume analysis error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to analyze this resume. Please try again.",
      });
    } finally {
      if (parser) {
        await parser.destroy().catch(() => {});
      }
    }
  }
);

// Normalize text for skill and keyword matching.
function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9+#.]/g, " ");
}

// Find skills from the predefined dictionary.
function findSkills(text) {
  const skills = [
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "c#",
    "sql",
    "postgresql",
    "mysql",
    "mongodb",
    "react",
    "node.js",
    "express.js",
    "html",
    "css",
    "rest api",
    "git",
    "github",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "google cloud",
    "machine learning",
    "data analysis",
    "power bi",
    "tableau",
    "excel",
    "pandas",
    "numpy",
    "tensorflow",
    "pytorch",
    "linux",
    "operating systems",
    "data structures",
    "algorithms",
    "object oriented programming",
    "agile",
    "communication",
    "leadership",
    "problem solving",
  ];

  const normalizedText = normalizeText(text);

  return skills.filter((skill) => {
    const normalizedSkill = normalizeText(skill);
    const escapedSkill = normalizedSkill.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    return new RegExp(`(^| )${escapedSkill}( |$)`).test(
      normalizedText
    );
  });
}

// Rule-based resume matching.
router.post(
  "/match",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    let parser;

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a PDF resume.",
        });
      }

      if (req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
        return res.status(400).json({
          success: false,
          message: "The uploaded file is not a valid PDF.",
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

      parser = new PDFParse({ data: req.file.buffer });
      const pdfResult = await parser.getText();
      const resumeText = pdfResult.text?.trim() || "";

      if (!resumeText) {
        return res.status(422).json({
          success: false,
          message:
            "No readable text was found. This PDF may be scanned or image-based.",
        });
      }

      const resumeSkills = findSkills(resumeText);
      const jobSkills = findSkills(jobDescription);

      const matchedSkills = jobSkills.filter((skill) =>
        resumeSkills.includes(skill)
      );

      const missingSkills = jobSkills.filter(
        (skill) => !resumeSkills.includes(skill)
      );

      const skillsMatchScore =
        jobSkills.length > 0
          ? Math.round(
              (matchedSkills.length / jobSkills.length) * 100
            )
          : 0;

      // Compare keywords in the job description and resume.
      const stopWords = new Set([
        "about", "after", "again", "also", "and", "are", "because",
        "been", "being", "both", "can", "candidate", "could", "each",
        "for", "from", "have", "into", "must", "need", "our",
        "should", "such", "than", "that", "their", "them", "then",
        "there", "these", "they", "this", "those", "through", "using",
        "very", "want", "well", "were", "what", "when", "where",
        "which", "will", "with", "work", "working", "would", "you",
        "your", "role", "team", "experience", "skills", "ability",
        "responsibilities", "requirements", "preferred", "including",
      ]);

      const getKeywords = (input) => {
        const words = normalizeText(input)
          .split(/\s+/)
          .filter(
            (word) =>
              word.length >= 3 &&
              !stopWords.has(word) &&
              !/^\d+$/.test(word)
          );

        return [...new Set(words)];
      };

      const resumeKeywords = new Set(getKeywords(resumeText));
      const jobKeywords = getKeywords(jobDescription);

      const matchedKeywords = jobKeywords.filter((word) =>
        resumeKeywords.has(word)
      );

      const keywordMatchScore =
        jobKeywords.length > 0
          ? Math.round(
              (matchedKeywords.length / jobKeywords.length) * 100
            )
          : 0;

      // Weight skills more heavily than general keywords.
      const matchScore = Math.round(
        skillsMatchScore * 0.7 + keywordMatchScore * 0.3
      );

      const recommendations = [];

      if (missingSkills.length > 0) {
        recommendations.push(
          `Build or demonstrate relevant skills in: ${missingSkills.join(", ")}.`
        );
      }

      if (keywordMatchScore < 60) {
        recommendations.push(
          "Review the job description and include relevant experience and terminology where they accurately reflect your background."
        );
      }

      if (matchedSkills.length > 0) {
        recommendations.push(
          `Highlight your relevant experience with ${matchedSkills
            .slice(0, 5)
            .join(", ")} in your resume.`
        );
      }

      if (recommendations.length === 0) {
        recommendations.push(
          "Your resume contains the skills and keywords detected in this job description. Review the role's responsibilities and tailor your relevant experience."
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
      console.error("Resume matching error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to match this resume. Please try again.",
      });
    } finally {
      if (parser) {
        await parser.destroy().catch(() => {});
      }
    }
  }
);

export default router;