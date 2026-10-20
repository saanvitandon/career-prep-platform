
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: 60000,
  },
});

const MODEL = "gemini-3.7-flash";

const VALID_LEVELS = [
  "Complete beginner",
  "Some experience",
  "Intermediate",
  "Advanced",
];

const VALID_HOURS = [
  "1–5 hours",
  "6–10 hours",
  "11–20 hours",
  "20+ hours",
];

const VALID_DURATIONS = [
  "4 weeks",
  "8 weeks",
  "12 weeks",
  "16 weeks",
  "6 months",
];

const VALID_PRIORITIES = [
  "Balanced",
  "Get job-ready quickly",
  "Build projects",
  "Interview preparation",
  "Learn fundamentals",
];

// Retry temporary Gemini API failures.
const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(generateRequest, maxRetries = 3) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await generateRequest();
    } catch (error) {
      const status = Number(error.status ?? error.code);
      const isTemporary = [429, 500, 503, 504].includes(status);

      if (!isTemporary || attempt >= maxRetries) {
        throw error;
      }

      const delay = 1000 * 2 ** attempt;

      console.warn(
        `Gemini returned ${status}. Retrying in ${
          delay / 1000
        }s (attempt ${attempt + 1}/${maxRetries})...`
      );

      await sleep(delay);
    }
  }
}

function getWeekCount(duration) {
  if (duration === "6 months") return 24;
  return Number.parseInt(duration, 10);
}

function validateCriteria(body = {}) {
  const {
    role,
    level,
    hours,
    duration,
    priority,
    skills = "",
  } = body;

  if (
    typeof role !== "string" ||
    !role.trim() ||
    role.trim().length > 255
  ) {
    return "Enter a target role of up to 255 characters.";
  }

  if (!VALID_LEVELS.includes(level)) {
    return "Select a valid current skill level.";
  }

  if (!VALID_HOURS.includes(hours)) {
    return "Select a valid weekly availability.";
  }

  if (!VALID_DURATIONS.includes(duration)) {
    return "Select a valid roadmap duration.";
  }

  if (!VALID_PRIORITIES.includes(priority)) {
    return "Select a valid preparation priority.";
  }

  if (typeof skills !== "string" || skills.length > 2000) {
    return "Existing skills must be text of at most 2,000 characters.";
  }

  return null;
}

function normalizeRoadmap(roadmap, expectedWeeks) {
  if (
    !roadmap ||
    typeof roadmap !== "object" ||
    typeof roadmap.title !== "string" ||
    typeof roadmap.overview !== "string" ||
    !Array.isArray(roadmap.weeks) ||
    roadmap.weeks.length !== expectedWeeks
  ) {
    throw new Error("The AI returned an invalid roadmap structure.");
  }

  const weeks = roadmap.weeks.map((week, index) => {
    if (
      !week ||
      typeof week !== "object" ||
      !Array.isArray(week.tasks) ||
      week.tasks.length === 0
    ) {
      throw new Error(`Week ${index + 1} has no valid tasks.`);
    }

    const tasks = week.tasks.map((task, taskIndex) => {
      if (
        !task ||
        typeof task.title !== "string" ||
        typeof task.description !== "string"
      ) {
        throw new Error(
          `Week ${index + 1} contains an invalid task.`
        );
      }

      const rawHours = Number(task.hours);
      const hours =
        Number.isFinite(rawHours) && rawHours > 0
          ? Math.min(Math.round(rawHours * 10) / 10, 40)
          : 1;

      return {
        id: `w${index + 1}-t${taskIndex + 1}`,
        title: task.title.slice(0, 200),
        description: task.description.slice(0, 1500),
        hours,
        resourceTitle:
          typeof task.resourceTitle === "string"
            ? task.resourceTitle.slice(0, 200)
            : "",
        resourceUrl:
          typeof task.resourceUrl === "string" &&
          /^https?:\/\//i.test(task.resourceUrl)
            ? task.resourceUrl.slice(0, 1000)
            : "",
      };
    });

    const weekNumber = index + 1;

    return {
      week: weekNumber,
      phase:
        typeof week.phase === "string"
          ? week.phase.slice(0, 120)
          : `Phase ${Math.ceil(weekNumber / 3)}`,
      title:
        typeof week.title === "string"
          ? week.title.slice(0, 200)
          : `Week ${weekNumber}`,
      description:
        typeof week.description === "string"
          ? week.description.slice(0, 1500)
          : "",
      deliverable:
        typeof week.deliverable === "string"
          ? week.deliverable.slice(0, 1000)
          : "",
      tasks,
    };
  });

  return {
    title: roadmap.title.slice(0, 255),
    overview: roadmap.overview.slice(0, 3000),
    weeks,
  };
}

function calculateCompletedWeeks(roadmap, completedTasks) {
  if (!roadmap || !Array.isArray(roadmap.weeks)) return [];

  const completed = new Set(completedTasks);

  return roadmap.weeks
    .filter(
      (week) =>
        week.tasks.length > 0 &&
        week.tasks.every((task) => completed.has(task.id))
    )
    .map((week) => week.week);
}

function validTaskIds(roadmap) {
  if (!roadmap || !Array.isArray(roadmap.weeks)) {
    return new Set();
  }

  return new Set(
    roadmap.weeks.flatMap((week) =>
      week.tasks.map((task) => task.id)
    )
  );
}

async function ensureProgressRow(userId) {
  await pool.query(
    `INSERT INTO roadmap_progress
       (user_id, completed_weeks, completed_tasks)
     VALUES ($1, '{}', '{}')
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

async function readProgress(userId) {
  await ensureProgressRow(userId);

  const result = await pool.query(
    `SELECT roadmap, criteria, completed_tasks, completed_weeks, updated_at
     FROM roadmap_progress
     WHERE user_id = $1`,
    [userId]
  );

  const row = result.rows[0];
  const roadmap = row.roadmap;
  const completedTasks = Array.isArray(row.completed_tasks)
    ? row.completed_tasks
    : [];

  return {
    success: true,
    roadmap,
    criteria: row.criteria,
    completedTasks,
    completedWeeks: calculateCompletedWeeks(
      roadmap,
      completedTasks
    ),
    updatedAt: row.updated_at,
  };
}

// GET /api/roadmap
// Load the user's saved roadmap and progress.
router.get("/", authMiddleware, async (req, res) => {
  try {
    return res.json(await readProgress(req.user.userId));
  } catch (error) {
    console.error("Load roadmap error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load your roadmap.",
    });
  }
});

// POST /api/roadmap/generate
// Generate a personalized roadmap with Gemini and save it.
router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const validationError = validateCriteria(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is not configured on the server.",
      });
    }

    const {
      role,
      level,
      hours,
      duration,
      priority,
      skills = "",
    } = req.body;

    const expectedWeeks = getWeekCount(duration);

    const prompt = `
You are a practical career mentor creating a personalized learning roadmap.

Create a roadmap for:
- Target role: ${role.trim()}
- Current skill level: ${level}
- Available time: ${hours} per week
- Duration: ${duration} (${expectedWeeks} weeks)
- Main priority: ${priority}
- Existing skills and preferences: ${skills.trim() || "Not specified"}

Requirements:
1. Return exactly ${expectedWeeks} weeks, numbered sequentially from 1.
2. Tailor topics and tasks to the target role, skill level, priority and existing skills.
3. Make each task concrete, actionable and achievable.
4. Respect the user's available weekly hours. The sum of task hours in a week should fit the selected time budget as closely as possible.
5. Each week must have a title, phase, description, deliverable and 2–5 tasks.
6. Every task must have a title, description, estimated hours, resourceTitle and resourceUrl.
7. Resource URLs should be real, well-known official documentation or learning resources that you are confident exist. If uncertain, use an empty string instead of inventing a URL.
8. Sequence learning sensibly. Include practical work and measurable outcomes.
9. Avoid generic filler and repeated tasks.
10. Do not claim that the user has mastered a skill before completing the relevant work.
11. Return JSON only, with no Markdown fences or surrounding explanation.

Use this exact JSON structure:
{
  "title": "A concise roadmap title",
  "overview": "A personalized overview",
  "weeks": [
    {
      "week": 1,
      "phase": "Phase name",
      "title": "Week title",
      "description": "Weekly goal",
      "deliverable": "A concrete outcome",
      "tasks": [
        {
          "title": "Task title",
          "description": "Specific instructions",
          "hours": 2,
          "resourceTitle": "Official documentation or resource",
          "resourceUrl": "https://..."
        }
      ]
    }
  ]
}
`;

    const response = await generateWithRetry(() =>
      ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      })
    );

    const responseText = response.text;

    if (
      typeof responseText !== "string" ||
      !responseText.trim()
    ) {
      throw new Error("Gemini returned an empty response.");
    }

    let parsed;

    try {
      parsed = JSON.parse(responseText);
    } catch {
      throw new Error("Gemini returned invalid JSON.");
    }

    const roadmap = normalizeRoadmap(parsed, expectedWeeks);

    const criteria = {
      role: role.trim(),
      level,
      hours,
      duration,
      priority,
      skills: skills.trim(),
    };

    const userId = req.user.userId;

    const result = await pool.query(
      `INSERT INTO roadmap_progress
         (user_id, roadmap, criteria, completed_tasks, completed_weeks, updated_at)
       VALUES ($1, $2::jsonb, $3::jsonb, '{}', '{}', CURRENT_TIMESTAMP)
       ON CONFLICT (user_id)
       DO UPDATE SET
         roadmap = EXCLUDED.roadmap,
         criteria = EXCLUDED.criteria,
         completed_tasks = '{}',
         completed_weeks = '{}',
         updated_at = CURRENT_TIMESTAMP
       RETURNING roadmap, criteria, completed_tasks, completed_weeks, updated_at`,
      [
        userId,
        JSON.stringify(roadmap),
        JSON.stringify(criteria),
      ]
    );

    const saved = result.rows[0];

    return res.json({
      success: true,
      message: "Your personalized roadmap has been generated.",
      roadmap: saved.roadmap,
      criteria: saved.criteria,
      completedTasks: saved.completed_tasks ?? [],
      completedWeeks: [],
      updatedAt: saved.updated_at,
    });
  } catch (error) {
    console.error("Generate roadmap error:", error);

    const message =
      error.message?.includes("invalid roadmap") ||
      error.message?.includes("returned an empty") ||
      error.message?.includes("returned invalid JSON") ||
      error.message?.includes("has no valid tasks")
        ? error.message
        : "Unable to generate your roadmap. Please try again.";

    return res.status(502).json({
      success: false,
      message,
    });
  }
});

// PUT /api/roadmap/progress
// Save completed task IDs; completed weeks are calculated on the server.
router.put("/progress", authMiddleware, async (req, res) => {
  try {
    const { completedTasks } = req.body;

    if (
      !Array.isArray(completedTasks) ||
      !completedTasks.every(
        (id) => typeof id === "string" && id.length <= 100
      ) ||
      new Set(completedTasks).size !== completedTasks.length
    ) {
      return res.status(400).json({
        success: false,
        message: "completedTasks must be an array of unique task IDs.",
      });
    }

    const userId = req.user.userId;
    const current = await readProgress(userId);

    if (!current.roadmap) {
      return res.status(409).json({
        success: false,
        message: "Generate a roadmap before saving progress.",
      });
    }

    const allowedIds = validTaskIds(current.roadmap);

    if (!completedTasks.every((id) => allowedIds.has(id))) {
      return res.status(400).json({
        success: false,
        message: "Some task IDs do not belong to your saved roadmap.",
      });
    }

    const completedWeeks = calculateCompletedWeeks(
      current.roadmap,
      completedTasks
    );

    const result = await pool.query(
      `UPDATE roadmap_progress
       SET completed_tasks = $2,
           completed_weeks = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING updated_at`,
      [userId, completedTasks, completedWeeks]
    );

    return res.json({
      success: true,
      message: "Roadmap progress saved.",
      completedTasks,
      completedWeeks,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    console.error("Save roadmap progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save roadmap progress.",
    });
  }
});

// PUT /api/roadmap
// Backward-compatible endpoint for callers saving completed week numbers.
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { completedWeeks } = req.body;
    const userId = req.user.userId;
    const current = await readProgress(userId);

    if (!current.roadmap) {
      return res.status(409).json({
        success: false,
        message: "Generate a roadmap before saving progress.",
      });
    }

    const totalWeeks = current.roadmap.weeks.length;

    if (
      !Array.isArray(completedWeeks) ||
      !completedWeeks.every(
        (week) =>
          Number.isInteger(week) &&
          week >= 1 &&
          week <= totalWeeks
      ) ||
      new Set(completedWeeks).size !== completedWeeks.length
    ) {
      return res.status(400).json({
        success: false,
        message: `completedWeeks must contain unique integers from 1 to ${totalWeeks}.`,
      });
    }

    const completedTasks = current.roadmap.weeks
      .filter((week) => completedWeeks.includes(week.week))
      .flatMap((week) => week.tasks.map((task) => task.id));

    const calculatedWeeks = calculateCompletedWeeks(
      current.roadmap,
      completedTasks
    );

    const result = await pool.query(
      `UPDATE roadmap_progress
       SET completed_tasks = $2,
           completed_weeks = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING updated_at`,
      [userId, completedTasks, calculatedWeeks]
    );

    return res.json({
      success: true,
      message: "Roadmap progress saved.",
      completedTasks,
      completedWeeks: calculatedWeeks,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    console.error("Save legacy roadmap progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save roadmap progress.",
    });
  }
});

// POST /api/roadmap/reset
// Keep the saved roadmap, but clear all task and week progress.
router.post("/reset", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `INSERT INTO roadmap_progress
         (user_id, completed_weeks, completed_tasks, updated_at)
       VALUES ($1, '{}', '{}', CURRENT_TIMESTAMP)
       ON CONFLICT (user_id)
       DO UPDATE SET
         completed_tasks = '{}',
         completed_weeks = '{}',
         updated_at = CURRENT_TIMESTAMP
       RETURNING roadmap, criteria, completed_tasks, completed_weeks, updated_at`,
      [userId]
    );

    const saved = result.rows[0];

    return res.json({
      success: true,
      message: "Roadmap progress reset.",
      roadmap: saved.roadmap,
      criteria: saved.criteria,
      completedTasks: [],
      completedWeeks: [],
      updatedAt: saved.updated_at,
    });
  } catch (error) {
    console.error("Reset roadmap progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset roadmap progress.",
    });
  }
});

export default router;
