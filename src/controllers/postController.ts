import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';
import postModal from '../models/postModel';
import commentModal from '../models/commentModel';

// get all posts OR get posts by sender
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sender } = req.query;
        const filter: any = sender ? { sender: new mongoose.Types.ObjectId(sender as string) } : {};
        const posts = await postModal.find(filter)
            .populate('sender', 'username email')
            .populate({
                path: 'comments',
                populate: { path: 'sender', select: 'username email' }
            });
        res.status(200).json(posts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// get a post by ID
export const getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await postModal.findById(req.params.id)
            .populate('sender', 'username email')
            .populate({
                path: 'comments',
                populate: { path: 'sender', select: 'username email' }
            });
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        res.status(200).json(post);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// add a new post
export const addNewPost = async (req: AuthRequest, res: Response): Promise<void> => {
    const { title, content } = req.body;
    
    // Validate required fields
    if (!title || !content) {
        res.status(400).json({ message: 'Title and content are required' });
        return;
    }
    
    // Use authenticated user's ID as sender
    const newPost = new postModal({ sender: req.user?.id, title, content });
    try {
        const savedPost = await newPost.save();
        await savedPost.populate('sender', 'username email');
        res.status(201).json(savedPost);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// update a post by ID
export const updatePostById = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id;
    const { title, content } = req.body;
    
    // Only allow updating title and content, not sender
    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    
    try {
        const post = await postModal.findById(id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        // Check ownership
        if (post.sender.toString() !== req.user?.id) {
            res.status(403).json({ message: 'Not authorized to update this post' });
            return;
        }
        const updatedPost = await postModal.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('sender', 'username email')
            .populate({
                path: 'comments',
                populate: { path: 'sender', select: 'username email' }
            });
        res.status(200).json(updatedPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// delete a post by ID
export const deletePostById = async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id;
    try {
        const post = await postModal.findById(id);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        // Check ownership
        if (post.sender.toString() !== req.user?.id) {
            res.status(403).json({ message: 'Not authorized to delete this post' });
            return;
        }
        
        // Delete all comments associated with this post (cascade delete)
        await commentModal.deleteMany({ postId: id as any });
        
        // Delete the post
        await postModal.findByIdAndDelete(id);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
