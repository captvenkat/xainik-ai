-- Add sample activity log entries for veteran value ticker
-- Migration: 20250127_add_veteran_value_activity.sql

-- Insert sample activity log entries to demonstrate veteran value
INSERT INTO public.activity_log (event, meta) VALUES
  ('recruiter_shortlisted', '{"recruiter_name": "Tech Recruiter", "veteran_name": "John Smith", "pitch_title": "Cybersecurity Specialist"}'),
  ('recruiter_contacted', '{"recruiter_name": "HR Manager", "veteran_name": "Sarah Johnson", "pitch_title": "Project Manager"}'),
  ('veteran_hired', '{"recruiter_name": "Talent Director", "veteran_name": "Mike Davis", "pitch_title": "Operations Lead"}'),
  ('recruiter_shortlisted', '{"recruiter_name": "Engineering Recruiter", "veteran_name": "Lisa Chen", "pitch_title": "Software Engineer"}'),
  ('recruiter_contacted', '{"recruiter_name": "Sales Recruiter", "veteran_name": "David Wilson", "pitch_title": "Sales Manager"}'),
  ('veteran_hired', '{"recruiter_name": "Operations Manager", "veteran_name": "Alex Rodriguez", "pitch_title": "Logistics Coordinator"}'),
  ('recruiter_shortlisted', '{"recruiter_name": "Product Recruiter", "veteran_name": "Emma Thompson", "pitch_title": "Product Manager"}'),
  ('recruiter_contacted', '{"recruiter_name": "Marketing Recruiter", "veteran_name": "James Brown", "pitch_title": "Marketing Specialist"}'),
  ('veteran_hired', '{"recruiter_name": "Finance Recruiter", "veteran_name": "Maria Garcia", "pitch_title": "Financial Analyst"}'),
  ('recruiter_shortlisted', '{"recruiter_name": "Customer Success Recruiter", "veteran_name": "Robert Lee", "pitch_title": "Customer Success Manager"}')
ON CONFLICT DO NOTHING;
