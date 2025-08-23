import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET() {
  try {
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
              Mission vs Standby
            </div>
            <div
              style={{
                fontSize: '20px',
                color: '#64748b',
              }}
            >
              Pay only when you're searching
            </div>
          </div>

          {/* Toggle Cards */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              justifyContent: 'center',
              alignItems: 'stretch',
              flex: 1,
            }}
          >
            {/* Mission Mode - Active */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '20px',
                border: '3px solid #10b981',
                width: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.2)',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#10b981',
                    marginBottom: '16px',
                    textAlign: 'center',
                  }}
                >
                  🚀 Mission: Live
                </div>
                
                <div
                  style={{
                    fontSize: '18px',
                    color: '#1e293b',
                    marginBottom: '24px',
                    textAlign: 'center',
                  }}
                >
                  Active job search mode
                </div>
                
                <ul
                  style={{
                    fontSize: '16px',
                    color: '#475569',
                    lineHeight: '1.6',
                    marginBottom: '24px',
                  }}
                >
                  <li style={{ marginBottom: '12px' }}>• Pitch visible to recruiters</li>
                  <li style={{ marginBottom: '12px' }}>• Full dashboard access</li>
                  <li style={{ marginBottom: '12px' }}>• Live referral tracking</li>
                  <li style={{ marginBottom: '12px' }}>• Priority support</li>
                </ul>
              </div>
              
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '12px',
                  border: '1px solid #bbf7d0',
                }}
              >
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#166534',
                  }}
                >
                  ₹99 - 7 days
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#16a34a',
                  }}
                >
                  Starter Mission
                </div>
              </div>
            </div>

            {/* Standby Mode - Hidden */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '20px',
                border: '3px solid #64748b',
                width: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: '0.7',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#64748b',
                    marginBottom: '16px',
                    textAlign: 'center',
                  }}
                >
                  💤 Standby: Hidden
                </div>
                
                <div
                  style={{
                    fontSize: '18px',
                    color: '#1e293b',
                    marginBottom: '24px',
                    textAlign: 'center',
                  }}
                >
                  Pitch saved but hidden
                </div>
                
                <ul
                  style={{
                    fontSize: '16px',
                    color: '#475569',
                    lineHeight: '1.6',
                    marginBottom: '24px',
                  }}
                >
                  <li style={{ marginBottom: '12px' }}>• Pitch hidden from recruiters</li>
                  <li style={{ marginBottom: '12px' }}>• Basic profile access</li>
                  <li style={{ marginBottom: '12px' }}>• No referral tracking</li>
                  <li style={{ marginBottom: '12px' }}>• Ready to activate anytime</li>
                </ul>
              </div>
              
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#64748b',
                  }}
                >
                  FREE
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#64748b',
                  }}
                >
                  Always available
                </div>
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
              Fair. Focused. Veteran-first.
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#64748b',
              }}
            >
              Xainik • Mission vs Standby
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
