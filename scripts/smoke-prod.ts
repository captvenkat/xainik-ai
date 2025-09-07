#!/usr/bin/env tsx

/**
 * PRODUCTION SMOKE TEST - Run smoke tests on production
 */

import { execSync } from 'child_process';

class ProductionSmokeRunner {
  private prodUrl = 'https://xainik.com';

  private log(message: string, isError = false) {
    const prefix = isError ? '❌' : '✅';
    console.log(`${prefix} ${message}`);
  }

  async run(): Promise<void> {
    try {
      console.log('🚀 PRODUCTION SMOKE TEST');
      console.log('='.repeat(50));
      console.log(`Testing: ${this.prodUrl}`);

      // Run the bash smoke script with production URL
      const command = `bash scripts/predeploy-smoke.sh "${this.prodUrl}"`;
      execSync(command, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });

      this.log('Production smoke test completed successfully');
      console.log('\n🎉 PRODUCTION DEPLOYMENT HEALTHY');
      console.log('All critical endpoints are responding correctly');
    } catch (error: any) {
      this.log(`Production smoke test failed: ${error.message}`, true);
      console.log('\n🔄 ROLLBACK REQUIRED');
      console.log('1. Go to Vercel Dashboard');
      console.log('2. Find the failed deployment');
      console.log('3. Click "Rollback" to last green deployment');
      console.log('4. Run fix tasks and retry');
      console.log('\nFix steps:');
      console.log('1. Check Vercel deployment logs');
      console.log('2. Verify environment variables are set');
      console.log('3. Check database connectivity');
      console.log('4. Ensure all migrations are applied');
      console.log('5. Check external service integrations (Razorpay, Runware, etc.)');
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const smoke = new ProductionSmokeRunner();
  smoke.run().catch(console.error);
}

export { ProductionSmokeRunner };
