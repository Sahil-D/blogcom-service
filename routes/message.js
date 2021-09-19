const router = require('express').Router();
const messageController = require('../controllers/message-controller');

router.post('/', messageController.createMessage);

router.get('/:conversationId', messageController.getMessages);

module.exports = router;
