import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { recipesApi, getErrorMessage } from '../../services/api';
import { Recipe } from '../../types';
import { RecipeCard } from '../../components/ui/RecipeCard';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors, layout, spacing, borderRadius } from '../../constants/theme';
import {
  sortRecipes,
  filterRecipes,
  extractFilterGroups,
  SortOption,
} from '../../utils/recipeHelpers';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'alpha-asc', label: 'A-Z' },
  { key: 'alpha-desc', label: 'Z-A' },
  { key: 'date-new', label: 'Más recientes' },
  { key: 'date-old', label: 'Más antiguas' },
  { key: 'rating-high', label: 'Mejor calificadas' },
  { key: 'rating-low', label: 'Menor calificación' },
];

export default function GeneralRecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('alpha-asc');
  const [showSort, setShowSort] = useState(false);

  const loadRecipes = async () => {
    try {
      const { data } = await recipesApi.getAll();
      setRecipes(data);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadRecipes();
    }, [])
  );

  const filterGroups = useMemo(() => extractFilterGroups(recipes), [recipes]);

  const displayedRecipes = useMemo(() => {
    const filtered = filterRecipes(recipes, search, selectedGroupId);
    return sortRecipes(filtered, sort);
  }, [recipes, search, selectedGroupId, sort]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Recetas Generales"
        subtitle="Explora y guarda recetas de la comunidad"
      />

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(!showSort)}>
          <Ionicons name="funnel-outline" size={16} color={colors.primary} />
          <Text style={styles.sortBtnText}>
            {SORT_OPTIONS.find((s) => s.key === sort)?.label}
          </Text>
        </TouchableOpacity>
      </View>

      {showSort && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortOption, sort === opt.key && styles.sortOptionActive]}
              onPress={() => {
                setSort(opt.key);
                setShowSort(false);
              }}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sort === opt.key && styles.sortOptionTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {filterGroups.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, !selectedGroupId && styles.filterChipActive]}
            onPress={() => setSelectedGroupId(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedGroupId && styles.filterChipTextActive,
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>
          {filterGroups.map((g) => (
            <TouchableOpacity
              key={g._id}
              style={[
                styles.filterChip,
                selectedGroupId === g._id && styles.filterChipActive,
                { borderColor: g.color },
              ]}
              onPress={() =>
                setSelectedGroupId(selectedGroupId === g._id ? null : g._id)
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedGroupId === g._id && { color: g.color },
                ]}
              >
                {g.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <FlatList
        data={displayedRecipes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => router.push(`/recipe/${item._id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadRecipes();
            }}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="globe-outline"
            title="Sin resultados"
            subtitle="Prueba otro filtro o crea la primera receta"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: layout.screenPaddingTop,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 4 },
  toolbar: { flexDirection: 'row', marginBottom: spacing.sm },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortBtnText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  sortMenu: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sortOption: { padding: spacing.md },
  sortOptionActive: { backgroundColor: colors.primary + '15' },
  sortOptionText: { fontSize: 14, color: colors.text },
  sortOptionTextActive: { color: colors.primary, fontWeight: '700' },
  filterScroll: { maxHeight: 44, marginBottom: spacing.sm },
  filterContent: { gap: 8, paddingRight: spacing.md },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary + '18',
    borderColor: colors.primary,
  },
  filterChipText: { fontSize: 13, fontWeight: '600', color: colors.textLight },
  filterChipTextActive: { color: colors.primary },
  list: { paddingBottom: layout.screenPaddingBottom },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
