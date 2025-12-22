/**
 * Crisis Support Handler
 * Provides immediate crisis resources
 */

import type { Firestore } from 'firebase-admin/firestore';

export async function handleCrisisSupport(db: Firestore, userId: string) {
  // Log the crisis support request (without PII)
  await db
    .collection('users')
    .doc(userId)
    .collection('crisis_events')
    .add({
      createdAt: new Date(),
      triggerType: 'explicit_request',
      severity: 'medium',
      detectionMethod: 'mcp_tool_call',
      resourcesShown: ['988', 'crisis-text', 'samhsa'],
      userAcknowledged: false,
      followUpScheduled: true,
    });

  return {
    content: [
      {
        type: 'text',
        text: `**You're Not Alone - Help is Available**

If you're in crisis or need immediate support, please reach out to one of these resources:

📞 **988 Suicide & Crisis Lifeline** (National)
Call or text **988** (available 24/7)
Free, confidential support for people in distress

📱 **Crisis Text Line**
Text **HOME** to **741741**
Free crisis counseling via text message

🏥 **SAMHSA National Helpline**
Call **1-800-662-4357**
Treatment referrals and information (24/7)

🏳️‍🌈 **The Trevor Project** (LGBTQ+ Youth)
Call **1-866-488-7386** or text **START** to **678-678**

🍑 **Georgia Crisis & Access Line** (Georgia Residents)
Call **1-800-715-4225** (available 24/7)
Georgia's behavioral health crisis line

🏠 **Georgia DBHDD Mobile Crisis Teams**
Available statewide for in-person crisis support

---

**Remember:**
• What you're feeling is temporary, even when it doesn't feel that way
• Reaching out is a sign of strength, not weakness
• You deserve support and care

Is there anything specific I can help you with right now? I'm here to listen.`,
      },
    ],
  };
}
