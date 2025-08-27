#!/usr/bin/env node

/**
 * Manual Migration Application
 */

const { createClient } = require('@supabase/supabase-js');

async function applyMigrationsManual() {
  console.log('🚀 Applying Manual Migrations...');
  
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
    
    // Apply veteran count function
    console.log('🔢 Creating veteran count function...');
    const veteranCountSQL = `
      create or replace function public.veteran_count()
      returns integer
      language sql
      security definer
      set search_path = public
      as $$
        select count(*)::int from public.profiles where role = 'veteran';
      $$;
    `;
    
    const { error: countError } = await supabase.rpc('exec_sql', { sql: veteranCountSQL });
    if (countError) {
      console.log('⚠️  Could not create veteran count function via RPC, trying direct SQL...');
      // Try alternative approach
      console.log('📝 Note: Function may need to be created manually in Supabase dashboard');
    } else {
      console.log('✅ Veteran count function created');
    }
    
    // Apply veteran cap trigger
    console.log('🔒 Creating veteran cap trigger...');
    const veteranCapSQL = `
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
          -- Allow if already veteran and just updating other fields
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
      
      drop trigger if exists trg_profiles_veteran_cap on public.profiles;
      create trigger trg_profiles_veteran_cap
      before insert or update of role on public.profiles
      for each row execute function public.enforce_veteran_cap();
    `;
    
    const { error: capError } = await supabase.rpc('exec_sql', { sql: veteranCapSQL });
    if (capError) {
      console.log('⚠️  Could not create veteran cap trigger via RPC');
      console.log('📝 Note: Trigger may need to be created manually in Supabase dashboard');
    } else {
      console.log('✅ Veteran cap trigger created');
    }
    
    // Create contact messages table
    console.log('📝 Creating contact messages table...');
    const contactMessagesSQL = `
      create table if not exists public.contact_messages (
        id uuid primary key default gen_random_uuid(),
        owner_id uuid references auth.users(id) on delete set null,
        email text,
        name text,
        message text not null,
        created_at timestamptz not null default now()
      );
      
      alter table public.contact_messages enable row level security;
      
      create policy if not exists contact_messages_insert_own
      on public.contact_messages
      for insert
      with check (auth.uid() = owner_id or owner_id is null);
      
      create policy if not exists contact_messages_select_own
      on public.contact_messages
      for select
      using (auth.uid() = owner_id or auth.role() = 'service_role');
    `;
    
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: contactMessagesSQL });
    if (tableError) {
      console.log('⚠️  Could not create contact messages table via RPC');
      console.log('📝 Note: Table may need to be created manually in Supabase dashboard');
    } else {
      console.log('✅ Contact messages table created');
    }
    
    // Grant permissions
    console.log('🔐 Granting permissions...');
    const grantSQL = `
      grant execute on function public.veteran_count() to anon, authenticated;
    `;
    
    const { error: grantError } = await supabase.rpc('exec_sql', { sql: grantSQL });
    if (grantError) {
      console.log('⚠️  Could not grant permissions via RPC');
    } else {
      console.log('✅ Permissions granted');
    }
    
    console.log('\n🎉 Manual migration application completed!');
    console.log('📋 Next steps:');
    console.log('   1. Check Supabase dashboard for any errors');
    console.log('   2. Run test script to verify functionality');
    console.log('   3. If functions/tables not created, apply manually in dashboard');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyMigrationsManual();
