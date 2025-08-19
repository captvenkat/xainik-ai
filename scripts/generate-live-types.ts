import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

// =====================================================
// FETCH LIVE DATABASE SCHEMA AND GENERATE TYPESCRIPT
// =====================================================

async function generateLiveTypes() {
  console.log('🔍 Generating Live TypeScript Types from Supabase...')
  console.log('====================================================')

  try {
    // Get all tables in public schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables_info')
      .select()

    if (tablesError) {
      console.log('RPC not available, using information_schema...')
      
      // Fallback: Query information_schema directly
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE')

      if (schemaError) {
        console.error('Failed to fetch schema:', schemaError)
        return await generateTypesFromSampleData()
      }

      console.log('Tables found:', schemaData?.map(t => t.table_name))
      return await generateTypesFromInformationSchema()
    }

    console.log('Tables found:', tables)
    return await generateTypesFromTables(tables)

  } catch (error) {
    console.error('Error generating types:', error)
    return await generateTypesFromSampleData()
  }
}

// =====================================================
// GENERATE TYPES FROM SAMPLE DATA (MOST RELIABLE)
// =====================================================

async function generateTypesFromSampleData() {
  console.log('📊 Generating types from sample data...')

  const tableQueries = [
    'users',
    'pitches', 
    'veterans',
    'recruiters',
    'supporters',
    'endorsements',
    'referrals',
    'referral_events',
    'shared_pitches',
    'donations',
    'activity_log',
    'resume_requests',
    'notifications',
    'notification_prefs',
    'email_logs'
  ]

  const tableSchemas: Record<string, any> = {}

  for (const tableName of tableQueries) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (error) {
        console.log(`❌ Table ${tableName}: ${error.message}`)
        continue
      }

      if (data && data.length > 0) {
        const sample = data[0]
        const schema = generateSchemaFromSample(sample)
        tableSchemas[tableName] = schema
        console.log(`✅ Table ${tableName}: schema extracted`)
      } else {
        console.log(`⚠️  Table ${tableName}: no data, inferring basic schema`)
        tableSchemas[tableName] = await inferEmptyTableSchema(tableName)
      }
    } catch (err) {
      console.log(`❌ Table ${tableName}: ${err}`)
    }
  }

  return generateTypeScriptFile(tableSchemas)
}

// =====================================================
// INFER SCHEMA FROM SAMPLE ROW
// =====================================================

function generateSchemaFromSample(sample: any): any {
  const schema: any = {}
  
  for (const [key, value] of Object.entries(sample)) {
    if (value === null) {
      schema[key] = 'string | null'
    } else if (typeof value === 'string') {
      // Check if it's a timestamp
      if (key.includes('_at') || key.includes('timestamp') || key === 'created' || key === 'updated') {
        schema[key] = 'string' // ISO timestamp
      } else if (key === 'id' || key.endsWith('_id')) {
        schema[key] = 'string' // UUID
      } else {
        schema[key] = 'string'
      }
    } else if (typeof value === 'number') {
      schema[key] = 'number'
    } else if (typeof value === 'boolean') {
      schema[key] = 'boolean'
    } else if (Array.isArray(value)) {
      schema[key] = 'any[]'
    } else if (typeof value === 'object') {
      schema[key] = 'any' // JSON objects
    } else {
      schema[key] = 'any'
    }
  }

  return schema
}

// =====================================================
// INFER SCHEMA FOR EMPTY TABLES
// =====================================================

async function inferEmptyTableSchema(tableName: string): Promise<any> {
  const commonSchemas: Record<string, any> = {
    users: {
      id: 'string',
      email: 'string',
      name: 'string | null',
      created_at: 'string',
      updated_at: 'string',
      role: 'string | null'
    },
    pitches: {
      id: 'string',
      user_id: 'string',
      title: 'string',
      pitch: 'string',
      created_at: 'string',
      updated_at: 'string',
      allow_resume_requests: 'boolean | null'
    },
    resume_requests: {
      id: 'string',
      recruiter_id: 'string',
      veteran_id: 'string',
      pitch_id: 'string',
      status: 'string',
      job_role: 'string | null',
      message: 'string | null',
      created_at: 'string',
      responded_at: 'string | null'
    }
  }

  return commonSchemas[tableName] || {
    id: 'string',
    created_at: 'string',
    updated_at: 'string'
  }
}

// =====================================================
// GENERATE TYPESCRIPT FILE
// =====================================================

function generateTypeScriptFile(tableSchemas: Record<string, any>): string {
  let typescript = `// =====================================================
// LIVE DATABASE SCHEMA TYPES
// Generated from Supabase Database
// Generated at: ${new Date().toISOString()}
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
`

  // Generate table types
  for (const [tableName, schema] of Object.entries(tableSchemas)) {
    typescript += `      ${tableName}: {
        Row: {
`
    
    for (const [column, type] of Object.entries(schema)) {
      typescript += `          ${column}: ${type}\n`
    }

    typescript += `        }
        Insert: {
`
    
    for (const [column, type] of Object.entries(schema)) {
      // Make optional for Insert if it's an ID or timestamp
      const isOptional = column === 'id' || column.includes('_at') || column === 'created' || column === 'updated'
      const optionalType = isOptional ? `${type} | undefined` : type
      typescript += `          ${column}${isOptional ? '?' : ''}: ${optionalType}\n`
    }

    typescript += `        }
        Update: {
`
    
    for (const [column, type] of Object.entries(schema)) {
      // All fields optional for Update
      typescript += `          ${column}?: ${type} | undefined\n`
    }

    typescript += `        }
        Relationships: []
      }
`
  }

  typescript += `    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// =====================================================
// CONVENIENCE TYPE EXPORTS
// =====================================================

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

// =====================================================
// SPECIFIC TABLE TYPE EXPORTS FOR CONVENIENCE
// =====================================================

`

  // Add specific exports for each table
  for (const tableName of Object.keys(tableSchemas)) {
    const capitalizedName = tableName.charAt(0).toUpperCase() + tableName.slice(1)
    typescript += `export type ${capitalizedName} = Tables<'${tableName}'>\n`
    typescript += `export type ${capitalizedName}Insert = TablesInsert<'${tableName}'>\n`
    typescript += `export type ${capitalizedName}Update = TablesUpdate<'${tableName}'>\n\n`
  }

  return typescript
}

// =====================================================
// FALLBACK METHODS
// =====================================================

async function generateTypesFromInformationSchema() {
  console.log('📋 Using information_schema fallback...')
  // This would require more complex queries to get column info
  return generateTypesFromSampleData()
}

async function generateTypesFromTables(tables: any[]) {
  console.log('📋 Using table info...')
  return generateTypesFromSampleData()
}

// =====================================================
// MAIN EXECUTION
// =====================================================

async function main() {
  try {
    const typescriptContent = await generateLiveTypes()
    
    // Write to types file
    const typesDir = path.join(process.cwd(), 'types')
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true })
    }
    
    const typesFile = path.join(typesDir, 'live-schema.ts')
    fs.writeFileSync(typesFile, typescriptContent)
    
    console.log('✅ Live TypeScript types generated successfully!')
    console.log(`📁 File: ${typesFile}`)
    
  } catch (error) {
    console.error('❌ Failed to generate types:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { main as generateLiveTypes }
