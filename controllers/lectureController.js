const db = require('../db');

class lectureController {
    // GET /lectures – получить список всех лекций
    async getLectures(req, res) {
        try {
            const result = await db.query('SELECT * FROM lectures ORDER BY id');
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching lectures' });
        }
    }

    // GET /lectures/:id – получить одну лекцию
    async getLectureById(req, res) {
        const lectureId = req.params.id;
        try {
            const result = await db.query('SELECT * FROM lectures WHERE id=$1', [lectureId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Lecture not found' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching lecture' });
        }
    }

    // POST /admin/lectures – создать новую лекцию (только для admin)
    async createLecture(req, res) {
        const { title, description, content, video_url } = req.body;
        try {
            const result = await db.query(
                'INSERT INTO lectures (title, description, content, video_url) VALUES ($1, $2, $3, $4) RETURNING *',
                [title, description, content, video_url]
            );
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error creating lecture' });
        }
    }

    // PUT /admin/lectures/:id – редактировать лекцию
    async updateLecture(req, res) {
        const lectureId = req.params.id;
        const { title, description, content, video_url } = req.body;
        try {
            const result = await db.query(
                'UPDATE lectures SET title=$1, description=$2, content=$3, video_url=$4 WHERE id=$5 RETURNING *',
                [title, description, content, video_url, lectureId]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Lecture not found' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error updating lecture' });
        }
    }

    // DELETE /admin/lectures/:id – удалить лекцию
    async deleteLecture(req, res) {
        const lectureId = req.params.id;
        try {
            const result = await db.query('DELETE FROM lectures WHERE id=$1', [lectureId]);
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Lecture not found' });
            }
            res.json({ message: 'Lecture deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error deleting lecture' });
        }
    }
}

module.exports = new lectureController();
