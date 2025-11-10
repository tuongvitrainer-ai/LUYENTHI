const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');

// Import middleware
const { authenticateToken, isAdmin } = require('../middleware/auth');

// ============================================
// AUTH ROUTES
// ============================================

// Public routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);

// Protected routes (require authentication)
router.get('/auth/me', authenticateToken, authController.getMe);

// ============================================
// GAME ROUTES (will be added later)
// ============================================

// router.get('/questions', gameController.getQuestions);
// router.post('/game/submit_result', authenticateToken, gameController.submitResult);

// ============================================
// ADMIN ROUTES (will be added later)
// ============================================

// router.post('/admin/questions', authenticateToken, isAdmin, adminController.createQuestion);

// ============================================
// SHOP ROUTES (will be added later)
// ============================================

// router.get('/shop/items', shopController.getItems);
// router.post('/shop/purchase', authenticateToken, shopController.purchase);

module.exports = router;
