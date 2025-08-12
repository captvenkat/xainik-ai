#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Security patterns to detect
const SECRET_PATTERNS = [
  // JWT tokens
  /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g,
  // API keys
  /[a-zA-Z0-9]{32,}/g,
  // Private keys
  /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g,
  // RSA keys
  /-----BEGIN RSA PRIVATE KEY-----[\s\S]*?-----END RSA PRIVATE KEY-----/g,
  // Environment variables with actual values
  /(SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|RAZORPAY_KEY_SECRET|RESEND_API_KEY)=[^#\n\r]+/g,
];

// Files to exclude from scanning
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /\.env\.example$/,
  /SECURITY_INCIDENT_RESPONSE\.md$/,
  /SECURITY_CHECKLIST\.md$/,
  /package-lock\.json$/,
  /\.secrets\.baseline$/,
];

// Extensions to scan
const SCAN_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.sql', '.yaml', '.yml'
];

function shouldScanFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Check exclude patterns
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(relativePath)) {
      return false;
    }
  }
  
  // Check if it's a file we want to scan
  const ext = path.extname(filePath);
  return SCAN_EXTENSIONS.includes(ext);
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    const issues = [];
    
    SECRET_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Skip if it's just a placeholder
          if (match.includes('your_') || match.includes('placeholder') || match.includes('example')) {
            return;
          }
          
          issues.push({
            type: getPatternType(index),
            match: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
            line: findLineNumber(content, match),
            severity: 'HIGH'
          });
        });
      }
    });
    
    return issues;
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error.message);
    return [];
  }
}

function getPatternType(index) {
  const types = [
    'JWT Token',
    'API Key',
    'Private Key',
    'RSA Key',
    'Environment Variable'
  ];
  return types[index] || 'Secret Pattern';
}

function findLineNumber(content, match) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(match.substring(0, 20))) {
      return i + 1;
    }
  }
  return 'Unknown';
}

function scanDirectory(dirPath) {
  const results = [];
  
  function scanRecursive(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanRecursive(fullPath);
      } else if (stat.isFile() && shouldScanFile(fullPath)) {
        const issues = scanFile(fullPath);
        if (issues.length > 0) {
          results.push({
            file: path.relative(process.cwd(), fullPath),
            issues
          });
        }
      }
    }
  }
  
  scanRecursive(dirPath);
  return results;
}

function main() {
  console.log('🔒 Security Scan Starting...\n');
  
  const results = scanDirectory('.');
  
  if (results.length === 0) {
    console.log('✅ No security issues found!');
    process.exit(0);
  }
  
  console.log('🚨 SECURITY ISSUES DETECTED:\n');
  
  let totalIssues = 0;
  results.forEach(result => {
    console.log(`📁 ${result.file}:`);
    result.issues.forEach(issue => {
      console.log(`  ⚠️  ${issue.severity}: ${issue.type}`);
      console.log(`     Line ${issue.line}: ${issue.match}`);
      console.log('');
      totalIssues++;
    });
  });
  
  console.log(`\n📊 Summary: ${totalIssues} security issues found in ${results.length} files`);
  
  if (totalIssues > 0) {
    console.log('\n🚨 CRITICAL: Please address these security issues before committing!');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scanDirectory, scanFile };
