const httpStatus = require('http-status');
const { ErrorMessages } = require('../utils/ErrorMessages');
const ApiError = require('../utils/ApiError');
const Post = require('../models/Post');
const User = require('../models/User');

async function createNewPost(reqBody) {
  const newPost = new Post(reqBody);
  try {
    const savedPost = await newPost.save();
    return savedPost;
  } catch (err) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.ERROR_WHILE_CREATING_POST
    );
  }
}

async function updatePost(postId, reqBody) {
  if (postId) {
    try {
      const oldPost = await Post.findById(postId);
      if (oldPost && oldPost.userId === reqBody.userId) {
        await oldPost.updateOne({ $set: reqBody });
        const newPost = await Post.findById(postId);
        return newPost;
      } else {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          ErrorMessages.POST_NOT_FOUND
        );
      }
    } catch (err) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        ErrorMessages.ERROR_WHILE_UPDATING_POST
      );
    }
  } else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.POST_ID_NOT_FOUND_IN_REQUEST
    );
  }
}

async function likePost(postId, reqBody) {
  if (!postId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.POST_ID_NOT_FOUND_IN_REQUEST
    );
  }

  try {
    const post = await Post.findById(postId);
    if (post) {
      if (post.likes.includes(reqBody.userId)) {
        await post.updateOne({ $pull: { likes: reqBody.userId } });
      } else {
        await post.updateOne({ $push: { likes: reqBody.userId } });
      }
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, ErrorMessages.POST_NOT_FOUND);
    }
  } catch (err) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.ERROR_WHILE_LIKE_POST
    );
  }
}

async function deletePost(postId, reqBody) {
  if (!postId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.POST_ID_NOT_FOUND_IN_REQUEST
    );
  }

  try {
    const post = await Post.findById(postId);
    if (post && post.userId === reqBody.userId) {
      try {
        const oldPost = await Post.findByIdAndDelete(postId);
      } catch (err) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          ErrorMessages.GENERIC_ERROR_MESSAGE
        );
      }
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, ErrorMessages.POST_NOT_FOUND);
    }
  } catch (err) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.ERROR_WHILE_DELETING_POST
    );
  }
}

async function getPost(postId, reqBody) {
  if (!postId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.POST_ID_NOT_FOUND_IN_REQUEST
    );
  }

  try {
    const post = await Post.findById(postId);
    if (post && post.userId === reqBody.userId) {
      return post;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, ErrorMessages.POST_NOT_FOUND);
    }
  } catch (err) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.ERROR_WHILE_FETCHING_POST
    );
  }
}

async function getTimeline(userId) {
  if (!userId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_CREDENTIALS
    );
  }

  try {
    const user = await User.findById(userId);
    const userPosts = await Post.find({ userId: userId });
    const friendsPost = await Promise.all(
      user.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    return userPosts.concat(...friendsPost);
  } catch (err) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.GENERIC_ERROR_MESSAGE
    );
  }
}

async function getUserTimeline(username) {
  if (!username) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.INVALID_CREDENTIALS
    );
  }

  try {
    const user = await User.findOne({ username: username });
    const userPosts = await Post.find({ userId: user._id.toString() });
    return userPosts;
  } catch (err) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ErrorMessages.GENERIC_ERROR_MESSAGE
    );
  }
}

module.exports = {
  createNewPost,
  updatePost,
  deletePost,
  getPost,
  likePost,
  getTimeline,
  getUserTimeline,
};
