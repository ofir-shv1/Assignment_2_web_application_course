import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel';
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

    const user = await userModel.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};