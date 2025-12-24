/**
 * Biometric Authentication Service
 * Handles Face ID, Touch ID, and Fingerprint authentication
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Storage keys
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_USER_ID_KEY = 'biometric_user_id';

// ========================================
// DEVICE CAPABILITY CHECKS
// ========================================

/**
 * Check if device has biometric hardware
 */
export async function hasBiometricHardware(): Promise<boolean> {
  return await LocalAuthentication.hasHardwareAsync();
}

/**
 * Check if biometrics are enrolled on the device
 */
export async function isBiometricEnrolled(): Promise<boolean> {
  return await LocalAuthentication.isEnrolledAsync();
}

/**
 * Get the types of biometric authentication available
 */
export async function getSupportedBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
  return await LocalAuthentication.supportedAuthenticationTypesAsync();
}

/**
 * Get a user-friendly name for the biometric type
 */
export async function getBiometricTypeName(): Promise<string> {
  const types = await getSupportedBiometricTypes();

  if (Platform.OS === 'ios') {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    }
  } else {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face Recognition';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris Recognition';
    }
  }

  return 'Biometric';
}

/**
 * Check if biometric authentication is available and ready to use
 */
export async function isBiometricAvailable(): Promise<{
  available: boolean;
  biometricType: string;
  reason?: string;
}> {
  const hasHardware = await hasBiometricHardware();
  if (!hasHardware) {
    return {
      available: false,
      biometricType: '',
      reason: 'Your device does not support biometric authentication',
    };
  }

  const isEnrolled = await isBiometricEnrolled();
  if (!isEnrolled) {
    return {
      available: false,
      biometricType: '',
      reason: Platform.OS === 'ios'
        ? 'Please set up Face ID or Touch ID in your device settings'
        : 'Please set up fingerprint or face recognition in your device settings',
    };
  }

  const biometricType = await getBiometricTypeName();
  return {
    available: true,
    biometricType,
  };
}

// ========================================
// BIOMETRIC AUTHENTICATION
// ========================================

/**
 * Authenticate using biometrics
 */
export async function authenticateWithBiometrics(options?: {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackLabel?: string;
  disableDeviceFallback?: boolean;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  const biometricType = await getBiometricTypeName();

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: options?.promptMessage || `Unlock with ${biometricType}`,
    cancelLabel: options?.cancelLabel || 'Cancel',
    fallbackLabel: options?.fallbackLabel || 'Use Password',
    disableDeviceFallback: options?.disableDeviceFallback ?? false,
  });

  if (result.success) {
    return { success: true };
  }

  // Map error codes to user-friendly messages
  let errorMessage = 'Authentication failed';
  if (result.error === 'user_cancel') {
    errorMessage = 'Authentication cancelled';
  } else if (result.error === 'user_fallback') {
    errorMessage = 'Use password instead';
  } else if (result.error === 'system_cancel') {
    errorMessage = 'Authentication was cancelled by the system';
  } else if (result.error === 'lockout') {
    errorMessage = 'Too many failed attempts. Please try again later.';
  } else if ((result.error as string) === 'lockout_permanent') {
    errorMessage = 'Biometric authentication is locked. Please use your device passcode.';
  }

  return {
    success: false,
    error: errorMessage,
  };
}

// ========================================
// BIOMETRIC PREFERENCES
// ========================================

/**
 * Check if biometric login is enabled for the current user
 */
export async function isBiometricLoginEnabled(): Promise<boolean> {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch {
    return false;
  }
}

/**
 * Get the user ID associated with biometric login
 */
export async function getBiometricUserId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(BIOMETRIC_USER_ID_KEY);
  } catch {
    return null;
  }
}

/**
 * Enable biometric login for a user
 */
export async function enableBiometricLogin(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // First verify they can authenticate
    const authResult = await authenticateWithBiometrics({
      promptMessage: 'Verify your identity to enable biometric login',
    });

    if (!authResult.success) {
      return { success: false, error: authResult.error || 'Authentication failed' };
    }

    // Store the preference
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
    await SecureStore.setItemAsync(BIOMETRIC_USER_ID_KEY, userId);

    return { success: true };
  } catch (error: any) {
    console.error('Failed to enable biometric login:', error);
    return { success: false, error: error.message || 'Failed to enable biometric login' };
  }
}

/**
 * Disable biometric login
 */
export async function disableBiometricLogin(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_USER_ID_KEY);
  } catch (error) {
    console.error('Failed to disable biometric login:', error);
  }
}

/**
 * Perform biometric authentication for app unlock
 * Returns the stored user ID if successful
 */
/**
 * Alias for isBiometricAvailable - checks if biometric is supported
 */
export async function isBiometricSupported(): Promise<boolean> {
  const result = await isBiometricAvailable();
  return result.available;
}

export async function authenticateForAppUnlock(): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  // Check if biometric is enabled
  const isEnabled = await isBiometricLoginEnabled();
  if (!isEnabled) {
    return {
      success: false,
      error: 'Biometric login is not enabled',
    };
  }

  // Get the stored user ID
  const userId = await getBiometricUserId();
  if (!userId) {
    return {
      success: false,
      error: 'No user associated with biometric login',
    };
  }

  // Authenticate
  const biometricType = await getBiometricTypeName();
  const result = await authenticateWithBiometrics({
    promptMessage: `Use ${biometricType} to unlock MentalSpace`,
  });

  if (result.success) {
    return {
      success: true,
      userId,
    };
  }

  return {
    success: false,
    error: result.error,
  };
}

// Backward compatibility aliases
export const getBiometricType = getBiometricTypeName;
export const isBiometricEnabled = isBiometricLoginEnabled;
