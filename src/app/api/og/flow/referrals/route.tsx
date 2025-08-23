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
              How Referrals Flow Through Xainik
            </div>
            <div
              style={{
                fontSize: '20px',
                color: '#64748b',
              }}
            >
              From veteran to opportunity
            </div>
          </div>

          {/* Flow Diagram */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              flex: 1,
              padding: '0 40px',
            }}
          >
            {/* Veteran */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '48px',
                  fontWeight: 'bold',
                }}
              >
                🛡️
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  textAlign: 'center',
                }}
              >
                Veteran
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  textAlign: 'center',
                  maxWidth: '120px',
                }}
              >
                Creates AI pitch
              </div>
            </div>

            {/* Arrow 1 */}
            <div
              style={{
                fontSize: '32px',
                color: '#64748b',
              }}
            >
              ➡️
            </div>

            {/* Supporters */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '48px',
                  fontWeight: 'bold',
                }}
              >
                👥
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  textAlign: 'center',
                }}
              >
                Supporters
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  textAlign: 'center',
                  maxWidth: '120px',
                }}
              >
                Endorse & share
              </div>
            </div>

            {/* Arrow 2 */}
            <div
              style={{
                fontSize: '32px',
                color: '#64748b',
              }}
            >
              ➡️
            </div>

            {/* Recruiters */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#f59e0b',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '48px',
                  fontWeight: 'bold',
                }}
              >
                💼
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  textAlign: 'center',
                }}
              >
                Recruiters
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  textAlign: 'center',
                  maxWidth: '120px',
                }}
              >
                Connect & hire
              </div>
            </div>

            {/* Arrow 3 */}
            <div
              style={{
                fontSize: '32px',
                color: '#64748b',
              }}
            >
              ➡️
            </div>

            {/* Dashboard */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#8b5cf6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '48px',
                  fontWeight: 'bold',
                }}
              >
                📊
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  textAlign: 'center',
                }}
              >
                Dashboard
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  textAlign: 'center',
                  maxWidth: '120px',
                }}
              >
                Track everything
              </div>
            </div>
          </div>

          {/* Loop Arrow */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                color: '#64748b',
                marginBottom: '16px',
              }}
            >
              🔄
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#64748b',
                fontStyle: 'italic',
              }}
            >
              Continuous feedback loop
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
              Xainik • Organized Referral Management
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#64748b',
              }}
            >
              Make referrals work for you
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
