const Router = require('express')
const router = new Router()
const followController = require('../controllers/followController')
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware')

router.get('/follows/:id1/:id2', authenticateToken, followController.followExist)
router.post('/follows/follow/', authenticateToken, followController.follow)
router.post('/follows/unfollow', authenticateToken, followController.unfollow)

module.exports = router