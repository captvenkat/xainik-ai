#!/usr/bin/env node

/**
 * Comprehensive Schema Synchronization Check
 * Identifies mismatches between database schema, TypeScript types, and code usage
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Results tracking
const results = {
  database: { tables: [], columns: {}, relationships: [] },
  typescript: { tables: [], columns: {}, types: [] },
  code: { imports: [], usage: [] },
  mismatches: { tables: [], columns: [], relationships: [] }
};

async function checkDatabaseSchema() {
  console.log('🔍 Checking Database Schema...');
  console.log('=====================================');
  
  try {
    // Get all tables from database
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (tablesError) throw tablesError;
    
    results.database.tables = tables.map(t => t.table_name);
    console.log(`✅ Found ${results.database.tables.length} tables in database`);
    
    // Get column information for each table
    for (const tableName of results.database.tables) {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .order('ordinal_position');
      
      if (columnsError) {
        console.log(`⚠️  Could not get columns for ${tableName}: ${columnsError.message}`);
        continue;
      }
      
      results.database.columns[tableName] = columns;
    }
    
    // Get foreign key relationships
    const { data: relationships, error: relError } = await supabase
      .from('information_schema.table_constraints')
      .select(`
        table_name,
        constraint_name,
        constraint_type
      `)
      .eq('table_schema', 'public')
      .eq('constraint_type', 'FOREIGN KEY');
    
    if (!relError) {
      results.database.relationships = relationships;
    }
    
  } catch (error) {
    console.error('❌ Database schema check failed:', error.message);
  }
}

function checkTypeScriptTypes() {
  console.log('\n📝 Checking TypeScript Types...');
  console.log('=====================================');
  
  try {
    // Read supabase.ts file
    const supabaseTypesPath = path.join(__dirname, '..', 'types', 'supabase.ts');
    if (!fs.existsSync(supabaseTypesPath)) {
      console.log('❌ types/supabase.ts not found');
      return;
    }
    
    const supabaseContent = fs.readFileSync(supabaseTypesPath, 'utf8');
    
    // Extract table names from TypeScript types
    const tableMatches = supabaseContent.match(/Tables: \{([^}]+)\}/g);
    if (tableMatches) {
      const tableNames = [];
      for (const match of tableMatches) {
        const tableNameMatches = match.match(/(\w+): \{/g);
        if (tableNameMatches) {
          tableNames.push(...tableNameMatches.map(t => t.replace(':', '').replace(' {', '')));
        }
      }
      results.typescript.tables = tableNames;
    }
    
    console.log(`✅ Found ${results.typescript.tables.length} tables in TypeScript types`);
    
    // Extract column information from TypeScript types
    const columnMatches = supabaseContent.match(/(\w+): ([^,\n]+)/g);
    if (columnMatches) {
      for (const match of columnMatches) {
        const [columnName, columnType] = match.split(': ');
        if (columnName && columnType) {
          // This is a simplified extraction - in practice you'd need more sophisticated parsing
          results.typescript.columns[columnName] = columnType.trim();
        }
      }
    }
    
    // Check domain.ts file
    const domainTypesPath = path.join(__dirname, '..', 'types', 'domain.ts');
    if (fs.existsSync(domainTypesPath)) {
      const domainContent = fs.readFileSync(domainTypesPath, 'utf8');
      
      // Extract type definitions
      const typeMatches = domainContent.match(/export type (\w+) =/g);
      if (typeMatches) {
        results.typescript.types = typeMatches.map(t => t.replace('export type ', '').replace(' =', ''));
      }
    }
    
  } catch (error) {
    console.error('❌ TypeScript types check failed:', error.message);
  }
}

function checkCodeUsage() {
  console.log('\n💻 Checking Code Usage...');
  console.log('=====================================');
  
  try {
    const srcPath = path.join(__dirname, '..', 'src');
    if (!fs.existsSync(srcPath)) {
      console.log('❌ src directory not found');
      return;
    }
    
    // Scan for database-related imports and usage
    scanDirectory(srcPath);
    
    console.log(`✅ Found ${results.code.imports.length} database imports`);
    console.log(`✅ Found ${results.code.usage.length} database usages`);
    
  } catch (error) {
    console.error('❌ Code usage check failed:', error.message);
  }
}

function scanDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      scanFile(filePath);
    }
  }
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for Supabase imports
    const supabaseImports = content.match(/from ['"]@supabase\/supabase-js['"]/g);
    if (supabaseImports) {
      results.code.imports.push({
        file: path.relative(process.cwd(), filePath),
        type: 'supabase-js'
      });
    }
    
    // Check for type imports
    const typeImports = content.match(/from ['"]@\/types\/([^'"]+)['"]/g);
    if (typeImports) {
      results.code.imports.push({
        file: path.relative(process.cwd(), filePath),
        type: 'types'
      });
    }
    
    // Check for database table usage
    const tableUsage = content.match(/\.from\(['"](\w+)['"]\)/g);
    if (tableUsage) {
      results.code.usage.push({
        file: path.relative(process.cwd(), filePath),
        tables: tableUsage.map(t => t.match(/['"](\w+)['"]/)[1])
      });
    }
    
  } catch (error) {
    console.log(`⚠️  Could not read file ${filePath}: ${error.message}`);
  }
}

function findMismatches() {
  console.log('\n🔍 Finding Mismatches...');
  console.log('=====================================');
  
  // Check for tables that exist in database but not in TypeScript
  const dbOnlyTables = results.database.tables.filter(
    table => !results.typescript.tables.includes(table)
  );
  
  // Check for tables that exist in TypeScript but not in database
  const tsOnlyTables = results.typescript.tables.filter(
    table => !results.database.tables.includes(table)
  );
  
  // Check for tables that exist in TypeScript but not used in code
  const unusedTables = results.typescript.tables.filter(
    table => !results.code.usage.some(usage => usage.tables.includes(table))
  );
  
  // Check for tables used in code but not in TypeScript
  const usedTables = new Set();
  results.code.usage.forEach(usage => {
    usage.tables.forEach(table => usedTables.add(table));
  });
  
  const missingTypes = Array.from(usedTables).filter(
    table => !results.typescript.tables.includes(table)
  );
  
  // Store mismatches
  results.mismatches.tables = {
    dbOnly: dbOnlyTables,
    tsOnly: tsOnlyTables,
    unused: unusedTables,
    missingTypes: missingTypes
  };
  
  // Report mismatches
  if (dbOnlyTables.length > 0) {
    console.log(`❌ Tables in database but not in TypeScript: ${dbOnlyTables.join(', ')}`);
  }
  
  if (tsOnlyTables.length > 0) {
    console.log(`❌ Tables in TypeScript but not in database: ${tsOnlyTables.join(', ')}`);
  }
  
  if (unusedTables.length > 0) {
    console.log(`⚠️  Tables in TypeScript but not used in code: ${unusedTables.join(', ')}`);
  }
  
  if (missingTypes.length > 0) {
    console.log(`❌ Tables used in code but missing from TypeScript: ${missingTypes.join(', ')}`);
  }
  
  if (dbOnlyTables.length === 0 && tsOnlyTables.length === 0 && missingTypes.length === 0) {
    console.log('✅ All tables are properly synchronized!');
  }
}

function checkMigrationFiles() {
  console.log('\n📁 Checking Migration Files...');
  console.log('=====================================');
  
  try {
    const migrationsPath = path.join(__dirname, '..', 'migrations');
    if (!fs.existsSync(migrationsPath)) {
      console.log('❌ migrations directory not found');
      return;
    }
    
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`✅ Found ${migrationFiles.length} migration files`);
    
    // Check for table creation in migrations
    const migrationTables = new Set();
    
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract table names from CREATE TABLE statements
      const createMatches = content.match(/CREATE TABLE (?:IF NOT EXISTS )?public\.(\w+)/g);
      if (createMatches) {
        createMatches.forEach(match => {
          const tableName = match.match(/public\.(\w+)/)[1];
          migrationTables.add(tableName);
        });
      }
    }
    
    // Check for tables in migrations but not in database
    const migrationOnlyTables = Array.from(migrationTables).filter(
      table => !results.database.tables.includes(table)
    );
    
    if (migrationOnlyTables.length > 0) {
      console.log(`⚠️  Tables in migrations but not in database: ${migrationOnlyTables.join(', ')}`);
    } else {
      console.log('✅ All migration tables exist in database');
    }
    
  } catch (error) {
    console.error('❌ Migration files check failed:', error.message);
  }
}

function generateReport() {
  console.log('\n📊 GENERATING COMPREHENSIVE REPORT');
  console.log('=====================================');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      databaseTables: results.database.tables.length,
      typescriptTables: results.typescript.tables.length,
      codeFiles: results.code.imports.length,
      mismatches: {
        dbOnlyTables: results.mismatches.tables.dbOnly.length,
        tsOnlyTables: results.mismatches.tables.tsOnly.length,
        unusedTables: results.mismatches.tables.unused.length,
        missingTypes: results.mismatches.tables.missingTypes.length
      }
    },
    details: results
  };
  
  // Save report to file
  const reportPath = path.join(__dirname, '..', 'schema-sync-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📄 Report saved to: ${reportPath}`);
  
  // Print summary
  console.log('\n📈 SUMMARY');
  console.log('=====================================');
  console.log(`Database Tables: ${report.summary.databaseTables}`);
  console.log(`TypeScript Tables: ${report.summary.typescriptTables}`);
  console.log(`Code Files: ${report.summary.codeFiles}`);
  console.log(`Mismatches: ${report.summary.mismatches.dbOnlyTables + report.summary.mismatches.tsOnlyTables + report.summary.mismatches.missingTypes}`);
  
  if (report.summary.mismatches.dbOnlyTables + report.summary.mismatches.tsOnlyTables + report.summary.mismatches.missingTypes === 0) {
    console.log('\n🎉 PERFECT SYNCHRONIZATION!');
    console.log('All database tables, TypeScript types, and code usage are properly aligned.');
  } else {
    console.log('\n⚠️  SYNCHRONIZATION ISSUES FOUND');
    console.log('Please review the mismatches above and update accordingly.');
  }
}

async function runComprehensiveCheck() {
  console.log('🚀 Starting Comprehensive Schema Synchronization Check...');
  console.log('============================================================');
  
  await checkDatabaseSchema();
  checkTypeScriptTypes();
  checkCodeUsage();
  findMismatches();
  checkMigrationFiles();
  generateReport();
  
  console.log('\n============================================================');
  console.log('✅ Comprehensive check completed!');
}

// Run the check
runComprehensiveCheck().catch(error => {
  console.error('❌ Comprehensive check failed:', error);
  process.exit(1);
});
