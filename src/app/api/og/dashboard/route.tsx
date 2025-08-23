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
              Veteran Dashboard
            </div>
            <div
              style={{
                fontSize: '20px',
                color: '#64748b',
              }}
            >
              {mockPitch.name} • {mockPitch.service}
            </div>
          </div>

          {/* Main Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '24px',
              marginBottom: '40px',
            }}
          >
            {/* Opens */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                  marginBottom: '8px',
                }}
              >
                {mockPitch.stats.opens}
              </div>
              <div
                style={{
                  fontSize: '16px',
                  color: '#64748b',
                }}
              >
                Opens
              </div>
            </div>

            {/* Clicks */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#10b981',
                  marginBottom: '8px',
                }}
              >
                {mockPitch.stats.clicks}
              </div>
              <div
                style={{
                  fontSize: '16px',
                  color: '#64748b',
                }}
              >
                Clicks
              </div>
            </div>

            {/* Referrals */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#f59e0b',
                  marginBottom: '8px',
                }}
              >
                {mockPitch.stats.sharesToday}
              </div>
              <div
                style={{
                  fontSize: '16px',
                  color: '#64748b',
                }}
              >
                Referrals
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '40px',
            }}
          >
            {/* Calls */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#8b5cf6',
                  marginBottom: '8px',
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
                Calls This Week
              </div>
            </div>

            {/* Resume Requests */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#ef4444',
                  marginBottom: '8px',
                }}
              >
                {mockPitch.stats.resume.pending + mockPitch.stats.resume.approved}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                }}
              >
                Resume Requests
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: 'center',
              marginTop: 'auto',
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
              Like Google Analytics — but for your job search
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#64748b',
              }}
            >
              Xainik • Veteran Referral Dashboard
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
