'use server'

import { createActionClient } from '@/lib/supabase-server'

export interface KeywordData {
  id: string
  phrase: string
  appliedToHeadline: boolean
  appliedDate: string | null
}

export async function getKeywordSuggestions(pitchId: string): Promise<KeywordData[]> {
  const supabase = await createActionClient()
  
  try {
    const { data, error } = await supabase
      .from('impact_keywords')
      .select('*')
      .eq('pitch_id', pitchId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching keyword suggestions:', error)
      return getDefaultKeywords()
    }
    
    if (!data || data.length === 0) {
      return getDefaultKeywords()
    }
    
    return data.map(keyword => ({
      id: keyword.id,
      phrase: keyword.keyword_phrase,
      appliedToHeadline: keyword.applied_to_headline || false,
      appliedDate: keyword.applied_date
    }))
  } catch (error) {
    console.error('Error in getKeywordSuggestions:', error)
    return getDefaultKeywords()
  }
}

export async function applyKeywordToHeadline(pitchId: string, phrase: string): Promise<boolean> {
  const supabase = await createActionClient()
  
  try {
    // First, check if keyword exists
    const { data: existingKeyword } = await supabase
      .from('impact_keywords')
      .select('id')
      .eq('pitch_id', pitchId)
      .eq('keyword_phrase', phrase)
      .single()
    
    if (existingKeyword) {
      // Update existing keyword
      const { error } = await supabase
        .from('impact_keywords')
        .update({
          applied_to_headline: true,
          applied_date: new Date().toISOString()
        })
        .eq('id', existingKeyword.id)
      
      if (error) {
        console.error('Error updating keyword:', error)
        return false
      }
    } else {
      // Create new keyword
      const { error } = await supabase
        .from('impact_keywords')
        .insert({
          pitch_id: pitchId,
          keyword_phrase: phrase,
          applied_to_headline: true,
          applied_date: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error creating keyword:', error)
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error('Error in applyKeywordToHeadline:', error)
    return false
  }
}

function getDefaultKeywords(): KeywordData[] {
  return [
    {
      id: '1',
      phrase: 'veteran leadership',
      appliedToHeadline: false,
      appliedDate: null
    },
    {
      id: '2',
      phrase: 'military experience',
      appliedToHeadline: false,
      appliedDate: null
    },
    {
      id: '3',
      phrase: 'team management',
      appliedToHeadline: false,
      appliedDate: null
    },
    {
      id: '4',
      phrase: 'strategic planning',
      appliedToHeadline: false,
      appliedDate: null
    },
    {
      id: '5',
      phrase: 'crisis management',
      appliedToHeadline: false,
      appliedDate: null
    }
  ]
}
