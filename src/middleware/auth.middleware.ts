// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import User from '../models/user.model';

export interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Token is not valid'
            });
        }

        req.user = await User.findById((decoded as any).id);
        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};