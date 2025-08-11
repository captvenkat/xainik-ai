import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { uploadResume } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const supabase = createSupabaseServerOnly()
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
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Please upload a PDF, DOC, or DOCX file' 
      }, { status: 400 })
    }

    // Upload to storage
    const storagePath = await uploadResume(user.id, file, file.name)

    return NextResponse.json({ 
      success: true, 
      storagePath,
      fileName: file.name,
      fileSize: file.size
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to upload resume' 
    }, { status: 500 })
  }
}
