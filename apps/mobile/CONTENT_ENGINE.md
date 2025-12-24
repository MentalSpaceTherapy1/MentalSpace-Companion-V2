# Content Personalization Engine

## Overview

The Content Personalization Engine is a sophisticated recommendation system that delivers tailored mental health content to users based on their current emotional state, time of day, weekly focus, and viewing history.

## Architecture

### Core Components

1. **Content Library** (`data/contentLibrary.ts`)
   - 20+ curated content pieces
   - Articles (10+): In-depth guides on stress, anxiety, sleep, mindfulness, work-life balance, etc.
   - Audio Guides (5+): Breathing exercises, meditations, body scans
   - Video Guides (5+): Movement practices, grounding exercises, yoga flows

2. **Recommendation Algorithm** (`utils/contentRecommendation.ts`)
   - Multi-factor scoring system
   - Time-of-day optimization
   - User state analysis
   - Freshness and variety balancing

3. **Content Store** (`stores/contentStore.ts`)
   - Zustand state management
   - Persistent view history
   - Favorites management
   - Progress tracking

4. **UI Components**
   - `ArticleReader`: Full-featured markdown reader with progress tracking
   - `ContentCard`: Reusable content display component
   - Audio/Video player interfaces (placeholders for future implementation)

## Content Library

### Content Structure

Each content item includes:
```typescript
{
  id: string;
  title: string;
  type: 'article' | 'audio' | 'video';
  duration: number; // in minutes
  category: 'stress' | 'sleep' | 'anxiety' | 'energy' | 'focus' | 'mindfulness' | 'connection' | 'coping';
  tags: string[];
  description: string;
  content?: string; // Markdown for articles
  url?: string; // Media URL
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  intensity?: 'gentle' | 'moderate' | 'energizing';
}
```

### Content Categories

- **Stress**: Techniques for managing acute and chronic stress
- **Sleep**: Sleep hygiene, insomnia management, bedtime routines
- **Anxiety**: Cognitive strategies for calming anxious thoughts
- **Energy**: Natural energy boosters and fatigue management
- **Focus**: Deep work strategies and concentration techniques
- **Mindfulness**: Meditation practices and present-moment awareness
- **Connection**: Relationship building and social support
- **Coping**: Resilience building and adaptive coping strategies

## Recommendation Algorithm

### Scoring Factors

The algorithm uses multiple weighted factors to score content:

1. **Time of Day Match (0-15 points)**
   - Perfect match: +15 points
   - "Anytime" content: +8 points
   - Mismatch: 0 points

2. **Weekly Focus Alignment (0-25 points)**
   - Matches user's weekly focus area: +25 points

3. **Current Need Based on Check-in (0-30 points)**
   - High stress (≥8): Prioritize stress content
   - High anxiety (≥8): Prioritize anxiety content
   - Poor sleep (≤3): Prioritize sleep content
   - Low energy/focus (≤5): Prioritize corresponding content

4. **Time-Specific Recommendations (0-20 points)**
   - Morning: Energizing content for low energy
   - Afternoon: Stress management and focus
   - Evening: Calming and sleep preparation

5. **Freshness Bonus (0-20 points)**
   - Never viewed: +20 points
   - Favorited: +15 points
   - Recently viewed (last 5): -15 points
   - Viewed (last 15): -5 points

6. **Duration Appropriateness (0-10 points)**
   - Morning: Quick content (≤10 min)
   - Afternoon: Medium content (≤15 min)
   - Evening: Deep content (≥10 min)

7. **Content Type Variety (0-5 points)**
   - Avoids repetition of same type
   - Encourages diverse consumption

### Recommendation Types

1. **For You Today**: Top 3 personalized recommendations
2. **Category Browse**: Filtered by specific mental health category
3. **Quick Relief**: 5 minutes or less
4. **Evening Wind-Down**: Calming evening content
5. **Morning Energizers**: Energizing morning content
6. **Similar Content**: Based on current item

## User Features

### Viewing History
- Automatic tracking of viewed content
- Completion status
- Timestamp of viewing
- Influences future recommendations

### Favorites
- One-tap favoriting
- Quick access to preferred content
- Slight boost in recommendation scoring

### Progress Tracking
- Article reading progress (scroll-based)
- Percentage completion
- Auto-mark as complete at 90%+
- Resume where you left off

### Article Reader Features
- Clean, readable typography
- Markdown rendering (headings, lists, bold text)
- Scroll progress bar
- Reading progress percentage
- Favorite while reading
- Smooth scrolling experience

## Integration Points

### Check-in Store Integration
```typescript
const userState: UserState = {
  recentCheckin: checkinStore.todayCheckin,
  viewHistory: contentStore.viewHistory,
  favorites: contentStore.favorites,
  weeklyFocus: weeklyFocusStore.currentFocus, // Future integration
};
```

### Recommended API Usage

```typescript
// Get personalized recommendations
const recommendations = useContentStore.getState().getRecommendations(6);

// Get "For You Today" section
const forYou = useContentStore.getState().getForYouToday();

// Mark content as viewed
useContentStore.getState().markAsViewed(contentId, completed);

// Update reading progress
useContentStore.getState().updateProgress(contentId, percentage);

// Toggle favorite
useContentStore.getState().toggleFavorite(contentId);
```

## UI Patterns

### Content Discovery Flow

1. **Browse Screen** (`app/(content)/index.tsx`)
   - "For You Today" hero section with top 3 recommendations
   - Category filter chips
   - Grid view of all content
   - "Why this" badges on recommended items

2. **Content Viewing**
   - Articles: Full-screen reader with progress tracking
   - Audio: Player interface with controls (placeholder)
   - Video: Player interface (placeholder)

3. **Content Card Design**
   - Type icon with category color
   - Category badge
   - Duration indicator
   - Title and description
   - Favorite button
   - "Why this" reason badge for recommendations

### Visual Design

- **Category Colors**: Each category has a unique color for quick recognition
- **Type Icons**: Visual indicators for article, audio, and video content
- **Progress Indicators**: Reading progress bar and completion percentage
- **Accessibility**: High contrast, readable typography, touch targets

## Data Persistence

Uses Zustand with AsyncStorage persistence:

```typescript
{
  viewHistory: ViewHistoryItem[];
  favorites: string[];
  readingProgress: Record<string, number>;
}
```

## Future Enhancements

### Planned Features
1. **Audio Playback Integration**: Expo AV or react-native-track-player
2. **Video Playback**: Expo Video or react-native-video
3. **Download for Offline**: Save content for offline access
4. **Notes and Highlights**: Annotate articles
5. **Sharing**: Share content with contacts
6. **Content Collections**: Curated playlists
7. **Advanced Filtering**: Multiple filters, search
8. **AI-Powered Insights**: Content effectiveness tracking
9. **Weekly Focus Integration**: Deeper alignment with user goals
10. **Push Notifications**: Time-based content suggestions

### Analytics Opportunities
- Track which content types are most effective
- Identify best times for content consumption
- Measure engagement and completion rates
- A/B test recommendation algorithms
- Content gap analysis

## Performance Considerations

### Optimization Strategies
- Content library is static and imported once
- View history limited to relevant entries
- Recommendation calculation cached when possible
- Lazy loading for content viewers
- Efficient markdown rendering

### Scalability
- Current: 20+ static content items
- Can scale to 100s of items with minimal performance impact
- Recommendation algorithm complexity: O(n) where n = content items
- View history trimming to prevent unbounded growth

## Content Creation Guidelines

### Adding New Content

1. **Articles**
   - Use clear markdown formatting
   - Include practical, actionable advice
   - 5-10 minute read time ideal
   - Break up with headings and lists
   - Include "why this works" explanations

2. **Audio Guides**
   - 5-20 minute duration
   - Clear, calming narration
   - Include pauses for practice
   - Background music optional
   - Provide timestamps for sections

3. **Video Guides**
   - 5-15 minute duration
   - Clear demonstration
   - Beginner-friendly
   - Minimal equipment needed
   - Closed captions essential

### Content Quality Standards
- Evidence-based practices
- Trauma-informed language
- Inclusive and accessible
- Professionally reviewed
- Culturally sensitive
- Clear disclaimers when appropriate

## Testing

### Manual Testing Checklist
- [ ] View different content types
- [ ] Test favorite functionality
- [ ] Verify progress tracking
- [ ] Check recommendations after different check-ins
- [ ] Test at different times of day
- [ ] Verify persistence across app restarts
- [ ] Test article reader markdown rendering
- [ ] Verify scroll progress tracking
- [ ] Test category filtering
- [ ] Check "Why this" explanations

### Recommended Test Scenarios
1. New user (no history)
2. User with high stress check-in
3. User viewing content in the morning vs. evening
4. User with extensive view history
5. User with specific weekly focus

## Technical Dependencies

- `zustand`: State management
- `@react-native-async-storage/async-storage`: Persistence
- `expo-router`: Navigation
- `@expo/vector-icons`: Icons
- React Native core components

## Files Structure

```
apps/mobile/
├── data/
│   └── contentLibrary.ts          # 20+ content items
├── utils/
│   └── contentRecommendation.ts   # Recommendation algorithm
├── stores/
│   └── contentStore.ts            # Zustand store
├── components/
│   └── content/
│       ├── ArticleReader.tsx      # Markdown reader
│       └── ContentCard.tsx        # Reusable card component
└── app/
    └── (content)/
        ├── _layout.tsx            # Stack navigation
        ├── index.tsx              # Browse screen
        ├── article.tsx            # Article viewer
        ├── audio.tsx              # Audio player (placeholder)
        └── video.tsx              # Video player (placeholder)
```

## Usage Example

```typescript
// In your main tabs or home screen
import { router } from 'expo-router';

function HomeScreen() {
  return (
    <Button
      title="Browse Content"
      onPress={() => router.push('/(content)')}
    />
  );
}

// Getting recommendations
const ContentWidget = () => {
  const recommendations = useContentStore(state => state.getForYouToday());

  return (
    <View>
      {recommendations.map(rec => (
        <ContentCard
          key={rec.item.id}
          content={rec.item}
          reason={rec.reason}
          onPress={(item) => {
            // Navigate based on type
            router.push({
              pathname: `/(content)/${item.type}`,
              params: { id: item.id }
            });
          }}
        />
      ))}
    </View>
  );
};
```

## Contributing

When adding new content:
1. Follow the content structure defined in `contentLibrary.ts`
2. Ensure proper categorization and tagging
3. Set appropriate time of day and intensity
4. Test recommendations with the new content
5. Update this documentation if adding new features

## License & Attribution

All content should be original or properly licensed. Include attribution for:
- Techniques adapted from research
- Meditation scripts inspired by existing practices
- Any third-party audio/video assets

---

**Built with care for mental health support** 💙
