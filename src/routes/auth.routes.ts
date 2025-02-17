// src/routes/auth.routes.ts
import { Router } from 'express';
import { check } from 'express-validator';
import { signup, login } from '../controllers/auth.controller';

const router = Router();

router.post(
    '/signup',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    signup
);

router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    login
);

export default router;