const httpStatus = require('http-status');
const { ErrorMessages } = require('../utils/ErrorMessages');
const ApiError = require('../utils/ApiError');
const Message = require('../models/Message');

async function createMessage(reqBody) {
  const newMessage = new Message(reqBody);
  try {
    const savedMessage = await newMessage.save();
    return savedMessage;
  } catch (err) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.ERROR_WHILE_CREATING_MESSAGE
    );
  }
}

async function getMessages(conversationId) {
  if (!conversationId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_CREDENTIALS
    );
  }

  try {
    const messages = await Message.find({
      conversationId: conversationId,
    });
    if (messages) {
      return messages;
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        ErrorMessages.MESSAGE_NOT_FOUND
      );
    }
  } catch (err) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.ERROR_WHILE_FETCHING_MESSAGES
    );
  }
}

module.exports = { createMessage, getMessages };
