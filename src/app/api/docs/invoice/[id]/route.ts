import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { signedUrl } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get user from auth
    const supabase = createAdminClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Check if user can access this invoice (owner or admin)
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const canAccess = invoice.user_id === user.id || userProfile?.role === 'admin'
    
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate signed URL
    const downloadUrl = await signedUrl(invoice.storage_key)

    // Redirect to signed URL
    return NextResponse.redirect(downloadUrl)

  } catch (error) {
    console.error('Error serving invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
