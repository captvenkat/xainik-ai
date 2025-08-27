import type { AnalyticsEvent } from '../../types/xainik'

export async function emit(evt: AnalyticsEvent) {
  try {
    await fetch('/api/track-event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(evt),
      keepalive: true,
    })
  } catch (error) {
    console.error('Failed to emit analytics event:', error)
  }
}

export async function emitStoryView(pitchId: string, storyId: string, referrer?: string) {
  await emit({
    event_type: 'view',
    pitch_id: pitchId,
    story_id: storyId,
    referrer
  })
}

export async function emitStoryShare(pitchId: string, storyId: string, platform: string) {
  await emit({
    event_type: 'share',
    pitch_id: pitchId,
    story_id: storyId,
    utm: { source: platform }
  })
}

export async function emitStoryCTAClick(pitchId: string, storyId: string, ctaType: string) {
  await emit({
    event_type: 'cta_click',
    pitch_id: pitchId,
    story_id: storyId,
    utm: { cta_type: ctaType }
  })
}
