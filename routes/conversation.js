const router = require('express').Router();
const conversationController = require('../controllers/conversation-controller');

router.post('/', conversationController.createConversation);

router.get('/:userId', conversationController.getConversation);

module.exports = router;
