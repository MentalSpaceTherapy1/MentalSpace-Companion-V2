/**
 * useDeepLinking Hook
 * Handles deep links from widgets, quick actions, and external sources
 */

import { useEffect, useCallback } from 'react';
import { Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import * as ExpoLinking from 'expo-linking';

// URL scheme for the app
const APP_SCHEME = 'mentalspace://';

// Route mappings for deep links
const DEEP_LINK_ROUTES: Record<string, string> = {
  'checkin': '/(tabs)/checkin',
  'journal': '/(journal)/entry',
  'journal/new': '/(journal)/entry',
  'plan': '/(tabs)/plan',
  'sos': '/(tabs)/sos',
  'sleep': '/(sleep)',
  'sleep/log': '/(sleep)/log',
  'insights': '/(insights)',
  'safety-plan': '/(safety-plan)',
  'settings': '/(tabs)/settings',
};

interface UseDeepLinkingOptions {
  enabled?: boolean;
  onDeepLink?: (url: string) => void;
}

export function useDeepLinking(options: UseDeepLinkingOptions = {}) {
  const { enabled = true, onDeepLink } = options;

  /**
   * Parse deep link URL and extract the path
   */
  const parseDeepLink = useCallback((url: string): string | null => {
    if (!url) return null;

    try {
      // Handle mentalspace:// scheme
      if (url.startsWith(APP_SCHEME)) {
        return url.replace(APP_SCHEME, '');
      }

      // Handle universal links (https://mentalspace.app/...)
      const parsed = ExpoLinking.parse(url);
      return parsed.path || null;
    } catch (error) {
      console.error('Failed to parse deep link:', error);
      return null;
    }
  }, []);

  /**
   * Handle a deep link URL
   */
  const handleDeepLink = useCallback(
    (url: string) => {
      const path = parseDeepLink(url);
      if (!path) return;

      console.log('Handling deep link:', path);

      // Notify callback if provided
      onDeepLink?.(url);

      // Find matching route
      const route = DEEP_LINK_ROUTES[path];
      if (route) {
        router.push(route as any);
      } else {
        console.log('No route found for deep link:', path);
      }
    },
    [parseDeepLink, onDeepLink]
  );

  /**
   * Handle initial URL that launched the app
   */
  useEffect(() => {
    if (!enabled) return;

    const handleInitialURL = async () => {
      try {
        // Get the URL that opened the app
        const initialURL = await Linking.getInitialURL();
        if (initialURL) {
          // Delay slightly to ensure navigation is ready
          setTimeout(() => handleDeepLink(initialURL), 100);
        }
      } catch (error) {
        console.error('Failed to get initial URL:', error);
      }
    };

    handleInitialURL();
  }, [enabled, handleDeepLink]);

  /**
   * Listen for incoming deep links while app is running
   */
  useEffect(() => {
    if (!enabled) return;

    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, handleDeepLink]);

  return {
    handleDeepLink,
    parseDeepLink,
  };
}

/**
 * Create a deep link URL for the app
 */
export function createDeepLink(path: string): string {
  return `${APP_SCHEME}${path}`;
}

/**
 * Get available deep link routes
 */
export function getDeepLinkRoutes(): Record<string, string> {
  return { ...DEEP_LINK_ROUTES };
}
