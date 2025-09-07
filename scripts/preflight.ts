#!/usr/bin/env tsx

/**
 * PREFLIGHT - Comprehensive pre-deployment checks
 * 
 * Runs: spec:check, dead:find, typecheck, tests, webp:check
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface PreflightResult {
  check: string;
  success: boolean;
  output?: string;
  error?: string;
}

class PreflightRunner {
  private results: PreflightResult[] = [];
  private shouldStop = false;

  private log(check: string, message: string, isError = false) {
    const prefix = isError ? '❌' : '✅';
    console.log(`${prefix} ${check}: ${message}`);
  }

  private async runCheck(command: string, check: string, optional = false): Promise<PreflightResult> {
    try {
      this.log(check, `Running: ${command}`);
      const output = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      const result: PreflightResult = {
        check,
        success: true,
        output: output.trim()
      };
      
      this.results.push(result);
      this.log(check, 'Passed');
      return result;
    } catch (error: any) {
      const result: PreflightResult = {
        check,
        success: false,
        error: error.message || error.toString()
      };
      
      this.results.push(result);
      
      if (optional) {
        this.log(check, `Failed (optional): ${result.error}`);
      } else {
        this.log(check, `Failed: ${result.error}`, true);
        this.shouldStop = true;
      }
      
      return result;
    }
  }

  private async checkSpec(): Promise<void> {
    await this.runCheck('npm run spec:check', 'Spec Check');
  }

  private async checkDeadCode(): Promise<void> {
    await this.runCheck('npm run dead:find', 'Dead Code Check');
  }

  private async checkTypes(): Promise<void> {
    await this.runCheck('tsc --noEmit', 'TypeScript Check');
  }

  private async checkTests(): Promise<void> {
    // Check if test files exist
    const testFiles = ['__tests__', '*.test.ts', '*.test.js'];
    const hasTests = testFiles.some(pattern => {
      try {
        execSync(`find . -name "${pattern}" -type f | head -1`, { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    });

    if (hasTests) {
      await this.runCheck('npm test --if-present', 'Tests');
    } else {
      this.log('Tests', 'No test files found - skipping');
    }
  }

  private async checkWebP(): Promise<void> {
    await this.runCheck('npm run webp:check', 'WebP Policy', true);
  }

  private generateReport(): void {
    console.log('\n📋 PREFLIGHT REPORT');
    console.log('='.repeat(40));

    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;

    console.log(`✅ Passed: ${successful}`);
    console.log(`❌ Failed: ${failed}`);

    if (failed === 0) {
      console.log('\n🎉 PREFLIGHT PASSED - Ready for deployment');
    } else {
      console.log('\n🛑 PREFLIGHT FAILED - Fix issues before deploying');
      this.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`❌ ${result.check}: ${result.error}`);
        });
    }
  }

  async run(): Promise<void> {
    try {
      console.log('🚀 PREFLIGHT - Xainik Pre-deployment Checks');
      console.log('='.repeat(50));

      // Check if we're in the right directory
      if (!existsSync('package.json')) {
        throw new Error('Not in project root directory');
      }

      await this.checkSpec();
      await this.checkDeadCode();
      await this.checkTypes();
      await this.checkTests();
      await this.checkWebP();

      this.generateReport();

      if (this.shouldStop) {
        process.exit(1);
      }
    } catch (error: any) {
      console.error('\n💥 PREFLIGHT FAILED:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const preflight = new PreflightRunner();
  preflight.run().catch(console.error);
}

export { PreflightRunner };
