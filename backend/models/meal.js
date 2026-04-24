const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: String,
    required: true
  },
  breakfast: {
    type: Boolean,
    default: false
  },
  lunch: {
    type: Boolean,
    default: false
  },
  dinner: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["active", "going_home"],
    default: "active"
  }
}, { timestamps: true });

module.exports = mongoose.model("Meal", mealSchema);