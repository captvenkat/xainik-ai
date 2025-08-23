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
              AI Drafted Pitch
            </div>
            <div
              style={{
                fontSize: '20px',
                color: '#64748b',
              }}
            >
              One-click share functionality
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '40px',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
            }}
          >
            {/* Left - AI Pitch */}
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
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                🚀 AI Pitch
              </div>
              
              <div
                style={{
                  fontSize: '16px',
                  color: '#475569',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                }}
              >
                "Experienced Army veteran with 15+ years in operations and leadership. 
                Proven track record of managing complex logistics, training teams, and 
                delivering results under pressure. Seeking Operations Manager role 
                in logistics or manufacturing sector."
              </div>
              
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Operations
                </span>
                <span
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Leadership
                </span>
                <span
                  style={{
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Logistics
                </span>
              </div>
            </div>

            {/* Right - Share Button */}
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
                ➡️
              </div>
              
              <div
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '20px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                }}
              >
                Share Pitch
              </div>
              
              <div
                style={{
                  fontSize: '16px',
                  color: '#64748b',
                  textAlign: 'center',
                  maxWidth: '200px',
                }}
              >
                One click to share anywhere
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
              Xainik • AI-Powered Veteran Pitches
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#64748b',
              }}
            >
              Turn your experience into shareable content
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
