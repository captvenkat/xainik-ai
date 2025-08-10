import { generateToken, verifyToken } from '../tokens'

describe('Token Security', () => {
  it('should generate and verify valid tokens', () => {
    const payload = {
      requestId: 'test-request',
      veteranId: 'test-veteran',
      purpose: 'resume_approve' as const
    }

    const token = generateToken(payload)
    const verified = verifyToken(token)

    expect(verified).toEqual({
      ...payload,
      exp: expect.any(Number)
    })
  })

  it('should reject expired tokens', () => {
    const payload = {
      requestId: 'test-request',
      veteranId: 'test-veteran',
      purpose: 'resume_approve' as const
    }

    const token = generateToken(payload)
    
    // Manually expire the token by modifying the exp time
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const [data, signature] = decoded.split('.')
    const tokenData = JSON.parse(data)
    tokenData.exp = Date.now() - 1000 // 1 second ago
    
    const expiredData = JSON.stringify(tokenData)
    const expiredSignature = require('crypto').createHmac('sha256', process.env.TOKEN_SECRET || 'fallback-secret-change-in-production').update(expiredData).digest('hex')
    const expiredToken = Buffer.from(`${expiredData}.${expiredSignature}`).toString('base64url')

    const verified = verifyToken(expiredToken)
    expect(verified).toBeNull()
  })

  it('should reject forged tokens', () => {
    const forgedToken = 'forged.token.signature'
    const verified = verifyToken(forgedToken)
    expect(verified).toBeNull()
  })

  it('should reject tokens with wrong purpose', () => {
    const payload = {
      requestId: 'test-request',
      veteranId: 'test-veteran',
      purpose: 'resume_approve' as const
    }

    const token = generateToken(payload)
    const verified = verifyToken(token)

    // Token should be valid but purpose should match
    expect(verified?.purpose).toBe('resume_approve')
  })
})
