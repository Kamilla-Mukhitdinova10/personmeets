const db = require("../db");

class QuizController {
    // GET /quiz – возвращает список вопросов квиза из БД
    async getQuiz(req, res) {
        try {
            const result = await db.query(
                "SELECT id, question, options, correct_option FROM quiz_questions ORDER BY id ASC"
            );
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching quiz questions" });
        }
    }

    // POST /quiz/submit – принимает ответы пользователя и возвращает результат
    async submitQuiz(req, res) {
        try {
            // Ожидаем массив ответов вида: [{ questionId: 1, answer: 0 }, ...]
            const userAnswers = req.body.answers;
            const result = await db.query("SELECT id, correct_option FROM quiz_questions");
            const questions = result.rows;
            let score = 0;
            questions.forEach(q => {
                const userAnswer = userAnswers.find(ans => ans.questionId === q.id);
                if (userAnswer && userAnswer.answer === q.correct_option) {
                    score++;
                }
            });
            res.json({ score, total: questions.length });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error submitting quiz" });
        }
    }
}

module.exports = new QuizController();
