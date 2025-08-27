require('dotenv').config({ path: '.env.local' })

async function testPitchOwnerAPI() {
  console.log('🔍 Testing Pitch Owner API\n')

  const pitchId = 'b8348447-2064-44eb-852c-f6ca4e2b7f4f'

  try {
    // Test the pitch owner API
    console.log('1️⃣ Testing pitch owner API...')
    const response = await fetch(`https://xainik-6rm1adah0-venkats-projects-596bb496.vercel.app/api/pitch/${pitchId}/owner`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Pitch owner API response:', data)
      console.log(`👤 User ID: ${data.userId}`)
    } else {
      const errorText = await response.text()
      console.log(`❌ Pitch owner API failed: ${response.status} - ${errorText}`)
    }

    // Test the track-event API with the user ID
    console.log('\n2️⃣ Testing track-event API with user ID...')
    const trackResponse = await fetch('https://xainik-6rm1adah0-venkats-projects-596bb496.vercel.app/api/pitch/b8348447-2064-44eb-852c-f6ca4e2b7f4f/owner')
    
    if (trackResponse.ok) {
      const ownerData = await trackResponse.json()
      const userId = ownerData.userId
      
      const testEvent = {
        eventType: 'CALL_CLICKED',
        pitchId: pitchId,
        userId: userId,
        platform: 'test',
        userAgent: 'Test Agent',
        ipAddress: '127.0.0.1',
        sessionId: 'test-session-' + Date.now(),
        metadata: { source: 'test-pitch-owner-api' },
        timestamp: new Date().toISOString()
      }

      console.log('📤 Sending call tracking event:', testEvent)

      const trackEventResponse = await fetch('https://xainik-6rm1adah0-venkats-projects-596bb496.vercel.app/api/track-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testEvent)
      })

      if (trackEventResponse.ok) {
        const result = await trackEventResponse.json()
        console.log('✅ Call tracking API response:', result)
      } else {
        const errorText = await trackEventResponse.text()
        console.log(`❌ Call tracking API failed: ${trackEventResponse.status} - ${errorText}`)
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testPitchOwnerAPI()
