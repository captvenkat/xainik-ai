import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    console.log('OG GET request received:', req.url);
    const { searchParams } = new URL(req.url);
    const line = searchParams.get('line');
    const bg = searchParams.get('bg');
    
    console.log('OG GET params:', { line, bg });
    
    if (!line || !bg) {
      console.error('Missing parameters:', { line, bg });
      return new Response('Missing line or bg parameter', { status: 400 });
    }

    console.log('Generating image for:', { line, bg });
    return await generateImage(line, bg);
  } catch (error) {
    console.error('OG GET error:', error);
    return generateFallbackImage();
  }
}

const OGPostSchema = z.object({
  line: z.string().min(1).max(200),
  bgKey: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OGPostSchema.safeParse(body);
    
    if (!parsed.success) {
      return new Response('Invalid request data', { status: 400 });
    }
    
    const { line, bgKey } = parsed.data;

    return await generateImage(line, bgKey);
  } catch (error) {
    console.error('OG POST error:', error);
    return generateFallbackImage();
  }
}

async function generateImage(line: string, bgKey: string) {
  // Military background images (1080x1350, footer+QR already included)
  const MILITARY_BACKGROUNDS = {
    'military-01.webp': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    'military-02.webp': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1350&fit=crop&crop=center',
    'military-03.webp': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&h=1350&fit=crop&crop=center',
    'military-04.webp': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    'military-05.webp': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1350&fit=crop&crop=center',
    'military-06.webp': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&h=1350&fit=crop&crop=center',
    'military-07.webp': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    'military-08.webp': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1350&fit=crop&crop=center',
    'military-09.webp': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    'military-10.webp': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1350&fit=crop&crop=center',
    'military-11.webp': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&h=1350&fit=crop&crop=center',
    'military-12.webp': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    'military-13.webp': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1350&fit=crop&crop=center',
    'military-14.webp': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&h=1350&fit=crop&crop=center',
    'military-15.webp': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    'military-16.webp': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1350&fit=crop&crop=center',
    'military-17.webp': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&h=1350&fit=crop&crop=center',
    'military-18.webp': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    'military-19.webp': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1350&fit=crop&crop=center',
    'military-20.webp': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&h=1350&fit=crop&crop=center',
    'military-21.webp': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    'military-22.webp': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1350&fit=crop&crop=center',
    'military-23.webp': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&h=1350&fit=crop&crop=center',
    'military-24.webp': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    'military-25.webp': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1350&fit=crop&crop=center',
    'military-26.webp': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&h=1350&fit=crop&crop=center',
    'military-27.webp': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    'military-28.webp': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1350&fit=crop&crop=center',
    'military-29.webp': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&h=1350&fit=crop&crop=center',
    'military-30.webp': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    'military-31.webp': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1350&fit=crop&crop=center',
    'military-32.webp': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&h=1350&fit=crop&crop=center',
    'military-33.webp': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    'military-34.webp': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1350&fit=crop&crop=center',
    'military-35.webp': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&h=1350&fit=crop&crop=center',
    'military-36.webp': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    'military-37.webp': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1350&fit=crop&crop=center',
    'military-38.webp': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&h=1350&fit=crop&crop=center',
    'military-39.webp': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=1350&fit=crop&crop=center',
    'military-40.webp': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1350&fit=crop&crop=center'
  };

  // Get background URL or use fallback
  const backgroundUrl = MILITARY_BACKGROUNDS[bgKey as keyof typeof MILITARY_BACKGROUNDS] || MILITARY_BACKGROUNDS['military-01.webp'];

  // Calculate font size based on text length
  const textLength = line.length;
  let fontSize = 64;
  if (textLength > 60) fontSize = 48;
  else if (textLength > 40) fontSize = 56;
  else if (textLength > 30) fontSize = 60;

  // Safe zone: Never draw text in bottom 180px, side padding 48px, top padding 72px
  const safeZone = {
    top: 72,
    bottom: 180,
    left: 48,
    right: 48
  };

  // Calculate text position (centered in safe zone)
  const textY = safeZone.top + (1080 - safeZone.top - safeZone.bottom) / 2;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1080px',
          height: '1350px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'linear-gradient(135deg, #0B1220 0%, #1a365d 50%, #2d3748 100%)'
        }}
      >
        {/* Background Image */}
        <img
          src={backgroundUrl}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        
        {/* Dark overlay for better text readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)'
          }}
        />
        
        {/* Meme Text */}
        <div
          style={{
            position: 'absolute',
            top: `${textY}px`,
            left: `${safeZone.left}px`,
            right: `${safeZone.right}px`,
            textAlign: 'center',
            color: '#FFFFFF',
            fontFamily: 'Bebas Neue, Arial, sans-serif',
            fontSize: `${fontSize}px`,
            fontWeight: 'bold',
            lineHeight: '1.1',
            textTransform: 'uppercase',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            zIndex: 10
          }}
        >
          {line}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: [
        {
          name: 'Bebas Neue',
          data: await fetch('https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg69CK48gW7PXoo9WlhI.ttf').then(res => res.arrayBuffer()),
          style: 'normal',
          weight: 400
        }
      ]
    }
  );
}

function generateFallbackImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1080px',
          height: '1350px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0B1220 0%, #1a365d 50%, #2d3748 100%)',
          color: '#FFFFFF',
          fontSize: '48px',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          padding: '48px'
        }}
      >
        <div>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🪖</div>
          <div>Military Skill Unlocked</div>
          <div style={{ fontSize: '32px', marginTop: '16px', opacity: 0.8 }}>
            THE MILITARY REPEATS UNTIL FLAWLESS.
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350
    }
  );
}
