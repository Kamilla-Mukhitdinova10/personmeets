const db = require("../db")
const bcrypt = require('bcrypt')
const session = require('express-session')

class postController {
    async getPosts(req, res) {
        try {
            const posts = await db.query('SELECT * FROM posts')
            res.json(posts.rows)
        } catch (error) {
            console.error(error)
            res.status(511).json(error)
        }
    }

    async getUserPost (req, res) {
        try {
            const posts = await db.query('SELECT * FROM posts WHERE userid = $1', [req.session.user.id])
            res.json(posts.rows)
        } catch (error) {
            console.error(error)
            res.status(511).json(error)
        }
    }

    async getLikes(req, res) {
        const postId = req.params.id;
        const userId = req.session.user.id;
        try {
          const result = await db.query('SELECT COUNT(*) AS like_number FROM likes WHERE postid = $1', [postId]);
      
          if (result.rows.length === 1) {
            const likeNumber = result.rows[0].like_number;
            res.json({ likeNumber });
            console.log(likeNumber)
          } else {
            res.status(404).json({ error: 'Post not found' });
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Error retrieving likes' });
        }
    }

    async likeExist(req, res) {
        try {
            const userId = req.session.user.id;
            const postId = req.params.id;
                try {
                    const result = await db.query('SELECT * FROM likes WHERE postid = $1 AND userid = $2', [postId, userId])
                    if(result.rows.length > 0) {
                        res.json(true)
                    } else {
                        res.json(false)
                    }
                } catch (error) {
                    res.json(error)
                }
        }
         catch (error) {
            console.error(error)   
        }
    }


    async removeLikePost(req, res) {
        const postId = req.params.id;
        const userId = req.session.user.id;
        try {
            const result = await db.query('DELETE FROM likes WHERE postid = $1 AND userid =$2', [postId, userId])
            res.json({ message: 'Like removed' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error removing like' });
        }
    }

    async likePost(req, res) {
        const postId = req.params.id;
        const userId = req.session.user.id;
        try {
            const result = await db.query('INSERT INTO likes (userid, postid) VALUES ($1, $2)', [userId, postId])
            console.log(result.rows[0])
            res.json(result.rows[0])
        } catch (error) {
            console.error(error)
            res.json(error)
        }
    }

    async addPost(req, res) {
        const userid = req.session.user.id;
        const { title, description } = req.body;
        try {
            const result = await db.query('INSERT INTO posts (userid, title, description) VALUES ($1, $2, $3)', [userid, title, description])
            res.json(result.rows[0])
        } catch (error) {
            console.error(error)
            res.json(error)
        }
    }

    async updatePost(req, res) {
        const postId = req.params.id;
        const {title, description} = req.body;
        try {
            const post = await db.query('UPDATE posts SET title = $1, description = $2 WHERE id=$3', [title, description, postId])
            res.json(post.rows[0])
        } catch (error) {
            console.error(error)
            res.status(511).json(error)
        }
    }

    async deletePost(req, res) {
        const postId = req.params.id;
        try {
            const result = await db.query('DELETE FROM posts WHERE id = $1', [postId])
            res.json({ message: 'Post deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error deleting post' });
        }
    }
}

module.exports = new postController();
