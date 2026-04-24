const express = require("express");
const router = express.Router();
const { registerUser, loginUser, resetPassword } = require('../controllers/authControllers');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddlewares');

router.post('/login', loginUser);
router.post('/register', authMiddleware, isAdmin, registerUser); // 🔒 protected
router.post("/reset-password", resetPassword);

module.exports = router;