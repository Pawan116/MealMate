const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ================= REGISTER ================= */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let studentId = null;

    // Auto-generate Student ID for students
    if (role === "student") {
      const yearPrefix = new Date().getFullYear().toString().slice(-2);

      const studentsThisYear = await User.find({
        role: "student",
        studentId: new RegExp(`^${yearPrefix}\\d{5}$`)
      }).select("studentId");

      let maxSerial = 0;
      for (const student of studentsThisYear) {
        const sid = student.studentId || "";
        const serial = Number(sid.slice(2));
        if (!Number.isNaN(serial) && serial > maxSerial) {
          maxSerial = serial;
        }
      }

      studentId = `${yearPrefix}${String(maxSerial + 1).padStart(5, "0")}`;

      while (await User.findOne({ studentId })) {
        const serial = Number(studentId.slice(2)) + 1;
        studentId = `${yearPrefix}${String(serial).padStart(5, "0")}`;
      }
    }

    if (role === "admin" && !email) {
      return res.status(400).json({ message: "Email is required for admin users" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      password: hashedPassword,
      role
    };

    if (email) {
      userData.email = email.toLowerCase().trim();
    }

    if (studentId) {
      userData.studentId = studentId;
    }

    const user = await User.create(userData);

    res.status(201).json({
      message: "User registered successfully",
      studentId: user.studentId || null
    });

  } catch (error) {
    console.log(error); // 🔥 Debug log
    res.status(500).json({ error: error.message });
  }
};

/* ================= LOGIN ================= */
exports.loginUser = async (req, res) => {
  try {
    const { studentId, email, password } = req.body;

    let user;

    // Support both student & admin login
    if (studentId) {
      user = await User.findOne({ studentId: studentId.trim() });
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    } else {
      return res.status(400).json({ message: "Invalid login data" });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      studentId: user.studentId || null
    });

  } catch (error) {
    console.log(error); // 🔥 Debug
    res.status(500).json({ error: error.message });
  }
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  try {
    const { studentId, newPassword } = req.body;

    if (!studentId || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ studentId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};