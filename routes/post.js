const express = require('express');
const postController = require('../controllers/postController');
const replyController = require('../controllers/replyController');
const router = express.Router();

router.get('/write', postController.getWrite);

router.post('/write', postController.postWrite);

router.get('/update/:id', postController.getUpdate);

router.post('/update', postController.postUpdate);

router.post('/delete', postController.delete);

router.post('/reply', replyController.postReply);

router.post('/delete-reply', replyController.deleteReply);

router.get('/:url', postController.getPost);

module.exports = router;
