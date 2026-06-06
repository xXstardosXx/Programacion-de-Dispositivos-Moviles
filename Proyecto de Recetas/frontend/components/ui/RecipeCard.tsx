import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../../types';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';
import { getIngredientCount } from '../../utils/recipeHelpers';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  onRemove?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress, onRemove }) => {
  const authorName =
    typeof recipe.user === 'object' ? recipe.user.name : 'Usuario';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {recipe.image ? (
        <Image source={{ uri: recipe.image }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="restaurant" size={36} color={colors.primary} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.author}>por {authorName}</Text>
        <View style={styles.tags}>
          {recipe.groups?.slice(0, 3).map((g) => (
            <View key={g._id} style={[styles.tag, { backgroundColor: g.color + '33' }]}>
              <Text style={[styles.tagText, { color: g.color }]}>{g.name}</Text>
            </View>
          ))}
        </View>
        <View style={styles.meta}>
          <Ionicons name="list-outline" size={14} color={colors.textLight} />
          <Text style={styles.metaText}>{getIngredientCount(recipe)} ingredientes</Text>
          {(recipe.ratingCount ?? 0) > 0 && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Ionicons name="star" size={13} color={colors.accent} />
              <Text style={styles.metaText}>
                {(recipe.averageRating ?? 0).toFixed(1)} ({recipe.ratingCount})
              </Text>
            </>
          )}
        </View>
      </View>
      {onRemove ? (
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Ionicons name="unlink-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      )}
    </TouchableOpacity>
  );
};

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
  image: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
  },
  placeholder: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, marginLeft: spacing.md },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  author: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: spacing.xs },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  tagText: { fontSize: 11, fontWeight: '600' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  metaText: { fontSize: 12, color: colors.textLight },
  metaDot: { fontSize: 12, color: colors.textLight, marginHorizontal: 2 },
  removeBtn: { padding: 8 },
});
