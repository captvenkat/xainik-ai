#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('⚠️  Supabase environment variables not set. Skipping WebP policy check.');
  console.log('   This is expected in CI without database access.');
  process.exit(0);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PolicyViolation {
  id: string;
  speaker_id: string;
  kind: string;
  url: string;
  issue: string;
  meta: any;
}

class WebPPolicyChecker {
  private violations: PolicyViolation[] = [];

  async check(): Promise<boolean> {
    console.log('🔍 Checking WebP policy compliance...');

    try {
      // Query all media records
      const { data: allMedia, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to query media: ${error.message}`);
      }

      if (!allMedia || allMedia.length === 0) {
        console.log('✅ No media records found');
        return true;
      }

      console.log(`📊 Checking ${allMedia.length} media records...`);

      // Check each media record
      for (const media of allMedia) {
        this.checkMediaRecord(media);
      }

      // Report results
      this.reportResults();

      return this.violations.length === 0;

    } catch (error) {
      console.error('❌ Policy check failed:', error);
      return false;
    }
  }

  private checkMediaRecord(media: any): void {
    const issues: string[] = [];

    // Skip archived records
    if (media.meta?.archived === true) {
      return;
    }

    // Check MIME type
    if (!media.meta?.mime || media.meta.mime !== 'image/webp') {
      issues.push('Not WebP format');
    }

    // Check sizes
    if (!media.meta?.sizes) {
      issues.push('Missing sizes metadata');
    } else {
      const sizes = media.meta.sizes;
      if (!sizes.hero || !sizes.card || !sizes.thumb) {
        issues.push('Missing size variants (hero/card/thumb)');
      }
    }

    // Check URL structure
    if (media.url && !media.url.includes('.webp')) {
      issues.push('URL does not contain .webp extension');
    }

    // Check meta structure
    if (!media.meta?.source) {
      issues.push('Missing source metadata');
    }

    if (!media.meta?.version) {
      issues.push('Missing version metadata');
    }

    // Record violations
    if (issues.length > 0) {
      this.violations.push({
        id: media.id,
        speaker_id: media.speaker_id,
        kind: media.kind,
        url: media.url,
        issue: issues.join(', '),
        meta: media.meta
      });
    }
  }

  private reportResults(): void {
    console.log('\n📊 WebP Policy Check Results:');
    console.log(`   Total records checked: ${this.violations.length + (this.violations.length === 0 ? 1 : 0)}`);
    console.log(`   Violations found: ${this.violations.length}`);

    if (this.violations.length === 0) {
      console.log('✅ All media records comply with WebP policy!');
      return;
    }

    console.log('\n❌ Policy violations found:');
    this.violations.forEach((violation, index) => {
      console.log(`\n${index + 1}. Media ID: ${violation.id}`);
      console.log(`   Speaker: ${violation.speaker_id}`);
      console.log(`   Kind: ${violation.kind}`);
      console.log(`   URL: ${violation.url}`);
      console.log(`   Issues: ${violation.issue}`);
    });

    console.log('\n💡 To fix violations, run:');
    console.log('   pnpm tsx scripts/migrate-media.ts --dry');
    console.log('   pnpm tsx scripts/migrate-media.ts');
  }
}

// Main execution
async function main() {
  const checker = new WebPPolicyChecker();
  const isCompliant = await checker.check();
  
  if (!isCompliant) {
    console.log('\n❌ WebP policy check failed');
    process.exit(1);
  } else {
    console.log('\n✅ WebP policy check passed');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}
