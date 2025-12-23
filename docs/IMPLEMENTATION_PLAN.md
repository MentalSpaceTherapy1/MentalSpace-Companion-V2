# MentalSpace Companion - Implementation Plan

## Executive Summary

**Current Status:** ~70% of PRD implemented
**Remaining Work:** 15 features across 3 priority tiers
**Estimated Effort:** 4-6 weeks for HIGH priority, 8-10 weeks for all

---

## Phase 1: HIGH PRIORITY (Weeks 1-4)

### 1.1 Safety Plan Builder (Week 1)
**Value:** Critical safety feature, required for crisis support completeness
**Complexity:** Medium
**Dependencies:** None (builds on existing SOS infrastructure)

#### Tasks:
```
1.1.1 Create Safety Plan Store
      - File: stores/safetyPlanStore.ts
      - Data model: warning signs, coping strategies, contacts, safe places, reasons
      - Persist to AsyncStorage + Firebase sync

1.1.2 Create Safety Plan Screen
      - File: app/(safety-plan)/index.tsx
      - Multi-section form with add/edit/remove capabilities
      - Editable text fields with character limits

1.1.3 Create Safety Plan Components
      - File: components/safety/SafetyPlanSection.tsx
      - File: components/safety/ContactCard.tsx
      - File: components/safety/QuickDialButton.tsx

1.1.4 Integrate with SOS Flow
      - Add "My Safety Plan" button to SOS screen
      - Quick-dial contacts from safety plan
      - Show "Reasons to Live" in crisis moments

1.1.5 Add to Settings
      - Link in Settings > Safety section
      - Export safety plan option
```

#### Deliverables:
- [ ] Safety plan data model and store
- [ ] Full safety plan editor screen
- [ ] Integration with SOS flow
- [ ] Offline support for safety plan

---

### 1.2 Smart Journaling / Voice Notes (Week 1-2)
**Value:** High engagement feature, reduces friction for journaling
**Complexity:** High (requires expo-av, speech-to-text)
**Dependencies:** None

#### Tasks:
```
1.2.1 Install Dependencies
      - expo-av for audio recording
      - expo-speech (or cloud API) for transcription

1.2.2 Create Voice Recording Service
      - File: services/voiceRecording.ts
      - Start/stop recording
      - Audio level metering
      - Save to local storage

1.2.3 Create Voice Journal Component
      - File: components/journal/VoiceRecorder.tsx
      - Hold-to-record button
      - Waveform visualization
      - Playback controls

1.2.4 Add AI-Prompted Reflection
      - File: utils/journalPrompts.ts
      - Context-aware prompts based on check-in data
      - Low energy → "What drained you today?"
      - High anxiety → "What's creating uncertainty?"

1.2.5 Create Gratitude Capture Component
      - File: components/journal/GratitudeCapture.tsx
      - 3 gratitude fields
      - Daily reminder option

1.2.6 Integrate Voice Notes with Check-in
      - Add voice option to journal step in check-in flow
      - Store transcription + audio file reference
      - Display in journal history

1.2.7 Cloud Transcription (Optional)
      - Firebase Function for audio transcription
      - Fallback to on-device if offline
```

#### Deliverables:
- [ ] Voice recording with waveform UI
- [ ] Speech-to-text transcription
- [ ] AI-prompted contextual journal prompts
- [ ] Gratitude capture feature
- [ ] Journal history with voice playback

---

### 1.3 Insights Dashboard (Week 2-3)
**Value:** Differentiator feature, helps users understand patterns
**Complexity:** Medium-High
**Dependencies:** Check-in history data

#### Tasks:
```
1.3.1 Create Insights Store
      - File: stores/insightsStore.ts
      - Computed metrics: averages, trends, correlations
      - "What works" / "What doesn't work" tracking

1.3.2 Create Insights Screen
      - File: app/(insights)/index.tsx
      - Tab navigation: Weekly / Monthly / All Time
      - Pull-to-refresh

1.3.3 Create Chart Components
      - File: components/charts/MoodTrendChart.tsx
      - File: components/charts/MetricComparisonChart.tsx
      - File: components/charts/CompletionChart.tsx
      - File: components/charts/CorrelationCard.tsx

1.3.4 Implement Pattern Detection
      - File: utils/patternDetection.ts
      - Day-of-week patterns
      - Metric correlations (sleep → mood)
      - Action effectiveness scoring

1.3.5 Create Insight Cards
      - File: components/insights/InsightCard.tsx
      - "Your mood tends to dip on Mondays"
      - "Sleep below 6 hours correlates with higher stress"

1.3.6 Add "What Works" Section
      - Track action completion + next-day mood
      - Calculate effectiveness percentage
      - Display top 5 effective actions

1.3.7 Export Report Feature
      - Generate PDF summary
      - Email to self or therapist
      - Privacy-safe version option
```

#### Deliverables:
- [ ] Multi-timeframe insights view
- [ ] Trend charts for all metrics
- [ ] Pattern detection with AI insights
- [ ] "What works for you" analysis
- [ ] Exportable PDF report

---

### 1.4 Sleep Support Suite (Week 3-4)
**Value:** Sleep is #1 requested feature for mental health apps
**Complexity:** Medium
**Dependencies:** expo-av for sounds

#### Tasks:
```
1.4.1 Create Sleep Store
      - File: stores/sleepStore.ts
      - Bedtime routine configuration
      - Sleep sounds preferences
      - Sleep log history

1.4.2 Create Bedtime Routine Builder
      - File: app/(sleep)/routine.tsx
      - Customizable routine steps
      - Time scheduling
      - Reminder notifications

1.4.3 Create Sleep Sounds Player
      - File: components/sleep/SleepSoundsPlayer.tsx
      - Built-in sounds: rain, ocean, forest, white noise
      - Sleep timer: 15/30/60 min / until morning
      - Volume control, fade out

1.4.4 Generate/Bundle Sleep Sounds
      - File: scripts/generate-sleep-sounds.js
      - Or bundle royalty-free ambient sounds
      - Optimize for file size

1.4.5 Create Morning Check-in Widget
      - File: components/sleep/MorningQuickCheck.tsx
      - "How'd you sleep?" quick capture
      - Wake time picker
      - Integrates with full check-in

1.4.6 Add Sleep Tab/Section
      - Add to home screen or as dedicated section
      - Tonight's routine preview
      - Sleep trends mini-chart

1.4.7 Bedtime Notifications
      - "Wind-down reminder" 30 min before
      - "Bedtime" notification
      - Respect Do Not Disturb
```

#### Deliverables:
- [ ] Bedtime routine builder with scheduling
- [ ] Ambient sleep sounds with timer
- [ ] Morning quick sleep check
- [ ] Sleep-specific insights
- [ ] Bedtime reminder notifications

---

### 1.5 Widgets & Quick Actions (Week 4)
**Value:** Surface functionality without opening app, drives engagement
**Complexity:** High (requires native modules)
**Dependencies:** Completed check-in, streak systems

#### Tasks:
```
1.5.1 Research Widget Options
      - expo-widgets (if available)
      - react-native-widget-extension (iOS)
      - React Native Android Widget

1.5.2 Create iOS Small Widget
      - Yesterday's mood emoji
      - "Check in" button
      - Streak count

1.5.3 Create iOS Medium Widget
      - Streak + yesterday metrics
      - "Start Check-in" button
      - Weekly focus progress

1.5.4 Create Android Widget
      - Similar to iOS medium
      - Home screen + lock screen variants

1.5.5 Implement Quick Actions
      - File: native module or expo config
      - 3D Touch / Long Press menu:
        - "Start Check-in"
        - "SOS"
        - "Today's Plan"

1.5.6 Widget Data Bridge
      - Share data between app and widget
      - iOS: App Groups
      - Android: SharedPreferences
```

#### Deliverables:
- [ ] iOS Home Screen widgets (small + medium)
- [ ] Android Home Screen widget
- [ ] Quick Actions on app icon
- [ ] Real-time data sync to widgets

---

## Phase 2: MEDIUM PRIORITY (Weeks 5-7)

### 2.1 Firebase Analytics & Crashlytics (Week 5)
**Value:** Essential for production monitoring
**Complexity:** Low
**Dependencies:** Firebase setup (already done)

#### Tasks:
```
2.1.1 Install Packages
      - @react-native-firebase/analytics
      - @react-native-firebase/crashlytics
      - @react-native-firebase/perf

2.1.2 Configure Analytics
      - File: services/analytics.ts
      - Screen tracking
      - Event tracking (check-in, action complete, etc.)
      - User properties

2.1.3 Define Key Events
      - check_in_completed
      - action_completed
      - sos_triggered
      - therapist_booked
      - streak_milestone
      - weekly_focus_set

2.1.4 Configure Crashlytics
      - Error boundary component
      - Non-fatal error logging
      - User context for crashes

2.1.5 Performance Monitoring
      - API call tracing
      - Screen render times
      - Custom traces for key flows
```

#### Deliverables:
- [ ] Event tracking for all key actions
- [ ] Crash reporting with context
- [ ] Performance monitoring
- [ ] Analytics dashboard setup

---

### 2.2 Apple Health / Google Fit Integration (Week 5-6)
**Value:** Auto-import sleep/activity data, reduces manual entry
**Complexity:** Medium-High
**Dependencies:** None

#### Tasks:
```
2.2.1 Install Health Packages
      - expo-health-connect (or react-native-health)
      - Platform-specific setup

2.2.2 Create Health Service
      - File: services/healthIntegration.ts
      - Request permissions
      - Read sleep data
      - Read activity data

2.2.3 Permission Flow
      - Opt-in from Settings > Integrations
      - Clear explanation of what data is accessed
      - Granular permissions

2.2.4 Auto-Import Sleep Data
      - Pre-fill sleep quality in check-in
      - Show source indicator
      - Allow manual override

2.2.5 Correlate with Mood Data
      - Add to insights: "Steps vs. Mood"
      - Sleep duration vs. next-day metrics
```

#### Deliverables:
- [ ] Apple Health connection (sleep, steps)
- [ ] Google Fit connection (sleep, activity)
- [ ] Auto-import into check-ins
- [ ] Health data in insights

---

### 2.3 Content Personalization Engine (Week 6)
**Value:** Right content at right time increases engagement
**Complexity:** Medium
**Dependencies:** Check-in data, user preferences

#### Tasks:
```
2.3.1 Create Content Library
      - File: data/contentLibrary.ts
      - Articles, audio guides, videos
      - Categorized by topic, mood, time-of-day

2.3.2 Create Content Store
      - File: stores/contentStore.ts
      - Personalization algorithm
      - View history, favorites

2.3.3 Build Recommendation Engine
      - File: utils/contentRecommendation.ts
      - Based on: recent check-ins, time of day, weekly focus
      - "Why this" explanations

2.3.4 Create Content Feed Screen
      - File: app/(content)/index.tsx
      - "For You Today" section
      - Browse by category
      - Search

2.3.5 Create Content Components
      - File: components/content/ArticleCard.tsx
      - File: components/content/AudioPlayer.tsx
      - File: components/content/VideoPlayer.tsx

2.3.6 In-App Content Reader
      - Markdown/HTML article renderer
      - Reading progress tracking
      - Save for later
```

#### Deliverables:
- [ ] Content library with 20+ pieces
- [ ] Personalized "For You" feed
- [ ] In-app article reader
- [ ] Audio/video player
- [ ] "Why this" transparency

---

### 2.4 Predictive & Proactive Support (Week 6-7)
**Value:** Help before crisis, not just after
**Complexity:** High
**Dependencies:** Sufficient check-in history, insights

#### Tasks:
```
2.4.1 Pattern Prediction Service
      - File: services/patternPrediction.ts
      - Day-of-week predictions
      - Seasonal patterns
      - Trigger date awareness

2.4.2 Create Trigger Date Feature
      - File: app/(settings)/trigger-dates.tsx
      - Add/edit difficult dates
      - Anniversary reminders
      - Proactive support

2.4.3 Implement "Bad Day" Mode
      - File: utils/badDayMode.ts
      - Triggers: low mood, SOS use, missed actions
      - Lighter plans, gentler tone
      - Extra support prompts

2.4.4 Proactive Notifications
      - "Tomorrow tends to be harder for you"
      - "Difficult date approaching"
      - Preventive plan suggestions

2.4.5 Weather Correlation (Optional)
      - Fetch local weather
      - Correlate with mood history
      - "Rainy day ahead" support
```

#### Deliverables:
- [ ] Day-of-week pattern predictions
- [ ] Trigger date management
- [ ] Automatic "Bad Day" mode
- [ ] Proactive support notifications

---

### 2.5 Post-Session Reflection (Week 7)
**Value:** Closes therapy loop, tracks progress with professional care
**Complexity:** Low
**Dependencies:** Telehealth booking system

#### Tasks:
```
2.5.1 Create Session Reflection Screen
      - File: app/(telehealth)/reflection.tsx
      - How was session? (rating)
      - Key takeaways
      - Homework items

2.5.2 Session Reminder with Reflection
      - After appointment time, prompt reflection
      - Notification: "How was your session?"

2.5.3 Homework Tracking
      - Add therapist homework as special actions
      - Track separately from daily plan
      - Report in handoff summary

2.5.4 Session History
      - List of past sessions with reflections
      - Progress over time
      - Shareable with therapist
```

#### Deliverables:
- [ ] Post-session reflection flow
- [ ] Homework tracking as actions
- [ ] Session history view

---

## Phase 3: LOWER PRIORITY (Weeks 8-10)

### 3.1 Siri Shortcuts / Google Assistant (Week 8)
**Value:** Voice-first interaction
**Complexity:** Medium
**Dependencies:** Core app features complete

#### Tasks:
```
- expo-siri-shortcuts or native module
- "Start check-in" shortcut
- "Open SOS" shortcut
- "How's my mood this week?" query
- Google Assistant actions (Android)
```

---

### 3.2 Calendar Integration (Week 8)
**Value:** Context-aware plans based on schedule
**Complexity:** Medium
**Dependencies:** None

#### Tasks:
```
- expo-calendar for read access
- Detect busy days
- Offer lighter plans
- "Heads up" notifications
```

---

### 3.3 Photo Mood Board (Week 9)
**Value:** Visual journaling option
**Complexity:** Low
**Dependencies:** Journal system

#### Tasks:
```
- expo-image-picker integration
- Attach photo to check-in
- Photo gallery view
- "What does today look like?"
```

---

### 3.4 Full Accessibility Audit (Week 9)
**Value:** Inclusivity, legal compliance
**Complexity:** Medium
**Dependencies:** All UI complete

#### Tasks:
```
- VoiceOver/TalkBack testing
- Color contrast audit
- Dynamic Type support
- Reduce motion support
- Accessibility settings screen
```

---

### 3.5 CI/CD Pipeline (Week 10)
**Value:** Automated builds, faster releases
**Complexity:** Medium
**Dependencies:** None

#### Tasks:
```
- GitHub Actions for PR checks
- EAS Build integration
- Automated testing
- Preview deployments
- Production release workflow
```

---

## Implementation Order Summary

```
WEEK 1:
├── 1.1 Safety Plan Builder
└── 1.2 Voice Recording (start)

WEEK 2:
├── 1.2 Voice Recording (complete)
└── 1.3 Insights Dashboard (start)

WEEK 3:
├── 1.3 Insights Dashboard (complete)
└── 1.4 Sleep Support Suite (start)

WEEK 4:
├── 1.4 Sleep Support Suite (complete)
└── 1.5 Widgets & Quick Actions

WEEK 5:
├── 2.1 Firebase Analytics
└── 2.2 Health Integration (start)

WEEK 6:
├── 2.2 Health Integration (complete)
├── 2.3 Content Personalization
└── 2.4 Predictive Support (start)

WEEK 7:
├── 2.4 Predictive Support (complete)
└── 2.5 Post-Session Reflection

WEEK 8:
├── 3.1 Siri/Assistant Shortcuts
└── 3.2 Calendar Integration

WEEK 9:
├── 3.3 Photo Mood Board
└── 3.4 Accessibility Audit

WEEK 10:
└── 3.5 CI/CD Pipeline
```

---

## Success Metrics

### Phase 1 Completion Criteria:
- [ ] Safety plan accessible from SOS and settings
- [ ] Voice journal working with transcription
- [ ] Insights show 30-day trends with AI observations
- [ ] Sleep sounds playing with timer
- [ ] At least one widget working (iOS or Android)

### Phase 2 Completion Criteria:
- [ ] Analytics events firing in Firebase console
- [ ] Health data importing automatically
- [ ] Content recommendations showing in app
- [ ] Bad Day mode triggering appropriately
- [ ] Post-session reflections saving

### Phase 3 Completion Criteria:
- [ ] Siri shortcuts functional
- [ ] Calendar integration detecting busy days
- [ ] Photos attachable to check-ins
- [ ] WCAG 2.1 AA compliance
- [ ] Automated builds on PR merge

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| expo-av issues | Fallback to text-only journaling |
| Widget complexity | Start with iOS only, add Android later |
| Speech-to-text accuracy | Keep audio file as backup |
| Health permissions denied | Graceful fallback to manual entry |
| Content creation time | Start with 10 pieces, expand later |

---

## Next Steps

1. **Immediate:** Start with Safety Plan Builder (no dependencies)
2. **Parallel:** Install expo-av and test voice recording
3. **Design:** Finalize Insights Dashboard layouts
4. **Research:** Evaluate widget implementation options

Ready to begin implementation.
