import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';
import postModal from '../models/postModel';
import commentModal from '../models/commentModel';

// create a new comment
export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
    const postId = req.params.id;
    const { content } = req.body;
    
    // Validate required field
    if (!content) {
        res.status(400).json({ message: 'Content is required' });
        return;
    }
    
    try {
        const post = await postModal.findById(postId);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        
        // Use authenticated user's ID as sender
        const newComment = new commentModal({ postId, content, sender: req.user?.id });
        const savedComment = await newComment.save();
        await savedComment.populate('sender', 'username email');
        post.comments.push(savedComment._id as any);
        await post.save();
        res.status(201).json(savedComment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }   
};

// get a comment by ID
export const getCommentById = async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.id;
    try {
        const comment = await commentModal.findById(commentId).populate('sender', 'username email');
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }
        res.status(200).json(comment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// delete a comment by ID
export const deleteCommentById = async (req: AuthRequest, res: Response): Promise<void> => {
    const commentId = req.params.id;
    try {
        const comment = await commentModal.findById(commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }
        // Check ownership
        if (comment.sender.toString() !== req.user?.id) {
            res.status(403).json({ message: 'Not authorized to delete this comment' });
            return;
        }
        
        // Remove comment from post's comments array
        await postModal.findByIdAndUpdate(
            comment.postId,
            { $pull: { comments: commentId } }
        );
        
        await commentModal.findByIdAndDelete(commentId);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// update a comment by ID
export const updateCommentById = async (req: AuthRequest, res: Response): Promise<void> => {
    const commentId = req.params.id;
    const { content } = req.body;
    try {
        const comment = await commentModal.findById(commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }
        // Check ownership
        if (comment.sender.toString() !== req.user?.id) {
            res.status(403).json({ message: 'Not authorized to update this comment' });
            return;
        }
        const updatedComment = await commentModal.findByIdAndUpdate(
            commentId,
            { content },
            { new: true }
        ).populate('sender', 'username email');
        res.status(200).json(updatedComment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }   
};

// get all comments (by postId)
export const getAllComments = async (req: Request, res: Response): Promise<void> => {
    const { postId } = req.query;
    const filter: any = postId ? { postId: new mongoose.Types.ObjectId(postId as string) } : {};
    try {
        const comments = await commentModal.find(filter).populate('sender', 'username email');
        res.status(200).json(comments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};