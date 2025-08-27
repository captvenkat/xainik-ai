import { createSupabaseServer } from '@/lib/supabaseServer'

export interface AvoidItem {
  title?: string;
  angle?: string;
  keyPhrases?: string[];
}

export interface Span {
  start: number;
  end: number;
}

export async function buildAvoidList(pitchId: string): Promise<AvoidItem[]> {
  try {
    const supabase = await createSupabaseServer()
    
    // Get recent stories for this pitch
    const { data: stories } = await supabase
      .from('stories')
      .select('title, summary, body_md')
      .eq('pitch_id', pitchId)
      .in('status', ['published', 'queued'])
      .order('created_at', { ascending: false })
      .limit(10)

    if (!stories) return []

    return stories.map(story => ({
      title: story.title,
      angle: story.summary,
      keyPhrases: extractKeyPhrases(story.title + ' ' + story.summary)
    }))
  } catch (error) {
    console.error('Error building avoid list:', error)
    return []
  }
}

function extractKeyPhrases(text: string): string[] {
  // Simple key phrase extraction - can be enhanced with NLP
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['with', 'from', 'that', 'this', 'have', 'been', 'they', 'their'].includes(word))
  
  return [...new Set(words)].slice(0, 10)
}

export function isTooSimilar(a: string, b: string): boolean {
  // Simple Jaccard similarity - can be enhanced with embeddings
  const wordsA = new Set(a.toLowerCase().split(/\s+/))
  const wordsB = new Set(b.toLowerCase().split(/\s+/))
  
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)))
  const union = new Set([...wordsA, ...wordsB])
  
  const similarity = intersection.size / union.size
  return similarity > 0.7 // 70% similarity threshold
}

export function validateSpans(items: any[], resumeLength: number): boolean {
  for (const item of items) {
    if (!item.source_spans) continue
    
    for (const span of item.source_spans) {
      if (typeof span.start !== 'number' || typeof span.end !== 'number') {
        return false
      }
      if (span.start < 0 || span.end > resumeLength || span.start >= span.end) {
        return false
      }
    }
  }
  return true
}

export function enforceBand(str: string, min: number, max: number): string {
  if (str.length <= max) return str
  
  // Trim at sentence boundary
  const sentences = str.match(/[^.!?]+[.!?]+/g) || []
  let result = ''
  
  for (const sentence of sentences) {
    if ((result + sentence).length <= max) {
      result += sentence
    } else {
      break
    }
  }
  
  // If no sentences fit, trim at word boundary
  if (!result) {
    const words = str.split(' ')
    for (const word of words) {
      if ((result + ' ' + word).length <= max) {
        result += (result ? ' ' : '') + word
      } else {
        break
      }
    }
  }
  
  return result || str.substring(0, max)
}
