// =====================================================
// PROFESSIONAL PERFORMANCE MONITORING SYSTEM
// Xainik Platform - Enterprise Grade Performance Analytics
// =====================================================

export interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  timestamp: string
  category: 'navigation' | 'api' | 'rendering' | 'resource' | 'user' | 'business'
  metadata?: Record<string, any>
}

export interface PerformanceReport {
  id: string
  sessionId: string
  userId?: string
  timestamp: string
  metrics: PerformanceMetric[]
  summary: {
    totalMetrics: number
    averageLoadTime: number
    slowestOperation: PerformanceMetric | null
    fastestOperation: PerformanceMetric | null
    criticalIssues: number
  }
}

export interface NavigationTiming {
  navigationStart: number
  fetchStart: number
  domainLookupStart: number
  domainLookupEnd: number
  connectStart: number
  connectEnd: number
  requestStart: number
  responseStart: number
  responseEnd: number
  domLoading: number
  domInteractive: number
  domContentLoadedEventStart: number
  domContentLoadedEventEnd: number
  domComplete: number
  loadEventStart: number
  loadEventEnd: number
}

// =====================================================
// PERFORMANCE MONITORING CLASS
// =====================================================

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private sessionId: string
  private startTime: number
  private observers: Set<(metric: PerformanceMetric) => void> = new Set()

  private constructor() {
    this.sessionId = crypto.randomUUID()
    this.startTime = performance.now()
    this.initializeMonitoring()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initializeMonitoring(): void {
    // Monitor navigation performance
    this.observeNavigationTiming()
    
    // Monitor API performance
    this.observeAPIPerformance()
    
    // Monitor resource loading
    this.observeResourceLoading()
    
    // Monitor user interactions
    this.observeUserInteractions()
    
    // Monitor business metrics
    this.observeBusinessMetrics()
  }

  // =====================================================
  // NAVIGATION PERFORMANCE MONITORING
  // =====================================================

  private observeNavigationTiming(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.recordNavigationMetrics(navEntry)
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['navigation'] })
      } catch (error) {
        // Fallback for older browsers
        this.recordLegacyNavigationMetrics()
      }
    }
  }

  private recordNavigationMetrics(navEntry: PerformanceNavigationTiming): void {
    const metrics = [
      {
        name: 'DNS Lookup Time',
        value: navEntry.domainLookupEnd - navEntry.domainLookupStart,
        unit: 'ms',
        category: 'navigation' as const
      },
      {
        name: 'TCP Connection Time',
        value: navEntry.connectEnd - navEntry.connectStart,
        unit: 'ms',
        category: 'navigation' as const
      },
      {
        name: 'Server Response Time',
        value: navEntry.responseEnd - navEntry.requestStart,
        unit: 'ms',
        category: 'navigation' as const
      },
      {
        name: 'DOM Content Loaded',
        value: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
        unit: 'ms',
        category: 'navigation' as const
      },
      {
        name: 'Page Load Complete',
        value: navEntry.loadEventEnd - navEntry.fetchStart,
        unit: 'ms',
        category: 'navigation' as const
      }
    ]

    metrics.forEach(metric => this.recordMetric(metric))
  }

  private recordLegacyNavigationMetrics(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const timing = (performance as any).timing
      if (timing) {
        const metrics = [
          {
            name: 'Page Load Time (Legacy)',
            value: timing.loadEventEnd - timing.navigationStart,
            unit: 'ms',
            category: 'navigation' as const
          }
        ]

        metrics.forEach(metric => this.recordMetric(metric))
      }
    }
  }

  // =====================================================
  // API PERFORMANCE MONITORING
  // =====================================================

  private observeAPIPerformance(): void {
    if (typeof window !== 'undefined') {
      // Monitor fetch requests
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        const startTime = performance.now()
        const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url
        
        try {
          const response = await originalFetch(...args)
          const duration = performance.now() - startTime
          
          this.recordMetric({
            name: 'API Response Time',
            value: duration,
            unit: 'ms',
            category: 'api',
            metadata: { url, status: response.status }
          })
          
          return response
        } catch (error) {
          const duration = performance.now() - startTime
          
          this.recordMetric({
            name: 'API Error Time',
            value: duration,
            unit: 'ms',
            category: 'api',
            metadata: { url, error: error instanceof Error ? error.message : 'Unknown error' }
          })
          
          throw error
        }
      }
    }
  }

  // =====================================================
  // RESOURCE LOADING MONITORING
  // =====================================================

  private observeResourceLoading(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            this.recordResourceMetrics(resourceEntry)
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['resource'] })
      } catch (error) {
        // Fallback for older browsers
      }
    }
  }

  private recordResourceMetrics(resourceEntry: PerformanceResourceTiming): void {
    const metrics = [
      {
        name: 'Resource Load Time',
        value: resourceEntry.responseEnd - resourceEntry.startTime,
        unit: 'ms',
        category: 'resource' as const,
        metadata: { 
          name: resourceEntry.name,
          type: resourceEntry.initiatorType,
          size: resourceEntry.transferSize
        }
      }
    ]

    metrics.forEach(metric => this.recordMetric(metric))
  }

  // =====================================================
  // USER INTERACTION MONITORING
  // =====================================================

  private observeUserInteractions(): void {
    if (typeof window !== 'undefined') {
      // Monitor click events
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement
        if (target) {
          this.recordMetric({
            name: 'User Click',
            value: 1,
            unit: 'count',
            category: 'user',
            metadata: { 
              element: target.tagName.toLowerCase(),
              className: target.className,
              id: target.id
            }
          })
        }
      })

      // Monitor form submissions
      document.addEventListener('submit', (event) => {
        const target = event.target as HTMLFormElement
        if (target) {
          this.recordMetric({
            name: 'Form Submission',
            value: 1,
            unit: 'count',
            category: 'user',
            metadata: { 
              formId: target.id,
              action: target.action
            }
          })
        }
      })
    }
  }

  // =====================================================
  // BUSINESS METRICS MONITORING
  // =====================================================

  private observeBusinessMetrics(): void {
    // Monitor key business events
    if (typeof window !== 'undefined') {
      // Track page views
      this.recordMetric({
        name: 'Page View',
        value: 1,
        unit: 'count',
        category: 'business',
        metadata: { 
          url: window.location.pathname,
          referrer: document.referrer
        }
      })

      // Track session duration
      setInterval(() => {
        const sessionDuration = performance.now() - this.startTime
        this.recordMetric({
          name: 'Session Duration',
          value: sessionDuration,
          unit: 'ms',
          category: 'business'
        })
      }, 30000) // Every 30 seconds
    }
  }

  // =====================================================
  // METRIC RECORDING
  // =====================================================

  recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }

    this.metrics.push(fullMetric)
    
    // Notify observers
    this.observers.forEach(observer => observer(fullMetric))
    
    // Clean up old metrics (keep last 1000)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  // =====================================================
  // PERFORMANCE ANALYSIS
  // =====================================================

  getMetrics(category?: PerformanceMetric['category']): PerformanceMetric[] {
    if (category) {
      return this.metrics.filter(metric => metric.category === category)
    }
    return [...this.metrics]
  }

  getAverageMetric(name: string): number {
    const metrics = this.metrics.filter(metric => metric.name === name)
    if (metrics.length === 0) return 0
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0)
    return sum / metrics.length
  }

  getSlowestOperation(): PerformanceMetric | null {
    if (this.metrics.length === 0) return null
    
    return this.metrics.reduce((slowest, current) => 
      current.value > slowest.value ? current : slowest
    )
  }

  getFastestOperation(): PerformanceMetric | null {
    if (this.metrics.length === 0) return null
    
    return this.metrics.reduce((fastest, current) => 
      current.value < fastest.value ? current : fastest
    )
  }

  // =====================================================
  // PERFORMANCE REPORTING
  // =====================================================

  generateReport(): PerformanceReport {
    const metrics = this.getMetrics()
    const averageLoadTime = this.getAverageMetric('Page Load Complete') || 
                           this.getAverageMetric('Page Load Time (Legacy)') || 0
    
    return {
      id: crypto.randomUUID(),
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      metrics,
      summary: {
        totalMetrics: metrics.length,
        averageLoadTime,
        slowestOperation: this.getSlowestOperation(),
        fastestOperation: this.getFastestOperation(),
        criticalIssues: metrics.filter(m => m.value > 5000).length // Operations taking >5s
      }
    }
  }

  // =====================================================
  // OBSERVER PATTERN
  // =====================================================

  subscribe(observer: (metric: PerformanceMetric) => void): () => void {
    this.observers.add(observer)
    
    return () => {
      this.observers.delete(observer)
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  getSessionId(): string {
    return this.sessionId
  }

  getSessionDuration(): number {
    return performance.now() - this.startTime
  }

  reset(): void {
    this.metrics = []
    this.startTime = performance.now()
  }
}

// =====================================================
// PERFORMANCE UTILITIES
// =====================================================

export const performanceMonitor = PerformanceMonitor.getInstance()

export function measurePerformance<T>(
  name: string,
  operation: () => T | Promise<T>,
  category: PerformanceMetric['category'] = 'api'
): T | Promise<T> {
  const startTime = performance.now()
  
  try {
    const result = operation()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - startTime
        performanceMonitor.recordMetric({
          name,
          value: duration,
          unit: 'ms',
          category
        })
      })
    } else {
      const duration = performance.now() - startTime
      performanceMonitor.recordMetric({
        name,
        value: duration,
        unit: 'ms',
        category
      })
      return result
    }
  } catch (error) {
    const duration = performance.now() - startTime
    performanceMonitor.recordMetric({
      name: `${name} (Error)`,
      value: duration,
      unit: 'ms',
      category,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    throw error
  }
}

export function createPerformanceMarker(name: string): () => void {
  const startTime = performance.now()
  
  return () => {
    const duration = performance.now() - startTime
    performanceMonitor.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      category: 'rendering'
    })
  }
}

// =====================================================
// PERFORMANCE THRESHOLDS
// =====================================================

export const PerformanceThresholds = {
  // Navigation
  PAGE_LOAD_FAST: 1000,      // < 1s
  PAGE_LOAD_ACCEPTABLE: 3000, // < 3s
  PAGE_LOAD_SLOW: 5000,      // < 5s
  
  // API
  API_FAST: 100,             // < 100ms
  API_ACCEPTABLE: 500,        // < 500ms
  API_SLOW: 1000,            // < 1s
  
  // Resources
  RESOURCE_FAST: 50,         // < 50ms
  RESOURCE_ACCEPTABLE: 200,   // < 200ms
  RESOURCE_SLOW: 500         // < 500ms
}

export function getPerformanceRating(value: number, threshold: number): 'fast' | 'acceptable' | 'slow' {
  if (value < threshold * 0.5) return 'fast'
  if (value < threshold) return 'acceptable'
  return 'slow'
}
