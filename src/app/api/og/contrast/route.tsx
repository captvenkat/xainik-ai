import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'before-after'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Before - Traditional Methods */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              backgroundColor: '#f1f5f9',
              borderRight: '2px solid #e2e8f0',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#64748b',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              Before
            </div>
            
            <div
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#475569',
                marginBottom: '30px',
                textAlign: 'center',
              }}
            >
              Buried in chats
            </div>

            {/* Icons representing traditional methods */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  opacity: '0.6',
                }}
              >
                💬
              </div>
              <div
                style={{
                  fontSize: '48px',
                  opacity: '0.6',
                }}
              >
                📧
              </div>
              <div
                style={{
                  fontSize: '48px',
                  opacity: '0.6',
                }}
              >
                📱
              </div>
            </div>

            {/* Dimmed resume */}
            <div
              style={{
                width: '200px',
                height: '120px',
                backgroundColor: '#cbd5e1',
                borderRadius: '8px',
                opacity: '0.4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#64748b',
              }}
            >
              Resume
            </div>
          </div>

          {/* After - Xainik Dashboard */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              backgroundColor: '#f0f9ff',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#0369a1',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              After
            </div>
            
            <div
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#0c4a6e',
                marginBottom: '30px',
                textAlign: 'center',
              }}
            >
              One dashboard
            </div>

            {/* Dashboard tiles */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '60px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>120</div>
                <div style={{ fontSize: '12px' }}>Views</div>
              </div>
              <div
                style={{
                  width: '80px',
                  height: '60px',
                  backgroundColor: '#10b981',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>45</div>
                <div style={{ fontSize: '12px' }}>Clicks</div>
              </div>
              <div
                style={{
                  width: '80px',
                  height: '60px',
                  backgroundColor: '#f59e0b',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>12</div>
                <div style={{ fontSize: '12px' }}>Calls</div>
              </div>
              <div
                style={{
                  width: '80px',
                  height: '60px',
                  backgroundColor: '#8b5cf6',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>3</div>
                <div style={{ fontSize: '12px' }}>Resumes</div>
              </div>
            </div>

            {/* Xainik logo */}
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#0369a1',
                textAlign: 'center',
              }}
            >
              Xainik
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
