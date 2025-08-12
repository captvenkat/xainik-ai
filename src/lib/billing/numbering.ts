import { createActionClient } from '@/lib/supabase-server'

export async function generateReceiptNumber(entityType: string): Promise<string> {
  try {
    const supabase = await createActionClient()
    
    // Get current numbering state
    const { data: numberingState, error } = await supabase
      .from('numbering_state')
      .select('*')
      .eq('entity_type', entityType)
      .single()

    if (error) {
      console.error('Error fetching numbering state:', error)
      throw new Error('Failed to get numbering state')
    }

    // Generate next number
    const nextNumber = (numberingState?.current_number || 0) + 1
    
    // Update numbering state
    const { error: updateError } = await supabase
      .from('numbering_state')
      .update({ current_number: nextNumber })
      .eq('entity_type', entityType)

    if (updateError) {
      console.error('Error updating numbering state:', updateError)
      throw new Error('Failed to update numbering state')
    }

    // Format receipt number
    const prefix = numberingState?.prefix || 'RCPT'
    const suffix = numberingState?.suffix || ''
    const formattedNumber = nextNumber.toString().padStart(6, '0')
    
    return `${prefix}${formattedNumber}${suffix}`
  } catch (error) {
    console.error('Error in generateReceiptNumber:', error)
    throw error
  }
}

export async function generateInvoiceNumber(entityType: string): Promise<string> {
  try {
    const supabase = await createActionClient()
    
    // Get current numbering state
    const { data: numberingState, error } = await supabase
      .from('numbering_state')
      .select('*')
      .eq('entity_type', entityType)
      .single()

    if (error) {
      console.error('Error fetching numbering state:', error)
      throw new Error('Failed to get numbering state')
    }

    // Generate next number
    const nextNumber = (numberingState?.current_number || 0) + 1
    
    // Update numbering state
    const { error: updateError } = await supabase
      .from('numbering_state')
      .update({ current_number: nextNumber })
      .eq('entity_type', entityType)

    if (updateError) {
      console.error('Error updating numbering state:', updateError)
      throw new Error('Failed to update numbering state')
    }

    // Format invoice number
    const prefix = numberingState?.prefix || 'INV'
    const suffix = numberingState?.suffix || ''
    const formattedNumber = nextNumber.toString().padStart(6, '0')
    
    return `${prefix}${formattedNumber}${suffix}`
  } catch (error) {
    console.error('Error in generateInvoiceNumber:', error)
    throw error
  }
}

export async function initializeNumberingState(entityType: string, prefix?: string, suffix?: string): Promise<void> {
  try {
    const supabase = await createActionClient()
    
    // Check if numbering state already exists
    const { data: existingState } = await supabase
      .from('numbering_state')
      .select('*')
      .eq('entity_type', entityType)
      .single()

    if (existingState) {
      return // Already initialized
    }

    // Create new numbering state
    const { error } = await supabase
      .from('numbering_state')
      .insert({
        entity_type: entityType,
        current_number: 0,
        prefix: prefix || '',
        suffix: suffix || ''
      })

    if (error) {
      console.error('Error initializing numbering state:', error)
      throw new Error('Failed to initialize numbering state')
    }
  } catch (error) {
    console.error('Error in initializeNumberingState:', error)
    throw error
  }
}

export async function getNumberingState(entityType: string) {
  try {
    const supabase = await createActionClient()
    
    const { data: numberingState, error } = await supabase
      .from('numbering_state')
      .select('*')
      .eq('entity_type', entityType)
      .single()

    if (error) {
      console.error('Error fetching numbering state:', error)
      return null
    }

    return numberingState
  } catch (error) {
    console.error('Error in getNumberingState:', error)
    return null
  }
}

export async function resetNumberingState(entityType: string, newNumber: number = 0): Promise<void> {
  try {
    const supabase = await createActionClient()
    
    const { error } = await supabase
      .from('numbering_state')
      .update({ current_number: newNumber })
      .eq('entity_type', entityType)

    if (error) {
      console.error('Error resetting numbering state:', error)
      throw new Error('Failed to reset numbering state')
    }
  } catch (error) {
    console.error('Error in resetNumberingState:', error)
    throw error
  }
}
