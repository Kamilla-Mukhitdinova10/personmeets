const Router = require('express');
const router = new Router();
const quizController = require('../controllers/quizController');

router.get('/quiz', quizController.getQuiz);
router.post('/quiz/submit', quizController.submitQuiz);

module.exports = router;
