#!/usr/bin/env ts-node

/**
 * Magic Mode Verification Script
 * 
 * Performs static checks to verify Magic Mode implementation completeness.
 */

import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  category: string;
  checks: Array<{
    name: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    message: string;
  }>;
}

class MagicModeVerifier {
  private results: VerificationResult[] = [];

  async run(): Promise<void> {
    console.log('🔍 Magic Mode Verification Script');
    console.log('==================================\n');

    await this.verifyEnvironment();
    await this.verifyDatabase();
    await this.verifyTypes();
    await this.verifyComponents();
    await this.verifyAPIs();
    await this.verifyRouting();
    await this.verifyAnalytics();
    await this.verifyMobileFirst();

    this.printResults();
  }

  private async verifyEnvironment(): Promise<void> {
    const result: VerificationResult = {
      category: 'Environment Configuration',
      checks: []
    };

    // Check next.config.mjs
    const configPath = path.join(process.cwd(), 'next.config.mjs');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const hasMagicMode = configContent.includes('NEXT_PUBLIC_FEATURE_MAGIC_MODE');
      const hasFounding50 = configContent.includes('NEXT_PUBLIC_FEATURE_FOUNDING50');
      
      result.checks.push({
        name: 'Feature flags in next.config.mjs',
        status: hasMagicMode && hasFounding50 ? 'PASS' : 'FAIL',
        message: hasMagicMode && hasFounding50 
          ? 'Both feature flags found' 
          : `Missing flags: MAGIC_MODE=${hasMagicMode}, FOUNDING50=${hasFounding50}`
      });
    } else {
      result.checks.push({
        name: 'next.config.mjs exists',
        status: 'FAIL',
        message: 'next.config.mjs not found'
      });
    }

    this.results.push(result);
  }

  private async verifyDatabase(): Promise<void> {
    const result: VerificationResult = {
      category: 'Database Migration',
      checks: []
    };

    // Check migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '2025-08-26_magic_mode.sql');
    if (fs.existsSync(migrationPath)) {
      const migrationContent = fs.readFileSync(migrationPath, 'utf8');
      
      const hasStoriesTable = migrationContent.toLowerCase().includes('create table') && migrationContent.toLowerCase().includes('public.stories');
      const hasPitchExtensions = migrationContent.toLowerCase().includes('alter table') && migrationContent.toLowerCase().includes('public.pitches');
      const hasAnalyticsExtensions = migrationContent.toLowerCase().includes('analytics_events');
      const hasResumeExtensions = migrationContent.toLowerCase().includes('resume_requests');
      const hasRLS = migrationContent.toLowerCase().includes('row level security') || migrationContent.toLowerCase().includes('rls');
      const hasFunctions = migrationContent.toLowerCase().includes('create or replace function') || migrationContent.toLowerCase().includes('function');

      result.checks.push({
        name: 'Migration file exists',
        status: 'PASS',
        message: '2025-08-26_magic_mode.sql found'
      });

      result.checks.push({
        name: 'Stories table definition',
        status: hasStoriesTable ? 'PASS' : 'FAIL',
        message: hasStoriesTable ? 'Stories table defined' : 'Missing stories table'
      });

      result.checks.push({
        name: 'Pitch extensions',
        status: hasPitchExtensions ? 'PASS' : 'FAIL',
        message: hasPitchExtensions ? 'Pitch table extended' : 'Missing pitch extensions'
      });

      result.checks.push({
        name: 'Analytics extensions',
        status: hasAnalyticsExtensions ? 'PASS' : 'WARN',
        message: hasAnalyticsExtensions ? 'Analytics table extended' : 'Analytics extensions not found (may not exist)'
      });

      result.checks.push({
        name: 'Resume extensions',
        status: hasResumeExtensions ? 'PASS' : 'WARN',
        message: hasResumeExtensions ? 'Resume table extended' : 'Resume extensions not found (may not exist)'
      });

      result.checks.push({
        name: 'RLS policies',
        status: hasRLS ? 'PASS' : 'WARN',
        message: hasRLS ? 'RLS policies defined' : 'RLS policies not found (may be in separate migration)'
      });

      result.checks.push({
        name: 'Helper functions',
        status: hasFunctions ? 'PASS' : 'WARN',
        message: hasFunctions ? 'Helper functions defined' : 'Helper functions not found'
      });
    } else {
      result.checks.push({
        name: 'Migration file exists',
        status: 'FAIL',
        message: '2025-08-26_magic_mode.sql not found'
      });
    }

    this.results.push(result);
  }

  private async verifyTypes(): Promise<void> {
    const result: VerificationResult = {
      category: 'TypeScript Types',
      checks: []
    };

    const typesPath = path.join(process.cwd(), 'src', 'types', 'xainik.ts');
    if (fs.existsSync(typesPath)) {
      const typesContent = fs.readFileSync(typesPath, 'utf8');
      
      const hasPitchId = typesContent.includes('export type PitchId');
      const hasStoryId = typesContent.includes('export type StoryId');
      const hasStoryCandidate = typesContent.includes('export interface StoryCandidate');
      const hasStoryPublic = typesContent.includes('export interface StoryPublic');
      const hasAnalyticsEvent = typesContent.includes('export interface AnalyticsEvent');
      const hasAutoPitchInput = typesContent.includes('export interface AutoPitchInput');
      const hasAutoPitchOutput = typesContent.includes('export interface AutoPitchOutput');

      result.checks.push({
        name: 'Types file exists',
        status: 'PASS',
        message: 'src/types/xainik.ts found'
      });

      result.checks.push({
        name: 'PitchId type',
        status: hasPitchId ? 'PASS' : 'FAIL',
        message: hasPitchId ? 'PitchId type defined' : 'Missing PitchId type'
      });

      result.checks.push({
        name: 'StoryId type',
        status: hasStoryId ? 'PASS' : 'FAIL',
        message: hasStoryId ? 'StoryId type defined' : 'Missing StoryId type'
      });

      result.checks.push({
        name: 'StoryCandidate interface',
        status: hasStoryCandidate ? 'PASS' : 'FAIL',
        message: hasStoryCandidate ? 'StoryCandidate interface defined' : 'Missing StoryCandidate interface'
      });

      result.checks.push({
        name: 'StoryPublic interface',
        status: hasStoryPublic ? 'PASS' : 'FAIL',
        message: hasStoryPublic ? 'StoryPublic interface defined' : 'Missing StoryPublic interface'
      });

      result.checks.push({
        name: 'AnalyticsEvent interface',
        status: hasAnalyticsEvent ? 'PASS' : 'FAIL',
        message: hasAnalyticsEvent ? 'AnalyticsEvent interface defined' : 'Missing AnalyticsEvent interface'
      });

      result.checks.push({
        name: 'AutoPitch interfaces',
        status: hasAutoPitchInput && hasAutoPitchOutput ? 'PASS' : 'FAIL',
        message: hasAutoPitchInput && hasAutoPitchOutput 
          ? 'AutoPitch interfaces defined' 
          : 'Missing AutoPitch interfaces'
      });
    } else {
      result.checks.push({
        name: 'Types file exists',
        status: 'FAIL',
        message: 'src/types/xainik.ts not found'
      });
    }

    this.results.push(result);
  }

  private async verifyComponents(): Promise<void> {
    const result: VerificationResult = {
      category: 'UI Components',
      checks: []
    };

    const components = [
      'src/components/AppContainer.tsx',
      'src/components/BottomNav.tsx',
      'src/components/veteran/ObjectivePicker.tsx',
      'src/components/veteran/ChipGroup.tsx',
      'src/components/veteran/AutoPitch.tsx',
      'src/components/veteran/StorySuggestions.tsx',
      'src/components/veteran/StoryCard.tsx',
      'src/components/veteran/StoryModal.tsx',
      'src/components/veteran/MagicPitchWizard.tsx'
    ];

    components.forEach(componentPath => {
      const fullPath = path.join(process.cwd(), componentPath);
      const exists = fs.existsSync(fullPath);
      const name = path.basename(componentPath, '.tsx');
      
      result.checks.push({
        name: `${name} component`,
        status: exists ? 'PASS' : 'FAIL',
        message: exists ? `${componentPath} found` : `${componentPath} not found`
      });
    });

    this.results.push(result);
  }

  private async verifyAPIs(): Promise<void> {
    const result: VerificationResult = {
      category: 'API Endpoints',
      checks: []
    };

    const apis = [
      'src/app/api/xainik/ai/suggest-objectives/route.ts',
      'src/app/api/xainik/ai/auto-pitch/route.ts',
      'src/app/api/xainik/ai/suggest-stories/route.ts',
      'src/app/api/xainik/ai/expand-story/route.ts',
      'src/app/api/xainik/stories/route.ts',
      'src/app/api/xainik/stories/[id]/publish/route.ts',
              'src/app/api/xainik/stories/[id]/by-pitch/route.ts'
    ];

    apis.forEach(apiPath => {
      const fullPath = path.join(process.cwd(), apiPath);
      const exists = fs.existsSync(fullPath);
      const name = path.basename(apiPath, '.ts');
      
      result.checks.push({
        name: `${name} API`,
        status: exists ? 'PASS' : 'FAIL',
        message: exists ? `${apiPath} found` : `${apiPath} not found`
      });
    });

    // Check analytics helper
    const analyticsHelperPath = path.join(process.cwd(), 'src/lib/metrics/emit.ts');
    const analyticsHelperExists = fs.existsSync(analyticsHelperPath);
    
    result.checks.push({
      name: 'Analytics helper',
      status: analyticsHelperExists ? 'PASS' : 'FAIL',
      message: analyticsHelperExists ? 'src/lib/metrics/emit.ts found' : 'Analytics helper not found'
    });

    this.results.push(result);
  }

  private async verifyRouting(): Promise<void> {
    const result: VerificationResult = {
      category: 'Routing & Pages',
      checks: []
    };

    const pages = [
      'src/app/pitch/[id]/[storySlug]/page.tsx',
      'src/app/dashboard/veteran/stories/page.tsx',
      'src/app/dashboard/veteran/supporters/page.tsx',
      'src/app/dashboard/veteran/analytics/page.tsx'
    ];

    pages.forEach(pagePath => {
      const fullPath = path.join(process.cwd(), pagePath);
      const exists = fs.existsSync(fullPath);
      const name = path.basename(pagePath, '.tsx');
      
      result.checks.push({
        name: `${name} page`,
        status: exists ? 'PASS' : 'FAIL',
        message: exists ? `${pagePath} found` : `${pagePath} not found`
      });
    });

    // Check if pitch/new page was enhanced
    const pitchNewPath = path.join(process.cwd(), 'src/app/pitch/new/page.tsx');
    if (fs.existsSync(pitchNewPath)) {
      const content = fs.readFileSync(pitchNewPath, 'utf8');
      const hasMagicToggle = content.includes('MagicPitchWizard') || content.includes('pitchMode');
      
      result.checks.push({
        name: 'Pitch new page enhanced',
        status: hasMagicToggle ? 'PASS' : 'WARN',
        message: hasMagicToggle ? 'Magic vs Classic toggle added' : 'Magic toggle not found (may be in separate component)'
      });
    }

    this.results.push(result);
  }

  private async verifyAnalytics(): Promise<void> {
    const result: VerificationResult = {
      category: 'Analytics Integration',
      checks: []
    };

    // Check if track-event endpoint exists
    const trackEventPath = path.join(process.cwd(), 'src/app/api/track-event/route.ts');
    const trackEventExists = fs.existsSync(trackEventPath);
    
    result.checks.push({
      name: 'Track event endpoint',
      status: trackEventExists ? 'PASS' : 'WARN',
      message: trackEventExists ? 'Existing track-event endpoint found' : 'Track-event endpoint not found (may use different analytics)'
    });

    // Check analytics helper functions
    const analyticsHelperPath = path.join(process.cwd(), 'src/lib/metrics/emit.ts');
    if (fs.existsSync(analyticsHelperPath)) {
      const content = fs.readFileSync(analyticsHelperPath, 'utf8');
      const hasStoryView = content.includes('emitStoryView');
      const hasStoryShare = content.includes('emitStoryShare');
      const hasStoryCTAClick = content.includes('emitStoryCTAClick');
      
      result.checks.push({
        name: 'Story analytics functions',
        status: hasStoryView && hasStoryShare && hasStoryCTAClick ? 'PASS' : 'FAIL',
        message: hasStoryView && hasStoryShare && hasStoryCTAClick 
          ? 'All story analytics functions defined' 
          : 'Missing story analytics functions'
      });
    }

    this.results.push(result);
  }

  private async verifyMobileFirst(): Promise<void> {
    const result: VerificationResult = {
      category: 'Mobile-First Design',
      checks: []
    };

    // Check AppContainer component
    const appContainerPath = path.join(process.cwd(), 'src/components/AppContainer.tsx');
    if (fs.existsSync(appContainerPath)) {
      const content = fs.readFileSync(appContainerPath, 'utf8');
      const hasMobileClasses = content.includes('max-w-[480px]') && content.includes('mx-auto') && content.includes('px-4');
      
      result.checks.push({
        name: 'AppContainer mobile classes',
        status: hasMobileClasses ? 'PASS' : 'FAIL',
        message: hasMobileClasses ? 'Mobile-first classes found' : 'Missing mobile-first classes'
      });
    }

    // Check BottomNav component
    const bottomNavPath = path.join(process.cwd(), 'src/components/BottomNav.tsx');
    if (fs.existsSync(bottomNavPath)) {
      const content = fs.readFileSync(bottomNavPath, 'utf8');
      const hasTouchTargets = content.includes('h-11') || content.includes('min-h-[44px]') || content.includes('py-3');
      
      result.checks.push({
        name: 'BottomNav touch targets',
        status: hasTouchTargets ? 'PASS' : 'WARN',
        message: hasTouchTargets ? 'Touch targets found' : 'Touch targets not verified'
      });
    }

    this.results.push(result);
  }

  private printResults(): void {
    let totalPass = 0;
    let totalFail = 0;
    let totalWarn = 0;

    this.results.forEach(result => {
      console.log(`📋 ${result.category}`);
      console.log('─'.repeat(result.category.length + 2));
      
      result.checks.forEach(check => {
        const icon = check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${icon} ${check.name}: ${check.message}`);
        
        if (check.status === 'PASS') totalPass++;
        else if (check.status === 'FAIL') totalFail++;
        else totalWarn++;
      });
      
      console.log('');
    });

    console.log('📊 Summary');
    console.log('─'.repeat(8));
    console.log(`✅ Passed: ${totalPass}`);
    console.log(`❌ Failed: ${totalFail}`);
    console.log(`⚠️  Warnings: ${totalWarn}`);
    console.log(`📈 Total: ${totalPass + totalFail + totalWarn}`);

    if (totalFail === 0) {
      console.log('\n🎉 All critical checks passed! Magic Mode is ready for deployment.');
    } else {
      console.log('\n⚠️  Some checks failed. Please review and fix before deployment.');
      process.exit(1);
    }
  }
}

// Run verification
const verifier = new MagicModeVerifier();
verifier.run().catch(console.error);
