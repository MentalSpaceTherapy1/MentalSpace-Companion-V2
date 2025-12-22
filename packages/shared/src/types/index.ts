/**
 * MentalSpace Companion - Shared Types
 * These types are used across mobile app, MCP server, and Firebase functions
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  carePreferences: CarePreferences;
  onboardingCompleted: boolean;
  carePreferencesCompleted: boolean;
  timezone: string;
}

export interface UserPreferences {
  reasons: OnboardingReason[];
  focusAreas: string[];
  notifications: NotificationSettings;
  theme: ThemeMode;
  trustedContacts?: TrustedContact[];
  dailyTimeBudget?: number; // minutes available for self-care (5, 10, 15, 20, 30)
  privacyMode?: PrivacyMode; // default privacy level for sharing
}

export type PrivacyMode = 'full' | 'partial' | 'minimal';

// ============================================================================
// Trusted Contacts Types
// ============================================================================

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: ContactRelationship;
  notifyOnCrisis: boolean;
  notifyOnWeeklyUpdate: boolean;
}

export type ContactRelationship =
  | 'family'
  | 'friend'
  | 'therapist'
  | 'doctor'
  | 'partner'
  | 'mentor'
  | 'other';

export interface NotificationSettings {
  dailyReminder: boolean;
  reminderTime: string; // "HH:mm" format
  weeklyDigest: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type OnboardingReason =
  | 'stress_management'
  | 'anxiety_relief'
  | 'mood_tracking'
  | 'sleep_improvement'
  | 'mindfulness'
  | 'therapy_support'
  | 'self_discovery'
  | 'crisis_support';

// ============================================================================
// Care Preferences Types (New for MVP 2.0)
// ============================================================================

export interface CarePreferences {
  currentMentalState: MentalStateLevel;
  therapyStatus: TherapyStatus;
  primaryGoals: CareGoal[];
  preferredSupportStyle: SupportStyle;
  triggerTopics: string[];
  copingStrategiesUsed: string[];
  sleepSchedule: SleepSchedule;
  exerciseFrequency: ExerciseFrequency;
  socialSupport: SocialSupportLevel;
  crisisContacts: CrisisContact[];
}

export type MentalStateLevel =
  | 'thriving'      // Doing well, maintenance mode
  | 'managing'      // Generally okay, some challenges
  | 'struggling'    // Having difficulty, needs support
  | 'crisis';       // In crisis, needs immediate help

export type TherapyStatus =
  | 'currently_in_therapy'
  | 'looking_for_therapist'
  | 'between_therapists'
  | 'not_in_therapy'
  | 'prefer_not_to_say';

export type CareGoal =
  | 'reduce_anxiety'
  | 'manage_depression'
  | 'improve_sleep'
  | 'reduce_stress'
  | 'build_resilience'
  | 'improve_relationships'
  | 'increase_mindfulness'
  | 'manage_anger'
  | 'boost_confidence'
  | 'process_trauma'
  | 'grief_support'
  | 'work_life_balance';

export type SupportStyle =
  | 'gentle_encouragement'  // Soft, nurturing approach
  | 'direct_coaching'       // Clear, action-oriented guidance
  | 'reflective_listening'  // Empathetic, validating responses
  | 'structured_guidance';  // Step-by-step instructions

export interface SleepSchedule {
  typicalBedtime: string;   // "HH:mm" format
  typicalWakeTime: string;  // "HH:mm" format
  sleepQualityRating: number; // 1-10
}

export type ExerciseFrequency =
  | 'daily'
  | 'several_times_week'
  | 'once_week'
  | 'rarely'
  | 'never';

export type SocialSupportLevel =
  | 'strong'        // Good support network
  | 'moderate'      // Some support available
  | 'limited'       // Few people to rely on
  | 'isolated';     // Feeling alone

export interface CrisisContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

// ============================================================================
// SOS Protocol Types (New for MVP 2.0)
// ============================================================================

export type SOSProtocolType =
  | 'overwhelm'     // "I'm feeling overwhelmed"
  | 'panic'         // "I'm having a panic attack"
  | 'anger'         // "I'm really angry"
  | 'cant_sleep'    // "I can't sleep"
  | 'struggling';   // "I'm struggling and need help"

export interface SOSProtocol {
  id: SOSProtocolType;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  steps: SOSStep[];
  resources: string[]; // Resource IDs to show after
  escalationThreshold: number; // Steps before showing crisis resources
}

export interface SOSStep {
  id: string;
  type: SOSStepType;
  title: string;
  instruction: string;
  duration?: number; // seconds
  media?: SOSMedia;
  interactive?: SOSInteractive;
}

export type SOSStepType =
  | 'breathing'     // Guided breathing exercise
  | 'grounding'     // 5-4-3-2-1 or similar
  | 'affirmation'   // Positive statements
  | 'movement'      // Physical activity
  | 'reflection'    // Journaling prompt
  | 'audio'         // Calming sounds/music
  | 'contact';      // Reach out to someone

export interface SOSMedia {
  type: 'animation' | 'audio' | 'image';
  url?: string;
  animationType?: 'breathing' | 'wave' | 'pulse';
}

export interface SOSInteractive {
  type: 'tap' | 'hold' | 'swipe' | 'timer';
  targetCount?: number;
  duration?: number;
}

export interface SOSSession {
  id: string;
  userId: string;
  protocolType: SOSProtocolType;
  startedAt: Date;
  completedAt?: Date;
  stepsCompleted: number;
  totalSteps: number;
  helpfulRating?: number; // 1-5
  escalatedToCrisis: boolean;
  notes?: string;
}

// ============================================================================
// Weekly Focus Types (New for MVP 2.0)
// ============================================================================

export interface WeeklyFocus {
  id: string;
  userId: string;
  weekStart: string; // "YYYY-MM-DD"
  weekEnd: string;
  selectedAt: Date;

  focusArea: WeeklyFocusArea;
  intention: string;

  dailyMicroGoals: DailyMicroGoal[];
  weeklyReflection?: WeeklyReflection;

  completed: boolean;
  completionRate: number;
}

export type WeeklyFocusArea =
  | 'stress_relief'
  | 'sleep_hygiene'
  | 'mindfulness'
  | 'physical_wellness'
  | 'social_connection'
  | 'emotional_processing'
  | 'self_compassion'
  | 'productivity'
  | 'creativity'
  | 'gratitude';

export interface DailyMicroGoal {
  day: number; // 0-6 (Mon-Sun)
  goal: string;
  completed: boolean;
  completedAt?: Date;
  reflection?: string;
}

export interface WeeklyReflection {
  overallRating: number; // 1-5
  whatWorked: string;
  whatToImprove: string;
  nextWeekIntention?: string;
  submittedAt: Date;
}

// ============================================================================
// Check-in Types
// ============================================================================

export interface Checkin {
  id: string;
  userId: string;
  date: string; // "YYYY-MM-DD" format
  createdAt: Date;

  // Metrics (1-10 scale)
  mood: number;
  stress: number;
  sleep: number;
  energy: number;
  focus: number;
  anxiety: number;

  // Journal
  journalEntry?: string;
  voiceNoteUrl?: string;

  // Context tags (optional)
  contextTags?: ContextTag[];

  // Crisis detection
  crisisDetected: boolean;
  crisisHandled: boolean;
}

export type ContextTag =
  | 'work_stress'
  | 'relationship'
  | 'health'
  | 'finances'
  | 'family'
  | 'social'
  | 'sleep_issues'
  | 'exercise'
  | 'medication'
  | 'therapy_session'
  | 'good_day'
  | 'difficult_day';

export interface CheckinMetrics {
  mood: number;
  stress: number;
  sleep: number;
  energy: number;
  focus: number;
  anxiety: number;
}

export type MetricType = keyof CheckinMetrics;

export interface MetricConfig {
  key: MetricType;
  label: string;
  description: string;
  icon: string;
  lowLabel: string;
  highLabel: string;
  invertedScale: boolean; // true for stress/anxiety (lower is better)
}

// ============================================================================
// Action Plan Types
// ============================================================================

export interface DailyPlan {
  id: string;
  userId: string;
  date: string;
  createdAt: Date;
  checkinId: string;

  actions: PlannedAction[];

  completedCount: number;
  totalCount: number;
}

export interface PlannedAction {
  id: string;
  actionId: string;
  title: string;
  description: string;
  category: ActionCategory;
  duration: number; // minutes
  completed: boolean;
  completedAt?: Date;
  skipped: boolean;
  swappedFrom?: string;
}

export type ActionCategory = 'coping' | 'lifestyle' | 'connection';

export interface ActionTemplate {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: ActionCategory;
  duration: number;
  targetMetrics: MetricTarget[];
  focusModules: string[];
  difficulty: ActionDifficulty;
  isActive: boolean;
  tags?: string[];
  steps?: string[];
}

export interface MetricTarget {
  metric: MetricType;
  condition: 'low' | 'high';
  threshold: number;
}

export type ActionDifficulty = 'easy' | 'medium' | 'hard';

// ============================================================================
// Crisis Types
// ============================================================================

export interface CrisisEvent {
  id: string;
  userId: string;
  createdAt: Date;
  checkinId?: string;

  triggerType: CrisisTriggerType;
  severity: CrisisSeverity;
  detectionMethod: string;

  resourcesShown: string[];
  userAcknowledged: boolean;
  followUpScheduled: boolean;
}

export type CrisisTriggerType =
  | 'keyword'
  | 'low_mood_pattern'
  | 'explicit_request'
  | 'sentiment_analysis'
  | 'sos_escalation';

export type CrisisSeverity = 'low' | 'medium' | 'high';

export interface CrisisResource {
  id: string;
  name: string;
  description: string;
  phone?: string;
  textLine?: string;
  website?: string;
  available24x7: boolean;
}

// ============================================================================
// Focus Module Types
// ============================================================================

export interface FocusModule {
  id: string;
  title: string;
  description: string;
  category: FocusCategory;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

export type FocusCategory = 'mental' | 'physical' | 'social' | 'mindfulness';

// ============================================================================
// Analytics Types
// ============================================================================

export interface WeeklySummary {
  userId: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: Date;

  metrics: WeeklyMetricSummary;
  streaks: StreakInfo;
  completionRate: number;
  insights: string[];
  topActions: ActionSummary[];
}

export interface WeeklyMetricSummary {
  mood: MetricTrend;
  stress: MetricTrend;
  sleep: MetricTrend;
  energy: MetricTrend;
  focus: MetricTrend;
  anxiety: MetricTrend;
}

export interface MetricTrend {
  average: number;
  min: number;
  max: number;
  trend: 'improving' | 'stable' | 'declining';
  values: number[];
}

export interface StreakInfo {
  currentCheckinStreak: number;
  longestCheckinStreak: number;
  currentCompletionStreak: number;
  longestCompletionStreak: number;
}

export interface ActionSummary {
  actionId: string;
  title: string;
  category: ActionCategory;
  completedCount: number;
}

// ============================================================================
// Telehealth Appointment Request Types
// ============================================================================

export interface TelehealthRequest {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: TelehealthRequestStatus;

  // Contact Information
  fullName: string;
  email: string;
  phone: string;
  state: USState;

  // Appointment Details
  appointmentType: TelehealthAppointmentType;
  urgency: TelehealthUrgency;
  preferredTimes: string[];
  reasonForVisit: string;

  // Insurance Information
  hasInsurance: boolean;
  insuranceProvider?: InsuranceProvider;
  memberId?: string;

  // Optional prep info
  sessionPrepNotes?: string;

  // Staff notes (internal use)
  staffNotes?: string;
  assignedTo?: string;
  followUpDate?: Date;
}

export type TelehealthRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'contacted'
  | 'scheduled'
  | 'completed'
  | 'cancelled';

export type TelehealthAppointmentType =
  | 'video_session'      // Full video telehealth appointment
  | 'phone_session'      // Phone-based therapy session
  | 'text_therapy'       // Async text-based therapy
  | 'initial_consult';   // Free initial consultation

export type TelehealthUrgency =
  | 'routine'            // Within 2 weeks
  | 'soon'               // Within 1 week
  | 'urgent'             // Within 48 hours
  | 'crisis';            // Same day (emergency)

export type USState =
  | 'AL' | 'AK' | 'AZ' | 'AR' | 'CA' | 'CO' | 'CT' | 'DE' | 'FL' | 'GA'
  | 'HI' | 'ID' | 'IL' | 'IN' | 'IA' | 'KS' | 'KY' | 'LA' | 'ME' | 'MD'
  | 'MA' | 'MI' | 'MN' | 'MS' | 'MO' | 'MT' | 'NE' | 'NV' | 'NH' | 'NJ'
  | 'NM' | 'NY' | 'NC' | 'ND' | 'OH' | 'OK' | 'OR' | 'PA' | 'RI' | 'SC'
  | 'SD' | 'TN' | 'TX' | 'UT' | 'VT' | 'VA' | 'WA' | 'WV' | 'WI' | 'WY'
  | 'DC' | 'PR' | 'VI';

export type InsuranceProvider =
  | 'caresource'
  | 'peach_state'
  | 'amerigroup'
  | 'wellcare'
  | 'molina'
  | 'united_healthcare'
  | 'anthem_bcbs'
  | 'aetna'
  | 'cigna'
  | 'humana'
  | 'kaiser'
  | 'medicaid'
  | 'medicare'
  | 'tricare'
  | 'other';

// ============================================================================
// Therapist Booking Types
// ============================================================================

export interface TherapistProfile {
  id: string;
  name: string;
  credentials: string[];
  specialties: string[];
  bio: string;
  avatarUrl?: string;
  acceptingNewClients: boolean;
  sessionTypes: SessionType[];
  insuranceAccepted: InsuranceProvider[];
  hourlyRate?: number;
  rating?: number;
  reviewCount?: number;
}

export type SessionType = 'in_person' | 'video' | 'phone' | 'chat';

export interface BookingRequest {
  id: string;
  userId: string;
  therapistId: string;
  preferredSessionType: SessionType;
  preferredTimes: string[];
  reason: string;
  insuranceInfo?: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled';

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR';

// ============================================================================
// MCP Types (for ChatGPT integration)
// ============================================================================

export interface McpToolDefinition {
  name: string;
  description: string;
  parameters: McpParameterSchema;
}

export interface McpParameterSchema {
  type: 'object';
  properties: Record<string, McpPropertySchema>;
  required?: string[];
}

export interface McpPropertySchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  items?: McpPropertySchema;
}

export interface McpToolResult {
  success: boolean;
  content: string;
  uiComponent?: McpUiComponent;
}

export interface McpUiComponent {
  type: string;
  props: Record<string, unknown>;
}
