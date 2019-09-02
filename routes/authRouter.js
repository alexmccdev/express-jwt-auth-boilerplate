const router = require('express').Router();
const authController = require('../controllers/authController');

const { verifyToken } = require('../middleware/token');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Routes that require token
router.use(verifyToken);

router.get('/check', authController.check);

module.exports = router;
