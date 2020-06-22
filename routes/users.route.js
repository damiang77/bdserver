const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

const users_controller = require('../controllers/users.controller');


router.post('/register', users_controller.user_create);
router.get('/me', authenticate.authenticate, users_controller.user_private);
router.post('/login', users_controller.user_login);
router.delete('/logout', authenticate.authenticate, users_controller.user_logout);

module.exports = router;
