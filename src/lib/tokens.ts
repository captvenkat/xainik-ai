import { createHmac, timingSafeEqual } from 'crypto'

const SECRET = process.env.TOKEN_SECRET || 'fallback-secret-change-in-production'
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

interface TokenPayload {
  requestId: string
  veteranId: string
  purpose: 'resume_approve' | 'resume_decline'
  exp: number
}

export function generateToken(payload: Omit<TokenPayload, 'exp'>): string {
  const tokenData: TokenPayload = {
    ...payload,
    exp: Date.now() + TOKEN_EXPIRY
  }
  
  const data = JSON.stringify(tokenData)
  const signature = createHmac('sha256', SECRET).update(data).digest('hex')
  
  return Buffer.from(`${data}.${signature}`).toString('base64url')
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const [data, signature] = decoded.split('.')
    
    if (!data || !signature) return null
    
    // Verify signature
    const expectedSignature = createHmac('sha256', SECRET).update(data).digest('hex')
    if (!timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
      return null
    }
    
    const payload: TokenPayload = JSON.parse(data)
    
    // Check expiration
    if (payload.exp < Date.now()) {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}
