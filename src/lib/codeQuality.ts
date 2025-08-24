// =====================================================
// PROFESSIONAL CODE QUALITY SYSTEM
// Xainik Platform - Enterprise Grade Code Standards
// =====================================================

export interface CodeQualityRule {
  id: string
  name: string
  description: string
  severity: 'error' | 'warning' | 'info'
  category: 'performance' | 'security' | 'maintainability' | 'readability' | 'best-practice'
  pattern: RegExp
  message: string
  fix?: string
}

export interface CodeQualityReport {
  id: string
  filePath: string
  timestamp: string
  rules: CodeQualityRule[]
  violations: CodeQualityViolation[]
  score: number
  summary: {
    totalViolations: number
    errors: number
    warnings: number
    info: number
    criticalIssues: number
  }
}

export interface CodeQualityViolation {
  id: string
  ruleId: string
  line: number
  column: number
  message: string
  severity: 'error' | 'warning' | 'info'
  code: string
  fix?: string
}

// =====================================================
// CODE QUALITY RULES
// =====================================================

export const CODE_QUALITY_RULES: CodeQualityRule[] = [
  // Performance Rules
  {
    id: 'PERF-001',
    name: 'Console Statement in Production',
    description: 'Console statements should not be used in production code',
    severity: 'warning',
    category: 'performance',
    pattern: /console\.(log|error|warn|info|debug)/,
    message: 'Console statements should be removed in production',
    fix: 'Remove console statement or use proper logging'
  },
  {
    id: 'PERF-002',
    name: 'Unused Variables',
    description: 'Variables should not be declared but never used',
    severity: 'warning',
    category: 'performance',
    pattern: /const\s+(\w+)\s*=\s*[^;]+;\s*(?!.*\1)/,
    message: 'Variable is declared but never used',
    fix: 'Remove unused variable or use it'
  },
  {
    id: 'PERF-003',
    name: 'Large Bundle Imports',
    description: 'Avoid importing entire libraries when only specific functions are needed',
    severity: 'info',
    category: 'performance',
    pattern: /import\s+\*\s+as\s+\w+\s+from\s+['"][^'"]+['"]/,
    message: 'Consider importing only specific functions to reduce bundle size',
    fix: 'Use named imports instead of namespace imports'
  },

  // Security Rules
  {
    id: 'SEC-001',
    name: 'Hardcoded Secrets',
    description: 'Secrets should not be hardcoded in source code',
    severity: 'error',
    category: 'security',
    pattern: /(api_key|secret|password|token)\s*[:=]\s*['"][^'"]+['"]/i,
    message: 'Hardcoded secrets are a security risk',
    fix: 'Use environment variables or secure configuration management'
  },
  {
    id: 'SEC-002',
    name: 'SQL Injection Risk',
    description: 'Direct string concatenation in SQL queries is dangerous',
    severity: 'error',
    category: 'security',
    pattern: /SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*\s*\+\s*['"][^'"]*['"]/i,
    message: 'SQL injection vulnerability detected',
    fix: 'Use parameterized queries or ORM methods'
  },
  {
    id: 'SEC-003',
    name: 'XSS Risk',
    description: 'Direct HTML insertion without sanitization',
    severity: 'error',
    category: 'security',
    pattern: /innerHTML\s*=\s*[^;]+/,
    message: 'XSS vulnerability: innerHTML assignment without sanitization',
    fix: 'Use textContent or sanitize HTML content'
  },

  // Maintainability Rules
  {
    id: 'MAINT-001',
    name: 'Magic Numbers',
    description: 'Numbers should have meaningful names',
    severity: 'warning',
    category: 'maintainability',
    pattern: /[^a-zA-Z_]\d{2,}[^a-zA-Z_]/,
    message: 'Magic number detected - consider using a named constant',
    fix: 'Define a constant with a descriptive name'
  },
  {
    id: 'MAINT-002',
    name: 'Long Functions',
    description: 'Functions should not exceed 50 lines',
    severity: 'info',
    category: 'maintainability',
    pattern: /function\s+\w+\s*\([^)]*\)\s*\{[\s\S]{500,}/,
    message: 'Function is too long - consider breaking it into smaller functions',
    fix: 'Extract logic into smaller, focused functions'
  },
  {
    id: 'MAINT-003',
    name: 'Deep Nesting',
    description: 'Avoid deeply nested control structures',
    severity: 'warning',
    category: 'maintainability',
    pattern: /\{\s*\{[\s\S]*\{[\s\S]*\{[\s\S]*\{/,
    message: 'Deep nesting detected - consider early returns or guard clauses',
    fix: 'Use early returns or extract nested logic into functions'
  },

  // Readability Rules
  {
    id: 'READ-001',
    name: 'Inconsistent Naming',
    description: 'Use consistent naming conventions',
    severity: 'warning',
    category: 'readability',
    pattern: /(camelCase|PascalCase|snake_case|kebab-case)/,
    message: 'Inconsistent naming convention detected',
    fix: 'Follow consistent naming convention throughout the codebase'
  },
  {
    id: 'READ-002',
    name: 'Missing JSDoc',
    description: 'Public functions should have JSDoc comments',
    severity: 'info',
    category: 'readability',
    pattern: /export\s+(?:default\s+)?function\s+\w+\s*\([^)]*\)\s*\{/,
    message: 'Public function missing JSDoc documentation',
    fix: 'Add JSDoc comment describing function purpose and parameters'
  },
  {
    id: 'READ-003',
    name: 'Complex Expressions',
    description: 'Avoid overly complex expressions',
    severity: 'warning',
    category: 'readability',
    pattern: /[^;]*\?[^:]*:[^;]*\?[^:]*:[^;]*/,
    message: 'Complex ternary expression detected',
    fix: 'Break down into multiple statements or use if-else'
  },

  // Best Practice Rules
  {
    id: 'BEST-001',
    name: 'Async/Await Usage',
    description: 'Prefer async/await over .then() chains',
    severity: 'info',
    category: 'best-practice',
    pattern: /\.then\s*\(\s*[^)]*\)\s*\.then\s*\(\s*[^)]*\)/,
    message: 'Consider using async/await instead of promise chains',
    fix: 'Convert to async/await for better readability'
  },
  {
    id: 'BEST-002',
    name: 'Error Handling',
    description: 'Always handle potential errors',
    severity: 'warning',
    category: 'best-practice',
    pattern: /await\s+\w+\([^)]*\)(?!\s*\.catch)/,
    message: 'Async operation without error handling',
    fix: 'Add try-catch block or .catch() handler'
  },
  {
    id: 'BEST-003',
    name: 'Type Safety',
    description: 'Use proper TypeScript types',
    severity: 'warning',
    category: 'best-practice',
    pattern: /:\s*any\b/,
    message: 'Avoid using "any" type - specify proper types',
    fix: 'Define specific types or use "unknown" for truly unknown values'
  }
]

// =====================================================
// CODE QUALITY ANALYZER
// =====================================================

export class CodeQualityAnalyzer {
  private rules: CodeQualityRule[]

  constructor(rules: CodeQualityRule[] = CODE_QUALITY_RULES) {
    this.rules = rules
  }

  analyzeFile(filePath: string, content: string): CodeQualityReport {
    const violations: CodeQualityViolation[] = []
    const lines = content.split('\n')

    // Analyze each line
    lines.forEach((line, lineIndex) => {
      this.rules.forEach(rule => {
        const matches = line.match(rule.pattern)
        if (matches) {
          const column = line.indexOf(matches[0]) + 1
          
          violations.push({
            id: crypto.randomUUID(),
            ruleId: rule.id,
            line: lineIndex + 1,
            column,
            message: rule.message,
            severity: rule.severity,
            code: line.trim(),
            fix: rule.fix
          })
        }
      })
    })

    // Calculate score (100 - violations * severity weight)
    const severityWeights = { error: 10, warning: 5, info: 1 }
    const totalPenalty = violations.reduce((sum, violation) => 
      sum + severityWeights[violation.severity], 0
    )
    const score = Math.max(0, 100 - totalPenalty)

    // Generate summary
    const summary = {
      totalViolations: violations.length,
      errors: violations.filter(v => v.severity === 'error').length,
      warnings: violations.filter(v => v.severity === 'warning').length,
      info: violations.filter(v => v.severity === 'info').length,
      criticalIssues: violations.filter(v => v.severity === 'error').length
    }

    return {
      id: crypto.randomUUID(),
      filePath,
      timestamp: new Date().toISOString(),
      rules: this.rules,
      violations,
      score,
      summary
    }
  }

  analyzeDirectory(directoryPath: string, files: string[]): CodeQualityReport[] {
    return files.map(filePath => {
      // This would read the actual file content in a real implementation
      const mockContent = `// Mock file content for ${filePath}`
      return this.analyzeFile(filePath, mockContent)
    })
  }

  getRulesByCategory(category: CodeQualityRule['category']): CodeQualityRule[] {
    return this.rules.filter(rule => rule.category === category)
  }

  getRulesBySeverity(severity: CodeQualityRule['severity']): CodeQualityRule[] {
    return this.rules.filter(rule => rule.severity === severity)
  }
}

// =====================================================
// CODE QUALITY UTILITIES
// =====================================================

export function calculateCodeQualityScore(reports: CodeQualityReport[]): number {
  if (reports.length === 0) return 100

  const totalScore = reports.reduce((sum, report) => sum + report.score, 0)
  return Math.round(totalScore / reports.length)
}

export function getCriticalIssues(reports: CodeQualityReport[]): CodeQualityViolation[] {
  return reports.flatMap(report => 
    report.violations.filter(violation => violation.severity === 'error')
  )
}

export function generateQualitySummary(reports: CodeQualityReport[]): {
  totalFiles: number
  averageScore: number
  criticalIssues: number
  totalViolations: number
  categoryBreakdown: Record<string, number>
} {
  const totalFiles = reports.length
  const averageScore = calculateCodeQualityScore(reports)
  const criticalIssues = getCriticalIssues(reports).length
  const totalViolations = reports.reduce((sum, report) => sum + report.summary.totalViolations, 0)

  const categoryBreakdown = reports.reduce((acc, report) => {
    report.violations.forEach(violation => {
      const rule = report.rules.find(r => r.id === violation.ruleId)
      if (rule) {
        acc[rule.category] = (acc[rule.category] || 0) + 1
      }
    })
    return acc
  }, {} as Record<string, number>)

  return {
    totalFiles,
    averageScore,
    criticalIssues,
    totalViolations,
    categoryBreakdown
  }
}

// =====================================================
// CODE QUALITY ENFORCEMENT
// =====================================================

export function enforceCodeQuality(
  content: string,
  rules: CodeQualityRule[] = CODE_QUALITY_RULES
): { isValid: boolean; violations: CodeQualityViolation[] } {
  const analyzer = new CodeQualityAnalyzer(rules)
  const mockFilePath = 'inline-content'
  const report = analyzer.analyzeFile(mockFilePath, content)

  const criticalViolations = report.violations.filter(v => v.severity === 'error')
  const isValid = criticalViolations.length === 0

  return {
    isValid,
    violations: report.violations
  }
}

// =====================================================
// AUTOMATIC FIXES
// =====================================================

export function applyAutomaticFixes(
  content: string,
  violations: CodeQualityViolation[]
): string {
  let fixedContent = content

  // Sort violations by line number in descending order to avoid offset issues
  const sortedViolations = [...violations].sort((a, b) => b.line - a.line)

  sortedViolations.forEach(violation => {
    if (violation.fix) {
      const lines = fixedContent.split('\n')
      const lineIndex = violation.line - 1
      
      if (lineIndex >= 0 && lineIndex < lines.length) {
        // Apply the fix based on the rule type
        const rule = CODE_QUALITY_RULES.find(r => r.id === violation.ruleId)
        if (rule) {
          lines[lineIndex] = applyFixToLine(lines[lineIndex], rule, violation)
          fixedContent = lines.join('\n')
        }
      }
    }
  })

  return fixedContent
}

function applyFixToLine(
  line: string,
  rule: CodeQualityRule,
  violation: CodeQualityViolation
): string {
  // This is a simplified fix application
  // In a real implementation, you'd have more sophisticated fix logic
  
  switch (rule.id) {
    case 'PERF-001': // Console statement
      return line.replace(/console\.(log|error|warn|info|debug)\([^)]*\);?/g, '// Removed console statement')
    
    case 'BEST-003': // Any type
      return line.replace(/:\s*any\b/g, ': unknown')
    
    default:
      return line
  }
}

// =====================================================
// CODE QUALITY REPORTING
// =====================================================

export function generateQualityReport(
  reports: CodeQualityReport[]
): string {
  const summary = generateQualitySummary(reports)
  
  let report = '📊 CODE QUALITY REPORT\n'
  report += '========================\n\n'
  
  report += `📁 Total Files: ${summary.totalFiles}\n`
  report += `⭐ Average Score: ${summary.averageScore}/100\n`
  report += `🚨 Critical Issues: ${summary.criticalIssues}\n`
  report += `⚠️  Total Violations: ${summary.totalViolations}\n\n`
  
  report += '📊 Category Breakdown:\n'
  Object.entries(summary.categoryBreakdown).forEach(([category, count]) => {
    report += `  ${category}: ${count}\n`
  })
  
  report += '\n🎯 Recommendations:\n'
  if (summary.criticalIssues > 0) {
    report += '  • Fix all critical issues immediately\n'
  }
  if (summary.averageScore < 80) {
    report += '  • Focus on improving code quality score\n'
  }
  if (summary.categoryBreakdown.security > 0) {
    report += '  • Address security vulnerabilities first\n'
  }
  
  return report
}
