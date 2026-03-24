const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.use(verifyToken, verifyAdmin); // All admin routes require token AND admin role

router.get('/dashboard', adminController.getDashboardStats);

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/courses', adminController.getAdminCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/reorder', adminController.reorderCategories);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

router.get('/rewards', adminController.getAdminRewards);
router.post('/rewards', adminController.createReward);
router.put('/rewards/:id', adminController.updateReward);

router.get('/redeems', adminController.getRedeemRequests);
router.put('/redeems/:id/status', adminController.updateRedeemStatus);

// Lesson Management
router.get('/courses/:courseId/lessons', adminController.getCourseLessons);
router.post('/lessons', adminController.createLesson);
router.put('/lessons/:id', adminController.updateLesson);
router.delete('/lessons/:id', adminController.deleteLesson);

// Quiz Reports
router.get('/courses/:courseId/quiz-reports', adminController.getCourseQuizAttempts);

module.exports = router;
