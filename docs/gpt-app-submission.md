# MentalSpace Companion - GPT App Directory Submission

## App Information

### Basic Details
- **App Name:** MentalSpace Companion
- **Short Description:** Your AI-powered mental wellness companion for daily check-ins, personalized action plans, and crisis support.
- **Category:** Health & Wellness
- **Developer:** MentalSpace Therapy

### Full Description
MentalSpace Companion is a comprehensive mental health support tool that helps users track their daily mental wellness, receive personalized action plans, and access crisis resources when needed.

**Key Features:**
- **Daily Check-ins:** Track mood, stress, sleep, energy, focus, and anxiety on a 1-10 scale
- **Personalized Action Plans:** Get tailored wellness activities based on your current state
- **Weekly Focus Goals:** Set and track weekly mental health objectives with daily micro-goals
- **SOS Protocols:** Guided support for panic attacks, overwhelm, anger, insomnia, and difficult moments
- **Breathing & Grounding Exercises:** Evidence-based techniques for immediate relief
- **Progress Tracking:** View trends, streaks, and weekly summaries
- **Crisis Support:** Immediate access to crisis hotlines and resources

**This app is NOT a substitute for professional mental health treatment.**

---

## Technical Information

### MCP Server
- **URL:** https://mentalspace-companion-mcp.fly.dev
- **Protocol:** Model Context Protocol (MCP)
- **Transport:** HTTP/HTTPS
- **Authentication:** User ID passed via MCP context

### Endpoints
| Endpoint | Purpose |
|----------|---------|
| `/health` | Health check (returns server status) |
| `/api/tools` | List all available MCP tools |
| `/api/version` | Server version information |

### Tools Summary (17 total)

#### Check-in Tools
- `daily_checkin` - Record daily mental health metrics

#### Action Plan Tools
- `get_daily_plan` - Get personalized action plan
- `complete_action` - Mark action as completed
- `swap_action` - Replace action with alternative

#### Summary Tools
- `get_weekly_summary` - View weekly trends and insights
- `get_streak_info` - Check current streak

#### Crisis & SOS Tools
- `crisis_support` - Get crisis resources (hotlines)
- `start_sos_protocol` - Begin guided coping protocol
- `guided_breathing` - Breathing exercises
- `grounding_exercise` - 5-4-3-2-1 grounding technique

#### Weekly Focus Tools
- `set_weekly_focus` - Set weekly goal area
- `get_weekly_focus` - View current focus and progress
- `complete_daily_goal` - Complete daily micro-goal

#### Preferences Tools
- `get_care_preferences` - View support preferences
- `update_care_preferences` - Update preferences

#### Engagement Tools
- `journal_prompt` - Get journaling prompts
- `get_encouragement` - Receive encouragement

---

## URLs

| Resource | URL |
|----------|-----|
| Web App | https://mentalspace-companion.web.app |
| MCP Server | https://mentalspace-companion-mcp.fly.dev |
| Privacy Policy | https://mentalspace-companion.web.app/privacy-policy.html |
| Health Check | https://mentalspace-companion-mcp.fly.dev/health |

---

## Testing Guidelines

### Test Account
For reviewers, use any email to create an account through the web app, or test tools will work with any user ID in the MCP context.

### Sample Test Scenarios

**1. Basic Check-in Flow:**
```
User: "I want to do my daily check-in"
Expected: App asks for mood, stress, sleep, energy, focus, anxiety ratings
Action: Provide ratings (e.g., mood: 7, stress: 4, sleep: 6, energy: 5, focus: 6, anxiety: 3)
Result: Check-in saved, personalized actions generated
```

**2. Get Action Plan:**
```
User: "What should I do today for my mental health?"
Expected: Returns 3 personalized actions
```

**3. Crisis Support:**
```
User: "I'm feeling really overwhelmed and need help"
Expected: Provides crisis resources and offers SOS protocols
```

**4. Breathing Exercise:**
```
User: "Can you guide me through a breathing exercise?"
Expected: Step-by-step breathing instructions
```

**5. Weekly Summary:**
```
User: "How have I been doing this week?"
Expected: Trend analysis, averages, insights
```

---

## Safety & Compliance

### Crisis Handling
- Crisis keywords trigger immediate display of hotline numbers
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Clear disclaimers that this is not a substitute for professional treatment

### Data Privacy
- Minimal data collection (only what's needed for personalization)
- No full chat transcripts stored
- No location data collected
- User can delete all data on request
- HTTPS encryption for all data in transit

### Content Safety
- No medical diagnoses provided
- No medication recommendations
- Encourages professional help for serious concerns
- Positive, supportive messaging only

---

## Screenshots

*Note: Add screenshots of the web app showing:*
1. Daily check-in interface
2. Action plan view
3. Weekly summary/trends
4. SOS/Crisis support screen
5. Breathing exercise guide

---

## Contact

- **Developer:** MentalSpace Therapy
- **Support Email:** support@mentalspacetherapy.com
- **Privacy Email:** privacy@mentalspacetherapy.com
- **Website:** https://mentalspacetherapy.com

---

## Submission Checklist

- [x] MCP Server deployed and accessible
- [x] All tools have proper annotations (readOnlyHint, destructiveHint, openWorldHint)
- [x] Privacy policy published
- [x] Health endpoints working
- [x] Crisis support resources included
- [ ] Developer verification completed on OpenAI Platform
- [ ] Screenshots prepared
- [ ] Test credentials documented
