/**
 * Login Screen
 * User authentication with email/password and social providers
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthStore } from '../../stores/authStore';
import { loginSchema, type LoginInput } from '@mentalspace/shared';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { signInWithApple, isAppleSignInAvailable, signInWithGoogle } from '../../services/socialAuth';
import * as Haptics from '../../utils/haptics';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [appleSignInAvailable, setAppleSignInAvailable] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'apple' | 'google' | null>(null);

  useEffect(() => {
    checkAppleSignIn();
  }, []);

  const checkAppleSignIn = async () => {
    const available = await isAppleSignInAvailable();
    setAppleSignInAvailable(available);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      clearError();
      await signIn(data.email, data.password);
      // Navigate to home after successful login
      router.replace('/(tabs)');
    } catch (e) {
      // Error handled by store
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setSocialLoading('apple');
      clearError();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const { isNewUser } = await signInWithApple();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // If new user, redirect to onboarding
      if (isNewUser) {
        router.replace('/(onboarding)/welcome');
      }
      // Otherwise, auth state listener will handle navigation
    } catch (error: any) {
      console.error('Apple Sign In error:', error);
      // Don't show error if user cancelled
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setSocialLoading('google');
      clearError();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const { isNewUser } = await signInWithGoogle();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // If new user, redirect to onboarding
      if (isNewUser) {
        router.replace('/(onboarding)/welcome');
      }
      // Otherwise, auth state listener will handle navigation
    } catch (error: any) {
      console.error('Google Sign In error:', error);
      // Don't show error if user cancelled the popup
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        // Show user-friendly error message
        if (error.code === 'auth/popup-blocked') {
          alert('Popup was blocked. Please allow popups for this site and try again.');
        }
      }
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="heart" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>Welcome to MentalSpace</Text>
          <Text style={styles.subtitle}>
            Sign in to continue your wellness journey
          </Text>
        </View>

        {/* Social Sign In Buttons */}
        <View style={styles.socialContainer}>
          {/* Apple Sign In - Only show on iOS when available */}
          {appleSignInAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={borderRadius.md}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}

          {/* Google Sign In */}
          <Pressable
            style={[styles.socialButton, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={socialLoading !== null}
          >
            {socialLoading === 'google' ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color={colors.textTertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
              )}
            />
            {errors.email && (
              <Text style={styles.errorMessage}>{errors.email.message}</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textTertiary}
                    />
                  </Pressable>
                </View>
              )}
            />
            {errors.password && (
              <Text style={styles.errorMessage}>{errors.password.message}</Text>
            )}
          </View>

          {/* Forgot Password */}
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </Pressable>
          </Link>

          {/* Submit Button */}
          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>

        {/* Register Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={styles.linkText}>Sign Up</Text>
            </Pressable>
          </Link>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  socialContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  appleButton: {
    height: 50,
    width: '100%',
  },
  googleButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  googleButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.error,
  },
  form: {
    gap: spacing.md,
  },
  inputContainer: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  errorMessage: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  linkText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  terms: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
  },
});
