import { Request, Response } from 'express';
import mongoose from 'mongoose';
import postModal from '../models/postModel';
import commentModal from '../models/commentModel';

// create a new comment
export const createComment = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const { content, sender } = req.body;
    const post = await postModal.findById(postId);
    if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
    }
    const newComment = new commentModal({ postId, content, sender });  
    try {
        const savedComment = await newComment.save();
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
        const comment = await commentModal.findById(commentId);
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
export const deleteCommentById = async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.id;
    try {
        const deletedComment = await commentModal.findByIdAndDelete(commentId);
        if (!deletedComment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// update a comment by ID
export const updateCommentById = async (req: Request, res: Response): Promise<void> => {
    const commentId = req.params.id;
    const { content } = req.body;
    try {
        const updatedComment = await commentModal.findByIdAndUpdate(
            commentId,
            { content },
            { new: true }
        );
        if (!updatedComment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }
        res.status(200).json(updatedComment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }   
};

// get all comments (by postId)
export const getAllComments = async (req: Request, res: Response): Promise<void> => {
    const { postId } = req.query;
    const filter: any = postId ? { postId: postId as string } : {};
    try {
        const comments = await commentModal.find(filter);
        res.status(200).json(comments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};