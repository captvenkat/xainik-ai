import { ImageResponse } from '@vercel/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const title = searchParams.get('title') || 'Veteran Pitch'
    const name = searchParams.get('name') || 'Veteran'
    
    if (!id) {
      return new Response('Missing pitch ID', { status: 400 })
    }

    // Create Supabase client for edge runtime
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch real pitch data
    const { data: pitch } = await supabase
      .from('pitches')
      .select(`
        *,
        users!pitches_user_id_fkey(
          name,
          avatar_url
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    // Fetch veteran profile for military info
    const { data: veteranProfile } = await supabase
      .from('veterans')
      .select('rank, service_branch, years_experience')
      .eq('user_id', pitch?.user_id)
      .single()

    // Use real data or fallback to params
    const pitchTitle = pitch?.title || title
    const veteranName = pitch?.users?.name || name
    const militaryInfo = veteranProfile ? 
      `${veteranProfile.rank} ${veteranProfile.service_branch}` : 
      'Military Veteran'
    const experience = veteranProfile?.years_experience ? 
      `${veteranProfile.years_experience} years` : 
      'Experienced'

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
                {veteranName}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  color: '#64748b',
                }}
              >
                {militaryInfo} • {experience}
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
              {pitchTitle}
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#64748b',
                textAlign: 'center',
              }}
            >
              Looking for opportunities
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
                {pitch?.stats?.opens || 0}
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
                {pitch?.stats?.clicks || 0}
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
                {pitch?.stats?.callsWeek || 0}
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
