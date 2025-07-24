import { Request, Response, NextFunction } from "express";
import { autoHealingSystem } from "./auto-healing";

interface TenantRequest extends Request {
  tenantId?: string;
  user?: any;
}

// Global error handler that triggers auto-healing
export const autoHealingErrorHandler = (
  error: Error,
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  // Extract tenant information from request
  const tenantId = req.tenantId || req.user?.claims?.companyId || extractTenantFromPath(req.path);
  
  if (tenantId && shouldTriggerHealing(error)) {
    // Trigger auto-healing asynchronously (don't block response)
    autoHealingSystem.handleError(
      tenantId,
      error.name || 'UnknownError',
      error.message,
      {
        endpoint: req.path,
        method: req.method,
        userAgent: req.headers['user-agent'],
        userId: req.user?.claims?.sub,
        requestBody: req.body,
        timestamp: new Date().toISOString()
      }
    ).catch(healingError => {
      console.error('Auto-healing system error:', healingError);
    });
  }

  // Log error for monitoring
  console.error(`[${tenantId || 'unknown'}] ${error.name}: ${error.message}`, {
    path: req.path,
    method: req.method,
    stack: error.stack
  });

  // Send appropriate error response
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = getErrorStatusCode(error);
  const message = getErrorMessage(error, req.path);

  res.status(statusCode).json({
    error: message,
    code: error.name,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Middleware to catch async errors
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Database connection error handler
export const dbErrorHandler = (error: any, tenantId: string) => {
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    autoHealingSystem.handleError(
      tenantId,
      'DatabaseConnectionError',
      `Database connection failed: ${error.message}`,
      { errorCode: error.code, host: error.hostname }
    );
  }
};

// API integration error handler
export const apiErrorHandler = (serviceName: string, error: any, tenantId: string) => {
  const errorTypes = {
    'stripe': 'PaymentProcessingError',
    'eld': 'ELDIntegrationError',
    'loadboard': 'LoadBoardSyncError',
    'email': 'EmailDeliveryError',
    'sms': 'SMSDeliveryError'
  };

  const errorType = errorTypes[serviceName.toLowerCase()] || 'ExternalAPIError';

  autoHealingSystem.handleError(
    tenantId,
    errorType,
    `${serviceName} API error: ${error.message}`,
    {
      service: serviceName,
      statusCode: error.statusCode || error.status,
      response: error.response?.data
    }
  );
};

// Authentication error handler
export const authErrorHandler = (error: any, req: TenantRequest) => {
  const tenantId = req.tenantId || extractTenantFromPath(req.path);
  
  if (tenantId && error.message.includes('token')) {
    autoHealingSystem.handleError(
      tenantId,
      'AuthenticationError',
      `Authentication failed: ${error.message}`,
      {
        endpoint: req.path,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      }
    );
  }
};

// Validation error handler
export const validationErrorHandler = (error: any, tenantId: string, context?: any) => {
  if (error.name === 'ZodError' || error.name === 'ValidationError') {
    autoHealingSystem.handleError(
      tenantId,
      'ValidationError',
      `Data validation failed: ${error.message}`,
      { validationErrors: error.errors, context }
    );
  }
};

// File upload error handler
export const fileUploadErrorHandler = (error: any, tenantId: string, fileType: string) => {
  autoHealingSystem.handleError(
    tenantId,
    'FileUploadError',
    `File upload failed: ${error.message}`,
    { fileType, fileSize: error.fileSize, errorCode: error.code }
  );
};

// Helper functions
function extractTenantFromPath(path: string): string | null {
  // Extract tenant ID from API paths like /api/tenant/:tenantId/...
  const match = path.match(/\/api\/tenant\/([^\/]+)/);
  return match ? match[1] : null;
}

function shouldTriggerHealing(error: Error): boolean {
  // Don't trigger healing for client errors (4xx) except authentication
  const healableErrors = [
    'DatabaseConnectionError',
    'TimeoutError',
    'RateLimitError',
    'AuthenticationError',
    'ConfigurationError',
    'ValidationError',
    'SyncError',
    'DocumentUploadError',
    'EmailDeliveryError',
    'PaymentProcessingError',
    'ELDIntegrationError',
    'LoadBoardSyncError'
  ];

  return healableErrors.includes(error.name) || 
         error.message.includes('timeout') ||
         error.message.includes('connection') ||
         error.message.includes('authentication');
}

function getErrorStatusCode(error: Error): number {
  if (error.name === 'ValidationError') return 400;
  if (error.name === 'AuthenticationError') return 401;
  if (error.name === 'AuthorizationError') return 403;
  if (error.name === 'NotFoundError') return 404;
  if (error.name === 'RateLimitError') return 429;
  if (error.name === 'DatabaseConnectionError') return 503;
  return 500;
}

function getErrorMessage(error: Error, path: string): string {
  // Provide user-friendly error messages
  const friendlyMessages = {
    'DatabaseConnectionError': 'Service temporarily unavailable. Our team has been notified and is working on a fix.',
    'TimeoutError': 'Request timed out. Please try again.',
    'RateLimitError': 'Too many requests. Please wait a moment and try again.',
    'AuthenticationError': 'Authentication failed. Please log in again.',
    'ValidationError': 'Invalid data provided. Please check your input.',
    'PaymentProcessingError': 'Payment processing failed. Please check your payment method.',
    'ELDIntegrationError': 'ELD sync temporarily unavailable. Data will be synchronized automatically.',
    'LoadBoardSyncError': 'Load board sync failed. Retrying automatically.'
  };

  return friendlyMessages[error.name] || 'An unexpected error occurred. Our team has been notified.';
}

// Express middleware to extract tenant context
export const tenantContextMiddleware = (req: TenantRequest, res: Response, next: NextFunction) => {
  // Extract tenant ID from various sources
  req.tenantId = req.tenantId || 
                 req.headers['x-tenant-id'] as string ||
                 req.user?.claims?.companyId ||
                 extractTenantFromPath(req.path);
  
  next();
};

// Middleware to monitor and trigger healing for slow requests
export const performanceMonitoringMiddleware = (req: TenantRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Trigger healing for consistently slow endpoints
    if (duration > 10000 && req.tenantId) { // 10 seconds threshold
      autoHealingSystem.handleError(
        req.tenantId,
        'PerformanceError',
        `Slow response detected: ${duration}ms for ${req.path}`,
        {
          endpoint: req.path,
          method: req.method,
          duration,
          statusCode: res.statusCode
        }
      );
    }
  });
  
  next();
};