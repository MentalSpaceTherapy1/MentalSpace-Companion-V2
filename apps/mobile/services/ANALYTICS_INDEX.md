# Analytics Documentation Index

Complete documentation for Firebase Analytics & Crashlytics implementation in MentalSpace Companion.

## 📚 Documentation Files

### 1. Quick Reference (Start Here)
**File**: [`ANALYTICS_QUICK_REFERENCE.md`](./ANALYTICS_QUICK_REFERENCE.md)

Quick copy-paste reference for common analytics tasks.

**Use this when you need to:**
- Track a specific event quickly
- Find the right import statement
- Look up event parameters
- Copy common patterns

**Contents:**
- Import statements
- Common tasks (screen tracking, events, errors)
- Event parameters reference
- User properties
- Testing & debugging

---

### 2. Complete Documentation
**File**: [`ANALYTICS_README.md`](./ANALYTICS_README.md)

Comprehensive documentation covering the entire analytics implementation.

**Use this when you need to:**
- Understand the architecture
- Configure Firebase
- Learn about tracked events
- Set up production monitoring
- Troubleshoot issues

**Contents:**
- Overview & features
- Architecture & integration points
- Complete event catalog
- User properties reference
- Environment support
- Configuration guide
- Best practices
- Troubleshooting

---

### 3. Practical Examples
**File**: [`ANALYTICS_EXAMPLES.md`](./ANALYTICS_EXAMPLES.md)

Real-world code examples for implementing analytics throughout the app.

**Use this when you need to:**
- See how to implement a specific feature
- Learn advanced patterns
- Understand error handling
- Implement performance tracing
- Follow best practices

**Contents:**
- Screen tracking examples
- Event tracking patterns
- User properties management
- Error logging
- Performance tracing
- Advanced patterns
- Common mistakes to avoid

---

### 4. Implementation Summary
**File**: [`ANALYTICS_IMPLEMENTATION_SUMMARY.md`](./ANALYTICS_IMPLEMENTATION_SUMMARY.md)

High-level overview of what was implemented and how it works.

**Use this when you need to:**
- Get a quick overview of the implementation
- Understand what files were changed
- See what events are tracked
- Review success metrics
- Plan next steps

**Contents:**
- What was implemented
- Files created & modified
- Usage examples
- Environment compatibility
- Configuration requirements
- Success metrics
- Privacy & compliance

---

### 5. Source Code
**File**: [`analytics.ts`](./analytics.ts)

The core analytics service implementation.

**Contents:**
- Type definitions
- AnalyticsService class
- Event tracking functions
- Performance tracing
- Error logging
- Parameter sanitization

---

## 🚀 Quick Start

### For New Developers

1. Read **ANALYTICS_QUICK_REFERENCE.md** for common tasks
2. Browse **ANALYTICS_EXAMPLES.md** for implementation patterns
3. Refer to **ANALYTICS_README.md** for detailed documentation

### For Tracking a New Event

1. Open **analytics.ts**
2. Add event type to `AnalyticsEventName`
3. Create parameter interface
4. Add specialized tracking function
5. Test in development mode

### For Debugging

1. Check console for `[Analytics]` logs
2. Verify initialization message appears
3. Use **ANALYTICS_QUICK_REFERENCE.md** debugging section
4. Review **ANALYTICS_README.md** troubleshooting section

---

## 📋 Implementation Checklist

### Current Status ✅

- [x] Core analytics service implemented
- [x] Screen tracking integrated
- [x] Check-in events tracked
- [x] Action completion tracked
- [x] SOS triggers tracked
- [x] Streak milestones tracked
- [x] Journal entries tracked
- [x] Weekly focus tracked
- [x] Therapist booking tracked
- [x] User properties managed
- [x] Error logging implemented
- [x] Performance tracing ready
- [x] Complete documentation written

### Optional Enhancements ⚙️

- [ ] Add Crashlytics SDK
- [ ] Implement Remote Config
- [ ] Set up A/B testing
- [ ] Create custom dashboards
- [ ] Configure Firebase alerts
- [ ] Add analytics opt-out setting
- [ ] Implement data deletion

---

## 🎯 Common Use Cases

### Track User Actions

```typescript
import { trackEvent } from '../services/analytics';

trackEvent('button_clicked', {
  button_id: 'submit',
  screen: 'CheckinForm',
});
```

See: **ANALYTICS_QUICK_REFERENCE.md** → Track Event

---

### Track Screen Views

```typescript
import { trackScreen } from '../services/analytics';

useEffect(() => {
  trackScreen('ScreenName');
}, []);
```

See: **ANALYTICS_EXAMPLES.md** → Screen Tracking

---

### Log Errors

```typescript
import { logError } from '../services/analytics';

try {
  await riskyOperation();
} catch (error) {
  logError(error, { component: 'MyComponent' });
}
```

See: **ANALYTICS_EXAMPLES.md** → Error Logging

---

### Measure Performance

```typescript
import { startTrace, stopTrace } from '../services/analytics';

startTrace('api_call');
try {
  const data = await fetchData();
  stopTrace('api_call', true);
} catch (error) {
  stopTrace('api_call', false, error.message);
}
```

See: **ANALYTICS_EXAMPLES.md** → Performance Tracing

---

## 📊 Tracked Events Summary

| Event | Location | Documentation |
|-------|----------|---------------|
| `check_in_completed` | `stores/checkinStore.ts` | ANALYTICS_README.md |
| `action_completed` | `stores/planStore.ts` | ANALYTICS_README.md |
| `sos_triggered` | `app/(tabs)/sos.tsx` | ANALYTICS_README.md |
| `therapist_booked` | `app/(telehealth)/index.tsx` | ANALYTICS_README.md |
| `streak_milestone` | `stores/streakStore.ts` | ANALYTICS_README.md |
| `weekly_focus_set` | `app/(weekly-focus)/daily-goals.tsx` | ANALYTICS_README.md |
| `journal_entry_created` | `stores/journalStore.ts` | ANALYTICS_README.md |
| `crisis_detected` | `stores/checkinStore.ts` | ANALYTICS_README.md |
| `screen_view` | `app/_layout.tsx` | ANALYTICS_README.md |

---

## 🔗 Related Files

### Integration Points

- `app/_layout.tsx` - Screen tracking & user properties
- `stores/checkinStore.ts` - Check-in events
- `stores/planStore.ts` - Action completion
- `stores/streakStore.ts` - Streak milestones
- `stores/journalStore.ts` - Journal entries
- `app/(tabs)/sos.tsx` - SOS triggers
- `app/(weekly-focus)/daily-goals.tsx` - Weekly focus
- `app/(telehealth)/index.tsx` - Therapist booking

### Firebase Configuration

- `services/firebase.ts` - Firebase initialization
- `google-services.json` - Android config
- `.env` - Environment variables

---

## 📞 Support

### Questions?

1. Check **ANALYTICS_QUICK_REFERENCE.md** for quick answers
2. Review **ANALYTICS_EXAMPLES.md** for code examples
3. Read **ANALYTICS_README.md** for detailed explanations
4. Examine **analytics.ts** source code

### Issues?

1. Check console for `[Analytics]` logs
2. Verify Firebase configuration
3. Review **ANALYTICS_README.md** troubleshooting section
4. Check Firebase Console for event delivery

---

## 🎓 Learning Path

### Beginner
1. **ANALYTICS_QUICK_REFERENCE.md** - Learn common tasks
2. Copy-paste examples for your use case
3. Test in development mode

### Intermediate
1. **ANALYTICS_EXAMPLES.md** - Study patterns
2. Implement custom events
3. Add error logging

### Advanced
1. **analytics.ts** - Understand implementation
2. **ANALYTICS_README.md** - Master architecture
3. Implement custom analytics features

---

## 📝 Contributing

### Adding New Events

1. Open `services/analytics.ts`
2. Add to `AnalyticsEventName` type
3. Create parameter interface
4. Add specialized tracking function
5. Document in **ANALYTICS_README.md**
6. Add examples to **ANALYTICS_EXAMPLES.md**
7. Update this index

### Updating Documentation

- Keep all docs in sync
- Add examples for new features
- Update quick reference
- Review implementation summary

---

## 🏆 Best Practices

From **ANALYTICS_README.md**:

✅ Track meaningful events
✅ Respect user privacy
✅ Use type-safe functions
✅ Handle errors gracefully
✅ Never block UI
✅ Test before deploying

---

**Last Updated**: December 23, 2024
**Version**: 1.0.0
**Maintainer**: MentalSpace Development Team
