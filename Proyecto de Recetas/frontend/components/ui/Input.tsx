import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, borderRadius, spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  showCount,
  maxLength,
  style,
  value,
  multiline,
  ...props
}) => {
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.textLight}
        maxLength={maxLength}
        value={value}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'auto'}
        {...props}
      />
      {showCount && maxLength && (
        <Text style={styles.counter}>
          {currentLength}/{maxLength}
        </Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  multiline: {
    minHeight: 140,
    maxHeight: 220,
    paddingTop: spacing.md,
  },
  inputError: { borderColor: colors.error },
  counter: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  error: { color: colors.error, fontSize: 12, marginTop: spacing.xs },
});
