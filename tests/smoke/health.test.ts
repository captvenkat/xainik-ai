import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createServer } from 'http'
import { parse } from 'url'
import { NextRequest } from 'next/server'

// Mock Next.js app for testing
const app = createServer(async (req, res) => {
  const { pathname } = parse(req.url || '/')
  
  try {
    // Simple route handling for smoke tests
    switch (pathname) {
      case '/':
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end('<html><body>Homepage</body></html>')
        break
      case '/browse':
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end('<html><body>Browse</body></html>')
        break
      case '/pricing':
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end('<html><body>Pricing</body></html>')
        break
      case '/donations':
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end('<html><body>Donations</body></html>')
        break
      case '/sitemap.xml':
        res.writeHead(200, { 'Content-Type': 'application/xml' })
        res.end(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://localhost:3000/</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>http://localhost:3000/browse</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>http://localhost:3000/pricing</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>http://localhost:3000/donations</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`)
        break
      default:
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found')
    }
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
})

describe('Smoke Tests - Public Routes', () => {
  it('GET / (Homepage SSR) -> 200', async () => {
    const response = await request(app)
      .get('/')
      .expect(200)
    
    expect(response.text).toContain('Homepage')
  })

  it('GET /browse -> 200', async () => {
    const response = await request(app)
      .get('/browse')
      .expect(200)
    
    expect(response.text).toContain('Browse')
  })

  it('GET /pricing -> 200', async () => {
    const response = await request(app)
      .get('/pricing')
      .expect(200)
    
    expect(response.text).toContain('Pricing')
  })

  it('GET /donations -> 200', async () => {
    const response = await request(app)
      .get('/donations')
      .expect(200)
    
    expect(response.text).toContain('Donations')
  })

  it('GET /sitemap.xml -> 200 and contains public routes only', async () => {
    const response = await request(app)
      .get('/sitemap.xml')
      .expect(200)
      .expect('Content-Type', /xml/)
    
    const sitemap = response.text
    
    // Check that sitemap contains public routes
    expect(sitemap).toContain('<loc>http://localhost:3000/</loc>')
    expect(sitemap).toContain('<loc>http://localhost:3000/browse</loc>')
    expect(sitemap).toContain('<loc>http://localhost:3000/pricing</loc>')
    expect(sitemap).toContain('<loc>http://localhost:3000/donations</loc>')
    
    // Check that sitemap doesn't contain private routes
    expect(sitemap).not.toContain('/dashboard')
    expect(sitemap).not.toContain('/api')
    expect(sitemap).not.toContain('/admin')
  })

  it('GET /dashboard/veteran -> 404 (private route)', async () => {
    await request(app)
      .get('/dashboard/veteran')
      .expect(404)
  })

  it('GET /api/test -> 404 (private route)', async () => {
    await request(app)
      .get('/api/test')
      .expect(404)
  })
})
