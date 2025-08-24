// =====================================================
// PROFESSIONAL ERROR HANDLING SYSTEM
// Xainik Platform - Enterprise Grade Error Management
// =====================================================

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  timestamp: string
  userAgent?: string
  url?: string
}

export interface ErrorReport {
  id: string
  type: 'validation' | 'authentication' | 'authorization' | 'network' | 'database' | 'system' | 'unknown'
  message: string
  context: ErrorContext
  severity: 'low' | 'medium' | 'high' | 'critical'
  stack?: string
  metadata?: Record<string, any>
}

export class ProfessionalError extends Error {
  public readonly type: ErrorReport['type']
  public readonly severity: ErrorReport['severity']
  public readonly context: ErrorContext
  public readonly metadata?: Record<string, any>
  public readonly userMessage: string

  constructor(
    message: string,
    type: ErrorReport['type'] = 'unknown',
    severity: ErrorReport['severity'] = 'medium',
    context: Partial<ErrorContext> = {},
    userMessage?: string,
    metadata?: Record<string, any>
  ) {
    super(message)
    this.name = 'ProfessionalError'
    this.type = type
    this.severity = severity
    this.context = {
      timestamp: new Date().toISOString(),
      ...context
    }
    this.metadata = metadata
    this.userMessage = userMessage || this.getDefaultUserMessage(type, severity)
  }

  private getDefaultUserMessage(type: ErrorReport['type'], severity: ErrorReport['severity']): string {
    const messages = {
      validation: 'Please check your input and try again.',
      authentication: 'Please sign in to continue.',
      authorization: 'You do not have permission to perform this action.',
      network: 'Network error. Please check your connection and try again.',
      database: 'Service temporarily unavailable. Please try again later.',
      system: 'System error. Please try again later.',
      unknown: 'An unexpected error occurred. Please try again.'
    }

    if (severity === 'critical') {
      return 'Critical system error. Please contact support immediately.'
    }

    return messages[type] || messages.unknown
  }

  toErrorReport(): ErrorReport {
    return {
      id: crypto.randomUUID(),
      type: this.type,
      message: this.message,
      context: this.context,
      severity: this.severity,
      stack: this.stack,
      metadata: this.metadata
    }
  }
}

// =====================================================
// ERROR HANDLING UTILITIES
// =====================================================

export function createError(
  message: string,
  type: ErrorReport['type'] = 'unknown',
  severity: ErrorReport['severity'] = 'medium',
  context: Partial<ErrorContext> = {},
  userMessage?: string,
  metadata?: Record<string, any>
): ProfessionalError {
  return new ProfessionalError(message, type, severity, context, userMessage, metadata)
}

export function handleError(
  error: unknown,
  context: Partial<ErrorContext> = {}
): ProfessionalError {
  if (error instanceof ProfessionalError) {
    // Add additional context if provided
    (error as any).context = { ...error.context, ...context }
    return error
  }

  if (error instanceof Error) {
    return new ProfessionalError(
      error.message,
      'unknown',
      'medium',
      context,
      undefined,
      { originalError: error.name }
    )
  }

  return new ProfessionalError(
    String(error),
    'unknown',
    'medium',
    context
  )
}

// =====================================================
// ERROR CATEGORIZATION
// =====================================================

export function categorizeError(error: unknown): ErrorReport['type'] {
  if (error instanceof ProfessionalError) {
    return error.type
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    if (message.includes('validation') || message.includes('invalid')) return 'validation'
    if (message.includes('auth') || message.includes('unauthorized')) return 'authentication'
    if (message.includes('permission') || message.includes('forbidden')) return 'authorization'
    if (message.includes('network') || message.includes('fetch')) return 'network'
    if (message.includes('database') || message.includes('sql')) return 'database'
    if (message.includes('system') || message.includes('internal')) return 'system'
  }

  return 'unknown'
}

export function determineSeverity(error: unknown): ErrorReport['severity'] {
  if (error instanceof ProfessionalError) {
    return error.severity
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    if (message.includes('critical') || message.includes('fatal')) return 'critical'
    if (message.includes('error') || message.includes('failed')) return 'high'
    if (message.includes('warning') || message.includes('caution')) return 'medium'
  }

  return 'medium'
}

// =====================================================
// USER-FRIENDLY ERROR MESSAGES
// =====================================================

export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ProfessionalError) {
    return error.userMessage
  }

  const type = categorizeError(error)
  const severity = determineSeverity(error)

  if (severity === 'critical') {
    return 'Critical system error. Please contact support immediately.'
  }

  const messages = {
    validation: 'Please check your input and try again.',
    authentication: 'Please sign in to continue.',
    authorization: 'You do not have permission to perform this action.',
    network: 'Network error. Please check your connection and try again.',
    database: 'Service temporarily unavailable. Please try again later.',
    system: 'System error. Please try again later.',
    unknown: 'An unexpected error occurred. Please try again.'
  }

  return messages[type] || messages.unknown
}

// =====================================================
// ERROR LOGGING (Production Ready)
// =====================================================

export function logError(error: ErrorReport): void {
  // In production, this would send to a logging service
  // For now, we'll use structured console logging
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 ${error.severity.toUpperCase()} ERROR: ${error.type}`)
    console.error('Message:', error.message)
    console.error('Context:', error.context)
    console.error('Severity:', error.severity)
    if (error.metadata) {
      console.error('Metadata:', error.metadata)
    }
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    console.groupEnd()
  }

  // TODO: Implement production error logging service
  // - Send to monitoring service (Sentry, LogRocket, etc.)
  // - Store in database for analysis
  // - Alert team for critical errors
}

// =====================================================
// COMMON ERROR PATTERNS
// =====================================================

export const CommonErrors = {
  // Authentication
  UNAUTHORIZED: () => createError(
    'User not authenticated',
    'authentication',
    'medium',
    {},
    'Please sign in to continue.'
  ),

  // Authorization
  INSUFFICIENT_PERMISSIONS: (action: string) => createError(
    `Insufficient permissions for: ${action}`,
    'authorization',
    'high',
    { action },
    'You do not have permission to perform this action.'
  ),

  // Validation
  INVALID_INPUT: (field: string, value: any) => createError(
    `Invalid input for field: ${field}`,
    'validation',
    'low',
    { field, value } as any,
    'Please check your input and try again.'
  ),

  // Network
  NETWORK_ERROR: (endpoint: string) => createError(
    `Network error calling: ${endpoint}`,
    'network',
    'medium',
    { endpoint } as any,
    'Network error. Please check your connection and try again.'
  ),

  // Database
  DATABASE_ERROR: (operation: string) => createError(
    `Database error during: ${operation}`,
    'database',
    'high',
    { operation } as any,
    'Service temporarily unavailable. Please try again later.'
  ),

  // System
  SYSTEM_ERROR: (component: string) => createError(
    `System error in: ${component}`,
    'system',
    'critical',
    { component } as any,
    'Critical system error. Please contact support immediately.'
  )
}

// =====================================================
// ERROR BOUNDARY UTILITIES
// =====================================================

export function isRecoverableError(error: ErrorReport): boolean {
  return error.severity !== 'critical' && error.type !== 'system'
}

export function shouldRetry(error: ErrorReport): boolean {
  return error.type === 'network' || error.type === 'database'
}

export function getRetryDelay(error: ErrorReport, attempt: number): number {
  if (!shouldRetry(error)) return 0
  
  // Exponential backoff with jitter
  const baseDelay = 1000 * Math.pow(2, attempt - 1)
  const jitter = Math.random() * 0.1 * baseDelay
  return Math.min(baseDelay + jitter, 30000) // Max 30 seconds
}
