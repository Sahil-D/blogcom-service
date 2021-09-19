const catchAsync = require('../utils/catchAsync');
const messageService = require('../services/messageService');

const createMessage = catchAsync(async (req, res) => {
  const newMesssage = await messageService.createMessage(req.body);
  return { status: 'success', data: newMesssage };
});

const getMessages = catchAsync(async (req, res) => {
  const messages = await messageService.getMessages(req.params.conversationId);
  return { status: 'success', data: messages };
});

module.exports = { createMessage, getMessages };
