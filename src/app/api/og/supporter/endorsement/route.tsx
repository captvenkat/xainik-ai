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
              Supporter Endorsement
            </div>
            <div
              style={{
                fontSize: '20px',
                color: '#64748b',
              }}
            >
              Help faster. With minimal effort.
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
            {/* Left - Veteran Pitch */}
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
                Target: {mockPitch.targetRoles[0]}
              </div>
              
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {[...Array(mockPitch.endorsements)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#fbbf24',
                      borderRadius: '50%',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Center - Endorsement Action */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  marginBottom: '20px',
                }}
              >
                ❤️
              </div>
              
              <div
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
                }}
              >
                Endorse
              </div>
              
              <div
                style={{
                  fontSize: '16px',
                  color: '#64748b',
                  textAlign: 'center',
                  maxWidth: '200px',
                }}
              >
                One click endorsement
              </div>
            </div>

            {/* Right - Share Options */}
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
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                Share Anywhere
              </div>
              
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#1da1f2',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Twitter
                </div>
                <div
                  style={{
                    backgroundColor: '#0077b5',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  LinkedIn
                </div>
                <div
                  style={{
                    backgroundColor: '#25d366',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  WhatsApp
                </div>
                <div
                  style={{
                    backgroundColor: '#ea4335',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Email
                </div>
              </div>
              
              <div
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                Ready referral messages included
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
              No manual work — fully automated
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#64748b',
              }}
            >
              Xainik • Supporter Endorsement
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
