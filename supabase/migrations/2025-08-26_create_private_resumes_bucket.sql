-- Create private-resumes storage bucket for resume uploads
-- This bucket will store user resumes privately

-- Note: Storage bucket creation is typically done through the Supabase dashboard
-- or using the Supabase CLI. This migration serves as documentation.

-- To create the bucket manually:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "Create a new bucket"
-- 3. Name: private-resumes
-- 4. Public bucket: false (private)
-- 5. File size limit: 10MB
-- 6. Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/*

-- RLS policies for private-resumes bucket:
-- Users can only access their own resume files

-- Example RLS policy (to be applied manually in dashboard):
/*
CREATE POLICY "Users can upload their own resumes" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'private-resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own resumes" ON storage.objects
FOR SELECT USING (
  bucket_id = 'private-resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own resumes" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'private-resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own resumes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'private-resumes' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
*/
