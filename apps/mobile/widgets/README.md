# MentalSpace Widgets

This directory contains the configuration and native code for iOS and Android widgets.

## iOS Widgets (WidgetKit)

iOS widgets require native Swift code and WidgetKit. The implementation includes:

### Widget Types

1. **Daily Check-in Widget** (Small/Medium)
   - Shows streak count
   - Quick "Check-in" button
   - Last check-in timestamp

2. **Mood Summary Widget** (Medium/Large)
   - Weekly mood trend chart
   - Average metrics display

3. **Quick Actions Widget** (Small)
   - SOS button
   - Journal entry shortcut

### Setup Instructions

1. Run `npx expo prebuild` to generate native projects
2. Open the iOS project in Xcode
3. Add a Widget Extension target
4. Configure App Groups for data sharing

## Android Widgets (App Widgets)

Android widgets use the App Widget framework:

1. **Check-in Widget** - Home screen widget for quick check-ins
2. **Mood Widget** - Shows current mood and trend

## Quick Actions (3D Touch / Long Press)

Quick Actions are configured in `app.json` and handled in the app.

### iOS Quick Actions
- Check-in Now
- View Plan
- Journal Entry
- SOS

### Android Shortcuts
- Dynamic shortcuts based on user activity
- Static shortcuts for core features

## Configuration

See `app.json` for the quick actions configuration.
