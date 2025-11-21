const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gameController = require('../controllers/gameController');
const shopController = require('../controllers/shopController');
const challengeController = require('../controllers/challengeController');

// Import middleware
const { authenticateToken, isAdmin } = require('../middleware/auth');

// ============================================
// AUTH ROUTES (V6 - GUEST-FIRST)
// ============================================

// Public routes
router.post('/auth/guest', authController.createGuestUser);  // NEW: Tạo guest user
router.post('/auth/register', authController.register);      // Nâng cấp guest → student hoặc tạo mới
router.post('/auth/login', authController.login);           // Đăng nhập thủ công

// Protected routes (require authentication)
router.get('/auth/me', authenticateToken, authController.getMe);
router.put('/auth/profile', authenticateToken, authController.updateProfile);  // Update profile
router.put('/auth/password', authenticateToken, authController.changePassword); // Change password

// ============================================
// GAME ROUTES (V6)
// ============================================

// Get questions for game/practice (PUBLIC - Guest có thể gọi)
router.get('/game/questions', gameController.getQuestions);

// Submit answer (Requires auth)
router.post('/game/submit_result', authenticateToken, gameController.submitResult);

// Get user's game history
router.get('/game/history', authenticateToken, gameController.getHistory);

// Get user statistics
router.get('/game/stats', authenticateToken, gameController.getStats);

// ============================================
// ADMIN ROUTES (V6)
// ============================================

// Question management (Admin only)
router.post('/admin/questions', authenticateToken, isAdmin, adminController.createQuestion);
router.get('/admin/questions', authenticateToken, isAdmin, adminController.getAllQuestions);
// Note: update and delete will be added later if needed

// ============================================
// SHOP ROUTES
// ============================================

// Get all shop items
router.get('/shop/items', authenticateToken, shopController.getItems);

// Purchase an item
router.post('/shop/purchase', authenticateToken, shopController.purchase);

// Get user's purchase history
router.get('/shop/purchases', authenticateToken, shopController.getUserPurchases);

// Get user's inventory
router.get('/shop/inventory', authenticateToken, shopController.getInventory);

// ============================================
// CHALLENGE ROUTES - "Thử thách khởi đầu" Game
// ============================================

// Get questions for test (PUBLIC - no auth required for sandbox testing)
router.get('/challenge/questions/:gradeLevel', challengeController.getQuestions);

// Submit test result (PUBLIC for now - will add auth later)
router.post('/challenge/submit', challengeController.submitTest);

// Get user's test history
router.get('/challenge/history/:userId', challengeController.getHistory);

// Get user statistics for a grade level
router.get('/challenge/stats/:userId/:gradeLevel', challengeController.getStats);

// Get leaderboard for a grade level
router.get('/challenge/leaderboard/:gradeLevel', challengeController.getLeaderboard);

// Get question count by grade level
router.get('/challenge/question-count/:gradeLevel', challengeController.getQuestionCount);

module.exports = router;
