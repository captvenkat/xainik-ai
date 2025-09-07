#!/usr/bin/env tsx

/**
 * PREVIEW SMOKE TEST - Run smoke tests on Vercel Preview
 */

import { execSync } from 'child_process';

class PreviewSmokeRunner {
  private previewUrl: string;

  constructor() {
    this.previewUrl = process.env.PREVIEW_URL || '';
    if (!this.previewUrl) {
      throw new Error('PREVIEW_URL environment variable is required');
    }
  }

  private log(message: string, isError = false) {
    const prefix = isError ? '❌' : '✅';
    console.log(`${prefix} ${message}`);
  }

  async run(): Promise<void> {
    try {
      console.log('🌐 PREVIEW SMOKE TEST');
      console.log('='.repeat(50));
      console.log(`Testing: ${this.previewUrl}`);

      // Run the bash smoke script with preview URL
      const command = `bash scripts/predeploy-smoke.sh "${this.previewUrl}"`;
      execSync(command, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });

      this.log('Preview smoke test completed successfully');
    } catch (error: any) {
      this.log(`Preview smoke test failed: ${error.message}`, true);
      console.log('\nFix steps:');
      console.log('1. Check Vercel Preview deployment status');
      console.log('2. Verify environment variables are set');
      console.log('3. Check application logs for errors');
      console.log('4. Ensure database migrations are applied');
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const smoke = new PreviewSmokeRunner();
  smoke.run().catch(console.error);
}

export { PreviewSmokeRunner };
