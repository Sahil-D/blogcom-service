const catchAsync = require('../utils/catchAsync');
const conversationService = require('../services/conversationService');

const createConversation = catchAsync(async (req, res) => {
  const newConversation = await conversationService.createConversation(
    req.body
  );
  return { status: 'success', data: newConversation };
});

const getConversation = catchAsync(async (req, res) => {
  const conversation = await conversationService.getConversation(
    req.params.userId
  );
  return { status: 'success', data: conversation };
});

module.exports = { createConversation, getConversation };
