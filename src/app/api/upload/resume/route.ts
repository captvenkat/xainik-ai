import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import { uploadResume } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const supabase = await createSupabaseServerOnly()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Resume upload API auth check:', { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: authError?.message,
      headers: Object.fromEntries(request.headers.entries())
    })
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        details: { authError: authError?.message, hasUser: !!user }
      }, { status: 401 })
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
    const result = await uploadResume(file, user.id)

    // Check if this is a Magic Mode request (has magic_mode header)
    const magicMode = request.headers.get('x-magic-mode') === 'true'
    
    if (magicMode) {
      // Return Magic Mode response with extracted text
      const mockExtractedText = `Experienced military leader with 8+ years of service in the Indian Army.
Led teams of 50+ personnel in high-pressure operational environments.
Managed logistics, training programs, and strategic planning initiatives.
Demonstrated exceptional problem-solving skills and adaptability in dynamic situations.
Strong background in operations management, team leadership, and resource optimization.`

      return NextResponse.json({ 
        success: true, 
        storagePath: result.url,
        fileName: file.name,
        fileSize: file.size,
        extractedText: mockExtractedText
      })
    }

    // Return standard response for non-Magic Mode
    return NextResponse.json({ 
      success: true, 
      storagePath: result.url,
      fileName: file.name,
      fileSize: file.size
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to upload resume' 
    }, { status: 500 })
  }
}
