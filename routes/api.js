const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.post('/category/:name', categoryController);

module.exports = router;
