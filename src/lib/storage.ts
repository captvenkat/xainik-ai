import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
