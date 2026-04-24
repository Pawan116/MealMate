const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  studentId: {
    type: String,
    required: function () {
      return this.role !== 'admin';
    }
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student"
  }
}, { timestamps: true });

userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { role: 'admin', email: { $type: 'string' } }
  }
);

userSchema.index(
  { studentId: 1 },
  {
    unique: true,
    partialFilterExpression: { role: 'student', studentId: { $type: 'string' } }
  }
);

module.exports = mongoose.model("User", userSchema);