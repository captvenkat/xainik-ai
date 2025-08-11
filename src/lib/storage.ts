import { createSupabaseServerOnly } from './supabaseServerOnly'

const supabase = createSupabaseServerOnly()

export async function uploadPdf(
  bucket: string,
  path: string,
  pdfBuffer: Buffer,
  contentType: string = 'application/pdf'
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, pdfBuffer, {
        contentType,
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw new Error(`Failed to upload PDF: ${error.message}`)
    }

    return data.path
  } catch (error) {
    console.error('Storage upload error:', error)
    throw error
  }
}

export async function uploadResume(
  userId: string,
  file: File,
  fileName: string
): Promise<string> {
  try {
    // Create a unique path for the resume
    const timestamp = Date.now()
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    const path = `resumes/${userId}/${timestamp}.${fileExtension}`

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(path, file, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Resume upload error:', error)
      throw new Error(`Failed to upload resume: ${error.message}`)
    }

    return data.path
  } catch (error) {
    console.error('Storage resume upload error:', error)
    throw error
  }
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = parseInt(process.env.BILLING_SIGNED_URL_TTL || '86400')
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Signed URL error:', error)
      throw new Error(`Failed to create signed URL: ${error.message}`)
    }

    return data.signedUrl
  } catch (error) {
    console.error('Storage signed URL error:', error)
    throw error
  }
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  } catch (error) {
    console.error('Storage delete error:', error)
    throw error
  }
}

export function generateStorageKey(
  type: 'invoice' | 'receipt',
  userId: string,
  number: string
): string {
  const timestamp = new Date().toISOString().split('T')[0]
  return `${userId}/${type}s/${timestamp}/${number}.pdf`
}

export function generateResumeKey(userId: string, fileName: string): string {
  const timestamp = Date.now()
  const fileExtension = fileName.split('.').pop()?.toLowerCase()
  return `resumes/${userId}/${timestamp}.${fileExtension}`
}
