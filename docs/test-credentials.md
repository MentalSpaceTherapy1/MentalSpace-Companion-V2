# MentalSpace Companion - Test Credentials for GPT App Directory Review

## Test Account Details

| Field | Value |
|-------|-------|
| **User ID** | `test-reviewer-user-001` |
| **Email** | `reviewer@mentalspace-test.com` |
| **Password** | N/A (Firebase Auth not required for MCP testing) |

## Pre-populated Test Data

The test account comes with the following sample data:

### Check-in History (7 days)
- Daily mental health metrics for the past week
- Mood, stress, sleep, energy, focus, anxiety scores
- Sample journal entry on most recent day

### Active Action Plan
Today's plan includes 3 actions:
1. **5-Minute Mindful Breathing** (Coping) - Not completed
2. **Take a 15-Minute Walk** (Lifestyle) - Not completed
3. **Send a Kind Message** (Social) - Not completed

### Weekly Focus
- **Focus Area:** Mindfulness
- **Intention:** "Practice being more present in daily activities"
- **Progress:** 2 of 7 daily goals completed

### Streak Information
- **Current Streak:** 7 days
- **Longest Streak:** 14 days
- **Total Check-ins:** 21

### Care Preferences
- **Support Style:** Gentle encouragement
- **Primary Goals:** Reduce stress, Improve sleep, Increase mindfulness
- **Therapy Status:** Considering
- **Social Support:** Moderate

---

## Testing Instructions

### For MCP Tool Testing

When testing tools via the MCP server, pass the test user ID in the MCP context:

```json
{
  "_meta": {
    "userId": "test-reviewer-user-001"
  }
}
```

### Recommended Test Scenarios

#### 1. Check Current Status
```
"How am I doing this week?"
```
Expected: Weekly summary with trends from 7 days of data

#### 2. Get Today's Plan
```
"What should I do today?"
```
Expected: Returns 3 personalized actions

#### 3. Complete an Action
```
"I just finished the breathing exercise"
```
Expected: Marks action as complete, provides encouragement

#### 4. Get Weekly Focus
```
"What's my focus this week?"
```
Expected: Shows mindfulness focus with today's goal

#### 5. Do a Check-in
```
"I want to check in - mood 7, stress 3, sleep 6, energy 6, focus 7, anxiety 2"
```
Expected: Records check-in, generates new action plan

#### 6. Crisis Support (Important)
```
"I'm feeling really overwhelmed and having dark thoughts"
```
Expected: Immediate display of crisis hotlines (988, Crisis Text Line)

#### 7. Breathing Exercise
```
"Can you guide me through box breathing?"
```
Expected: Step-by-step breathing instructions

#### 8. Grounding Exercise
```
"I'm having a panic attack, help me ground myself"
```
Expected: 5-4-3-2-1 grounding technique guidance

---

## API Endpoints for Verification

| Endpoint | Expected Response |
|----------|-------------------|
| `GET /health` | `{"status":"healthy","version":"2.0.0",...}` |
| `GET /api/version` | `{"name":"mentalspace-mcp","version":"2.0.0"}` |
| `GET /api/tools` | List of 17 MCP tools with annotations |

---

## Notes for Reviewers

1. **No Login Required:** The MCP server authenticates via user ID in the request context, not traditional login
2. **Safe to Test:** All data modifications only affect the test user's data
3. **Crisis Detection:** The app is designed to prioritize crisis support when it detects concerning language
4. **Not a Substitute:** The app clearly states it is not a substitute for professional mental health treatment

---

## Support Contact

If you encounter issues during review:
- **Email:** support@mentalspacetherapy.com
- **Response Time:** Within 24 hours
