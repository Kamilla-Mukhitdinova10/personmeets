const Router = require('express')
const router = new Router()
const postController = require('../controllers/postController')
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware')

router.get('/post/posts', authenticateToken, postController.getPosts)
router.put('/post/posts/:id', authenticateToken, postController.updatePost)
router.delete('/post/posts/:id', authenticateToken, postController.deletePost)
router.post('/post/addpost', authenticateToken, postController.addPost)
router.get('/post/userpost', authenticateToken, postController.getUserPost)
router.get('/post/onepost/:id', authenticateToken, postController.getUserOnePost)
router.get('/post/like/number/:id', authenticateToken, postController.getLikes)
router.put('/post/like/:id', authenticateToken, postController.likePost)
router.delete('/post/like/:id', authenticateToken, postController.removeLikePost)
router.get('/post/like/exist/:id', authenticateToken, postController.likeExist)

module.exports = router