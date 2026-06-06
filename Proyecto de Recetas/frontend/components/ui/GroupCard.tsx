import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Group } from '../../types';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onPress,
  onEdit,
  onDelete,
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.icon, { backgroundColor: group.color + '22' }]}>
      <Ionicons name="folder-open" size={28} color={group.color} />
    </View>
    <View style={styles.content}>
      <Text style={styles.name}>{group.name}</Text>
      <Text style={styles.count}>
        {group.recipeCount ?? 0} receta{(group.recipeCount ?? 0) !== 1 ? 's' : ''}
      </Text>
      {group.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {group.description}
        </Text>
      ) : null}
    </View>
    <View style={styles.actions}>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
          <Ionicons name="pencil" size={18} color={colors.secondary} />
        </TouchableOpacity>
      )}
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, marginLeft: spacing.md },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  count: { fontSize: 12, color: colors.primary, fontWeight: '600', marginTop: 2 },
  description: { fontSize: 13, color: colors.textLight, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 8 },
});
