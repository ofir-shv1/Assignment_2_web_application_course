import { Request, Response, NextFunction } from 'express';
import userModel from '../models/userModel';

// Create a new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'All fields (username, email, password) are required' });
      return;
    }

    const existingUser = await userModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email or username already exists' });
      return;
    }

    const user = await userModel.create({ username, email, password });

    res.status(201).json({ 
      message: 'User created successfully', 
      user 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userModel.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get a specific user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userModel.findById(req.params.id);

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
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { username, email, password },
      { new: true, runValidators: true }
    );

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
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
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