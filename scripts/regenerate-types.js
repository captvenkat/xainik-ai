#!/usr/bin/env node

/**
 * Regenerate TypeScript Types
 * Regenerates the live-schema.ts file from the current database schema
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function regenerateTypes() {
  console.log('🔄 Regenerating TypeScript types...');
  
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔍 Testing connection...');
    const { error } = await supabase.from('users').select('*').limit(1);
    if (error) throw new Error(`Connection failed: ${error.message}`);
    console.log('✅ Connection successful');
    
    // Get the current schema
    console.log('\n📋 Fetching current database schema...');
    
    const { data: schemaData, error: schemaError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name IN (
          'users', 'veterans', 'recruiters', 'supporters', 'pitches', 
          'endorsements', 'referrals', 'referral_events', 'shared_pitches',
          'donations', 'activity_log', 'resume_requests', 'notifications',
          'notification_prefs', 'email_logs', 'community_suggestions',
          'community_suggestions_with_votes', 'mission_invitation_summary'
        )
        ORDER BY table_name, ordinal_position;
      `
    });
    
    if (schemaError) {
      console.log(`❌ Schema fetch: ${schemaError.message}`);
      return;
    }
    
    console.log(`✅ Schema fetched: ${schemaData.length} columns`);
    
    // Group by table
    const tables = {};
    schemaData.forEach(row => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      tables[row.table_name].push(row);
    });
    
    console.log(`📊 Found ${Object.keys(tables).length} tables`);
    
    // Generate TypeScript types
    console.log('\n🔧 Generating TypeScript types...');
    
    let typesContent = `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
`;

    // Generate table types
    Object.keys(tables).forEach(tableName => {
      const columns = tables[tableName];
      
      typesContent += `      ${tableName}: {
        Row: {
`;
      
      columns.forEach(column => {
        const tsType = getTypeScriptType(column.data_type, column.is_nullable === 'YES');
        typesContent += `          ${column.column_name}: ${tsType}\n`;
      });
      
      typesContent += `        }
        Insert: {
`;
      
      columns.forEach(column => {
        const tsType = getTypeScriptType(column.data_type, column.is_nullable === 'YES');
        const isOptional = column.column_default || column.is_nullable === 'YES';
        typesContent += `          ${column.column_name}${isOptional ? '?' : ''}: ${tsType}\n`;
      });
      
      typesContent += `        }
        Update: {
`;
      
      columns.forEach(column => {
        const tsType = getTypeScriptType(column.data_type, column.is_nullable === 'YES');
        typesContent += `          ${column.column_name}?: ${tsType}\n`;
      });
      
      typesContent += `        }
        Relationships: []
      }
`;
    });
    
    typesContent += `    }
    Views: {
      community_suggestions_summary: {
        Row: {
          total_suggestions: number | null
          approved_suggestions: number | null
          pending_suggestions: number | null
          rejected_suggestions: number | null
          total_votes: number | null
          average_votes: number | null
          feature_suggestions: number | null
          ui_suggestions: number | null
          bug_suggestions: number | null
        }
        Insert: {
          total_suggestions?: number | null
          approved_suggestions?: number | null
          pending_suggestions?: number | null
          rejected_suggestions?: number | null
          total_votes?: number | null
          average_votes?: number | null
          feature_suggestions?: number | null
          ui_suggestions?: number | null
          bug_suggestions?: number | null
        }
        Update: {
          total_suggestions?: number | null
          approved_suggestions?: number | null
          pending_suggestions?: number | null
          rejected_suggestions?: number | null
          total_votes?: number | null
          average_votes?: number | null
          feature_suggestions?: number | null
          ui_suggestions?: number | null
          bug_suggestions?: number | null
        }
        Relationships: []
      }
      activity_recent: {
        Row: {
          id: string | null
          event: string | null
          meta: Json | null
          created_at: string | null
          display_text: string | null
        }
        Insert: {
          id?: string | null
          event?: string | null
          meta?: Json | null
          created_at?: string | null
          display_text?: string | null
        }
        Update: {
          id?: string | null
          event?: string | null
          meta?: Json | null
          created_at?: string | null
          display_text?: string | null
        }
        Relationships: []
      }
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName]
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"])[PublicTableNameOrOptions]
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName]
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"])[PublicTableNameOrOptions]
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName]
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"])[PublicTableNameOrOptions]
    : never

export type Views<
  PublicViewNameOrOptions extends
    | keyof (Database["public"]["Views"])
    | { schema: keyof Database },
  ViewName extends PublicViewNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicViewNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicViewNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicViewNameOrOptions["schema"]]["Views"])[ViewName]
  : PublicViewNameOrOptions extends keyof (Database["public"]["Views"])
    ? (Database["public"]["Views"])[PublicViewNameOrOptions]
    : never
`;

    // Write the types file
    const typesPath = path.join(__dirname, '../types/live-schema.ts');
    fs.writeFileSync(typesPath, typesContent);
    
    console.log(`✅ Types written to ${typesPath}`);
    console.log('\n🎉 TypeScript types regenerated successfully!');
    console.log('💡 You may need to restart your development server for changes to take effect');
    
  } catch (error) {
    console.error('\n❌ Type regeneration failed:', error.message);
  }
}

function getTypeScriptType(sqlType, isNullable) {
  let tsType = 'string';
  
  if (sqlType.includes('int') || sqlType.includes('numeric') || sqlType.includes('decimal')) {
    tsType = 'number';
  } else if (sqlType.includes('bool')) {
    tsType = 'boolean';
  } else if (sqlType.includes('json')) {
    tsType = 'Json';
  } else if (sqlType.includes('uuid')) {
    tsType = 'string';
  } else if (sqlType.includes('timestamp')) {
    tsType = 'string';
  } else if (sqlType.includes('array')) {
    tsType = 'string[]';
  }
  
  return isNullable ? `${tsType} | null` : tsType;
}

if (require.main === module) {
  regenerateTypes().catch(console.error);
}

module.exports = { regenerateTypes };
