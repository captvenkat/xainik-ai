import { ImageResponse } from '@vercel/og'
import { makeMockPitch } from '@/lib/mockData'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || '0'
    
    const mockPitch = makeMockPitch(parseInt(id))

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f8fafc',
            padding: '40px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#1e293b',
                marginBottom: '16px',
              }}
            >
              Recruiter Connect Panel
            </div>
            <div
              style={{
                fontSize: '20px',
                color: '#64748b',
              }}
            >
              Skip the noise. Hire faster.
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
            }}
          >
            {/* Left - Veteran Profile */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                width: '350px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}
              >
                {mockPitch.name}
              </div>
              
              <div
                style={{
                  fontSize: '16px',
                  color: '#64748b',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}
              >
                {mockPitch.service} • {mockPitch.city}
              </div>
              
              <div
                style={{
                  fontSize: '14px',
                  color: '#475569',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                }}
              >
                <strong>Target Roles:</strong>
                <br />
                {mockPitch.targetRoles.join(', ')}
              </div>
              
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  color: '#64748b',
                }}
              >
                <span>Opens: {mockPitch.stats.opens}</span>
                <span>Clicks: {mockPitch.stats.clicks}</span>
                <span>Endorsements: {mockPitch.endorsements}</span>
              </div>
            </div>

            {/* Right - Action Panel */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                width: '400px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: '24px',
                  textAlign: 'center',
                }}
              >
                Instant Connect
              </div>
              
              {/* Call Button */}
              <div
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                }}
              >
                📞 Call Now
              </div>
              
              {/* Email Button */}
              <div
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                }}
              >
                📧 Send Email
              </div>
              
              {/* Resume Request Button */}
              <div
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '20px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)',
                }}
              >
                📄 Request Resume
              </div>
              
              {/* Benefits */}
              <div
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  textAlign: 'center',
                  lineHeight: '1.5',
                }}
              >
                <div style={{ marginBottom: '8px' }}>✅ Verified veteran</div>
                <div style={{ marginBottom: '8px' }}>✅ Active in search</div>
                <div style={{ marginBottom: '8px' }}>✅ Current profile</div>
                <div>✅ No stale data</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '40px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0369a1',
                marginBottom: '8px',
              }}
            >
              Faster than LinkedIn or Naukri
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#64748b',
              }}
            >
              Xainik • Recruiter Connect Panel
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e) {
    console.log(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
