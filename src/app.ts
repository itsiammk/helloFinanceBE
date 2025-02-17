// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors'; // Import cors
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import { connectDB } from './config/database';

const app: Application = express();

// CORS Configuration
const corsOptions = {
  origin: 'https://hello-finance-five.vercel.app', // Allow only this origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
  credentials: true, // Allow cookies and credentials
  optionsSuccessStatus: 204, // Respond with 204 No Content for preflight requests
};

// Middleware
app.use(cors(corsOptions)); // Use cors with the specified options
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/', (_req, res) => {
  res.status(200).send('Hello from Backend!!!!');
});

app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Database connection
connectDB();

export default app;