// routes/quizRoute.js
const Router = require('express');
const router = new Router();
const quizController = require('../controllers/quizController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Список квизов для лекции
router.get('/admin/lectures/:lectureId/quizzes', authenticateToken, authorizeRole('admin'), quizController.getQuizzesByLecture);

// Создать квиз для лекции
router.post('/admin/lectures/:lectureId/quizzes', authenticateToken, authorizeRole('admin'), quizController.createQuiz);

// Получить/обновить/удалить конкретный квиз
router.get('/admin/quizzes/:quizId', authenticateToken, authorizeRole('admin'), quizController.getQuizById);
router.put('/admin/quizzes/:quizId', authenticateToken, authorizeRole('admin'), quizController.updateQuiz);
router.delete('/admin/quizzes/:quizId', authenticateToken, authorizeRole('admin'), quizController.deleteQuiz);


// -------------- QUIZ QUESTIONS (admin) --------------

// Список вопросов квиза
// GET /admin/quizzes/:quizId/questions
router.get('/quizzes/:quizId/questions',
    authenticateToken,
    quizController.getQuestionsByQuiz
  );
  
  // Создать вопрос
  // POST /admin/quizzes/:quizId/questions
  router.post('/admin/quizzes/:quizId/questions',
    authenticateToken,
    authorizeRole('admin'),
    quizController.createQuestion
  );
  
  // Получить/обновить/удалить один вопрос
  // GET /admin/quizzes/:quizId/questions/:questionId
  router.get('/admin/quizzes/:quizId/questions/:questionId',
    authenticateToken,
    authorizeRole('admin'),
    quizController.getQuestionById
  );
  router.put('/admin/quizzes/:quizId/questions/:questionId',
    authenticateToken,
    authorizeRole('admin'),
    quizController.updateQuestion
  );
  router.delete('/admin/quizzes/:quizId/questions/:questionId',
    authenticateToken,
    authorizeRole('admin'),
    quizController.deleteQuestion
  );

// ----- USER PART -----
// GET /lectures/:lectureId/quizzes – публичный/защищённый, если нужно
router.get('/lectures/:lectureId/quizzes', authenticateToken, quizController.getQuizzesByLecture);

// POST /quiz/submit
router.post('/quiz/submit', authenticateToken, quizController.submitQuizAnswers);

// GET /quiz/results – история результатов
router.get('/quiz/results', authenticateToken, quizController.getUserQuizResults);


module.exports = router;
