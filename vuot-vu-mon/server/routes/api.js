const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gameController = require('../controllers/gameController');
const shopController = require('../controllers/shopController');
const challengeController = require('../controllers/challengeController');
const uploadController = require('../controllers/uploadController');

// Import middleware
const { authenticateToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

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

// Report question issue (Requires auth)
router.post('/game/report_question', authenticateToken, gameController.reportQuestion);

// ============================================
// ADMIN ROUTES (V6)
// ============================================

// Question management (Admin only)
router.post('/admin/questions', authenticateToken, isAdmin, adminController.createQuestion);
router.get('/admin/questions', authenticateToken, isAdmin, adminController.getAllQuestions);
router.get('/admin/questions/:id', authenticateToken, isAdmin, adminController.getQuestionById);
router.put('/admin/questions/:id', authenticateToken, isAdmin, adminController.updateQuestion);
router.delete('/admin/questions/:id', authenticateToken, isAdmin, adminController.deleteQuestion);

// User management (Admin only)
router.get('/admin/users', authenticateToken, isAdmin, adminController.getAllUsers);

// Dashboard stats (Admin only)
router.get('/admin/stats', authenticateToken, isAdmin, adminController.getDashboardStats);

// Question reports management (Admin only)
router.get('/admin/question-reports', authenticateToken, isAdmin, adminController.getQuestionReports);
router.put('/admin/question-reports/:id', authenticateToken, isAdmin, adminController.updateQuestionReport);
router.get('/admin/question-reports/stats', authenticateToken, isAdmin, adminController.getQuestionReportStats);

// ============================================
// UPLOAD ROUTES (Admin only)
// ============================================

// Upload single file (image or audio) for questions
router.post('/upload', authenticateToken, isAdmin, upload.single('file'), uploadController.uploadFile);

// Upload multiple files
router.post('/upload/multiple', authenticateToken, isAdmin, upload.array('files', 5), uploadController.uploadMultipleFiles);

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
