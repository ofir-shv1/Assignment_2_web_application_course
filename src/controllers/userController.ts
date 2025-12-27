import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel';
import postModel from '../models/postModel';
import commentModel from '../models/commentModel';
import RefreshToken from '../models/refreshTokenModel';
import mongoose from 'mongoose';

// Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userModel.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get a specific user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(500).json({ message: 'Invalid user ID format' });
      return;
    }

    const user = await userModel.findById(req.params.id).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update a user info by ID
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(500).json({ message: 'Invalid user ID format' });
      return;
    }

    // Check authorization - users can only update their own profile
    if (req.params.id !== req.user?.id) {
      res.status(403).json({ message: 'Not authorized to update this user' });
      return;
    }

    const { username, email, password } = req.body;

    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) {
      // Hash the password before storing
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete a user by ID
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(500).json({ message: 'Invalid user ID format' });
      return;
    }

    // Check authorization - users can only delete their own profile
    if (req.params.id !== req.user?.id) {
      res.status(403).json({ message: 'Not authorized to delete this user' });
      return;
    }

    const user = await userModel.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Cascade delete: Remove all related data
    
    // 1. Delete all posts created by this user
    const userPosts = await postModel.find({ sender: req.params.id } as any);
    const postIds = userPosts.map(post => post._id);
    
    // 2. Delete all comments on those posts
    if (postIds.length > 0) {
      await commentModel.deleteMany({ postId: { $in: postIds } } as any);
    }
    
    // 3. Delete all comments created by this user (on other posts)
    await commentModel.deleteMany({ sender: req.params.id } as any);
    
    // 4. Delete all posts created by this user
    await postModel.deleteMany({ sender: req.params.id } as any);
    
    // 5. Delete all refresh tokens for this user
    await RefreshToken.deleteMany({ userId: req.params.id });
    
    // 6. Finally, delete the user
    await userModel.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'User and all related data deleted successfully',
      deletedPosts: postIds.length,
      deletedUser: user.username
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};