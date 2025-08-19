-- =====================================================
-- ENHANCED PROFILE SYSTEM MIGRATION
-- Adds intelligent profile features with Google Places integration
-- =====================================================

-- 1. Add new fields to veterans table
DO $$ BEGIN
  -- Add bio field with 600 character limit
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'veterans' 
    AND column_name = 'bio'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.veterans ADD COLUMN bio text CHECK (length(bio) <= 600);
    RAISE NOTICE 'Added bio field to veterans table';
  END IF;
  
  -- Add military_rank field (separate from existing rank field for better organization)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'veterans' 
    AND column_name = 'military_rank'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.veterans ADD COLUMN military_rank text;
    RAISE NOTICE 'Added military_rank field to veterans table';
  END IF;
  
  -- Add web_links field as JSONB to store multiple links
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'veterans' 
    AND column_name = 'web_links'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.veterans ADD COLUMN web_links jsonb DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added web_links field to veterans table';
  END IF;
  
  -- Add location_current_city and location_current_country for structured storage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'veterans' 
    AND column_name = 'location_current_city'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.veterans ADD COLUMN location_current_city text;
    RAISE NOTICE 'Added location_current_city field to veterans table';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'veterans' 
    AND column_name = 'location_current_country'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.veterans ADD COLUMN location_current_country text;
    RAISE NOTICE 'Added location_current_country field to veterans table';
  END IF;
  
  -- Add locations_preferred_structured as JSONB for better location handling
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'veterans' 
    AND column_name = 'locations_preferred_structured'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.veterans ADD COLUMN locations_preferred_structured jsonb DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added locations_preferred_structured field to veterans table';
  END IF;
  
  -- Add updated_at timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'veterans' 
    AND column_name = 'updated_at'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.veterans ADD COLUMN updated_at timestamptz DEFAULT now();
    RAISE NOTICE 'Added updated_at field to veterans table';
  END IF;
  
  -- Add retirement_date field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'veterans' 
    AND column_name = 'retirement_date'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.veterans ADD COLUMN retirement_date date;
    RAISE NOTICE 'Added retirement_date field to veterans table';
  END IF;
END $$;

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_veterans_military_rank ON public.veterans(military_rank);
CREATE INDEX IF NOT EXISTS idx_veterans_location_current_city ON public.veterans(location_current_city);
CREATE INDEX IF NOT EXISTS idx_veterans_location_current_country ON public.veterans(location_current_country);
CREATE INDEX IF NOT EXISTS idx_veterans_updated_at ON public.veterans(updated_at);

-- 3. Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_veterans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_veterans_updated_at ON public.veterans;
CREATE TRIGGER trigger_veterans_updated_at
  BEFORE UPDATE ON public.veterans
  FOR EACH ROW
  EXECUTE FUNCTION update_veterans_updated_at();

-- 5. Create a function to validate web links
CREATE OR REPLACE FUNCTION validate_web_link(link_data jsonb)
RETURNS boolean AS $$
DECLARE
  link_url text;
  link_type text;
BEGIN
  -- Extract URL and type from the link data
  link_url := link_data->>'url';
  link_type := link_data->>'type';
  
  -- Basic URL validation
  IF link_url IS NULL OR link_url = '' THEN
    RETURN false;
  END IF;
  
  -- Check if URL starts with http:// or https://
  IF NOT (link_url LIKE 'http://%' OR link_url LIKE 'https://%') THEN
    RETURN false;
  END IF;
  
  -- Validate specific link types
  CASE link_type
    WHEN 'linkedin' THEN
      -- LinkedIn URLs should contain linkedin.com
      IF link_url NOT LIKE '%linkedin.com%' THEN
        RETURN false;
      END IF;
    WHEN 'twitter' THEN
      -- Twitter URLs should contain twitter.com or x.com
      IF link_url NOT LIKE '%twitter.com%' AND link_url NOT LIKE '%x.com%' THEN
        RETURN false;
      END IF;
    WHEN 'youtube' THEN
      -- YouTube URLs should contain youtube.com
      IF link_url NOT LIKE '%youtube.com%' THEN
        RETURN false;
      END IF;
    WHEN 'github' THEN
      -- GitHub URLs should contain github.com
      IF link_url NOT LIKE '%github.com%' THEN
        RETURN false;
      END IF;
    WHEN 'website' THEN
      -- Website URLs are more flexible
      RETURN true;
    ELSE
      -- Unknown type, reject
      RETURN false;
  END CASE;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 6. Create a function to parse location string into city and country
CREATE OR REPLACE FUNCTION parse_location(location_text text)
RETURNS jsonb AS $$
DECLARE
  parts text[];
  city text;
  country text;
  result jsonb;
BEGIN
  IF location_text IS NULL OR location_text = '' THEN
    RETURN '{"city": null, "country": null, "full": null}'::jsonb;
  END IF;
  
  -- Split by comma and trim whitespace
  parts := string_to_array(location_text, ',');
  
  IF array_length(parts, 1) >= 2 THEN
    city := trim(parts[1]);
    country := trim(parts[2]);
  ELSIF array_length(parts, 1) = 1 THEN
    city := trim(parts[1]);
    country := null;
  ELSE
    city := null;
    country := null;
  END IF;
  
  result := jsonb_build_object(
    'city', city,
    'country', country,
    'full', location_text
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 7. Create a function to update location fields
CREATE OR REPLACE FUNCTION update_location_fields()
RETURNS TRIGGER AS $$
DECLARE
  parsed_location jsonb;
BEGIN
  -- Parse current location
  IF NEW.location_current IS NOT NULL AND (OLD.location_current IS NULL OR NEW.location_current != OLD.location_current) THEN
    parsed_location := parse_location(NEW.location_current);
    NEW.location_current_city := parsed_location->>'city';
    NEW.location_current_country := parsed_location->>'country';
  END IF;
  
  -- Parse preferred locations
  IF NEW.locations_preferred IS NOT NULL AND (OLD.locations_preferred IS NULL OR NEW.locations_preferred != OLD.locations_preferred) THEN
    NEW.locations_preferred_structured := (
      SELECT jsonb_agg(parse_location(loc))
      FROM unnest(NEW.locations_preferred) AS loc
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to automatically parse locations
DROP TRIGGER IF EXISTS trigger_update_location_fields ON public.veterans;
CREATE TRIGGER trigger_update_location_fields
  BEFORE INSERT OR UPDATE ON public.veterans
  FOR EACH ROW
  EXECUTE FUNCTION update_location_fields();

-- 9. Create a view for enhanced profile display
CREATE OR REPLACE VIEW public.veteran_profiles_enhanced AS
SELECT 
  v.user_id,
  u.name,
  u.email,
  u.phone,
  v.military_rank,
  v.service_branch,
  v.years_experience,
  v.bio,
  v.location_current_city,
  v.location_current_country,
  v.location_current,
  v.locations_preferred,
  v.locations_preferred_structured,
  v.web_links,
  v.retirement_date,
  v.rank as legacy_rank, -- Keep for backward compatibility
  v.created_at,
  v.updated_at
FROM public.veterans v
JOIN public.users u ON v.user_id = u.id;

-- 10. Grant permissions on the view
DO $$ BEGIN 
  BEGIN 
    GRANT SELECT ON public.veteran_profiles_enhanced TO authenticated;
  EXCEPTION WHEN OTHERS THEN NULL; 
  END; 
END $$;

-- 11. Update existing RLS policies for veterans table to include new fields
DO $$ BEGIN 
  -- Update existing policies to include new fields
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'veterans' AND policyname = 'Users can update own veteran profile') THEN
    DROP POLICY "Users can update own veteran profile" ON public.veterans;
  END IF;
  
  CREATE POLICY "Users can update own veteran profile" ON public.veterans 
    FOR UPDATE USING (auth.uid() = user_id);
    
  -- Ensure veterans can view all profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'veterans' AND policyname = 'Veterans can view all veteran profiles') THEN
    CREATE POLICY "Veterans can view all veteran profiles" ON public.veterans FOR SELECT USING (true);
  END IF;
END $$;

-- 12. Test the migration
SELECT 
  'Enhanced Profile Migration Complete' as status,
  COUNT(*) as total_veterans,
  COUNT(CASE WHEN bio IS NOT NULL THEN 1 END) as veterans_with_bio,
  COUNT(CASE WHEN military_rank IS NOT NULL THEN 1 END) as veterans_with_rank,
  COUNT(CASE WHEN web_links IS NOT NULL AND web_links != '[]'::jsonb THEN 1 END) as veterans_with_links,
  COUNT(CASE WHEN location_current_city IS NOT NULL THEN 1 END) as veterans_with_structured_location
FROM public.veterans;
