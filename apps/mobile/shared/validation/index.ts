/**
 * MentalSpace Companion - Zod Validation Schemas
 * Type-safe validation for all data structures
 */

import { z } from 'zod';
import {
  METRIC_MIN,
  METRIC_MAX,
  JOURNAL_MAX_LENGTH,
  VALIDATION,
} from '../constants';

// ============================================================================
// Primitive Validators
// ============================================================================

export const metricSchema = z
  .number()
  .int()
  .min(METRIC_MIN, `Must be at least ${METRIC_MIN}`)
  .max(METRIC_MAX, `Must be at most ${METRIC_MAX}`);

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format');

export const timeStringSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Must be in HH:mm format');

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(VALIDATION.email.maxLength, `Email must be less than ${VALIDATION.email.maxLength} characters`);

export const passwordSchema = z
  .string()
  .min(VALIDATION.password.minLength, `Password must be at least ${VALIDATION.password.minLength} characters`)
  .max(VALIDATION.password.maxLength, `Password must be less than ${VALIDATION.password.maxLength} characters`)
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Invalid phone number format')
  .min(VALIDATION.phone.minLength, 'Phone number is too short')
  .max(VALIDATION.phone.maxLength, 'Phone number is too long');

export const displayNameSchema = z
  .string()
  .min(VALIDATION.displayName.minLength, `Name must be at least ${VALIDATION.displayName.minLength} characters`)
  .max(VALIDATION.displayName.maxLength, `Name must be less than ${VALIDATION.displayName.maxLength} characters`)
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// ============================================================================
// Check-in Schemas
// ============================================================================

export const checkinMetricsSchema = z.object({
  mood: metricSchema,
  stress: metricSchema,
  sleep: metricSchema,
  energy: metricSchema,
  focus: metricSchema,
  anxiety: metricSchema,
});

export const createCheckinSchema = z.object({
  date: dateStringSchema,
  mood: metricSchema,
  stress: metricSchema,
  sleep: metricSchema,
  energy: metricSchema,
  focus: metricSchema,
  anxiety: metricSchema,
  journalEntry: z
    .string()
    .max(JOURNAL_MAX_LENGTH, `Journal entry must be less than ${JOURNAL_MAX_LENGTH} characters`)
    .optional(),
  voiceNoteUrl: z.string().url().optional(),
});

export const checkinSchema = createCheckinSchema.extend({
  id: z.string().uuid(),
  userId: z.string(),
  createdAt: z.date(),
  crisisDetected: z.boolean(),
  crisisHandled: z.boolean(),
});

// ============================================================================
// Action Plan Schemas
// ============================================================================

export const actionCategorySchema = z.enum(['coping', 'lifestyle', 'connection']);

export const plannedActionSchema = z.object({
  id: z.string(),
  actionId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  category: actionCategorySchema,
  duration: z.number().int().min(1).max(180),
  completed: z.boolean(),
  completedAt: z.date().optional(),
  skipped: z.boolean(),
  swappedFrom: z.string().optional(),
});

export const dailyPlanSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: dateStringSchema,
  createdAt: z.date(),
  checkinId: z.string(),
  actions: z.array(plannedActionSchema),
  completedCount: z.number().int().min(0),
  totalCount: z.number().int().min(0),
});

export const completeActionSchema = z.object({
  actionId: z.string(),
  completed: z.boolean(),
});

export const swapActionSchema = z.object({
  currentActionId: z.string(),
  newActionId: z.string().optional(), // If not provided, system selects
});

// ============================================================================
// User Schemas
// ============================================================================

export const themeModeSchema = z.enum(['light', 'dark', 'system']);

export const onboardingReasonSchema = z.enum([
  'stress_management',
  'anxiety_relief',
  'mood_tracking',
  'sleep_improvement',
  'mindfulness',
  'therapy_support',
  'self_discovery',
  'crisis_support',
]);

export const notificationSettingsSchema = z.object({
  dailyReminder: z.boolean(),
  reminderTime: timeStringSchema,
  weeklyDigest: z.boolean(),
});

export const userPreferencesSchema = z.object({
  reasons: z.array(onboardingReasonSchema).min(1).max(5),
  focusAreas: z.array(z.string()),
  notifications: notificationSettingsSchema,
  theme: themeModeSchema,
});

export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
});

export const updateUserSchema = z.object({
  displayName: displayNameSchema.optional(),
  avatarUrl: z.string().url().optional(),
  preferences: userPreferencesSchema.partial().optional(),
  timezone: z.string().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// ============================================================================
// Crisis Schemas
// ============================================================================

export const crisisTriggerTypeSchema = z.enum([
  'keyword',
  'low_mood_pattern',
  'explicit_request',
  'sentiment_analysis',
]);

export const crisisSeveritySchema = z.enum(['low', 'medium', 'high']);

export const crisisEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  checkinId: z.string().optional(),
  triggerType: crisisTriggerTypeSchema,
  severity: crisisSeveritySchema,
  detectionMethod: z.string(),
  resourcesShown: z.array(z.string()),
  userAcknowledged: z.boolean(),
  followUpScheduled: z.boolean(),
});

export const crisisAcknowledgeSchema = z.object({
  eventId: z.string(),
  acknowledged: z.boolean(),
  resourcesViewed: z.array(z.string()).optional(),
});

// ============================================================================
// Therapist Matching Schemas
// ============================================================================

export const supportTypeSchema = z.enum([
  'individual_therapy',
  'couples_therapy',
  'family_therapy',
  'group_therapy',
  'psychiatry',
  'crisis_support',
]);

export const therapistContactSchema = z.object({
  firstName: displayNameSchema,
  lastName: displayNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: dateStringSchema.refine((date) => {
    const dob = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    return age >= 18;
  }, 'You must be at least 18 years old'),
  state: z.string().length(2, 'Please select a state'),
  insuranceProvider: z.string().optional(),
  supportType: supportTypeSchema,
  additionalNotes: z.string().max(1000).optional(),
  consentToContact: z.boolean().refine((val) => val === true, 'You must consent to be contacted'),
});

// ============================================================================
// MCP Tool Schemas (for ChatGPT integration)
// ============================================================================

export const mcpCheckinToolSchema = z.object({
  mood: metricSchema,
  stress: metricSchema,
  sleep: metricSchema,
  energy: metricSchema,
  focus: metricSchema,
  anxiety: metricSchema,
  journalEntry: z.string().max(JOURNAL_MAX_LENGTH).optional(),
});

export const mcpCompleteActionToolSchema = z.object({
  actionId: z.string(),
});

export const mcpGetPlanToolSchema = z.object({
  date: dateStringSchema.optional(), // Defaults to today
});

export const mcpGetSummaryToolSchema = z.object({
  weeksBack: z.number().int().min(1).max(12).optional(), // Defaults to 1
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type CreateCheckinInput = z.infer<typeof createCheckinSchema>;
export type CheckinMetricsInput = z.infer<typeof checkinMetricsSchema>;
export type PlannedActionInput = z.infer<typeof plannedActionSchema>;
export type DailyPlanInput = z.infer<typeof dailyPlanSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type TherapistContactInput = z.infer<typeof therapistContactSchema>;
export type McpCheckinInput = z.infer<typeof mcpCheckinToolSchema>;
