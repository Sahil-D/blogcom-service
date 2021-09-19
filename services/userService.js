const httpStatus = require('http-status');
const bcrypt = require('bcrypt');
const { ErrorMessages } = require('../utils/ErrorMessages');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

async function registerNewUser(reqBody) {
  if (!reqBody.username || !reqBody.email || !reqBody.password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_CREDENTIALS
    );
  }

  const usernameExists = await User.findOne({ username: reqBody.username });
  if (usernameExists) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.USERNAME_ALREADY_REGISTERED
    );
  }

  const emailExists = await User.findOne({ email: reqBody.email });
  if (emailExists) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.EMAIL_ALREADY_REGISTERED
    );
  }

  try {
    // encoding password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(reqBody.password, salt);

    const user = await new User({
      username: reqBody.username,
      email: reqBody.email,
      password: hashedPassword,
    });

    await user.save();
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
}

async function login(email, password) {
  if (!email || !password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_CREDENTIALS
    );
  }

  try {
    const user = await User.findOne({ email: email });
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        ErrorMessages.INVALID_PASSWORD
      );
    }
    return user;
  } catch (err) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.GENERIC_ERROR_MESSAGE
    );
  }
}

async function updateUser(req) {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }

      if (req.body.username) {
        const usernameExists = await User.findOne({
          $and: [
            { _id: { $ne: req.body.userId } },
            { username: req.body.username },
          ],
        });
        if (usernameExists) {
          console.log('ue : ', usernameExists);
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            ErrorMessages.USERNAME_ALREADY_REGISTERED
          );
        }
      }

      if (req.body.email) {
        const emailExists = await User.findOne({
          $and: [{ _id: { $ne: req.body.userId } }, { email: req.body.email }],
        });
        if (emailExists) {
          console.log('ee : ', emailExists);
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            ErrorMessages.EMAIL_ALREADY_REGISTERED
          );
        }
      }

      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });

      return user;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err);
    }
  } else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_CREDENTIALS
    );
  }
}

async function deleteUser(req) {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
    } catch (err) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        ErrorMessages.GENERIC_ERROR_MESSAGE
      );
    }
  } else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_CREDENTIALS
    );
  }
}

async function getUser(req) {
  const userId = req.query.userId;
  const username = req.query.username;
  if (userId || username) {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    return other;
  } else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_CREDENTIALS
    );
  }
}

async function followUser(userId, userToFollow) {
  if (!userId || !userToFollow) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_CREDENTIALS
    );
  }

  const user = await User.findById(userId);
  const toFollow = await User.findById(userToFollow);

  if (user && toFollow && userId !== userToFollow) {
    try {
      if (!user.following.includes(userToFollow)) {
        await user.updateOne({ $push: { following: userToFollow } });
        await toFollow.updateOne({ $push: { followers: userId } });
      }
    } catch {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        ErrorMessages.GENERIC_ERROR_MESSAGE
      );
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, ErrorMessages.USER_NOT_FOUND);
  }
}

async function unfollowUser(userId, userToUnfollow) {
  if (!userId || !userToUnfollow) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_CREDENTIALS
    );
  }

  const user = await User.findById(userId);
  const toUnfollow = await User.findById(userToUnfollow);

  if (user && toUnfollow && userId !== userToUnfollow) {
    try {
      if (user.following.includes(userToUnfollow)) {
        await user.updateOne({ $pull: { following: userToUnfollow } });
        await toUnfollow.updateOne({ $pull: { followers: userId } });
      }
    } catch {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        ErrorMessages.GENERIC_ERROR_MESSAGE
      );
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, ErrorMessages.USER_NOT_FOUND);
  }
}

async function getFriends(userId) {
  if (!userId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_CREDENTIALS
    );
  }

  try {
    const user = await User.findById(userId);
    if (user) {
      const friends = await Promise.all(
        user.following.map((friendId) => {
          return User.findById(friendId);
        })
      );

      let friendsList = [];
      friends.map((friend) => {
        const { _id, username, avatar } = friend;
        friendsList.push({ _id, username, avatar });
      });
      return friendsList;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, ErrorMessages.USER_NOT_FOUND);
    }
  } catch {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.GENERIC_ERROR_MESSAGE
    );
  }
}

async function getUnfollowedUsers(userId) {
  if (!userId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_CREDENTIALS
    );
  }

  try {
    const user = await User.findById(userId);
    if (user) {
      const connectedUsers = [...user.following];

      connectedUsers.push(userId);

      let unconnectedUserList = await User.find({
        $nor: [{ _id: { $in: [...connectedUsers] } }],
      });
      unconnectedUserList = unconnectedUserList.map((user) => {
        const { _id, username, avatar } = user;
        return { _id, username, avatar };
      });
      return unconnectedUserList;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, ErrorMessages.USER_NOT_FOUND);
    }
  } catch {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.GENERIC_ERROR_MESSAGE
    );
  }
}

module.exports = {
  registerNewUser,
  login,
  updateUser,
  deleteUser,
  getUser,
  followUser,
  unfollowUser,
  getFriends,
  getUnfollowedUsers,
};
