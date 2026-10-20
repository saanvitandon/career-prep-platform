import express from "express";
import OpenAI from "openai";

import { pool } from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  timeout: 120000,
  defaultHeaders: {
    "X-OpenRouter-Title": "Ascend AI Prep",
  },
});

const MODEL =
  process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"];
const VALID_QUESTION_TYPES = ["Technical", "Behavioral", "HR"];

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(generateRequest, maxRetries = 2) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await generateRequest();
    } catch (error) {
      const status = Number(error.status ?? error.code);
      const isTemporary = [408, 429, 500, 502, 503, 504].includes(status);

      if (!isTemporary || attempt >= maxRetries) {
        throw error;
      }

      const delay = 1000 * 2 ** attempt;

      console.warn(
        `OpenRouter returned ${status}. Retrying in ${
          delay / 1000
        }s (attempt ${attempt + 1}/${maxRetries})...`
      );

      await sleep(delay);
    }
  }
}

// POST /api/interview/generate
// Generate and save a personalized interview session.
router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const { role, difficulty, questionType } = req.body;

    if (
      typeof role !== "string" ||
      !role.trim() ||
      role.trim().length > 255
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a target role of up to 255 characters.",
      });
    }

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Choose Easy, Medium, or Hard difficulty.",
      });
    }

    if (!VALID_QUESTION_TYPES.includes(questionType)) {
      return res.status(400).json({
        success: false,
        message: "Choose Technical, Behavioral, or HR questions.",
      });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "OPENROUTER_API_KEY is not configured on the server.",
      });
    }

    const prompt = `
You are an experienced interviewer creating an interview practice session.

TARGET ROLE: ${role.trim()}
DIFFICULTY: ${difficulty}
QUESTION TYPE: ${questionType}

Generate exactly 5 distinct interview questions for this session.

Requirements:
1. Tailor every question to the exact target role. Do not treat all roles as software engineering roles.
2. For Technical questions, focus on role-specific technical knowledge, practical problem-solving, tools, technologies, and realistic work scenarios.
3. For Behavioral questions, focus on workplace situations, teamwork, ownership, communication, conflict resolution, and decision-making relevant to the role.
4. For HR questions, focus on motivation, role fit, career goals, strengths, and professional judgment relevant to the role.
5. Easy means foundational, Medium means applying knowledge or reasoning through realistic scenarios, and Hard means advanced reasoning, trade-offs, or complex scenarios.
6. Vary the concepts, wording, and scenarios. Avoid generic questions when a role-specific question is possible.
7. Do not repeat the same question in different wording within this session.
8. Include a concise, useful tip for answering each question.
9. Return only valid JSON in the following structure:
{
  "questions": [
    {
      "question": "Question text",
      "tip": "Guidance for answering"
    }
  ]
}
`;

    const response = await generateWithRetry(() =>
      ai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an experienced interviewer. Generate role-specific interview questions and return valid JSON only, following the requested schema.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_object",
        },
        temperature: 0.9,
      })
    );

    const responseText = response.choices?.[0]?.message?.content;
    let generated;

    try {
      if (
        typeof responseText !== "string" ||
        !responseText.trim()
      ) {
        throw new Error("Empty response");
      }

      generated = JSON.parse(responseText);
    } catch {
      console.error(
        "OpenRouter returned invalid interview-question JSON."
      );

      return res.status(502).json({
        success: false,
        message: "The AI returned an invalid response. Please try again.",
      });
    }

    if (
      !Array.isArray(generated.questions) ||
      generated.questions.length !== 5 ||
      !generated.questions.every(
        (item) =>
          item &&
          typeof item.question === "string" &&
          item.question.trim() &&
          typeof item.tip === "string" &&
          item.tip.trim()
      )
    ) {
      return res.status(502).json({
        success: false,
        message:
          "The AI returned an incomplete question set. Please try again.",
      });
    }

    const questions = generated.questions.map((item) => ({
      question: item.question.trim(),
      tip: item.tip.trim(),
    }));

    const result = await pool.query(
      `INSERT INTO interview_sessions
         (user_id, target_role, difficulty, question_type, questions, answers)
       VALUES ($1, $2, $3, $4, $5::jsonb, '[]'::jsonb)
       RETURNING id, target_role, difficulty, question_type,
                 questions, answers, created_at, updated_at`,
      [
        req.user.userId,
        role.trim(),
        difficulty,
        questionType,
        JSON.stringify(questions),
      ]
    );

    return res.status(201).json({
      success: true,
      session: result.rows[0],
    });
  } catch (error) {
    console.error("Generate interview session error:", error);

    const status = Number(error.status ?? error.code);

    if ([408, 429, 500, 502, 503, 504].includes(status)) {
      return res.status(503).json({
        success: false,
        message:
          "The AI service is temporarily busy. Please wait a moment and try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate interview questions. Please try again.",
    });
  }
});

// GET /api/interview/history
// Load the authenticated user's recent interview sessions.
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, target_role, difficulty, question_type,
              jsonb_array_length(questions) AS question_count,
              created_at, updated_at
       FROM interview_sessions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [req.user.userId]
    );

    return res.json({
      success: true,
      sessions: result.rows,
    });
  } catch (error) {
    console.error("Interview history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load interview history.",
    });
  }
});

// DELETE /api/interview/:id
// Delete a session belonging to the authenticated user.
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview session ID.",
      });
    }

    const result = await pool.query(
      `DELETE FROM interview_sessions
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found.",
      });
    }

    return res.json({
      success: true,
      message: "Interview session deleted.",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Delete interview session error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete the interview session.",
    });
  }
});

// GET /api/interview/:id
// Load one interview session belonging to the authenticated user.
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview session ID.",
      });
    }

    const result = await pool.query(
      `SELECT id, target_role, difficulty, question_type,
              questions, answers, created_at, updated_at
       FROM interview_sessions
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found.",
      });
    }

    return res.json({
      success: true,
      session: result.rows[0],
    });
  } catch (error) {
    console.error("Load interview session error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load this interview session.",
    });
  }
});

// PUT /api/interview/:id/answers
// Save answers for an interview session belonging to the authenticated user.
router.put("/:id/answers", authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview session ID.",
      });
    }

    if (
      !Array.isArray(answers) ||
      answers.length > 5 ||
      !answers.every(
        (answer) =>
          typeof answer === "string" && answer.length <= 10000
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array of up to 5 text responses.",
      });
    }

    const result = await pool.query(
      `UPDATE interview_sessions
       SET answers = $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, answers, updated_at`,
      [JSON.stringify(answers), id, req.user.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found.",
      });
    }

    return res.json({
      success: true,
      session: result.rows[0],
    });
  } catch (error) {
    console.error("Save interview answers error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save interview answers.",
    });
  }
});

export default router;
