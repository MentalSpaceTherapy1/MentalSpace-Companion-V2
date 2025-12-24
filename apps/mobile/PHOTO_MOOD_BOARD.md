# Photo Mood Board Feature

## Overview

The Photo Mood Board feature allows users to attach photos to their daily check-ins, creating a visual timeline of their mental health journey. Users can view all their photos in a beautiful grid layout with mood indicators and date overlays.

## Files Created

### 1. Services Layer

**`services/photoService.ts`**
- `pickImage()` - Launches image picker from gallery with permission handling
- `takePhoto()` - Launches camera to capture a new photo
- `savePhotoLocally(uri, id)` - Saves photos to app's local storage
- `deletePhoto(id)` - Removes a photo from local storage
- `getPhotoPath(id)` - Retrieves the full path to a stored photo
- `hasPhoto(id)` - Checks if a photo exists for a check-in
- `getAllPhotoIds()` - Gets all stored photo IDs
- `getPhotoSize(id)` - Returns photo file size
- `clearAllPhotos()` - Clears all photos (admin function)

### 2. Store Updates

**`stores/checkinStore.ts`**
- Added `photoUri` to draft state
- Updated `createCheckin` to accept and save `photoUri`
- Photo is saved locally before creating the check-in record

### 3. Shared Types

**`packages/shared/src/types/index.ts`**
- Added `photoUri?: string` to `Checkin` interface

### 4. Check-in Flow

**`app/(tabs)/checkin.tsx`**
- Added new "photo" step to the check-in wizard
- PhotoStep component with camera and gallery buttons
- Photo preview with remove option
- Photos are saved locally with ID format: `checkin-YYYY-MM-DD`

### 5. Mood Board Screens

**`app/(mood-board)/_layout.tsx`**
- Stack navigator for mood board screens

**`app/(mood-board)/index.tsx`**
- Gallery view of all check-in photos
- Date range filtering (Week, Month, All Time)
- Empty state with call-to-action
- Opens PhotoViewer on photo tap

### 6. Mood Board Components

**`components/mood-board/PhotoGrid.tsx`**
- 2-column responsive grid layout
- Lazy loading images with loading states
- Date overlay (month + day)
- Mood indicator color bar (green for positive, red for negative)
- Placeholder for missing/error photos

**`components/mood-board/PhotoViewer.tsx`**
- Full-screen photo viewer modal
- Swipe navigation between photos
- Metrics overlay showing:
  - Date
  - Mood score with emoji
  - All 5 metrics with colored progress bars
  - Journal entry preview
- Toggle to show/hide metrics overlay
- Close button

### 7. Navigation Updates

**`app/(tabs)/index.tsx`**
- Added "Mood Board" quick action to home screen

**`app/(tabs)/settings.tsx`**
- Added "Photo Mood Board" section under "Mood Tracking"

### 8. Dependencies

**`package.json`**
- Added `expo-file-system": "~19.0.8"` for local photo storage

## User Flow

1. **Adding a Photo During Check-in:**
   - User completes metrics (mood, stress, sleep, etc.)
   - Optional journal entry
   - NEW: Photo step appears
   - User can:
     - Take a photo with camera
     - Choose from gallery
     - Skip (optional)
   - Preview selected photo
   - Photo is saved locally when check-in is submitted

2. **Viewing Mood Board:**
   - Access from home screen "Mood Board" quick action
   - Access from Settings > Mood Tracking > Photo Mood Board
   - View grid of photos with dates and mood indicators
   - Filter by date range (Week/Month/All)
   - Pull to refresh

3. **Photo Details:**
   - Tap any photo to view full screen
   - See all metrics from that check-in
   - Read journal entry if available
   - Swipe left/right to navigate between photos
   - Toggle metrics overlay on/off

## Permissions

The app handles permissions gracefully:
- **Camera Permission**: Required to take photos
- **Photo Library Permission**: Required to select from gallery
- User-friendly alerts with instructions if permissions denied

## Storage Strategy

- Photos stored locally using `expo-file-system`
- Directory: `{FileSystem.documentDirectory}mood-photos/`
- Filename format: `{checkin-id}.{extension}`
- Supports: JPG, JPEG, PNG, HEIC formats
- Efficient file lookup with extension detection

## UI/UX Features

### Check-in Photo Step
- Large, friendly buttons for camera and gallery
- Dashed border for visual clarity
- Photo preview with remove button
- Optional hint text
- Maintains check-in flow consistency

### Photo Grid
- 2-column responsive layout
- Automatic grid spacing and sizing
- Date badge (month + day number)
- Bottom mood indicator bar (color-coded)
- Loading states for images
- Error handling with placeholder

### Photo Viewer
- Full-screen immersive view
- Dark overlay for better photo visibility
- Swipeable navigation arrows
- Collapsible metrics panel
- Clean, minimal controls
- Smooth animations

### Design System Alignment
- Uses MentalSpace brand colors
- Consistent spacing and typography
- Follows existing shadow and border radius patterns
- Responsive to different screen sizes

## Performance Considerations

1. **Lazy Loading**: Images load as needed in grid
2. **Local Storage**: Fast access, no network delays
3. **Optimized Images**: 80% quality compression on capture
4. **Efficient Caching**: FileSystem handles caching automatically

## Accessibility

- Proper labeling for screen readers
- High contrast date overlays
- Large touch targets (44x44 minimum)
- Clear visual feedback on interactions

## Error Handling

- Permission denial: User-friendly alerts
- Image loading errors: Placeholder shown
- Missing photos: Graceful degradation
- File system errors: Console logging with fallbacks

## Future Enhancements

Potential improvements for future iterations:
- Cloud backup of photos
- Share mood board summaries
- Photo captions/tags
- Monthly mood collages
- Export mood board as PDF
- Photo filters or stickers
- Remind users to add photos
- Photo analytics (colors, patterns)

## Testing Checklist

- [ ] Take photo with camera
- [ ] Select photo from gallery
- [ ] Skip photo step
- [ ] View mood board with photos
- [ ] Filter by date range
- [ ] Open photo viewer
- [ ] Navigate between photos
- [ ] Toggle metrics overlay
- [ ] Check permission flows
- [ ] Test with no photos
- [ ] Test offline behavior
- [ ] Test on iOS and Android

## Installation

Run the following to install the new dependency:

```bash
cd apps/mobile
npm install
```

Then restart the Expo development server:

```bash
npm run dev
```

## Notes

- Photos are stored locally only (not synced to Firebase in this version)
- Photo URIs are stored in check-in records for reference
- Users can still complete check-ins without adding photos
- The photo step is completely optional
- All existing check-ins work without modification
