import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController';
import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', verifyToken, createUser);
router.get('/', verifyToken, getAllUsers);
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser);

export default router;