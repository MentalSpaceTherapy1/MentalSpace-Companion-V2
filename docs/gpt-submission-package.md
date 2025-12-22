# MentalSpace Companion - GPT App Directory Submission Package

## 1. App Metadata

### Basic Information
| Field | Value |
|-------|-------|
| **App Name** | MentalSpace Companion |
| **Category** | Health & Wellness |
| **Developer** | MentalSpace Therapy |
| **Support Email** | support@mentalspacetherapy.com |
| **Company Attribution** | "Developed by MentalSpace Therapy" |

### Short Description (under 80 chars)
> Your AI mental wellness companion for daily check-ins, action plans, and support.

### Long Description
MentalSpace Companion helps users track their mental wellness through daily check-ins, receive personalized action plans, set weekly focus goals, and access crisis support when needed.

**Key Features:**
- **Daily Check-ins:** Track mood, stress, sleep, energy, focus, and anxiety (1-10 scale)
- **Personalized Action Plans:** AI-generated wellness activities tailored to your current state
- **Weekly Focus Goals:** Set intentions with daily micro-goals across 10 focus areas
- **SOS Protocols:** Guided support for panic, overwhelm, anger, insomnia, and difficult moments
- **Breathing & Grounding:** Evidence-based exercises for immediate relief
- **Progress Tracking:** Streaks, trends, and weekly summaries
- **Crisis Resources:** Immediate access to 988 Lifeline and other hotlines

**Important Disclaimer:** This app is a wellness support tool and is NOT a substitute for professional mental health treatment. If you are experiencing a mental health emergency, please contact emergency services or a crisis hotline immediately.

---

## 2. MCP Server Details

### Endpoint Information
| Endpoint | URL | Status |
|----------|-----|--------|
| **MCP Server** | https://mentalspace-companion-mcp.fly.dev | ✅ Live |
| **Health Check** | https://mentalspace-companion-mcp.fly.dev/health | ✅ Passing |
| **Tools List** | https://mentalspace-companion-mcp.fly.dev/api/tools | ✅ Available |
| **Version** | https://mentalspace-companion-mcp.fly.dev/api/version | ✅ v2.0.0 |

### Tools List (17 Total)

#### Check-in Tools
| Tool | Description | Read-Only | Side Effects |
|------|-------------|-----------|--------------|
| `daily_checkin` | Record mental health metrics | No | Saves to Firestore, generates action plan |

#### Action Plan Tools
| Tool | Description | Read-Only | Side Effects |
|------|-------------|-----------|--------------|
| `get_daily_plan` | Retrieve today's action plan | Yes | None |
| `complete_action` | Mark action complete | No | Updates completion status |
| `swap_action` | Replace action with alternative | No | Replaces action, logs reason |

#### Summary Tools
| Tool | Description | Read-Only | Side Effects |
|------|-------------|-----------|--------------|
| `get_weekly_summary` | Get weekly trends & insights | Yes | None |
| `get_streak_info` | Get streak information | Yes | None |

#### Crisis & SOS Tools
| Tool | Description | Read-Only | Side Effects |
|------|-------------|-----------|--------------|
| `crisis_support` | Show crisis hotlines (GA + National) | **No** | Logs crisis event (no PII) |
| `start_sos_protocol` | Begin guided coping protocol | No | Logs SOS event |
| `guided_breathing` | Breathing exercise | Yes | None |
| `grounding_exercise` | 5-4-3-2-1 grounding | Yes | None |

#### Weekly Focus Tools
| Tool | Description | Read-Only | Side Effects |
|------|-------------|-----------|--------------|
| `set_weekly_focus` | Set focus area for week | No | Creates weekly goals |
| `get_weekly_focus` | Get current focus & progress | Yes | None |
| `complete_daily_goal` | Complete daily micro-goal | No | Updates completion |

#### Preferences Tools
| Tool | Description | Read-Only | Side Effects |
|------|-------------|-----------|--------------|
| `get_care_preferences` | Get user preferences | Yes | None |
| `update_care_preferences` | Update preferences | No | Updates user document |

#### Engagement Tools
| Tool | Description | Read-Only | Side Effects |
|------|-------------|-----------|--------------|
| `journal_prompt` | Get journaling prompt | Yes | None |
| `get_encouragement` | Get encouragement message | Yes | None |

---

## 3. Tool-by-Tool Test Transcripts

### Scenario 1: Normal Daily Check-in → Plan Generated

**User Prompt:**
> "I want to do my daily check-in. My mood is 6, stress is 5, sleep was 7, energy is 5, focus is 6, and anxiety is 4."

**Tools Called:**
1. `daily_checkin`

**Tool Input:**
```json
{
  "mood": 6,
  "stress": 5,
  "sleep": 7,
  "energy": 5,
  "focus": 6,
  "anxiety": 4
}
```

**Expected Tool Output:**
```
**Check-in Recorded** ✓

Your mental wellness snapshot for today:
• Mood: 6/10
• Stress: 5/10
• Sleep: 7/10
• Energy: 5/10
• Focus: 6/10
• Anxiety: 4/10

**Your Personalized Action Plan:**

1. **5-Minute Box Breathing** (Coping)
   Take a short break to practice calming breaths.
   Duration: 5 min

2. **15-Minute Nature Walk** (Lifestyle)
   Get outside and move your body.
   Duration: 15 min

3. **Text a Friend** (Social)
   Reach out to someone you care about.
   Duration: 5 min

You're doing great by checking in today! 🌟
```

---

### Scenario 2: Complete Action & Get Encouragement

**User Prompt:**
> "I just finished my breathing exercise!"

**Tools Called:**
1. `complete_action`
2. `get_encouragement`

**Tool Inputs:**
```json
// complete_action
{ "actionId": "action-001" }

// get_encouragement
{ "context": "achievement" }
```

**Expected Outputs:**
```
**Action Completed!** ✓

Great job completing "5-Minute Box Breathing"!
Progress: 1/3 actions done today.

---

⭐ Amazing! You should be proud of yourself for showing up.
Every small step counts. You're making progress!
```

---

### Scenario 3: Crisis Language Detection (CRITICAL)

**User Prompt:**
> "I'm having really dark thoughts and I don't know if I want to be here anymore"

**Tools Called:**
1. `crisis_support` (MUST be called first)

**Expected Tool Output:**
```
**You're Not Alone - Help is Available**

If you're in crisis or need immediate support, please reach out:

📞 **988 Suicide & Crisis Lifeline**
Call or text **988** (available 24/7)

📱 **Crisis Text Line**
Text **HOME** to **741741**

🏥 **SAMHSA National Helpline**
Call **1-800-662-4357** (24/7)

---

**Remember:**
• What you're feeling is temporary
• Reaching out is a sign of strength
• You deserve support and care

Is there anything specific I can help you with right now?
```

**IMPORTANT:** Normal action plans are NOT generated when crisis support is triggered.

---

### Scenario 4: SOS Protocol for Panic Attack

**User Prompt:**
> "I'm having a panic attack, please help me"

**Tools Called:**
1. `start_sos_protocol`

**Tool Input:**
```json
{ "protocolType": "panic" }
```

**Expected Output:**
```
**Panic Protocol Activated** 🆘

I'm here with you. Let's get through this together.

**Step 1: Ground yourself**
Put your feet flat on the floor. Feel the ground beneath you.

**Step 2: Slow your breathing**
Breathe in for 4 counts... hold for 4... out for 4...

**Step 3: Name 5 things you can see**
Look around and name them out loud or in your mind.

**Step 4: Reassure yourself**
Say: "This is uncomfortable but temporary. I am safe."

You're doing great. This will pass. 💙
```

---

### Scenario 5: Weekly Summary

**User Prompt:**
> "How have I been doing this week?"

**Tools Called:**
1. `get_weekly_summary`

**Expected Output:**
```
**Your Week at a Glance** 📊

**Averages:**
• Mood: 6.2/10 (↗️ improving)
• Stress: 4.8/10 (↘️ decreasing)
• Sleep: 6.5/10 (→ stable)
• Energy: 5.8/10 (↗️ improving)

**Achievements:**
• Check-ins: 7/7 days ✓
• Actions completed: 18/21 (86%)
• Current streak: 7 days 🔥

**Insight:**
Your stress levels have decreased by 15% compared to last week.
Keep up the great work with your coping activities!
```

---

## 4. Privacy Policy & Data Map

### Privacy Policy URL
**https://mentalspace-companion.web.app/privacy-policy.html** ✅ Live

### Data Inventory

| Data Collected | Purpose | Storage | Shared With | Retention | User Control |
|---------------|---------|---------|-------------|-----------|--------------|
| User ID | Identify user | Firebase Auth | None | Until deletion | Delete via account |
| Email | Account recovery | Firebase Auth | None | Until deletion | Delete via account |
| Check-in metrics (mood, stress, etc.) | Personalization & trends | Firestore | None | Until deletion | Export/delete |
| Journal entries | Self-reflection | Firestore | None | Until deletion | Export/delete |
| Action completion | Progress tracking | Firestore | None | Until deletion | Export/delete |
| Care preferences | Personalization | Firestore | None | Until deletion | Update anytime |
| Crisis events (no PII) | Safety monitoring | Firestore | None | 90 days | N/A |

### Data Minimization
- **What we DON'T collect:**
  - Full chat transcripts
  - Location data
  - Contact lists
  - Financial information
  - Biometric data
  - Device identifiers (beyond session)

- **Tool response minimization:**
  - No internal IDs exposed in responses
  - No session/telemetry metadata in outputs
  - Only relevant user data returned per request

---

## 5. Authentication & Demo Account

### Auth Approach
- **No traditional login required for MCP**
- User ID is passed via MCP context (`_meta.userId`)
- Firebase Auth handles web app authentication separately

### Demo Account for Reviewers

| Field | Value |
|-------|-------|
| **User ID** | `test-reviewer-user-001` |
| **Email** | `reviewer@mentalspace-test.com` |

**Pre-populated Test Data:**
- 7 days of check-in history
- Active action plan with 3 uncompleted actions
- Weekly focus on "mindfulness" with 2/7 goals done
- 7-day streak, 21 total check-ins
- Care preferences configured

**To use:** Pass `"userId": "test-reviewer-user-001"` in MCP context.

---

## 6. Reliability & Performance

### Hosting
- **Platform:** Fly.io (IAD region)
- **Protocol:** HTTPS only
- **Health Check:** Every 30 seconds

### Observed Latency (approximate)
| Operation | Avg | P95 |
|-----------|-----|-----|
| daily_checkin | 200ms | 400ms |
| get_daily_plan | 150ms | 300ms |
| get_weekly_summary | 250ms | 500ms |
| crisis_support | 100ms | 200ms |
| guided_breathing | 50ms | 100ms |

### Error Handling
- **Timeout:** 30-second timeout, returns friendly error message
- **Empty data:** Returns helpful "no data yet" messages
- **Invalid input:** Validates all inputs, returns clear error descriptions
- **Rate limiting:** No explicit limit, but Firebase quotas apply

---

## 7. Safety Implementation (Mental Health Specific)

### Crisis Detection Logic

**Trigger Conditions:**
1. User explicitly calls `crisis_support` tool
2. ChatGPT detects crisis language and calls tool (per tool description)

**Crisis Keywords (ChatGPT is instructed to watch for):**
- "don't want to be here"
- "want to hurt myself"
- "suicidal"
- "self-harm"
- "end it all"
- "give up on life"
- "no point in living"

### Crisis Mode UX

When `crisis_support` is triggered:
1. **Immediate display** of crisis hotlines (988, Crisis Text Line, SAMHSA)
2. **No normal plan generation** - crisis takes priority
3. **Logged event** (timestamp, trigger type, no PII)
4. **Follow-up flag** set for 24-hour reminder option

### What Gets Logged
```json
{
  "createdAt": "timestamp",
  "triggerType": "explicit_request | language_detection",
  "severity": "medium | high",
  "detectionMethod": "mcp_tool_call",
  "resourcesShown": ["988", "crisis-text", "samhsa"],
  "userAcknowledged": false,
  "followUpScheduled": true
}
```
- **No PII stored** in crisis logs
- **User consent:** Covered in privacy policy and onboarding
- **Access:** Only system administrators

### Content Safety
- No medical diagnoses provided
- No medication recommendations
- Encourages professional help for serious concerns
- Positive, supportive messaging only
- Clear disclaimer that app is NOT a substitute for professional treatment

---

## 8. Pre-Flight Self-Check ✓

| Check | Status |
|-------|--------|
| Tool responses include internal IDs? | ❌ No |
| Tool names match behavior? | ✅ Yes |
| Crisis flow returns normal plan? | ❌ No - blocks plan |
| Published privacy policy? | ✅ Yes |
| Demo account accessible? | ✅ Yes |
| App has real interaction? | ✅ Yes - 17 functional tools |

---

## 9. Submission Checklist

- [x] MCP Server deployed and reachable (HTTPS)
- [x] All 17 tools have proper annotations
- [x] Privacy policy published and accessible
- [x] Data minimization implemented
- [x] Demo account created with sample data
- [x] Crisis support prioritized over normal flows
- [x] No PII in crisis logs
- [x] Tool responses clean (no internal IDs)
- [x] Error handling implemented
- [x] Health endpoint passing
- [ ] Screenshots prepared
- [ ] Developer verification complete on OpenAI Platform

---

## 10. Contact Information

- **Support:** support@mentalspacetherapy.com
- **Privacy:** privacy@mentalspacetherapy.com
- **Website:** https://mentalspacetherapy.com
- **Response Time:** Within 24 hours

---

## 11. Raw Tools JSON (For Review)

**Endpoint:** `GET https://mentalspace-companion-mcp.fly.dev/api/tools`

<details>
<summary>Click to expand full JSON (17 tools with annotations)</summary>

```json
{
  "tools": [
    {
      "name": "daily_checkin",
      "description": "Record user's daily mental health check-in. This tool allows users to log their current mental state including mood, stress levels, sleep quality, energy, focus, and anxiety. Each metric is on a scale of 1-10. Users can also optionally add a journal entry. After completing a check-in, personalized actions will be generated.",
      "annotations": {
        "readOnlyHint": false,
        "destructiveHint": false,
        "openWorldHint": true
      },
      "inputSchema": {
        "type": "object",
        "properties": {
          "mood": { "type": "number", "minimum": 1, "maximum": 10 },
          "stress": { "type": "number", "minimum": 1, "maximum": 10 },
          "sleep": { "type": "number", "minimum": 1, "maximum": 10 },
          "energy": { "type": "number", "minimum": 1, "maximum": 10 },
          "focus": { "type": "number", "minimum": 1, "maximum": 10 },
          "anxiety": { "type": "number", "minimum": 1, "maximum": 10 },
          "journalEntry": { "type": "string", "maxLength": 2000 }
        },
        "required": ["mood", "stress", "sleep", "energy", "focus", "anxiety"]
      }
    },
    {
      "name": "get_daily_plan",
      "annotations": { "readOnlyHint": true, "destructiveHint": false, "openWorldHint": true }
    },
    {
      "name": "complete_action",
      "annotations": { "readOnlyHint": false, "destructiveHint": false, "openWorldHint": true, "idempotentHint": true }
    },
    {
      "name": "swap_action",
      "annotations": { "readOnlyHint": false, "destructiveHint": false, "openWorldHint": true }
    },
    {
      "name": "get_weekly_summary",
      "annotations": { "readOnlyHint": true, "destructiveHint": false, "openWorldHint": true }
    },
    {
      "name": "get_streak_info",
      "annotations": { "readOnlyHint": true, "destructiveHint": false, "openWorldHint": true }
    },
    {
      "name": "crisis_support",
      "description": "Provide immediate crisis support resources to the user. This should be called when a user expresses thoughts of self-harm, suicide, or severe distress. Returns crisis hotline information and resources. IMPORTANT: Always prioritize this tool when detecting crisis language. Note: This tool logs a crisis event for safety monitoring (no PII stored).",
      "annotations": { "readOnlyHint": false, "destructiveHint": false, "openWorldHint": false }
    },
    {
      "name": "start_sos_protocol",
      "annotations": { "readOnlyHint": false, "destructiveHint": false, "openWorldHint": true }
    },
    {
      "name": "guided_breathing",
      "annotations": { "readOnlyHint": true, "destructiveHint": false, "openWorldHint": false }
    },
    {
      "name": "grounding_exercise",
      "annotations": { "readOnlyHint": true, "destructiveHint": false, "openWorldHint": false }
    },
    {
      "name": "set_weekly_focus",
      "annotations": { "readOnlyHint": false, "destructiveHint": false, "openWorldHint": true }
    },
    {
      "name": "get_weekly_focus",
      "annotations": { "readOnlyHint": true, "destructiveHint": false, "openWorldHint": true }
    },
    {
      "name": "complete_daily_goal",
      "annotations": { "readOnlyHint": false, "destructiveHint": false, "openWorldHint": true, "idempotentHint": true }
    },
    {
      "name": "get_care_preferences",
      "annotations": { "readOnlyHint": true, "destructiveHint": false, "openWorldHint": true }
    },
    {
      "name": "update_care_preferences",
      "annotations": { "readOnlyHint": false, "destructiveHint": false, "openWorldHint": true }
    },
    {
      "name": "journal_prompt",
      "annotations": { "readOnlyHint": true, "destructiveHint": false, "openWorldHint": false }
    },
    {
      "name": "get_encouragement",
      "annotations": { "readOnlyHint": true, "destructiveHint": false, "openWorldHint": false }
    }
  ]
}
```

</details>

### Annotations Summary

| Tool | readOnlyHint | destructiveHint | openWorldHint | idempotentHint |
|------|-------------|-----------------|---------------|----------------|
| daily_checkin | false | false | true | - |
| get_daily_plan | true | false | true | - |
| complete_action | false | false | true | **true** |
| swap_action | false | false | true | - |
| get_weekly_summary | true | false | true | - |
| get_streak_info | true | false | true | - |
| **crisis_support** | **false** | false | false | - |
| start_sos_protocol | false | false | true | - |
| guided_breathing | true | false | false | - |
| grounding_exercise | true | false | false | - |
| set_weekly_focus | false | false | true | - |
| get_weekly_focus | true | false | true | - |
| complete_daily_goal | false | false | true | **true** |
| get_care_preferences | true | false | true | - |
| update_care_preferences | false | false | true | - |
| journal_prompt | true | false | false | - |
| get_encouragement | true | false | false | - |

---

## 12. Fixes Applied (Dec 2024)

Based on review feedback, the following issues have been addressed:

| Issue | Status | Resolution |
|-------|--------|------------|
| `crisis_support` marked read-only but has side effects | ✅ Fixed | Changed `readOnlyHint` to `false`, updated description to note logging |
| Crisis resources US-only | ✅ Fixed | Added Georgia Crisis & Access Line (1-800-715-4225) and Georgia DBHDD info |
| Annotations not in API response | ✅ Fixed | Verified all 17 tools include annotations in JSON response |
| No PII in crisis logs | ✅ Confirmed | Crisis events log: timestamp, triggerType, severity, resourcesShown (no user content) |

### Remaining Items
- [ ] Screenshots (5 minimum)
- [ ] Developer verification on platform.openai.com
