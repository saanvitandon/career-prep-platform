
import express from "express";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const QUESTION_BANK = {
  Technical: {
    Easy: [
      {
        question: "What is the difference between a process and a thread?",
        tip: "Explain memory isolation, resource sharing, and context switching.",
        keywords: ["process", "thread", "memory", "resources"],
      },
      {
        question: "What is the difference between an array and a linked list?",
        tip: "Compare memory layout, access time, insertion, and deletion.",
        keywords: ["array", "linked list", "memory", "access"],
      },
      {
        question: "What is a primary key in a database?",
        tip: "Discuss uniqueness, NULL values, and its role in identifying records.",
        keywords: ["unique", "null", "record", "table"],
      },
      {
        question: "What is the difference between GET and POST in REST APIs?",
        tip: "Explain their intended purposes, request bodies, and HTTP semantics.",
        keywords: ["get", "post", "http", "request"],
      },
      {
        question: "What is object-oriented programming?",
        tip: "Describe encapsulation, inheritance, polymorphism, and abstraction.",
        keywords: ["encapsulation", "inheritance", "polymorphism", "abstraction"],
      },
    ],
    Medium: [
      {
        question: "How would you optimize a slow SQL query?",
        tip: "Discuss execution plans, indexing, filtering, joins, and unnecessary columns.",
        keywords: ["execution plan", "index", "query", "filter"],
      },
      {
        question: "How would you design a scalable REST API?",
        tip: "Cover resource-oriented endpoints, validation, authentication, pagination, and error handling.",
        keywords: ["endpoint", "validation", "authentication", "pagination"],
      },
      {
        question: "Explain database normalization and when denormalization may help.",
        tip: "Discuss redundancy, functional dependencies, normal forms, and read performance.",
        keywords: ["redundancy", "normalization", "functional dependency", "performance"],
      },
      {
        question: "What happens when a user enters a URL in a browser?",
        tip: "Walk through DNS, connection establishment, HTTP, server processing, and rendering.",
        keywords: ["dns", "http", "server", "browser"],
      },
      {
        question: "How would you debug an API that returns intermittent errors?",
        tip: "Explain reproduction, logs, status codes, dependencies, and systematic testing.",
        keywords: ["logs", "status code", "debugging", "testing"],
      },
    ],
    Hard: [
      {
        question: "How would you design a URL-shortening service?",
        tip: "Discuss identifiers, storage, collision handling, redirects, caching, and scaling.",
        keywords: ["identifier", "database", "cache", "scaling"],
      },
      {
        question: "How would you prevent race conditions in a concurrent system?",
        tip: "Explain shared state, locks, atomic operations, transactions, and trade-offs.",
        keywords: ["race condition", "lock", "atomic", "concurrency"],
      },
      {
        question: "How would you design a rate limiter for an API?",
        tip: "Compare token bucket, sliding window, distributed counters, and storage choices.",
        keywords: ["token bucket", "sliding window", "distributed", "counter"],
      },
      {
        question: "Explain database indexing trade-offs in a high-write application.",
        tip: "Consider read speed, write overhead, storage, selectivity, and index choice.",
        keywords: ["index", "write", "storage", "selectivity"],
      },
      {
        question: "How would you investigate a production service with high latency?",
        tip: "Discuss metrics, traces, profiling, bottlenecks, dependencies, and mitigation.",
        keywords: ["metrics", "tracing", "profiling", "latency"],
      },
    ],
  },

  Behavioral: {
    Easy: [
      {
        question: "Tell me about yourself.",
        tip: "Connect your education, relevant skills, projects, and career goals.",
        keywords: ["education", "skills", "projects", "goals"],
      },
      {
        question: "Describe a project you enjoyed working on.",
        tip: "Explain the goal, your contribution, technologies, and outcome.",
        keywords: ["project", "contribution", "technology", "outcome"],
      },
      {
        question: "How do you manage competing deadlines?",
        tip: "Explain prioritization, planning, communication, and progress tracking.",
        keywords: ["prioritization", "planning", "communication", "deadlines"],
      },
      {
        question: "What is one skill you are currently improving?",
        tip: "Be specific about the skill, your practice routine, and progress.",
        keywords: ["skill", "practice", "progress", "learning"],
      },
      {
        question: "How do you respond to constructive feedback?",
        tip: "Describe how you listen, clarify, act, and learn from feedback.",
        keywords: ["feedback", "listen", "action", "improvement"],
      },
    ],
    Medium: [
      {
        question: "Tell me about a challenging project you worked on.",
        tip: "Use STAR: situation, task, action, and result. Clarify your individual contribution.",
        keywords: ["situation", "task", "action", "result"],
      },
      {
        question: "Describe a disagreement with a teammate and how you handled it.",
        tip: "Focus on respectful communication, evidence, compromise, and the outcome.",
        keywords: ["communication", "conflict", "collaboration", "resolution"],
      },
      {
        question: "Tell me about a mistake you made and what you learned.",
        tip: "Take responsibility and explain the concrete change you made afterward.",
        keywords: ["mistake", "responsibility", "learning", "improvement"],
      },
      {
        question: "Describe a time you took initiative without being asked.",
        tip: "Explain the problem you noticed, the action you took, and its impact.",
        keywords: ["initiative", "problem", "action", "impact"],
      },
      {
        question: "How have you handled an unfamiliar technical problem?",
        tip: "Describe research, experimentation, testing, and when you sought help.",
        keywords: ["research", "experimentation", "testing", "learning"],
      },
    ],
    Hard: [
      {
        question: "Describe a decision you made with incomplete information.",
        tip: "Explain assumptions, risks, alternatives, communication, and what you learned.",
        keywords: ["assumptions", "risks", "alternatives", "decision"],
      },
      {
        question: "Tell me about a time you influenced a team without authority.",
        tip: "Show how you built trust, used evidence, listened, and gained agreement.",
        keywords: ["influence", "evidence", "trust", "agreement"],
      },
      {
        question: "Describe a failure that significantly changed your approach.",
        tip: "Be honest about the failure and explain lasting changes to your process.",
        keywords: ["failure", "responsibility", "learning", "change"],
      },
      {
        question: "How would you handle a deadline you believe is unrealistic?",
        tip: "Discuss scope, risks, alternatives, transparent communication, and negotiation.",
        keywords: ["scope", "risks", "communication", "priorities"],
      },
      {
        question: "Tell me about a time you balanced quality with speed.",
        tip: "Explain trade-offs, minimum quality standards, risks, and follow-up improvements.",
        keywords: ["trade-offs", "quality", "risks", "delivery"],
      },
    ],
  },

  HR: {
    Easy: [
      {
        question: "Why do you want this role?",
        tip: "Connect your interests and strengths to the responsibilities of the role.",
        keywords: ["interests", "strengths", "responsibilities", "goals"],
      },
      {
        question: "What are your strengths?",
        tip: "Choose relevant strengths and support them with concrete examples.",
        keywords: ["strengths", "examples", "skills", "contribution"],
      },
      {
        question: "Where do you see yourself in three years?",
        tip: "Describe realistic professional growth and the skills you want to develop.",
        keywords: ["growth", "skills", "learning", "goals"],
      },
      {
        question: "Why should we hire you as an intern?",
        tip: "Highlight relevant skills, learning ability, projects, and willingness to contribute.",
        keywords: ["skills", "projects", "learning", "contribution"],
      },
      {
        question: "What do you know about our company?",
        tip: "Research the company's products, customers, mission, and recent work.",
        keywords: ["products", "customers", "mission", "research"],
      },
    ],
    Medium: [
      {
        question: "Why should we choose you over other candidates?",
        tip: "Focus on evidence of relevant skills and your potential contribution, not comparisons.",
        keywords: ["skills", "evidence", "projects", "contribution"],
      },
      {
        question: "Tell me about a time you worked under pressure.",
        tip: "Use a specific example and explain how you prioritized and delivered.",
        keywords: ["pressure", "prioritization", "communication", "result"],
      },
      {
        question: "What motivates you to do your best work?",
        tip: "Explain what motivates you and connect it to examples of your work.",
        keywords: ["motivation", "goals", "learning", "impact"],
      },
      {
        question: "How would your teammates describe you?",
        tip: "Choose realistic qualities and support them with an example.",
        keywords: ["teamwork", "communication", "reliability", "example"],
      },
      {
        question: "What would you do if you did not know how to complete a task?",
        tip: "Describe how you clarify requirements, research, experiment, and seek help.",
        keywords: ["clarification", "research", "experimentation", "communication"],
      },
    ],
    Hard: [
      {
        question: "How would you respond if you received another job offer?",
        tip: "Discuss your decision criteria, timelines, professional communication, and priorities.",
        keywords: ["priorities", "criteria", "communication", "decision"],
      },
      {
        question: "What would you do if you disagreed with your manager's decision?",
        tip: "Explain how you raise concerns respectfully, present evidence, and align on next steps.",
        keywords: ["respect", "evidence", "communication", "alignment"],
      },
      {
        question: "How would you handle a task outside your current skill set?",
        tip: "Show ownership, a learning plan, realistic timelines, and appropriate escalation.",
        keywords: ["ownership", "learning", "planning", "communication"],
      },
      {
        question: "Describe your most significant professional weakness.",
        tip: "Choose a genuine development area and explain the actions you take to improve.",
        keywords: ["self-awareness", "development", "action", "improvement"],
      },
      {
        question: "What would make you decline an otherwise attractive offer?",
        tip: "Explain your professional values and priorities constructively and honestly.",
        keywords: ["values", "priorities", "growth", "expectations"],
      },
    ],
  },
};

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

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Choose Easy, Medium, or Hard difficulty.",
      });
    }

    if (!["Technical", "Behavioral", "HR"].includes(questionType)) {
      return res.status(400).json({
        success: false,
        message: "Choose Technical, Behavioral, or HR questions.",
      });
    }

    const bank = QUESTION_BANK[questionType][difficulty];

    // Rotate the question bank so repeated sessions aren't identical.
    const offset = Math.floor(Math.random() * bank.length);
    const selectedQuestions = [...bank.slice(offset), ...bank.slice(0, offset)]
      .slice(0, 5)
      .map(({ question, tip }) => ({ question, tip }));

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
        JSON.stringify(selectedQuestions),
      ]
    );

    return res.status(201).json({
      success: true,
      session: result.rows[0],
    });
  } catch (error) {
    console.error("Generate interview session error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to create an interview session.",
    });
  }
});

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

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, target_role, difficulty, question_type,
              questions, answers, created_at, updated_at
       FROM interview_sessions
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.userId]
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

router.put("/:id/answers", authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;

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
       SET answers = $1::jsonb, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, answers, updated_at`,
      [
        JSON.stringify(answers),
        req.params.id,
        req.user.userId,
      ]
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
