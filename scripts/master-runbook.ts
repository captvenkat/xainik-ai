#!/usr/bin/env tsx

/**
 * MASTER RUNBOOK - End-to-end deployment pipeline
 * 
 * Phases:
 * A) PREFLIGHT (local/CI)
 * B) SELF-CHECK (functional)
 * C) PREVIEW DEPLOY + SMOKE
 * D) PRODUCTION DEPLOY + SMOKE
 * E) POST-DEPLOY WATCH (informational)
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface RunbookResult {
  phase: string;
  success: boolean;
  output?: string;
  error?: string;
  nextAction?: string;
}

class MasterRunbook {
  private results: RunbookResult[] = [];
  private shouldStop = false;

  private log(phase: string, message: string, isError = false) {
    const timestamp = new Date().toISOString();
    const prefix = isError ? '❌' : '✅';
    console.log(`[${timestamp}] ${prefix} ${phase}: ${message}`);
  }

  private async runCommand(command: string, phase: string): Promise<RunbookResult> {
    try {
      this.log(phase, `Running: ${command}`);
      const output = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      const result: RunbookResult = {
        phase,
        success: true,
        output: output.trim()
      };
      
      this.results.push(result);
      this.log(phase, 'Command completed successfully');
      return result;
    } catch (error: any) {
      const result: RunbookResult = {
        phase,
        success: false,
        error: error.message || error.toString()
      };
      
      this.results.push(result);
      this.log(phase, `Command failed: ${result.error}`, true);
      this.shouldStop = true;
      return result;
    }
  }

  private async phaseA_Preflight(): Promise<void> {
    console.log('\n🚀 PHASE A: PREFLIGHT');
    console.log('='.repeat(50));

    // Check if we're in the right directory
    if (!existsSync('package.json')) {
      throw new Error('Not in project root directory');
    }

    // Run preflight checks
    await this.runCommand('pnpm prisma generate', 'Preflight');
    await this.runCommand('pnpm run preflight', 'Preflight');

    if (this.shouldStop) {
      throw new Error('Preflight checks failed');
    }
  }

  private async phaseB_SelfCheck(): Promise<void> {
    console.log('\n🔍 PHASE B: SELF-CHECK');
    console.log('='.repeat(50));

    // Run the full self-check task
    await this.runCommand('pnpm tsx scripts/self-check.ts', 'Self-Check');

    if (this.shouldStop) {
      throw new Error('Self-check failed - see compliance report above');
    }
  }

  private async phaseC_PreviewSmoke(): Promise<void> {
    console.log('\n🌐 PHASE C: PREVIEW DEPLOY + SMOKE');
    console.log('='.repeat(50));

    const previewUrl = process.env.PREVIEW_URL;
    if (!previewUrl) {
      console.log('⚠️  No PREVIEW_URL provided - skipping preview smoke test');
      console.log('   To test preview: PREVIEW_URL=<url> pnpm run smoke:preview');
      return;
    }

    await this.runCommand(`PREVIEW_URL=${previewUrl} pnpm run smoke:preview`, 'Preview Smoke');

    if (this.shouldStop) {
      throw new Error('Preview smoke test failed');
    }
  }

  private async phaseD_ProductionDeploy(): Promise<void> {
    console.log('\n🚀 PHASE D: PRODUCTION DEPLOY + SMOKE');
    console.log('='.repeat(50));

    console.log('📝 Manual step required: Merge PR to main branch');
    console.log('   Vercel will auto-deploy from main branch');
    console.log('   Waiting for production deployment...');
    
    // Wait a bit for deployment
    await new Promise(resolve => setTimeout(resolve, 30000));

    await this.runCommand('pnpm run smoke:prod', 'Production Smoke');

    if (this.shouldStop) {
      console.log('\n🔄 ROLLBACK REQUIRED');
      console.log('1. Go to Vercel Dashboard');
      console.log('2. Find the failed deployment');
      console.log('3. Click "Rollback" to last green deployment');
      console.log('4. Run fix tasks and retry');
      throw new Error('Production smoke test failed - rollback required');
    }
  }

  private async phaseE_PostDeployWatch(): Promise<void> {
    console.log('\n👀 PHASE E: POST-DEPLOY WATCH');
    console.log('='.repeat(50));

    console.log('📊 Day-0 Watchpoints:');
    console.log('• /admin/media loads correctly');
    console.log('• Dry scan runs without errors');
    console.log('• Alerts configured to ceo@faujnet.com');
    console.log('• Payment webhooks responding');
    console.log('• Poster generation within rate limits');
    console.log('• Resend email delivery healthy');
    console.log('• No 500 errors in logs');
  }

  private generateReport(): void {
    console.log('\n📋 MASTER RUNBOOK REPORT');
    console.log('='.repeat(50));

    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;

    console.log(`✅ Successful phases: ${successful}`);
    console.log(`❌ Failed phases: ${failed}`);

    if (failed === 0) {
      console.log('\n🎉 GO - All phases completed successfully!');
      console.log('Production deployment is healthy and ready.');
    } else {
      console.log('\n🛑 NO-GO - Deployment pipeline failed');
      console.log('\nFix Plan:');
      this.results
        .filter(r => !r.success)
        .forEach((result, index) => {
          console.log(`${index + 1}. Fix ${result.phase}: ${result.error}`);
        });
    }

    console.log('\n📊 Detailed Results:');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.phase}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
  }

  async run(): Promise<void> {
    try {
      console.log('🎯 MASTER RUNBOOK - Xainik Deployment Pipeline');
      console.log('='.repeat(60));

      await this.phaseA_Preflight();
      await this.phaseB_SelfCheck();
      await this.phaseC_PreviewSmoke();
      await this.phaseD_ProductionDeploy();
      await this.phaseE_PostDeployWatch();

      this.generateReport();
    } catch (error: any) {
      console.error('\n💥 RUNBOOK FAILED:', error.message);
      this.generateReport();
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runbook = new MasterRunbook();
  runbook.run().catch(console.error);
}

export { MasterRunbook };
