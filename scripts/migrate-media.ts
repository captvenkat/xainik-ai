#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { ImagePipeline } from '../lib/image-pipeline';
import { randomUUID } from 'crypto';

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase environment variables not set.');
  console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MigrationOptions {
  dry: boolean;
  limit: number;
  speakerId?: string;
  kinds: string[];
  maxWidth: number;
}

interface MigrationStats {
  processed: number;
  converted: number;
  errors: number;
  skipped: number;
}

class MediaMigration {
  private options: MigrationOptions;
  private stats: MigrationStats = {
    processed: 0,
    converted: 0,
    errors: 0,
    skipped: 0
  };

  constructor(options: MigrationOptions) {
    this.options = options;
  }

  async run(): Promise<void> {
    console.log('🔄 Starting media migration...');
    console.log(`Options:`, {
      dry: this.options.dry,
      limit: this.options.limit,
      speakerId: this.options.speakerId || 'all',
      kinds: this.options.kinds,
      maxWidth: this.options.maxWidth
    });

    if (this.options.dry) {
      console.log('🔍 DRY RUN MODE - No changes will be made');
    }

    try {
      // Query legacy media records
      const legacyMedia = await this.getLegacyMedia();
      console.log(`📊 Found ${legacyMedia.length} legacy media records to process`);

      if (legacyMedia.length === 0) {
        console.log('✅ No legacy media found. Migration complete!');
        return;
      }

      // Process in batches
      const batches = this.chunkArray(legacyMedia, 10);
      for (const batch of batches) {
        await this.processBatch(batch);
        
        if (this.stats.processed >= this.options.limit) {
          console.log(`⏹️  Reached limit of ${this.options.limit} records`);
          break;
        }
      }

      // Log final stats
      this.logStats();

      // Create audit entry
      if (!this.options.dry && this.stats.converted > 0) {
        await this.createAuditEntry();
      }

    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  private async getLegacyMedia(): Promise<any[]> {
    let query = supabase
      .from('media')
      .select('*')
      .or('meta->mime.neq.image/webp,meta->sizes.is.null')
      .order('created_at', { ascending: true });

    if (this.options.speakerId) {
      query = query.eq('speaker_id', this.options.speakerId);
    }

    if (this.options.kinds.length > 0) {
      query = query.in('kind', this.options.kinds);
    }

    const { data, error } = await query.limit(this.options.limit);

    if (error) {
      throw new Error(`Failed to query legacy media: ${error.message}`);
    }

    return data || [];
  }

  private async processBatch(batch: any[]): Promise<void> {
    console.log(`\n📦 Processing batch of ${batch.length} records...`);

    for (const media of batch) {
      try {
        await this.processMediaRecord(media);
        this.stats.processed++;
      } catch (error) {
        console.error(`❌ Failed to process media ${media.id}:`, error);
        this.stats.errors++;
      }
    }
  }

  private async processMediaRecord(media: any): Promise<void> {
    console.log(`🔄 Processing ${media.kind} for speaker ${media.speaker_id}...`);

    // Check if already converted
    if (ImagePipeline.validateWebPPolicy(media.meta)) {
      console.log(`⏭️  Skipping ${media.id} - already WebP with sizes`);
      this.stats.skipped++;
      return;
    }

    if (this.options.dry) {
      console.log(`🔍 [DRY] Would convert ${media.id} from ${media.url}`);
      this.stats.converted++;
      return;
    }

    try {
      // Download and process the image
      const processedImage = await ImagePipeline.processImage(
        media.url,
        media.speaker_id,
        media.kind,
        'upload'
      );

      // Update the media record with new URLs and mark old as archived
      const { error: updateError } = await supabase
        .from('media')
        .update({
          url: processedImage.urls.hero,
          meta: {
            ...media.meta,
            sizes: processedImage.meta.sizes,
            source: processedImage.meta.source,
            mime: processedImage.meta.mime,
            version: processedImage.meta.version,
            urls: processedImage.urls,
            legacyUrl: media.url,
            archived: true
          }
        })
        .eq('id', media.id);

      if (updateError) {
        throw new Error(`Failed to update media record: ${updateError.message}`);
      }

      console.log(`✅ Converted ${media.id} to WebP with 3 sizes`);
      this.stats.converted++;

    } catch (error) {
      console.error(`❌ Failed to convert ${media.id}:`, error);
      throw error;
    }
  }

  private async createAuditEntry(): Promise<void> {
    const auditEntry = {
      who: 'system',
      action: 'media_migration',
      resource: 'media',
      before: null,
      after: {
        stats: this.stats,
        options: this.options
      },
      source: 'migration_cli'
    };

    const { error } = await supabase
      .from('audit')
      .insert(auditEntry);

    if (error) {
      console.warn('⚠️  Failed to create audit entry:', error.message);
    } else {
      console.log('📝 Created audit entry for migration');
    }
  }

  private logStats(): void {
    console.log('\n📊 Migration Statistics:');
    console.log(`   Processed: ${this.stats.processed}`);
    console.log(`   Converted: ${this.stats.converted}`);
    console.log(`   Skipped: ${this.stats.skipped}`);
    console.log(`   Errors: ${this.stats.errors}`);
    
    if (this.options.dry) {
      console.log('\n🔍 This was a dry run. Use without --dry to perform actual migration.');
    } else {
      console.log('\n✅ Migration completed successfully!');
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// CLI argument parsing
function parseArgs(): MigrationOptions {
  const args = process.argv.slice(2);
  
  const options: MigrationOptions = {
    dry: false,
    limit: 1000,
    kinds: ['poster', 'photo'],
    maxWidth: 2000
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--dry':
        options.dry = true;
        break;
      case '--limit':
        options.limit = parseInt(args[++i]) || 1000;
        break;
      case '--speaker':
        options.speakerId = args[++i];
        break;
      case '--kinds':
        options.kinds = args[++i].split(',').map(k => k.trim());
        break;
      case '--maxWidth':
        options.maxWidth = parseInt(args[++i]) || 2000;
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
📸 Media Migration CLI

Usage: pnpm tsx scripts/migrate-media.ts [options]

Options:
  --dry                    Dry run mode (no changes made)
  --limit N               Maximum number of records to process (default: 1000)
  --speaker SPEAKER_ID    Process only media for specific speaker
  --kinds poster,photo    Comma-separated list of media kinds to process
  --maxWidth N            Maximum width for resizing (default: 2000)
  --help                  Show this help message

Examples:
  pnpm tsx scripts/migrate-media.ts --dry
  pnpm tsx scripts/migrate-media.ts --limit 100
  pnpm tsx scripts/migrate-media.ts --speaker abc123 --kinds poster
  pnpm tsx scripts/migrate-media.ts --dry --limit 50
`);
}

// Main execution
async function main() {
  try {
    const options = parseArgs();
    const migration = new MediaMigration(options);
    await migration.run();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
