import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { groupsApi, getErrorMessage } from '../../services/api';
import { Group } from '../../types';
import { colors, borderRadius, spacing } from '../../constants/theme';

interface SaveToGroupModalProps {
  visible: boolean;
  recipeId: string;
  onClose: () => void;
  onSaved?: () => void;
}

export const SaveToGroupModal: React.FC<SaveToGroupModalProps> = ({
  visible,
  recipeId,
  onClose,
  onSaved,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [savedGroupIds, setSavedGroupIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (visible) loadData();
  }, [visible, recipeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupsRes, savedRes] = await Promise.all([
        groupsApi.getAll(),
        groupsApi.getSavedForRecipe(recipeId),
      ]);
      setGroups(groupsRes.data);
      setSavedGroupIds(savedRes.data.groupIds);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = async (group: Group) => {
    const isSaved = savedGroupIds.includes(group._id);
    setSaving(group._id);
    try {
      if (isSaved) {
        await groupsApi.removeRecipe(group._id, recipeId);
        setSavedGroupIds((prev) => prev.filter((id) => id !== group._id));
      } else {
        await groupsApi.saveRecipe(group._id, recipeId);
        setSavedGroupIds((prev) => [...prev, group._id]);
      }
      onSaved?.();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setSaving(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Guardar en mis grupos</Text>
          <Text style={styles.subtitle}>
            Organiza recetas de otros en tus carpetas personales
          </Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
          ) : groups.length === 0 ? (
            <Text style={styles.empty}>
              Crea un grupo primero en la pestaña Grupos
            </Text>
          ) : (
            <FlatList
              data={groups}
              keyExtractor={(item) => item._id}
              style={styles.list}
              renderItem={({ item }) => {
                const selected = savedGroupIds.includes(item._id);
                const isSaving = saving === item._id;
                return (
                  <TouchableOpacity
                    style={[styles.row, selected && styles.rowSelected]}
                    onPress={() => toggleGroup(item)}
                    disabled={!!saving}
                  >
                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                    <Text style={styles.rowText}>{item.name}</Text>
                    {isSaving ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Ionicons
                        name={selected ? 'checkmark-circle' : 'add-circle-outline'}
                        size={24}
                        color={selected ? colors.success : colors.textLight}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Listo</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textLight, marginTop: 4, marginBottom: spacing.md },
  list: { maxHeight: 280 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  rowSelected: { borderWidth: 1.5, borderColor: colors.success },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.sm },
  rowText: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '600' },
  empty: { textAlign: 'center', color: colors.textLight, padding: spacing.lg },
  closeBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  closeText: { color: '#FFF', fontWeight: '700' },
});
