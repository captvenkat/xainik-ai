import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const supabase = await createSupabaseServerOnly()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Please upload a JPEG, PNG, or WebP image' 
      }, { status: 400 })
    }

    // For now, we'll use base64 encoding and store in the database
    // In production, you'd want to upload to Supabase Storage or similar
    const reader = new FileReader()
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })
    
    reader.readAsDataURL(file)
    const base64Data = await base64Promise

    // Store the photo data in a temporary table or use the base64 directly
    // For now, we'll return the base64 data as the photo URL
    // In production, you'd upload to storage and return the storage URL

    return NextResponse.json({ 
      success: true, 
      photoUrl: base64Data,
      fileName: file.name,
      fileSize: file.size
    })

  } catch (error) {
    console.error('Photo upload failed:', error)
    return NextResponse.json({ 
      error: 'Failed to upload photo' 
    }, { status: 500 })
  }
}
