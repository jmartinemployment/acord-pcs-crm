import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import prisma from './utils/prisma';
import { AppError, ValidationError } from './utils/errors';

// Routes
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import partyRoutes from './routes/parties';
import policyRoutes from './routes/policies';
import claimRoutes from './routes/claims';
import vehicleRoutes from './routes/vehicles';
import propertyRoutes from './routes/properties';
import bondRoutes from './routes/bonds';
import activityRoutes from './routes/activities';
import leadRoutes from './routes/leads';
import auditLogRoutes from './routes/auditLogs';

// Middleware
import { authenticate, authorize, requireWriteAccess } from './middleware/auth.middleware';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4200'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// XML body parser for ACORD import
app.use(express.text({ type: ['application/xml', 'text/xml'] }));

// Health check endpoint (public)
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ACORD-PCS-CRM-Backend',
      version: '1.0.0',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'ACORD-PCS-CRM-Backend',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API info (public)
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'ACORD P&C/Surety CRM API',
    version: '1.0.0',
    description: 'Property & Casualty / Surety Insurance CRM Backend',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      parties: '/api/parties',
      policies: '/api/policies',
      claims: '/api/claims',
      vehicles: '/api/vehicles',
      properties: '/api/properties',
      bonds: '/api/bonds',
      activities: '/api/activities',
      leads: '/api/leads',
      auditLogs: '/api/audit-logs',
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>',
      loginEndpoint: 'POST /api/auth/login',
      registerEndpoint: 'POST /api/auth/register',
    },
    acordStandard: {
      version: 'P&C/Surety v1.16.0',
      supportedOperations: ['Import', 'Export', 'Validate'],
    },
  });
});

// =============================================================================
// PUBLIC ROUTES
// =============================================================================

// Auth routes (some public, some protected - handled internally)
app.use('/api/auth', authRoutes);

// =============================================================================
// PROTECTED ROUTES (Require authentication)
// =============================================================================

// Dashboard - accessible to all authenticated users
app.use('/api/dashboard',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  dashboardRoutes
);

// Parties - accessible to all authenticated users
app.use('/api/parties',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  requireWriteAccess,
  partyRoutes
);

// Policies - accessible to all authenticated users
app.use('/api/policies',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  requireWriteAccess,
  policyRoutes
);

// Claims - accessible to all authenticated users
app.use('/api/claims',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  requireWriteAccess,
  claimRoutes
);

// Vehicles - accessible to all authenticated users
app.use('/api/vehicles',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  requireWriteAccess,
  vehicleRoutes
);

// Properties - accessible to all authenticated users
app.use('/api/properties',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  requireWriteAccess,
  propertyRoutes
);

// Surety Bonds - accessible to all authenticated users
app.use('/api/bonds',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  requireWriteAccess,
  bondRoutes
);

// Activities - accessible to all authenticated users
app.use('/api/activities',
  authenticate,
  authorize('ADMIN', 'AGENT', 'READONLY'),
  requireWriteAccess,
  activityRoutes
);

// Leads - accessible to ADMIN and AGENT
app.use('/api/leads',
  authenticate,
  authorize('ADMIN', 'AGENT'),
  leadRoutes
);

// Audit Logs - accessible to ADMIN only
app.use('/api/audit-logs',
  authenticate,
  authorize('ADMIN'),
  auditLogRoutes
);

// =============================================================================
// STATIC FILES (Production - serve Angular frontend)
// =============================================================================

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/acord-pcs-crm/dist/acord-pcs-crm/browser');

  // Serve static files
  app.use(express.static(frontendPath));

  // SPA fallback - serve index.html for any non-API routes
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    // Skip API routes
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler (for API routes only in production)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  // Handle custom app errors
  if (err instanceof AppError) {
    const response: any = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    if (err instanceof ValidationError && err.validationErrors.length > 0) {
      response.error.validationErrors = err.validationErrors;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: process.env.NODE_ENV === 'development' ? err.message : 'A database error occurred',
      },
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: err.message,
      },
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    },
  });
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
app.listen(port, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   ACORD P&C/Surety CRM Backend                            ║
  ║                                                           ║
  ║   Server running on http://localhost:${port}                 ║
  ║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(27)}║
  ║                                                           ║
  ║   API Info: http://localhost:${port}/api                     ║
  ║   Health:   http://localhost:${port}/health                  ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);

  // Security reminder
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change-in-production')) {
    console.warn('⚠️  WARNING: Using default JWT_SECRET. Set a secure value in production!\n');
  }
});

export default app;
