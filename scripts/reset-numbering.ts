import { createAdminClient } from '../src/lib/supabaseAdmin'

async function resetNumbering() {
  console.log('🔄 Resetting Numbering State...')
  console.log('===============================')
  
  const adminClient = createAdminClient()

  try {
    // Check current numbering state
    console.log('📋 Checking current numbering state...')
    const { data: currentState, error: selectError } = await adminClient
      .from('numbering_state')
      .select('*')
    
    if (selectError) {
      console.log('❌ Error checking numbering state:', selectError)
    } else {
      console.log('📊 Current numbering state:', currentState)
    }

    // Reset numbering state by deleting all records
    console.log('🗑️  Resetting numbering state...')
    const { error: deleteError } = await adminClient
      .from('numbering_state')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
    
    if (deleteError) {
      console.log('❌ Error resetting numbering state:', deleteError)
    } else {
      console.log('✅ Numbering state reset successfully')
    }

    // Verify reset
    const { data: newState, error: verifyError } = await adminClient
      .from('numbering_state')
      .select('*')
    
    if (verifyError) {
      console.log('❌ Error verifying reset:', verifyError)
    } else {
      console.log('📊 Numbering state after reset:', newState)
    }

  } catch (error) {
    console.log('❌ Error in numbering reset:', error)
  }

  console.log('\n🏁 Numbering reset completed!')
}

resetNumbering().catch(console.error)
