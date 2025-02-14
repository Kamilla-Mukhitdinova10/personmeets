const db = require('../db');

class QuizController {
    // [GET] /admin/lectures/:lectureId/quizzes
    async getQuizzesByLecture(req, res) {
        const lectureId = req.params.lectureId;
        try {
            const result = await db.query('SELECT * FROM quizzes WHERE lecture_id=$1 ORDER BY id', [lectureId]);
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching quizzes' });
        }
    }

    // [POST] /admin/lectures/:lectureId/quizzes
    async createQuiz(req, res) {
        const lectureId = req.params.lectureId;
        const { title } = req.body;  // Вместо question, т.к. теперь quiz – это набор вопросов
        try {
            const result = await db.query(
                `INSERT INTO quizzes (lecture_id, title)
                 VALUES ($1, $2)
                 RETURNING *`,
                [lectureId, title]
            );
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error creating quiz' });
        }
    }

    // [GET] /admin/quizzes/:quizId
    async getQuizById(req, res) {
        const quizId = req.params.quizId;
        try {
            const result = await db.query('SELECT * FROM quizzes WHERE id=$1', [quizId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Quiz not found' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching quiz' });
        }
    }

    // [PUT] /admin/quizzes/:quizId
    async updateQuiz(req, res) {
        const quizId = req.params.quizId;
        const { title } = req.body;
        try {
            const result = await db.query(
                `UPDATE quizzes
                 SET title=$1, updated_at=NOW()
                 WHERE id=$2
                 RETURNING *`,
                [title, quizId]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Quiz not found' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error updating quiz' });
        }
    }

    // [DELETE] /admin/quizzes/:quizId
    async deleteQuiz(req, res) {
        const quizId = req.params.quizId;
        try {
            const result = await db.query('DELETE FROM quizzes WHERE id=$1', [quizId]);
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Quiz not found' });
            }
            res.json({ message: 'Quiz deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error deleting quiz' });
        }
    }

    // ---------------- QUIZ QUESTIONS ----------------
    // [GET] /admin/quizzes/:quizId/questions
    // Возвращает список вопросов для одного квиза
    async getQuestionsByQuiz(req, res) {
        const quizId = req.params.quizId;
        try {
            const result = await db.query(`
                SELECT * FROM quiz_questions
                WHERE quiz_id=$1
                ORDER BY id
            `, [quizId]);
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching quiz questions' });
        }
    }

    // [POST] /admin/quizzes/:quizId/questions
    // Создаёт вопрос внутри квиза
    async createQuestion(req, res) {
        const quizId = req.params.quizId;
        const { question, options, correct_option } = req.body;
        try {
            const result = await db.query(
                `INSERT INTO quiz_questions (quiz_id, question, options, correct_option)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [quizId, question, JSON.stringify(options), correct_option]
            );
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error creating quiz question' });
        }
    }

    // [GET] /admin/quizzes/:quizId/questions/:questionId
    // Получить один вопрос
    async getQuestionById(req, res) {
        const quizId = req.params.quizId;
        const questionId = req.params.questionId;
        try {
            const result = await db.query(
                `SELECT * FROM quiz_questions
                 WHERE quiz_id=$1 AND id=$2`,
                [quizId, questionId]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Question not found' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching quiz question' });
        }
    }

    // [PUT] /admin/quizzes/:quizId/questions/:questionId
    // Обновляем вопрос
    async updateQuestion(req, res) {
        const quizId = req.params.quizId;
        const questionId = req.params.questionId;
        const { question, options, correct_option } = req.body;
        try {
            const result = await db.query(
                `UPDATE quiz_questions
                 SET question=$1, options=$2, correct_option=$3, updated_at=NOW()
                 WHERE quiz_id=$4 AND id=$5
                 RETURNING *`,
                [question, JSON.stringify(options), correct_option, quizId, questionId]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Question not found' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error updating quiz question' });
        }
    }

     // Логика: найдем quiz_id для каждого questionId, сверим correct_option, посчитаем score.
    // Запишем одну строку в quiz_results (score, total).
    async submitQuizAnswers(req, res) {
        try {
            // проверяем, что пользователь залогинен
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not logged in' });
            }
            const userId = req.session.user.id;

            const { answers } = req.body; // [{ questionId, answer }, ...]
            if (!answers || !Array.isArray(answers)) {
                return res.status(400).json({ error: 'Invalid answers format' });
            }

            // Получаем quizId (предположим, что все questionId относятся к одному квизу)
            // Можно извлечь quizId из первой записи:
            // или проверить, что действительно все вопросы относятся к одному quizId
            const firstQuestionId = answers[0].questionId;

            // Узнаём, к какому квизу принадлежит этот questionId
            const qQuestion = await db.query(
                `SELECT quiz_id FROM quiz_questions WHERE id=$1`,
                [firstQuestionId]
            );
            if (qQuestion.rows.length === 0) {
                return res.status(400).json({ error: 'Invalid questionId' });
            }
            const quizId = qQuestion.rows[0].quiz_id;

            // Теперь проходимся по всем answers, сверяем
            let score = 0;
            let total = answers.length;

            for (const ans of answers) {
                const questionId = ans.questionId;
                const userAnswer = ans.answer;
                // Получаем правильный ответ из таблицы
                const questionRes = await db.query(`
                    SELECT correct_option FROM quiz_questions
                    WHERE id=$1
                `, [questionId]);
                if (questionRes.rows.length > 0) {
                    const correctOpt = questionRes.rows[0].correct_option;
                    if (userAnswer === correctOpt) {
                        score++;
                    }
                }
            }

            // Вставляем запись в quiz_results (score, total)
            await db.query(`
                INSERT INTO quiz_results (user_id, quiz_id, score, total)
                VALUES ($1, $2, $3, $4)
            `, [userId, quizId, score, total]);

            // Возвращаем результат
            return res.json({ score, total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error submitting quiz answers' });
        }
    }

    // [GET] /quiz/results
    // Возвращает список результатов текущего пользователя
    async getUserQuizResults(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not logged in' });
            }
            const userId = req.session.user.id;
            
            const result = await db.query(`
                SELECT qr.id, qr.quiz_id, qr.score, qr.total, qr.created_at,
                       q.lecture_id
                FROM quiz_results qr
                JOIN quizzes q ON qr.quiz_id = q.id
                WHERE qr.user_id = $1
                ORDER BY qr.created_at DESC
            `, [userId]);

            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching quiz results' });
        }
    }

    // [DELETE] /admin/quizzes/:quizId/questions/:questionId
    async deleteQuestion(req, res) {
        const quizId = req.params.quizId;
        const questionId = req.params.questionId;
        try {
            const result = await db.query(
                `DELETE FROM quiz_questions
                 WHERE quiz_id=$1 AND id=$2`,
                [quizId, questionId]
            );
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Question not found' });
            }
            res.json({ message: 'Question deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error deleting quiz question' });
        }
    }

}

module.exports = new QuizController();
