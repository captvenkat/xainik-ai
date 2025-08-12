// =====================================================
// DEBUG WEBHOOK SCRIPT
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/live-schema';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

async function debugWebhook() {
  try {
    console.log('🔍 Debugging webhook functionality...');

    // Test webhook event data - matching the actual schema
    const testEvent = {
      user_id: null, // No user associated for test
      event_id: 'test_webhook_' + Date.now(),
      event_type: 'payment.captured',
      payment_id: 'pay_test_' + Date.now(),
      order_id: null,
      event_data: {
        test: true,
        timestamp: new Date().toISOString(),
        amount_cents: 1000,
        currency: 'INR',
        status: 'captured',
        payment_method: 'card'
      },
      created_at: new Date().toISOString(),
      archived_at: new Date().toISOString()
    };

    console.log('📝 Inserting test webhook event...');

    const { data: paymentEvent, error } = await adminClient
      .from('payment_events_archive')
      .insert(testEvent)
      .select('id')
      .single();

    if (error) {
      console.error('❌ Failed to insert webhook event:', error);
      return;
    }

    console.log('✅ Webhook event inserted successfully:', paymentEvent);

    // Test donation creation
    const testDonation = {
      payment_id: testEvent.payment_id,
      amount_cents: 1000,
      currency: 'INR',
      donor_email: 'test@example.com',
      donor_name: 'Test Donor',
      is_anonymous: false,
      status: 'completed',
      created_at: new Date().toISOString()
    };

    console.log('📝 Inserting test donation...');

    const { data: donation, error: donationError } = await adminClient
      .from('donations')
      .insert(testDonation)
      .select('id')
      .single();

    if (donationError) {
      console.error('❌ Failed to insert donation:', donationError);
      return;
    }

    console.log('✅ Donation inserted successfully:', donation);

    console.log('🎉 Webhook debugging completed successfully!');

  } catch (error) {
    console.error('💥 Webhook debugging failed:', error);
  }
}

// Run the debug function
debugWebhook();
