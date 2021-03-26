const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const indexController = require('../controllers/indexController');

router.get('/login', loginController.getLogin);

router.post('/login', loginController.postLogin);

router.get('/logout', loginController.logout);

router.get('/category/:name', indexController.getCategory);

router.get('/tag/:tag', indexController.getTag);

router.get('/', indexController.getIndex);

module.exports = router;
