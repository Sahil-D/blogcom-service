const router = require('express').Router();
const userController = require('../controllers/user-controller');

router.get('/', userController.getUser);

router.post('/register', userController.registerNewUser);

router.post('/login', userController.login);

router.put('/:id', userController.updateUser);

router.delete('/:id', userController.deleteUser);

router.put('/:id/follow', userController.followUser);

router.put('/:id/unfollow', userController.unfollowUser);

router.get('/friends/:userId', userController.getFriends);

router.get('/unfollowed/:userId', userController.getUnfollowedUsers);

module.exports = router;
