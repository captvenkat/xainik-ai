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
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            padding: '40px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#3b82f6',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '32px',
                fontWeight: 'bold',
              }}
            >
              🛡️
            </div>
            <div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  marginBottom: '8px',
                }}
              >
                {mockPitch.name}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  color: '#64748b',
                }}
              >
                {mockPitch.service} • {mockPitch.city}
              </div>
            </div>
          </div>

          {/* Target Role */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              marginBottom: '24px',
              width: '100%',
              maxWidth: '500px',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              Target Role: {mockPitch.targetRoles[0]}
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#64748b',
                textAlign: 'center',
              }}
            >
              {mockPitch.endorsements} endorsements
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginBottom: '24px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                }}
              >
                {mockPitch.stats.opens}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                }}
              >
                Opens
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#10b981',
                }}
              >
                {mockPitch.stats.clicks}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                }}
              >
                Clicks
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#f59e0b',
                }}
              >
                {mockPitch.stats.callsWeek}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                }}
              >
                Calls
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              fontSize: '16px',
              color: '#64748b',
              textAlign: 'center',
              marginTop: '20px',
            }}
          >
            Xainik • Veteran Referral Dashboard
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
