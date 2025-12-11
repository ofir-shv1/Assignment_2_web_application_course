import express from 'express';
import * as commentController from '../controllers/commentController';

const router = express.Router();

router.post('/:id', commentController.createComment);
router.get('/:id', commentController.getCommentById);
router.delete('/:id', commentController.deleteCommentById);
router.put('/:id', commentController.updateCommentById);
router.get('/', commentController.getAllComments);

export default router;
