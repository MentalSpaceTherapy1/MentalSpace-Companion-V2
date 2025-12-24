/**
 * Voice Note Recorder Component
 * Audio recording and playback for journal entries
 *
 * Uses expo-av for audio recording (must be installed)
 */

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { triggerHaptic } from '../utils/haptics';

// Note: expo-av needs to be installed
// npm install expo-av
// These imports will work once the package is installed
let Audio: any = null;
let AudioClass: any = null;
try {
  const ExpoAv = require('expo-av');
  Audio = ExpoAv.Audio;
  AudioClass = ExpoAv.Audio;
} catch (e) {
  // expo-av not installed yet
}

interface VoiceNoteRecorderProps {
  onRecordingComplete: (uri: string, duration: number) => void;
  onDelete?: () => void;
  existingUri?: string;
  existingDuration?: number;
  maxDuration?: number; // in seconds, default 300 (5 minutes)
}

export function VoiceNoteRecorder({
  onRecordingComplete,
  onDelete,
  existingUri,
  existingDuration,
  maxDuration = 300,
}: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | undefined>(existingUri);
  const [totalDuration, setTotalDuration] = useState(existingDuration || 0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const recordingRef = useRef<any>(null);
  const soundRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Check if expo-av is available
  const isAudioAvailable = Audio !== null;

  useEffect(() => {
    if (isAudioAvailable) {
      checkPermissions();
    }
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (existingUri) {
      setRecordingUri(existingUri);
      setTotalDuration(existingDuration || 0);
    }
  }, [existingUri, existingDuration]);

  const checkPermissions = async () => {
    if (!isAudioAvailable) return;

    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error checking audio permissions:', error);
      setHasPermission(false);
    }
  };

  const cleanup = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {}
    }
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (e) {}
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startRecording = async () => {
    if (!isAudioAvailable) {
      Alert.alert(
        'Not Available',
        'Voice recording requires expo-av to be installed.'
      );
      return;
    }

    if (hasPermission === false) {
      Alert.alert(
        'Permission Required',
        'Microphone access is required for voice notes.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      triggerHaptic('medium');

      // Stop any playing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Create new recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);
      startPulseAnimation();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      triggerHaptic('success');

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      stopPulseAnimation();
      setIsRecording(false);

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      const duration = recordingDuration;

      recordingRef.current = null;

      if (uri) {
        setRecordingUri(uri);
        setTotalDuration(duration);
        onRecordingComplete(uri, duration);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      stopPulseAnimation();
    }
  };

  const playRecording = async () => {
    if (!recordingUri || !isAudioAvailable) return;

    try {
      triggerHaptic('light');

      // Unload any existing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setIsPlaying(true);
      setPlaybackPosition(0);
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Error', 'Failed to play recording.');
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackPosition(Math.floor(status.positionMillis / 1000));

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    }
  };

  const stopPlayback = async () => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.stopAsync();
      setIsPlaying(false);
      setPlaybackPosition(0);
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  const deleteRecording = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this voice note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic('medium');
            if (soundRef.current) {
              await soundRef.current.unloadAsync();
              soundRef.current = null;
            }
            setRecordingUri(undefined);
            setTotalDuration(0);
            setIsPlaying(false);
            onDelete?.();
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show install message if expo-av is not available
  if (!isAudioAvailable) {
    return (
      <View style={styles.container}>
        <View style={styles.unavailableContainer}>
          <Ionicons name="mic-off" size={32} color={colors.textSecondary} />
          <Text style={styles.unavailableText}>
            Voice recording requires the expo-av package.
          </Text>
          <Text style={styles.unavailableHint}>
            Run: npx expo install expo-av
          </Text>
        </View>
      </View>
    );
  }

  // Show existing recording
  if (recordingUri && !isRecording) {
    return (
      <View style={styles.container}>
        <View style={styles.playbackContainer}>
          <Pressable
            style={styles.playButton}
            onPress={isPlaying ? stopPlayback : playRecording}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={colors.textInverse}
            />
          </Pressable>

          <View style={styles.playbackInfo}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: totalDuration > 0
                      ? `${(playbackPosition / totalDuration) * 100}%`
                      : '0%',
                  },
                ]}
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(isPlaying ? playbackPosition : 0)}
              </Text>
              <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
            </View>
          </View>

          <Pressable style={styles.deleteButton} onPress={deleteRecording}>
            <Ionicons name="trash" size={20} color={colors.error} />
          </Pressable>
        </View>
      </View>
    );
  }

  // Show recording interface
  return (
    <View style={styles.container}>
      <View style={styles.recordingContainer}>
        {isRecording ? (
          <>
            <Animated.View
              style={[
                styles.recordingIndicator,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.recordingDot} />
            </Animated.View>
            <Text style={styles.recordingTime}>
              {formatTime(recordingDuration)}
            </Text>
            <Text style={styles.recordingHint}>
              Max: {formatTime(maxDuration)}
            </Text>
          </>
        ) : (
          <Text style={styles.recordingPrompt}>
            Tap the microphone to record a voice note
          </Text>
        )}

        <Pressable
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={32}
            color={colors.textInverse}
          />
        </Pressable>

        {isRecording && (
          <Text style={styles.tapToStop}>Tap to stop recording</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  unavailableContainer: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  unavailableText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  unavailableHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  recordingContainer: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  recordingIndicator: {
    marginBottom: spacing.md,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  recordingTime: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recordingHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  recordingPrompt: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recordButtonActive: {
    backgroundColor: colors.error,
  },
  tapToStop: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playbackInfo: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VoiceNoteRecorder;
