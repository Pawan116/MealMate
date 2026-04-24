const Meal = require("../models/meal");

// 📅 Helper: Get today's date
const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

// 🍽️ MARK MEAL (CREATE OR UPDATE)
exports.markMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { breakfast, lunch, dinner, status } = req.body;

    const today = getTodayDate();

    let meal = await Meal.findOne({ userId, date: today });

    // 🧠 If going home → override meals
    if (status === "going_home") {
      meal = await Meal.findOneAndUpdate(
        { userId, date: today },
        {
          breakfast: false,
          lunch: false,
          dinner: false,
          status: "going_home"
        },
        { new: true, upsert: true }
      );

      return res.json(meal);
    }

    // 🔁 UPSERT LOGIC
    meal = await Meal.findOneAndUpdate(
      { userId, date: today },
      {
        breakfast,
        lunch,
        dinner,
        status: "active"
      },
      { new: true, upsert: true }
    );

    res.json(meal);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📊 GET TODAY MEAL (STUDENT)
exports.getTodayMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getTodayDate();

    const meal = await Meal.findOne({ userId, date: today });

    res.json(meal || { message: "No meal marked today" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📈 ADMIN DASHBOARD
exports.getDashboard = async (req, res) => {
  try {
    const today = getTodayDate();

    const meals = await Meal.find({ date: today });

    let breakfastCount = 0;
    let lunchCount = 0;
    let dinnerCount = 0;

    meals.forEach(m => {
      if (m.breakfast) breakfastCount++;
      if (m.lunch) lunchCount++;
      if (m.dinner) dinnerCount++;
    });

    res.json({
      totalStudents: meals.length,
      breakfastCount,
      lunchCount,
      dinnerCount
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET all students' meals for today (Admin)
exports.getAllMeals = async (req, res) => {
  try {
    const today = getTodayDate();
    const meals = await Meal.find({ date: today }).populate("userId", "name email studentId");
    res.json(meals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};