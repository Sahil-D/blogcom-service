const catchAsync = require('../utils/catchAsync');
const userService = require('../services/userService');

const registerNewUser = catchAsync(async (req, res) => {
  await userService.registerNewUser(req.body);
  return { status: true };
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.login(email, password);
  return { status: 'success', data: user };
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req);
  return { status: 'success', data: user };
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req);
  return { status: true };
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUser(req);
  return { status: 'success', data: user };
});

const followUser = catchAsync(async (req, res) => {
  await userService.followUser(req.body.userId, req.params.id);
  return { status: true };
});

const unfollowUser = catchAsync(async (req, res) => {
  await userService.unfollowUser(req.body.userId, req.params.id);
  return { status: true };
});

const getFriends = catchAsync(async (req, res) => {
  const friendsList = await userService.getFriends(req.params.userId);
  return { status: 'success', data: friendsList };
});

const getUnfollowedUsers = catchAsync(async (req, res) => {
  const userList = await userService.getUnfollowedUsers(req.params.userId);
  return { status: 'success', data: userList };
});

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
