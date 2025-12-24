# Content Personalization Engine - Integration Guide

## Quick Start

The Content Personalization Engine is now fully built and ready to integrate into your MentalSpace app. Follow these steps to add it to your navigation.

## Adding to Tab Navigation

### Option 1: Add as a Tab

Edit your main tabs layout file (typically `app/(tabs)/_layout.tsx`):

```typescript
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      {/* Existing tabs */}
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="checkin" options={{ title: 'Check-in' }} />

      {/* Add Content Library Tab */}
      <Tabs.Screen
        name="content"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Navigate to content library
            e.preventDefault();
            router.push('/(content)');
          },
        }}
      />

      {/* More existing tabs */}
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
```

### Option 2: Add to Home Screen

Add a content widget to your home screen (`app/(tabs)/index.tsx`):

```typescript
import { useContentStore } from '../stores/contentStore';
import { ContentCard } from '../components/content/ContentCard';
import { router } from 'expo-router';

export default function HomeScreen() {
  const getForYouToday = useContentStore(state => state.getForYouToday);
  const recommendations = getForYouToday();

  const handleContentPress = (item: ContentItem) => {
    if (item.type === 'article') {
      router.push({
        pathname: '/(content)/article',
        params: { id: item.id },
      });
    } else if (item.type === 'audio') {
      router.push({
        pathname: '/(content)/audio',
        params: { id: item.id },
      });
    } else if (item.type === 'video') {
      router.push({
        pathname: '/(content)/video',
        params: { id: item.id },
      });
    }
  };

  return (
    <ScrollView>
      {/* Existing home screen content */}

      {/* Content Recommendations Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <Pressable onPress={() => router.push('/(content)')}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recommendations.map((rec) => (
            <ContentCard
              key={rec.item.id}
              content={rec.item}
              reason={rec.reason}
              onPress={handleContentPress}
              featured
              style={{ marginRight: 12 }}
            />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}
```

### Option 3: Add to Settings or Menu

Add a link in your settings/menu screen:

```typescript
export default function SettingsScreen() {
  return (
    <ScrollView>
      {/* Existing settings */}

      <Pressable
        onPress={() => router.push('/(content)')}
        style={styles.menuItem}
      >
        <Ionicons name="library" size={24} color={colors.primary} />
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>Content Library</Text>
          <Text style={styles.menuItemDescription}>
            Articles, audio guides, and videos
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </Pressable>
    </ScrollView>
  );
}
```

## Contextual Content Suggestions

### After Check-in

Show relevant content based on the check-in results:

```typescript
// In your check-in completion screen
import { useContentStore } from '../stores/contentStore';
import { useCheckinStore } from '../stores/checkinStore';

export default function CheckinCompleteScreen() {
  const todayCheckin = useCheckinStore(state => state.todayCheckin);
  const getRecommendations = useContentStore(state => state.getRecommendations);

  const recommendations = getRecommendations(3);

  return (
    <View>
      <Text>Check-in Complete!</Text>

      {/* Show relevant content */}
      <View style={styles.suggestionsSection}>
        <Text style={styles.suggestionsTitle}>
          Based on your check-in, you might find these helpful:
        </Text>

        {recommendations.map((rec) => (
          <ContentCard
            key={rec.item.id}
            content={rec.item}
            reason={rec.reason}
            onPress={handleContentPress}
          />
        ))}
      </View>
    </View>
  );
}
```

### In Weekly Focus Flow

Suggest content aligned with weekly focus:

```typescript
// In weekly focus selection screen
export default function WeeklyFocusScreen() {
  const selectedFocus = 'reduce-stress'; // User's selection

  const relevantContent = contentLibrary.filter(
    item => item.category === 'stress'
  ).slice(0, 3);

  return (
    <View>
      <Text>Your Weekly Focus: Reduce Stress</Text>

      <Text>Recommended Resources:</Text>
      {relevantContent.map(item => (
        <ContentCard
          key={item.id}
          content={item}
          onPress={handleContentPress}
        />
      ))}
    </View>
  );
}
```

### Smart Notifications

Create time-based content notifications:

```typescript
// In your notification service
import { getCurrentTimeOfDay } from '../utils/contentRecommendation';
import { useContentStore } from '../stores/contentStore';
import { useCheckinStore } from '../stores/checkinStore';

async function scheduleContentNotifications() {
  const timeOfDay = getCurrentTimeOfDay();
  const todayCheckin = useCheckinStore.getState().todayCheckin;
  const recommendations = useContentStore.getState().getRecommendations(1);

  if (recommendations.length > 0 && todayCheckin) {
    const rec = recommendations[0];

    // Schedule notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: rec.reason,
        body: rec.item.title,
        data: { contentId: rec.item.id, type: rec.item.type },
      },
      trigger: {
        // Customize based on your notification strategy
        seconds: 3600, // 1 hour from now
      },
    });
  }
}
```

## Weekly Focus Integration

When you build your Weekly Focus feature, integrate it with content recommendations:

```typescript
// In your weekly focus store
interface WeeklyFocusState {
  currentFocus: string;
  // ... other state
}

// In content recommendations
import { useWeeklyFocusStore } from '../stores/weeklyFocusStore';

export const getRecommendationsWithFocus = (): RecommendedContent[] => {
  const weeklyFocus = useWeeklyFocusStore.getState().currentFocus;
  const checkin = useCheckinStore.getState().todayCheckin;
  const contentStore = useContentStore.getState();

  return contentStore.getRecommendations({
    recentCheckin: checkin,
    weeklyFocus: weeklyFocus,
    viewHistory: contentStore.viewHistory.map(v => v.contentId),
    favorites: contentStore.favorites,
  });
};
```

## Analytics Integration

Track content engagement for insights:

```typescript
// When user views content
analytics.track('content_viewed', {
  content_id: content.id,
  content_type: content.type,
  content_category: content.category,
  source: 'recommendation', // or 'browse', 'search', etc.
  recommendation_reason: reason,
});

// When user completes content
analytics.track('content_completed', {
  content_id: content.id,
  duration_minutes: content.duration,
  completion_time: Date.now() - startTime,
});

// When user favorites content
analytics.track('content_favorited', {
  content_id: content.id,
  content_category: content.category,
});
```

## Testing the Integration

1. **Test Recommendations**
   - Create a check-in with high stress
   - Navigate to content library
   - Verify stress-related content is recommended
   - Check "Why this" explanations

2. **Test Time-Based Recommendations**
   - Test in morning (should show energizing content)
   - Test in evening (should show calming content)

3. **Test View History**
   - View several pieces of content
   - Verify they appear in history
   - Check that recommendations avoid recently viewed

4. **Test Favorites**
   - Favorite some content
   - Verify favorites persist across app restarts
   - Check favorites get slight boost in recommendations

5. **Test Progress Tracking**
   - Start reading an article
   - Close it partway through
   - Verify progress is saved
   - Re-open and verify it resumes

## Customization

### Adjust Recommendation Weights

Edit `utils/contentRecommendation.ts` to adjust scoring:

```typescript
// Example: Increase weight of weekly focus
if (focusCategory && content.category === focusCategory) {
  score += 35; // Increased from 25
  reasons.push('Strongly aligns with your weekly focus');
}
```

### Add Custom Content

Edit `data/contentLibrary.ts`:

```typescript
export const contentLibrary: ContentItem[] = [
  // ... existing content
  {
    id: 'custom-article-1',
    title: 'Your Custom Article',
    type: 'article',
    duration: 7,
    category: 'mindfulness',
    tags: ['custom', 'meditation'],
    description: 'Your custom description',
    timeOfDay: 'anytime',
    intensity: 'gentle',
    content: `# Your Custom Article

Your markdown content here...
    `,
  },
];
```

### Customize UI Colors

Category colors are defined in `stores/contentStore.ts`:

```typescript
export const getCategoryColor = (category: ContentItem['category']): string => {
  const colors = {
    stress: '#8B5CF6',     // Purple
    sleep: '#6366F1',      // Indigo
    anxiety: '#EC4899',    // Pink
    energy: '#F59E0B',     // Amber
    focus: '#10B981',      // Green
    mindfulness: '#14B8A6', // Teal
    connection: '#F97316',  // Orange
    coping: '#8B5CF6',     // Purple
  };
  return colors[category] || '#6B7280';
};
```

## Troubleshooting

### Content Not Showing
- Verify `contentLibrary.ts` exports are correct
- Check that `contentStore.ts` is properly initialized
- Ensure navigation routes are registered

### Recommendations Not Personalized
- Verify check-in data is available in `checkinStore`
- Check that `getCurrentTimeOfDay()` returns correct value
- Review scoring logic in `contentRecommendation.ts`

### Progress Not Persisting
- Verify AsyncStorage permissions
- Check Zustand persist configuration
- Test on physical device (not just simulator)

### Article Reader Issues
- Ensure markdown content is properly formatted
- Check for special characters that need escaping
- Verify scroll event handling

## Performance Tips

1. **Lazy Load Content**: Only load full content when viewing
2. **Cache Recommendations**: Memoize recommendation calculations
3. **Optimize Images**: Use appropriate sizes for thumbnails
4. **Limit History**: Trim view history to last 50 items
5. **Debounce Progress**: Don't update on every scroll event

## Next Steps

1. ✅ Content Library Created (20+ items)
2. ✅ Recommendation Engine Built
3. ✅ UI Components Complete
4. 🔲 Integrate into navigation
5. 🔲 Add to home screen
6. 🔲 Implement audio playback
7. 🔲 Implement video playback
8. 🔲 Add weekly focus integration
9. 🔲 Set up analytics tracking
10. 🔲 Create onboarding tour

## Support

For questions or issues with the Content Personalization Engine:
- Review `CONTENT_ENGINE.md` for detailed documentation
- Check the inline code comments
- Test with different user states and times of day
- Verify integration points with existing stores

---

**Happy coding!** The foundation is solid and ready to enhance your users' mental health journey. 💙
