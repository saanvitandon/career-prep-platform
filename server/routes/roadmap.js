
import express from "express";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const INITIAL_COMPLETED_WEEKS = [1, 2];

// GET /api/roadmap
// Load the logged-in user's progress.
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Create an initial record if this is the user's first visit.
    await pool.query(
      `INSERT INTO roadmap_progress (user_id, completed_weeks)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, INITIAL_COMPLETED_WEEKS]
    );

    const result = await pool.query(
      `SELECT completed_weeks, updated_at
       FROM roadmap_progress
       WHERE user_id = $1`,
      [userId]
    );

    return res.json({
      success: true,
      completedWeeks: result.rows[0].completed_weeks,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    console.error("Load roadmap error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load roadmap progress.",
    });
  }
});

// PUT /api/roadmap
// Save the user's completed weeks.
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { completedWeeks } = req.body;

    const isValid =
      Array.isArray(completedWeeks) &&
      completedWeeks.every(
        (week) =>
          Number.isInteger(week) && week >= 1 && week <= 8
      ) &&
      new Set(completedWeeks).size === completedWeeks.length;

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message:
          "completedWeeks must contain unique integer values from 1 to 8.",
      });
    }

    const userId = req.user.userId;

    const result = await pool.query(
      `INSERT INTO roadmap_progress
         (user_id, completed_weeks, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id)
       DO UPDATE SET
         completed_weeks = EXCLUDED.completed_weeks,
         updated_at = CURRENT_TIMESTAMP
       RETURNING completed_weeks, updated_at`,
      [userId, completedWeeks]
    );

    return res.json({
      success: true,
      message: "Roadmap progress saved.",
      completedWeeks: result.rows[0].completed_weeks,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    console.error("Save roadmap error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save roadmap progress.",
    });
  }
});

// POST /api/roadmap/reset
// Restore the initial roadmap progress.
router.post("/reset", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `INSERT INTO roadmap_progress
         (user_id, completed_weeks, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id)
       DO UPDATE SET
         completed_weeks = EXCLUDED.completed_weeks,
         updated_at = CURRENT_TIMESTAMP
       RETURNING completed_weeks, updated_at`,
      [userId, INITIAL_COMPLETED_WEEKS]
    );

    return res.json({
      success: true,
      message: "Roadmap progress reset.",
      completedWeeks: result.rows[0].completed_weeks,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    console.error("Reset roadmap error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to reset roadmap progress.",
    });
  }
});

export default router;
