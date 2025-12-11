import express from 'express';
import * as postController from '../controllers/postController';

const router = express.Router();

router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.post('/', postController.addNewPost);
router.put('/:id', postController.updatePostById);

export default router;
