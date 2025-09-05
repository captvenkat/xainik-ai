# Graveyard - Legacy Files

This directory contains files that were moved here during the cleanup process as part of the Build Captain migration to align with the SSOT spec.

## Files Moved

### `convert-and-upload.sh`
- **Reason**: One-time conversion script for military backgrounds
- **Status**: Legacy - no longer needed after initial setup
- **Action**: Can be deleted after confirming backgrounds are uploaded to Supabase

### `convert-images.js`
- **Reason**: One-time image conversion utility
- **Status**: Legacy - no longer needed after initial setup  
- **Action**: Can be deleted after confirming images are converted and uploaded

### `test-image.png`
- **Reason**: Test image file used during development
- **Status**: Legacy - no longer needed
- **Action**: Can be deleted

## Cleanup Policy

Files in this graveyard are candidates for deletion in a future cleanup PR. They are kept here temporarily to ensure no functionality is broken before final removal.

## Next Steps

1. Verify all functionality works without these files
2. Create a follow-up PR to delete these files permanently
3. Update any documentation that references these files
