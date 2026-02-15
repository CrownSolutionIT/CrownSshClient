/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import helmet from 'helmet'
import compression from 'compression'
import { rateLimit } from 'express-rate-limit'
import morgan from 'morgan'
import logger from './utils/logger.js'
import { AppError } from './utils/AppError.js'

import authRoutes from './routes/auth.js'
import vmRoutes from './routes/vms.js'
import environmentRoutes from './routes/environments.js'
import executionRoutes from './routes/execution.js'

// for esm mode
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

const app: express.Application = express()

// Trust proxy (required for Nginx/Cloudflare and secure cookies)
app.set('trust proxy', true);

// Basic security & performance middleware
app.use(helmet())
app.use(compression())

// Request logging via Morgan and Winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    process.env.VITE_API_URL
  ].filter(Boolean) as string[],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting for auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Session config
app.use(session({
  proxy: true, // Required for secure cookies behind a proxy
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.mongo,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60, // = 14 days. Default
    touchAfter: 24 * 3600 // time period in seconds: 24 hours
  }),
  cookie: {
    // Only use secure cookies if NODE_ENV is production and we are not in development mode.
    // This avoids needing to check for 'localhost' specifically.
    secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE === 'true',
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
    sameSite: 'lax'
  }
}));

// Passport config
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // Use the public-facing URL for the callback
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
  },
    (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
      // In a real app, you'd save user to DB here
      return done(null, profile);
    }));
} else {
  logger.warn("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not set. OAuth will not work.");
}

/**
 * API Routes
 */
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/vms', vmRoutes)
app.use('/api/environments', environmentRoutes)
app.use('/api/execute', executionRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = error instanceof AppError ? error.message : 'Internal Server Error';

  if (statusCode === 500) {
    logger.error('Unhandled Error:', {
      message: error.message,
      stack: error.stack,
      path: req.path,
    });
  } else {
    logger.warn(`Operational Error [${statusCode}]: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    // Include stack in non-production environments
    stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
  });
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  })
})

export default app
