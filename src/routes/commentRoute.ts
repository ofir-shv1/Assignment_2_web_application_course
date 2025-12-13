import express from 'express';
import * as commentController from '../controllers/commentController';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/:id', verifyToken, commentController.createComment);
router.get('/:id', verifyToken, commentController.getCommentById);
router.delete('/:id', verifyToken, commentController.deleteCommentById);
router.put('/:id', verifyToken, commentController.updateCommentById);
router.get('/', verifyToken, commentController.getAllComments);

export default router;
