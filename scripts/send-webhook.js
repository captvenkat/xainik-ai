#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function sendWebhook(fixturePath) {
  try {
    console.log(`📤 Sending webhook from fixture: ${fixturePath}`);
    
    // Read the fixture file
    const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    
    // Convert to string for signature generation
    const body = JSON.stringify(fixture);
    
    // Generate HMAC signature
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    
    // Send to local webhook endpoint
    const response = await fetch('http://localhost:3000/api/razorpay/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature
      },
      body: body
    });
    
    const result = await response.text();
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📄 Response Body: ${result}`);
    
    if (response.ok) {
      console.log('✅ Webhook sent successfully');
    } else {
      console.log('❌ Webhook failed');
    }
    
    return { status: response.status, body: result };
    
  } catch (error) {
    console.error('❌ Error sending webhook:', error);
    throw error;
  }
}

// Main execution
const fixturePath = process.argv[2];

if (!fixturePath) {
  console.error('❌ Please provide a fixture path');
  console.log('Usage: node scripts/send-webhook.js <fixture-path>');
  process.exit(1);
}

if (!fs.existsSync(fixturePath)) {
  console.error(`❌ Fixture file not found: ${fixturePath}`);
  process.exit(1);
}

sendWebhook(fixturePath)
  .then(() => {
    console.log('🏁 Webhook test completed');
  })
  .catch((error) => {
    console.error('💥 Webhook test failed:', error);
    process.exit(1);
  });
