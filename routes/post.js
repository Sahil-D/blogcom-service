const router = require('express').Router();
const postController = require('../controllers/post-controller');

router.post('/', postController.createPost);

router.put('/:id/like', postController.likePost);

router.put('/:id', postController.updatePost);

router.get('/timeline/:userId', postController.getTimeline);

router.get('/profile/:username', postController.getUserTimeline);

router.get('/:id', postController.getPost);

router.delete('/:id', postController.deletePost);

module.exports = router;
