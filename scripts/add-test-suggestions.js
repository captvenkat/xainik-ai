// =====================================================
// ADD TEST SUGGESTIONS AND VOTES
// Xainik Platform - Test Voting System
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function addTestSuggestions() {
  console.log('🔧 Adding test suggestions and votes...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Get existing users
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(5);

    if (!users || users.length === 0) {
      console.log('❌ No users found. Please create some users first.');
      return;
    }

    console.log(`✅ Found ${users.length} users`);

    // Add test suggestions
    const testSuggestions = [
      {
        title: 'Add Dark Mode Support',
        description: 'It would be great to have a dark mode option for better user experience, especially for users who prefer dark themes.',
        suggestion_type: 'feature',
        user_id: users[0].id,
        status: 'pending',
        priority: 'medium',
        votes: 0
      },
      {
        title: 'Improve Mobile Responsiveness',
        description: 'The mobile experience could be enhanced with better touch interactions and responsive design.',
        suggestion_type: 'improvement',
        user_id: users[0].id,
        status: 'pending',
        priority: 'high',
        votes: 0
      },
      {
        title: 'Fix Login Button Alignment',
        description: 'The login button on the homepage appears misaligned on certain screen sizes.',
        suggestion_type: 'bug',
        user_id: users[0].id,
        status: 'pending',
        priority: 'low',
        votes: 0
      },
      {
        title: 'Add Email Notifications',
        description: 'Users should receive email notifications for important updates and activities.',
        suggestion_type: 'feature',
        user_id: users[0].id,
        status: 'pending',
        priority: 'medium',
        votes: 0
      },
      {
        title: 'Optimize Database Queries',
        description: 'Some database queries are taking too long to execute, affecting user experience.',
        suggestion_type: 'improvement',
        user_id: users[0].id,
        status: 'pending',
        priority: 'high',
        votes: 0
      }
    ];

    console.log('📝 Adding test suggestions...');
    
    for (const suggestion of testSuggestions) {
      const { data, error } = await supabase
        .from('community_suggestions')
        .insert(suggestion)
        .select()
        .single();

      if (error) {
        console.log(`❌ Error adding suggestion "${suggestion.title}":`, error.message);
      } else {
        console.log(`✅ Added suggestion: ${suggestion.title}`);
      }
    }

    // Get the suggestions we just created
    const { data: suggestions } = await supabase
      .from('community_suggestions')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(5);

    if (suggestions && suggestions.length > 0) {
      console.log('\n🗳️  Adding test votes...');
      
      // Add some test votes
      const testVotes = [
        { suggestion_id: suggestions[0].id, user_id: users[0].id, vote_type: 'upvote' },
        { suggestion_id: suggestions[0].id, user_id: users[1]?.id, vote_type: 'upvote' },
        { suggestion_id: suggestions[1].id, user_id: users[0].id, vote_type: 'upvote' },
        { suggestion_id: suggestions[1].id, user_id: users[1]?.id, vote_type: 'downvote' },
        { suggestion_id: suggestions[2].id, user_id: users[0].id, vote_type: 'upvote' },
        { suggestion_id: suggestions[3].id, user_id: users[0].id, vote_type: 'upvote' },
        { suggestion_id: suggestions[3].id, user_id: users[1]?.id, vote_type: 'upvote' },
        { suggestion_id: suggestions[4].id, user_id: users[0].id, vote_type: 'upvote' }
      ];

      for (const vote of testVotes) {
        if (vote.user_id) {
          const { error } = await supabase
            .from('community_suggestion_votes')
            .insert(vote);

          if (error) {
            console.log(`❌ Error adding vote:`, error.message);
          } else {
            console.log(`✅ Added vote: ${vote.vote_type} on suggestion`);
          }
        }
      }

      // Update vote counts on suggestions
      console.log('\n📊 Updating vote counts...');
      for (const suggestion of suggestions) {
        const { data: votes } = await supabase
          .from('community_suggestion_votes')
          .select('vote_type')
          .eq('suggestion_id', suggestion.id);

        if (votes) {
          const upvotes = votes.filter(v => v.vote_type === 'upvote').length;
          const downvotes = votes.filter(v => v.vote_type === 'downvote').length;
          const totalVotes = upvotes - downvotes;

          const { error } = await supabase
            .from('community_suggestions')
            .update({ votes: totalVotes })
            .eq('id', suggestion.id);

          if (error) {
            console.log(`❌ Error updating vote count:`, error.message);
          } else {
            console.log(`✅ Updated suggestion vote count: ${totalVotes}`);
          }
        }
      }
    }

    console.log('\n🎉 Test data added successfully!');
    console.log('📋 You can now test the voting system with real data.');

  } catch (error) {
    console.error('❌ Error adding test data:', error.message);
  }
}

if (require.main === module) {
  addTestSuggestions();
}

module.exports = { addTestSuggestions };
