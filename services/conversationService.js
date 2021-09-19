const httpStatus = require('http-status');
const { ErrorMessages } = require('../utils/ErrorMessages');
const ApiError = require('../utils/ApiError');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

async function createConversation(reqBody) {
  if (!reqBody.senderId || !reqBody.receiverId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_CREDENTIALS
    );
  }

  const oldConversation = await Conversation.findOne({
    $and: [
      { members: { $in: [reqBody.senderId] } },
      { members: { $in: [reqBody.receiverId] } },
    ],
  });

  if (oldConversation) {
    return oldConversation;
  }

  const newConversation = new Conversation({
    members: [reqBody.senderId, reqBody.receiverId],
  });
  try {
    const savedConversation = await newConversation.save();
    return savedConversation;
  } catch (err) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.ERROR_WHILE_CREATING_CONVERSATION
    );
  }
}

async function getConversation(userId) {
  if (!userId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_CREDENTIALS
    );
  }

  try {
    const user = await User.findById(userId);
    const friendsList = [...user.following, ...user.followers];

    const conversation = await Conversation.find({
      $and: [
        { members: { $in: [userId] } },
        { members: { $in: [...friendsList] } },
      ],
    });
    if (conversation) {
      return conversation;
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        ErrorMessages.CONVERSATION_NOT_FOUND
      );
    }
  } catch (err) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.ERROR_WHILE_FETCHING_CONVERSATION
    );
  }
}

module.exports = { createConversation, getConversation };
