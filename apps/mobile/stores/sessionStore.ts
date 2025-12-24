/**
 * Session Store
 * Manages telehealth sessions and post-session reflections with Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SessionReflection {
  rating: number; // 1-5 stars
  keyTakeaways: string[];
  homework: string[];
  notes: string;
}

export interface TherapistSession {
  id: string;
  therapistName: string;
  therapistId?: string;
  date: string; // ISO date string
  sessionDate: Date; // Actual session date/time
  type: 'video' | 'audio' | 'chat';
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  reflection?: SessionReflection;
  homeworkCompleted?: boolean[];
}

interface SessionState {
  // Sessions data
  sessions: TherapistSession[];

  // Actions
  addSession: (session: Omit<TherapistSession, 'id'>) => void;
  updateReflection: (sessionId: string, reflection: SessionReflection) => void;
  updateHomeworkStatus: (sessionId: string, homeworkIndex: number, completed: boolean) => void;
  getUpcomingSessions: () => TherapistSession[];
  getPastSessions: () => TherapistSession[];
  getSessionById: (sessionId: string) => TherapistSession | undefined;
  markSessionCompleted: (sessionId: string) => void;
  cancelSession: (sessionId: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],

      addSession: (sessionData) => {
        const newSession: TherapistSession = {
          ...sessionData,
          id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        };

        set((state) => ({
          sessions: [...state.sessions, newSession],
        }));
      },

      updateReflection: (sessionId, reflection) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  reflection,
                  homeworkCompleted: reflection.homework.map(() => false),
                }
              : session
          ),
        }));
      },

      updateHomeworkStatus: (sessionId, homeworkIndex, completed) => {
        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (session.id === sessionId && session.homeworkCompleted) {
              const updatedHomework = [...session.homeworkCompleted];
              updatedHomework[homeworkIndex] = completed;
              return {
                ...session,
                homeworkCompleted: updatedHomework,
              };
            }
            return session;
          }),
        }));
      },

      getUpcomingSessions: () => {
        const now = new Date();
        return get()
          .sessions.filter(
            (session) =>
              session.status === 'scheduled' && new Date(session.sessionDate) > now
          )
          .sort(
            (a, b) =>
              new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
          );
      },

      getPastSessions: () => {
        const now = new Date();
        return get()
          .sessions.filter(
            (session) =>
              (session.status === 'completed' ||
                (session.status === 'scheduled' &&
                  new Date(session.sessionDate) <= now)) &&
              session.reflection !== undefined
          )
          .sort(
            (a, b) =>
              new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
          );
      },

      getSessionById: (sessionId) => {
        return get().sessions.find((session) => session.id === sessionId);
      },

      markSessionCompleted: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId ? { ...session, status: 'completed' } : session
          ),
        }));
      },

      cancelSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId ? { ...session, status: 'cancelled' } : session
          ),
        }));
      },
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
