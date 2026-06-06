import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { recipesApi, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Recipe } from '../../types';
import { Button } from '../../components/ui/Button';
import { ScrollableTextBlock } from '../../components/ui/ScrollableTextBlock';
import { SaveToGroupModal } from '../../components/ui/SaveToGroupModal';
import { StarRating } from '../../components/ui/StarRating';
import { UserAvatar } from '../../components/ui/UserAvatar';
import { colors, spacing, borderRadius, shadows, layout } from '../../constants/theme';
import {
  normalizeIngredients,
  formatIngredient,
  getPreparationText,
  isRecipeOwner,
} from '../../utils/recipeHelpers';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    try {
      const { data } = await recipesApi.getById(id!);
      setRecipe(data);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const owner = recipe ? isRecipeOwner(recipe, user?._id) : false;

  const handleRate = async (score: number) => {
    if (owner) return;
    setRatingLoading(true);
    try {
      const { data } = await recipesApi.rate(id!, score);
      setRecipe((prev) =>
        prev
          ? {
              ...prev,
              averageRating: data.averageRating,
              ratingCount: data.ratingCount,
              userRating: data.userRating,
            }
          : prev
      );
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setRatingLoading(false);
    }
  };

  const handleDelete = () => {
    if (!owner) {
      Alert.alert('Sin permiso', 'Solo el creador puede eliminar esta receta.');
      return;
    }

    Alert.alert('Eliminar receta', '¿Estás seguro de eliminar esta receta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await recipesApi.delete(id!);
            router.back();
          } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
          }
        },
      },
    ]);
  };

  if (loading || !recipe) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const author =
    typeof recipe.user === 'object' ? recipe.user : null;
  const authorName = author?.name || 'Usuario';
  const authorAvatar = author?.avatar;
  const ingredients = normalizeIngredients(recipe.ingredients);
  const preparation = getPreparationText(recipe);

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.heroCard}>
          {recipe.image ? (
            <Image source={{ uri: recipe.image }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="restaurant" size={56} color={colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.titleCard}>
          <Text style={styles.title}>{recipe.title}</Text>
          <View style={styles.authorRow}>
            <UserAvatar name={authorName} avatar={authorAvatar} size={36} />
            <Text style={styles.author}>Creada por {authorName}</Text>
          </View>

          {recipe.groups?.length > 0 && (
            <View style={styles.tags}>
              {recipe.groups.map((g) => (
                <View
                  key={g._id}
                  style={[styles.tag, { backgroundColor: g.color + '33' }]}
                >
                  <Text style={[styles.tagText, { color: g.color }]}>{g.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>
            {owner ? 'Calificación de la comunidad' : 'Califica esta receta'}
          </Text>
          {owner ? (
            <>
              <StarRating
                value={recipe.averageRating ?? 0}
                readonly
                size={24}
                showValue
                count={recipe.ratingCount}
              />
              {(recipe.ratingCount ?? 0) === 0 && (
                <Text style={styles.ratingHint}>
                  Aún nadie ha calificado tu receta
                </Text>
              )}
            </>
          ) : (
            <>
              <StarRating
                value={recipe.userRating ?? 0}
                onChange={handleRate}
                size={32}
              />
              {ratingLoading && (
                <ActivityIndicator
                  color={colors.primary}
                  style={{ marginTop: spacing.sm }}
                />
              )}
              <Text style={styles.ratingHint}>
                Promedio: {(recipe.averageRating ?? 0).toFixed(1)} (
                {recipe.ratingCount ?? 0} calificaciones)
              </Text>
              {recipe.userRating && (
                <Text style={styles.ratingUser}>
                  Tu calificación: {recipe.userRating} estrellas
                </Text>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="basket-outline" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>Ingredientes</Text>
          </View>
          {ingredients.map((ing, i) => (
            <View key={i} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{formatIngredient(ing)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>Preparación</Text>
          </View>
          <ScrollableTextBlock text={preparation || 'Sin pasos registrados.'} />
        </View>

        <View style={styles.actions}>
          <Button
            title="Guardar en mis grupos"
            variant="secondary"
            onPress={() => setShowSaveModal(true)}
          />

          {owner && (
            <>
              <Button
                title="Editar receta"
                variant="outline"
                onPress={() => router.push(`/recipe/form?id=${id}`)}
                style={{ marginTop: spacing.md }}
              />
              <Button
                title="Eliminar receta"
                variant="danger"
                onPress={handleDelete}
                style={{ marginTop: spacing.md }}
              />
            </>
          )}
        </View>
      </ScrollView>

      <SaveToGroupModal
        visible={showSaveModal}
        recipeId={id!}
        onClose={() => setShowSaveModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: layout.screenPaddingHorizontal,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  heroCard: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: 56,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  heroImage: { width: '100%', height: 220 },
  heroPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  titleCard: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 32,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  author: { fontSize: 14, color: colors.textLight },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.md,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  tagText: { fontSize: 13, fontWeight: '600' },
  ratingCard: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  ratingHint: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  ratingUser: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  section: {
    marginHorizontal: layout.screenPaddingHorizontal,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  listText: { flex: 1, fontSize: 15, color: colors.text, lineHeight: 22 },
  actions: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing.sm,
    marginBottom: layout.screenPaddingBottom,
  },
});
