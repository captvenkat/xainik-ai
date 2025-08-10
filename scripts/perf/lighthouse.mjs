import lighthouse from 'lighthouse'
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const urls = JSON.parse(fs.readFileSync('./scripts/perf/urls.json', 'utf8'))

const thresholds = {
  performance: 90,
  accessibility: 95,
  seo: 90,
  bestPractices: 85
}

async function runLighthouse(url, browser) {
  const { lhr } = await lighthouse(url, {
    port: new URL(browser.wsEndpoint()).port,
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
    formFactor: 'mobile',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    }
  })

  return {
    url,
    performance: Math.round(lhr.categories.performance.score * 100),
    accessibility: Math.round(lhr.categories.accessibility.score * 100),
    seo: Math.round(lhr.categories.seo.score * 100),
    bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
    audits: lhr.audits
  }
}

function analyzeAudits(audits, category) {
  const failedAudits = Object.values(audits).filter(audit => 
    audit.score !== null && audit.score < 0.9 && audit.details
  )

  if (failedAudits.length > 0) {
    console.log(`\n🔍 ${category} Issues:`)
    failedAudits.forEach(audit => {
      console.log(`  - ${audit.title}: ${Math.round(audit.score * 100)}/100`)
      if (audit.details && audit.details.items) {
        audit.details.items.slice(0, 3).forEach(item => {
          console.log(`    • ${item.name || item.url || 'Unknown'}`)
        })
      }
    })
  }
}

async function main() {
  console.log('🚀 Starting Lighthouse performance tests...')
  console.log('Base URL:', baseUrl)
  console.log('URLs to test:', urls)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const results = []
  let allPassed = true

  for (const url of urls) {
    const fullUrl = `${baseUrl}${url}`
    console.log(`\n📊 Testing: ${fullUrl}`)
    
    try {
      const result = await runLighthouse(fullUrl, browser)
      results.push(result)
      
      console.log(`  Performance: ${result.performance}/100`)
      console.log(`  Accessibility: ${result.accessibility}/100`)
      console.log(`  SEO: ${result.seo}/100`)
      console.log(`  Best Practices: ${result.bestPractices}/100`)

      // Check thresholds
      const passed = 
        result.performance >= thresholds.performance &&
        result.accessibility >= thresholds.accessibility &&
        result.seo >= thresholds.seo &&
        result.bestPractices >= thresholds.bestPractices

      if (!passed) {
        allPassed = false
        console.log(`  ❌ FAILED - Below thresholds`)
        
        if (result.performance < thresholds.performance) {
          analyzeAudits(result.audits, 'Performance')
        }
        if (result.accessibility < thresholds.accessibility) {
          analyzeAudits(result.audits, 'Accessibility')
        }
        if (result.seo < thresholds.seo) {
          analyzeAudits(result.audits, 'SEO')
        }
        if (result.bestPractices < thresholds.bestPractices) {
          analyzeAudits(result.audits, 'Best Practices')
        }
      } else {
        console.log(`  ✅ PASSED - All thresholds met`)
      }

    } catch (error) {
      console.error(`  ❌ ERROR testing ${fullUrl}:`, error.message)
      allPassed = false
    }
  }

  await browser.close()

  // Summary
  console.log('\n📋 Lighthouse Test Summary:')
  console.log('=' * 50)
  
  results.forEach(result => {
    console.log(`${result.url}:`)
    console.log(`  Performance: ${result.performance}/100 ${result.performance >= thresholds.performance ? '✅' : '❌'}`)
    console.log(`  Accessibility: ${result.accessibility}/100 ${result.accessibility >= thresholds.accessibility ? '✅' : '❌'}`)
    console.log(`  SEO: ${result.seo}/100 ${result.seo >= thresholds.seo ? '✅' : '❌'}`)
    console.log(`  Best Practices: ${result.bestPractices}/100 ${result.bestPractices >= thresholds.bestPractices ? '✅' : '❌'}`)
  })

  if (allPassed) {
    console.log('\n🎉 All Lighthouse tests PASSED!')
    process.exit(0)
  } else {
    console.log('\n❌ Some Lighthouse tests FAILED!')
    process.exit(1)
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}
