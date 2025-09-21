// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Core imports
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Local imports (must include .js extension)
import connectDB from './config/db.js';
import logger from './utils/logger.js';

import eventsRoute from './routes/event.js';
import usersRoute from './routes/user.js';
import authRoute from './routes/auth.js';
import sportRoute from './routes/sport.js';
import mapRoute from './routes/map.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://sports-buddy-psi.vercel.app' 
];

// Middleware
app.use(express.json());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // origin is allowed
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(helmet());

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Connect to DB
connectDB();

// Routes
app.use('/api/sports', sportRoute);
app.use('/api/events', eventsRoute);
app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);
app.use('/api/map', mapRoute); // ✅ fixed missing slash

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
