const catchAsync = require('../utils/catchAsync');
const postService = require('../services/postService');

const createPost = catchAsync(async (req, res) => {
  const newPost = await postService.createNewPost(req.body);
  return { status: 'success', data: newPost };
});

const updatePost = catchAsync(async (req, res) => {
  const updatedPost = await postService.updatePost(req.params.id, req.body);
  return { status: 'success', data: updatedPost };
});

const getPost = catchAsync(async (req, res) => {
  const post = await postService.getPost(req.params.id, req.body);
  return { status: 'success', data: post };
});

const getTimeline = catchAsync(async (req, res) => {
  const allPosts = await postService.getTimeline(req.params.userId);
  return { status: 'success', data: allPosts };
});

const getUserTimeline = catchAsync(async (req, res) => {
  const allPosts = await postService.getUserTimeline(req.params.username);
  return { status: 'success', data: allPosts };
});

const deletePost = catchAsync(async (req, res) => {
  await postService.deletePost(req.params.id, req.body);
  return { status: true };
});

const likePost = catchAsync(async (req, res) => {
  await postService.likePost(req.params.id, req.body);
  return { status: true };
});

module.exports = {
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPost,
  getTimeline,
  getUserTimeline,
};
