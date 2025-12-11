import { Request, Response } from 'express';
import postModal from '../models/postModel';

// get all posts OR get posts by sender
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sender } = req.query;
        const filter = sender ? { sender } : {};
        const posts = await postModal.find(filter).populate('comments');
        res.status(200).json(posts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// get a post by ID
export const getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await postModal.findById(req.params.id).populate('comments');
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
export const addNewPost = async (req: Request, res: Response): Promise<void> => {
    const { sender, title, content } = req.body;
    const newPost = new postModal({ sender, title, content });
    try {
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// update a post by ID
export const updatePostById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const updateData = req.body;
    try {
        const updatedPost = await postModal.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedPost) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        res.status(200).json(updatedPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
