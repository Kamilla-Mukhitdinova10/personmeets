const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware')

router.get('/profile', userController.getUserInfo)
router.post('/register', userController.createUser)
router.post('/login', userController.logUser)
router.post('/verify', userController.verifyCode);
router.post('/refresh', userController.refreshAccessToken);
router.get('/getUserName', authenticateToken, userController.getUserName)
router.get('/users', authenticateToken,userController.getUsers)
router.get('/usersexcept', authenticateToken,userController.getUsersExceptMe)
router.get('/users/:id', authenticateToken,userController.getUserById)
router.put('/users/:id', authenticateToken, userController.updateUser)
router.delete('/users/:id', authenticateToken, userController.deleteUser)
router.put('/user/updateinf', authenticateToken, userController.updateUserInformation)

module.exports = router