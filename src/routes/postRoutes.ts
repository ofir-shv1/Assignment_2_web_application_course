import express from 'express';
import * as postController from '../controllers/postController';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', verifyToken, postController.getAllPosts);
router.get('/:id', verifyToken, postController.getPostById);
router.post('/', verifyToken, postController.addNewPost);
router.put('/:id', verifyToken, postController.updatePostById);

export default router;
