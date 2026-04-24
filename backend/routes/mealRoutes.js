const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddlewares");

const {
  markMeal,
  getTodayMeal,
  getDashboard,
  getAllMeals
} = require("../controllers/mealControllers");

// Student
router.post("/mark", authMiddleware, markMeal);
router.get("/today", authMiddleware, getTodayMeal);
router.get("/all", authMiddleware, getAllMeals);

// Admin
router.get("/dashboard", authMiddleware, getDashboard);

module.exports = router;