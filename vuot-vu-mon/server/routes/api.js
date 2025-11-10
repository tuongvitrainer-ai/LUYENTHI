const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gameController = require('../controllers/gameController');

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
// GAME ROUTES
// ============================================

// Get questions for game/practice
router.get('/game/questions', authenticateToken, gameController.getQuestions);

// Submit answer
router.post('/game/submit_result', authenticateToken, gameController.submitResult);

// Get user's game history
router.get('/game/history', authenticateToken, gameController.getHistory);

// Get user statistics
router.get('/game/stats', authenticateToken, gameController.getStats);

// ============================================
// ADMIN ROUTES
// ============================================

// Question management (Admin only)
router.post('/admin/questions', authenticateToken, isAdmin, adminController.createQuestion);
router.get('/admin/questions', authenticateToken, isAdmin, adminController.getQuestions);
router.put('/admin/questions/:id', authenticateToken, isAdmin, adminController.updateQuestion);
router.delete('/admin/questions/:id', authenticateToken, isAdmin, adminController.deleteQuestion);

// ============================================
// SHOP ROUTES (will be added later)
// ============================================

// router.get('/shop/items', shopController.getItems);
// router.post('/shop/purchase', authenticateToken, shopController.purchase);

module.exports = router;
