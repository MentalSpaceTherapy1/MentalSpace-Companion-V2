/**
 * Native DateTimePicker Wrapper
 * This file is only imported on iOS/Android
 */

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface TimePickerProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
  label?: string;
}

export function NativeTimePicker({ value, onChange, label }: TimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const parseTimeToDate = (time: string): Date => {
    const [hours, mins] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, mins, 0, 0);
    return d;
  };

  const handleChange = (_: any, selectedTime?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const mins = selectedTime.getMinutes().toString().padStart(2, '0');
      onChange(`${hours}:${mins}`);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable style={styles.button} onPress={() => setShowPicker(true)}>
        <Text style={styles.timeText}>{value}</Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={parseTimeToDate(value)}
          mode="time"
          display="spinner"
          onChange={handleChange}
          is24Hour={true}
        />
      )}
    </View>
  );
}

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  label?: string;
  maxDate?: Date;
}

export function NativeDatePicker({ value, onChange, label, maxDate }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      onChange(selectedDate.toISOString().split('T')[0]);
    }
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable style={styles.button} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>{formatDate(value)}</Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={new Date(value)}
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={maxDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  button: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text,
  },
  dateText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
});
