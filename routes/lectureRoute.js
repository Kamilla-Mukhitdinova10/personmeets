// routes/lectureRoute.js
const Router = require('express');
const router = new Router();
const lectureController = require('../controllers/lectureController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Публичный просмотр лекций:
router.get('/lectures', lectureController.getLectures);
router.get('/lectures/:id', lectureController.getLectureById);

// CRUD операции только для админа:
router.post('/admin/lectures', authenticateToken, authorizeRole('admin'), lectureController.createLecture);
router.put('/admin/lectures/:id', authenticateToken, authorizeRole('admin'), lectureController.updateLecture);
router.delete('/admin/lectures/:id', authenticateToken, authorizeRole('admin'), lectureController.deleteLecture);

module.exports = router;
