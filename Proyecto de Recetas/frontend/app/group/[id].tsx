import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router';
import { groupsApi, getErrorMessage } from '../../services/api';
import { Group, Recipe } from '../../types';
import { RecipeCard } from '../../components/ui/RecipeCard';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors, layout } from '../../constants/theme';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const { data } = await groupsApi.getById(id!);
      setGroup(data.group);
      setRecipes(data.recipes);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [id])
  );

  const handleRemoveRecipe = (recipe: Recipe) => {
    Alert.alert(
      'Quitar del grupo',
      `¿Quitar "${recipe.title}" de este grupo?\n\nLa receta no se eliminará de la app.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          onPress: async () => {
            try {
              await groupsApi.removeRecipe(id!, recipe._id);
              loadData();
            } catch (error) {
              Alert.alert('Error', getErrorMessage(error));
            }
          },
        },
      ]
    );
  };

  if (loading || !group) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={group.name}
        subtitle={group.description || 'Recetas en este grupo'}
        onBack={() => router.back()}
      />
      <FlatList
        data={recipes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => router.push(`/recipe/${item._id}`)}
            onRemove={() => handleRemoveRecipe(item)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="restaurant-outline"
            title="Sin recetas en este grupo"
            subtitle="Asigna recetas a este grupo al crearlas o editarlas"
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
  list: { paddingBottom: layout.screenPaddingBottom },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
