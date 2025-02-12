const db = require("../db")

class followController {
    async followExist(req, res) {
        try {
            if(req.session.user) {
                const follower_id = req.params.id2;
                const followee_id = req.params.id1;
                try {
                    const result = await db.query('SELECT * FROM followers WHERE follower_id = $1 AND followee_id = $2', [follower_id, followee_id])
                    if(result.rows.length > 0) {
                        res.json(true)
                    } else {
                        res.json(false)
                    }
                } catch (error) {
                    res.json(error)
                }
            }
        } catch (error) {
            console.error(error)   
        }
    }

    async follow(req, res) {
        const followerId = req.session.user.id;
        const { followeeId } = req.body;
        try {
            const result = await db.query('INSERT INTO followers (follower_id, followee_id) VALUES ($1, $2)', [followerId, followeeId]);
            res.json({ success: true });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    }

    async unfollow(req, res) {
        const { followeeId } = req.body;
        try {
            const result = await db.query('DELETE FROM followers WHERE follower_id = $1 AND followee_id = $2', [req.session.user.id, followeeId]);
            res.json({ success: true });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new followController();