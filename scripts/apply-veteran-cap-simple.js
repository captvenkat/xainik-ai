#!/usr/bin/env node

/**
 * Simple Veteran Cap Migration
 */

const { createClient } = require('@supabase/supabase-js');

async function applyVeteranCapSimple() {
  console.log('🚀 Applying Simple Veteran Cap Migration...');
  
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
    const { error } = await supabase.from('profiles').select('*').limit(1);
    if (error) throw new Error(`Connection failed: ${error.message}`);
    console.log('✅ Connection successful');
    
    // 1. Create veteran count function
    console.log('\n🔧 Creating veteran count function...');
    const veteranCountFunction = `
      create or replace function public.veteran_count()
      returns integer
      language sql
      security definer
      set search_path = public
      as $$
        select count(*)::int from public.profiles where role = 'veteran';
      $$;
    `;
    
    const { error: funcError } = await supabase.rpc('exec_sql', {
      sql_query: veteranCountFunction
    });
    
    if (funcError) {
      console.log(`⚠️  Function creation: ${funcError.message}`);
    } else {
      console.log('✅ Veteran count function created');
    }
    
    // 2. Create enforce veteran cap function
    console.log('\n🔧 Creating veteran cap enforcement function...');
    const enforceCapFunction = `
      create or replace function public.enforce_veteran_cap()
      returns trigger
      language plpgsql
      security definer
      set search_path = public
      as $$
      declare
        v_count int;
      begin
        if new.role = 'veteran' then
          if tg_op = 'UPDATE' and old.role = 'veteran' then
            return new;
          end if;
          select count(*) into v_count from public.profiles where role = 'veteran';
          if v_count >= 50 then
            raise exception 'Veteran registrations are closed (cap reached)';
          end if;
        end if;
        return new;
      end;
      $$;
    `;
    
    const { error: capFuncError } = await supabase.rpc('exec_sql', {
      sql_query: enforceCapFunction
    });
    
    if (capFuncError) {
      console.log(`⚠️  Cap function creation: ${capFuncError.message}`);
    } else {
      console.log('✅ Veteran cap enforcement function created');
    }
    
    // 3. Create trigger
    console.log('\n🔧 Creating veteran cap trigger...');
    const triggerSql = `
      drop trigger if exists trg_profiles_veteran_cap on public.profiles;
      create trigger trg_profiles_veteran_cap
      before insert or update of role on public.profiles
      for each row execute function public.enforce_veteran_cap();
    `;
    
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql_query: triggerSql
    });
    
    if (triggerError) {
      console.log(`⚠️  Trigger creation: ${triggerError.message}`);
    } else {
      console.log('✅ Veteran cap trigger created');
    }
    
    // 4. Grant permissions
    console.log('\n🔧 Granting permissions...');
    const grantSql = `
      grant execute on function public.veteran_count() to anon, authenticated;
    `;
    
    const { error: grantError } = await supabase.rpc('exec_sql', {
      sql_query: grantSql
    });
    
    if (grantError) {
      console.log(`⚠️  Grant permissions: ${grantError.message}`);
    } else {
      console.log('✅ Permissions granted');
    }
    
    // 5. Create contact messages table
    console.log('\n🔧 Creating contact messages table...');
    const contactTableSql = `
      create table if not exists public.contact_messages (
        id uuid primary key default gen_random_uuid(),
        owner_id uuid references auth.users(id) on delete set null,
        email text,
        name text,
        message text not null,
        created_at timestamptz not null default now()
      );
    `;
    
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql_query: contactTableSql
    });
    
    if (tableError) {
      console.log(`⚠️  Contact table creation: ${tableError.message}`);
    } else {
      console.log('✅ Contact messages table created');
    }
    
    // 6. Enable RLS and create policies
    console.log('\n🔧 Setting up RLS policies...');
    const rlsSql = `
      alter table public.contact_messages enable row level security;
      
      drop policy if exists contact_messages_insert_own on public.contact_messages;
      create policy contact_messages_insert_own
      on public.contact_messages
      for insert
      with check (auth.uid() = owner_id or owner_id is null);
      
      drop policy if exists contact_messages_select_own on public.contact_messages;
      create policy contact_messages_select_own
      on public.contact_messages
      for select
      using (auth.uid() = owner_id);
    `;
    
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: rlsSql
    });
    
    if (rlsError) {
      console.log(`⚠️  RLS setup: ${rlsError.message}`);
    } else {
      console.log('✅ RLS policies created');
    }
    
    console.log('\n🎉 Simple Veteran Cap Migration completed!');
    
    // Test the veteran count function
    console.log('\n🧪 Testing veteran count function...');
    const { data: count, error: countError } = await supabase.rpc('veteran_count');
    if (countError) {
      console.log(`⚠️  Veteran count test failed: ${countError.message}`);
    } else {
      console.log(`✅ Veteran count: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyVeteranCapSimple();
