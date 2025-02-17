import { Request, Response } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { Types } from 'mongoose';
import User from '../models/user.model';
import { generateToken } from '../utils/jwt.utils';
import { SignupRequest, LoginRequest, AuthResponse } from '../types/auth.types';
import { AppError } from '../middleware/error.middleware';

const createUserResponse = (
    user: { _id: Types.ObjectId; name: string; email: string },
    token: string
): AuthResponse => ({
    success: true,
    token,
    user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
    }
});

export const signup = async (
    req: Request<{}, {}, SignupRequest>,
    res: Response<AuthResponse | { success: boolean; errors: ValidationError[] | string }>
): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }

        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                errors: 'User already exists'
            });
            return;
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate JWT
        const token = generateToken(user._id);
        
        res.status(201).json(createUserResponse(user, token));
    } catch (error) {
        console.error('Signup error:', error);
        throw new AppError('Error in signup process', 500);
    }
};

export const login = async (
    req: Request<{}, {}, LoginRequest>,
    res: Response<AuthResponse | { success: boolean; message: string }>
): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed'
            });
            return;
        }

        const { email, password } = req.body;

        // Check if user exists and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Generate JWT
        const token = generateToken(user._id);

        res.json(createUserResponse(user, token));
    } catch (error) {
        console.error('Login error:', error);
        throw new AppError('Error in login process', 500);
    }
};

// Add type-safe middleware for protected routes
export const getCurrentUser = async (
    req: Request & { user?: { _id: Types.ObjectId } },
    res: Response<AuthResponse | { success: boolean; message: string }>
): Promise<void> => {
    try {
        const user = await User.findById(req.user?._id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.json({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            }
        } as AuthResponse);
    } catch (error) {
        console.error('Get current user error:', error);
        throw new AppError('Error fetching user data', 500);
    }
};