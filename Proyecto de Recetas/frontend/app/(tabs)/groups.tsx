import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { groupsApi, getErrorMessage } from '../../services/api';
import { Group } from '../../types';
import { GroupCard } from '../../components/ui/GroupCard';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors, spacing, borderRadius, shadows, layout } from '../../constants/theme';

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGroups = async () => {
    try {
      const { data } = await groupsApi.getAll();
      setGroups(data);
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
      loadGroups();
    }, [])
  );

  const handleDelete = (group: Group) => {
    Alert.alert(
      'Eliminar grupo',
      `¿Eliminar "${group.name}"?\n\nLas recetas guardadas se quitarán de esta carpeta, pero no se borrarán de la app.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data } = await groupsApi.delete(group._id);
              if (data.warning) {
                Alert.alert('Grupo eliminado', data.warning);
              }
              loadGroups();
            } catch (error) {
              Alert.alert('Error', getErrorMessage(error));
            }
          },
        },
      ]
    );
  };

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
        title="Mis Grupos"
        subtitle="Guarda recetas propias y de otros en carpetas"
        rightAction={
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/group/form')}
          >
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={groups}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onPress={() => router.push(`/group/${item._id}`)}
            onEdit={() => router.push(`/group/form?id=${item._id}`)}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadGroups();
            }}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="folder-outline"
            title="Sin grupos aún"
            subtitle='Crea grupos como "Desayunos" o "Comidas Saludables"'
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
  fab: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
});
