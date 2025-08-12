// =====================================================
// PROFESSIONAL DATABASE CLIENT
// Xainik Platform - Professional Rewrite
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/live-schema';

// =====================================================
// ENVIRONMENT VALIDATION
// =====================================================

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// =====================================================
// CLIENT CONFIGURATION
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// =====================================================
// CLIENT INSTANCES
// =====================================================

// Public client for client-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Admin client for server-side operations with full access
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

// =====================================================
// SERVER-SIDE CLIENTS
// =====================================================

// Server Component Client
export async function createServerComponentClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options: any) {
        cookieStore.set(name, '', { ...options, maxAge: 0 });
      }
    }
  });
}

// Server Action Client (using server client for now)
export async function createActionClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options: any) {
        cookieStore.set(name, '', { ...options, maxAge: 0 });
      }
    }
  });
}

// Route Handler Client
export async function createRouteClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options: any) {
        cookieStore.set(name, '', { ...options, maxAge: 0 });
      }
    }
  });
}

// =====================================================
// DATABASE UTILITY FUNCTIONS
// =====================================================

export interface QueryOptions {
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export interface QueryResult<T> {
  data: T[] | null;
  error: any;
  count?: number;
}

// Generic query builder with error handling
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T[] | null; error: any; count?: number }>,
  errorContext: string
): Promise<QueryResult<T>> {
  try {
    const result = await queryFn();
    
    if (result.error) {
      console.error(`Database error in ${errorContext}:`, result.error);
      return {
        data: null,
        error: result.error.message || 'Database query failed'
      };
    }
    
    const queryResult: QueryResult<T> = {
      data: result.data,
      error: null
    };
    
    if (result.count !== undefined) {
      queryResult.count = result.count;
    }
    
    return queryResult;
  } catch (error) {
    console.error(`Unexpected error in ${errorContext}:`, error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// =====================================================
// TRANSACTION SUPPORT
// =====================================================

export async function executeTransaction<T>(
  operations: (() => Promise<T>)[],
  errorContext: string
): Promise<{ data: T[] | null; error: any }> {
  try {
    const results = await Promise.all(operations.map(op => op()));
    return { data: results, error: null };
  } catch (error) {
    console.error(`Transaction error in ${errorContext}:`, error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Transaction failed'
    };
  }
}

// =====================================================
// CONNECTION HEALTH CHECK
// =====================================================

export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  error?: string;
  responseTime?: number;
}> {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        healthy: false,
        error: error.message,
        responseTime
      };
    }
    
    return {
      healthy: true,
      responseTime
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Connection failed',
      responseTime: Date.now() - startTime
    };
  }
}

// =====================================================
// ERROR HANDLING UTILITIES
// =====================================================

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function handleDatabaseError(error: any, context: string): never {
  if (error?.code === '23505') { // Unique constraint violation
    throw new DatabaseError('Duplicate entry found', 'UNIQUE_VIOLATION', error);
  }
  
  if (error?.code === '23503') { // Foreign key violation
    throw new DatabaseError('Referenced record not found', 'FOREIGN_KEY_VIOLATION', error);
  }
  
  if (error?.code === '42P01') { // Table doesn't exist
    throw new DatabaseError('Table not found', 'TABLE_NOT_FOUND', error);
  }
  
  console.error(`Database error in ${context}:`, error);
  throw new DatabaseError(
    error?.message || 'Database operation failed',
    error?.code || 'UNKNOWN_ERROR',
    error
  );
}

// =====================================================
// CONNECTION POOLING (Future Enhancement)
// =====================================================

// Note: Supabase handles connection pooling automatically
// This is for future custom implementations if needed

export interface ConnectionPool {
  getConnection(): Promise<any>;
  releaseConnection(connection: any): void;
  close(): Promise<void>;
}
