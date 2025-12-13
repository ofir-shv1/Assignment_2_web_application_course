import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import RefreshToken from '../models/refreshTokenModel';

// Helper function to generate tokens
const generateTokens = (userId: string): { accessToken: string; refreshToken: string } => {
    const secret = process.env.JWT_SECRET || 'default_secret_key';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key';
    const accessExpiresIn = parseInt(process.env.JWT_ACCESS_EXPIRATION || '3600');
    const refreshExpiresIn = parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800');
    
    const accessToken = jwt.sign({ id: userId }, secret, { expiresIn: accessExpiresIn });
    const refreshToken = jwt.sign({ id: userId }, refreshSecret, { expiresIn: refreshExpiresIn });
    
    return { accessToken, refreshToken };
};

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, username: user.username, email: user.email },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt
    });

    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, username: user.username, email: user.email },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key';
    const decoded = jwt.verify(refreshToken, refreshSecret) as { id: string };

    const tokenDoc = await RefreshToken.findOne({ token: refreshToken, userId: decoded.id });
    if (!tokenDoc) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const secret = process.env.JWT_SECRET || 'default_secret_key';
    const accessExpiresIn = parseInt(process.env.JWT_ACCESS_EXPIRATION || '3600');
    const accessToken = jwt.sign(
      { id: decoded.id },
      secret,
      { expiresIn: accessExpiresIn }
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

// Logout user
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    await RefreshToken.deleteOne({ token: refreshToken });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error });
  }
};