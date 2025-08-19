// Test Community Suggestions
// Run this in browser console to debug

async function testCommunitySuggestions() {
  console.log('🔍 Testing Community Suggestions...')
  
  try {
    // Test 1: Check if we can access the table
    const { data: suggestions, error: suggestionsError } = await supabase
      .from('community_suggestions')
      .select('*')
      .limit(5)
    
    console.log('📋 Suggestions data:', suggestions)
    console.log('❌ Suggestions error:', suggestionsError)
    
    // Test 2: Check if view exists
    const { data: summary, error: summaryError } = await supabase
      .from('community_suggestions_summary')
      .select('*')
      .single()
    
    console.log('📊 Summary data:', summary)
    console.log('❌ Summary error:', summaryError)
    
    // Test 3: Check table structure
    const { data: columns, error: columnsError } = await supabase
      .from('community_suggestions')
      .select('id, title, description, category, suggestion_type, status, priority, votes, created_at')
      .limit(1)
    
    console.log('🏗️ Table structure sample:', columns)
    console.log('❌ Structure error:', columnsError)
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

// Run the test
testCommunitySuggestions()
