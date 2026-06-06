import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../constants/theme';

interface StarRatingProps {
  value: number;
  onChange?: (score: number) => void;
  size?: number;
  showValue?: boolean;
  count?: number;
  readonly?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  size = 28,
  showValue = false,
  count,
  readonly = false,
}) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {stars.map((star) => {
          const filled = star <= Math.round(value);
          const StarWrap = readonly ? View : TouchableOpacity;

          return (
            <StarWrap
              key={star}
              onPress={readonly ? undefined : () => onChange?.(star)}
              style={styles.starBtn}
              disabled={readonly}
            >
              <Ionicons
                name={filled ? 'star' : 'star-outline'}
                size={size}
                color={filled ? colors.accent : colors.border}
              />
            </StarWrap>
          );
        })}
      </View>
      {showValue && (
        <Text style={styles.valueText}>
          {value > 0 ? value.toFixed(1) : 'Sin calificar'}
          {count !== undefined && count > 0 ? ` (${count})` : ''}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  stars: { flexDirection: 'row', gap: 4 },
  starBtn: { padding: 2 },
  valueText: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
  },
});
