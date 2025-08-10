import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { getSignedUrl } from '@/lib/storage'

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

    // Get receipt details
    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', id)
      .single()

    if (receiptError || !receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    // Check if user can access this receipt (donor or admin)
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const canAccess = receipt.donor_email === user.email || userProfile?.role === 'admin'
    
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate signed URL
    const bucket = process.env.BILLING_PDF_BUCKET || 'docs'
    const downloadUrl = await getSignedUrl(bucket, receipt.storage_key)

    // Redirect to signed URL
    return NextResponse.redirect(downloadUrl)

  } catch (error) {
    console.error('Error serving receipt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
