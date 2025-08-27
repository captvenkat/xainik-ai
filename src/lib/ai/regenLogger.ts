import { createSupabaseServer } from '@/lib/supabaseServer'

export interface RegenLogEntry {
  pitch_id?: string
  route: string
  regen_token?: string
  avoid_list?: any[]
  inputs_hash?: string
  outputs_hash?: string
  reason?: string
}

export async function logRegenAttempt(entry: RegenLogEntry) {
  try {
    const supabase = await createSupabaseServer()
    
    await supabase
      .from('ai_regen_logs')
      .insert({
        pitch_id: entry.pitch_id,
        route: entry.route,
        regen_token: entry.regen_token,
        avoid_list: entry.avoid_list || [],
        inputs_hash: entry.inputs_hash,
        outputs_hash: entry.outputs_hash,
        reason: entry.reason
      })
  } catch (error) {
    console.error('Failed to log regeneration attempt:', error)
    // Don't throw - logging should not break the main flow
  }
}

// Simple hash function for inputs/outputs
export function simpleHash(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}
