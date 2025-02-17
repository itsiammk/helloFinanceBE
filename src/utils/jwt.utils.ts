// src/utils/jwt.utils.ts
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateToken = (userId: Types.ObjectId): string => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET as string,
        { expiresIn: "24h" }
    );
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
        return null;
    }
};