import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import roadmapRoutes from "./routes/roadmap.js";
import interviewRoutes from "./routes/interview.js";
import { pool } from "./db.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import resumeRoutes from "./routes/resume.js";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);

app.use("/api/resume", resumeRoutes);

app.use("/api/roadmap", roadmapRoutes);

// Basic health-check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Placement Copilot backend is running!",
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database()");
    res.json({
      success: true,
      database: result.rows[0].current_database,
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.get("/api/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await pool.query(
      `SELECT id, full_name, email, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    const [
      resumeStatsResult,
      matchStatsResult,
      roadmapResult,
      resumeActivityResult,
      matchActivityResult,
    ] = await Promise.all([
      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total_analyses,
           (
             SELECT ats_score
             FROM resume_analyses
             WHERE user_id = $1
             ORDER BY created_at DESC, id DESC
             LIMIT 1
           ) AS latest_ats_score
         FROM resume_analyses
         WHERE user_id = $1`,
        [userId]
      ),

      pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total_matches,
           (
             SELECT match_score
             FROM resume_matches
             WHERE user_id = $1
             ORDER BY created_at DESC, id DESC
             LIMIT 1
           ) AS latest_match
         FROM resume_matches
         WHERE user_id = $1`,
        [userId]
      ),

      pool.query(
        `SELECT completed_weeks
         FROM roadmap_progress
         WHERE user_id = $1`,
        [userId]
      ),

      pool.query(
        `SELECT id, file_name, ats_score, created_at
         FROM resume_analyses
         WHERE user_id = $1
         ORDER BY created_at DESC, id DESC
         LIMIT 5`,
        [userId]
      ),

      pool.query(
        `SELECT id, file_name, match_score, created_at
         FROM resume_matches
         WHERE user_id = $1
         ORDER BY created_at DESC, id DESC
         LIMIT 5`,
        [userId]
      ),
    ]);

    const user = userResult.rows[0];
    const resumeStats = resumeStatsResult.rows[0];
    const matchStats = matchStatsResult.rows[0];

    const completedWeeks =
      roadmapResult.rows[0]?.completed_weeks ?? [];

    const totalWeeks = 8;

    const resumeActivity = resumeActivityResult.rows.map((item) => ({
      id: `resume-${item.id}`,
      type: "resume_analysis",
      title: "Resume analyzed",
      description: `${item.file_name} · ATS score: ${item.ats_score}/100`,
      createdAt: item.created_at,
    }));

    const matchActivity = matchActivityResult.rows.map((item) => ({
      id: `match-${item.id}`,
      type: "resume_match",
      title: "Resume matched",
      description: `${item.file_name} · ${item.match_score}% match`,
      createdAt: item.created_at,
    }));

    const recentActivity = [...resumeActivity, ...matchActivity]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    return res.json({
      success: true,

      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        createdAt: user.created_at,
      },

      stats: {
        latestAtsScore: resumeStats.latest_ats_score,
        totalResumeAnalyses: resumeStats.total_analyses,
        latestMatch: matchStats.latest_match,
        totalMatches: matchStats.total_matches,
        preparationProgress: Math.round(
          (completedWeeks.length / totalWeeks) * 100
        ),
        completedWeeks: completedWeeks.length,
        totalWeeks,
      },

      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard data.",
    });
  }
});


app.get("/api/gemini-test", async (req, res) => {
  try {
    const response = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: "Reply with exactly: Gemini connection successful.",
    });

    res.json({
      success: true,
      message: response.output_text,
    });
  } catch (error) {
    console.error("Gemini test error:", error.message);

    res.status(500).json({
      success: false,
      message: "Gemini connection failed. Check the backend terminal.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Placement Copilot API running at http://localhost:${PORT}`);
});
