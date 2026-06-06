import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,

} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { recipesApi, groupsApi, getErrorMessage } from '../../services/api';
import { Group, Ingredient } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { KeyboardAwareScroll } from '../../components/ui/KeyboardAwareScroll';
import { UnitSelect } from '../../components/ui/UnitSelect';
import { colors, spacing, borderRadius, layout } from '../../constants/theme';
import { LIMITS } from '../../constants/limits';
import { normalizeIngredients } from '../../utils/recipeHelpers';
import { truncate } from '../../utils/validation';

const emptyIngredient = (): Ingredient => ({
  name: '',
  quantity: '',
  unit: 'unidad',
});

export default function RecipeFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [preparation, setPreparation] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroups();
    if (isEditing) loadRecipe();
  }, [id]);

  const loadGroups = async () => {
    try {
      const { data } = await groupsApi.getAll();
      setGroups(data);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    }
  };

  const loadRecipe = async () => {
    try {
      const { data } = await recipesApi.getById(id!);
      setTitle(data.title);
      setImage(data.image || '');
      const normalized = normalizeIngredients(data.ingredients);
      setIngredients(normalized.length ? normalized : [emptyIngredient()]);
      setPreparation(
        data.preparation ||
          (Array.isArray(data.steps) ? data.steps.join('\n') : '')
      );
      setSelectedGroupIds(data.groups.map((g: Group) => g._id));
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
      router.back();
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.4,
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const mime = result.assets[0].mimeType || 'image/jpeg';
      const base64Image = `data:${mime};base64,${result.assets[0].base64}`;

      if (base64Image.length > 1_500_000) {
        Alert.alert('Imagen muy grande', 'Selecciona una imagen más pequeña.');
        return;
      }

      setImage(base64Image);
    }
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((g) => g !== groupId)
        : [...prev, groupId]
    );
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const updated = [...ingredients];
    const limits: Record<keyof Ingredient, number> = {
      name: LIMITS.ingredientName,
      quantity: LIMITS.ingredientQuantity,
      unit: 20,
    };
    updated[index] = {
      ...updated[index],
      [field]: truncate(value, limits[field]),
    };
    setIngredients(updated);
  };

  const addIngredient = () => {
    if (ingredients.length >= 30) {
      Alert.alert('Límite alcanzado', 'Máximo 30 ingredientes por receta.');
      return;
    }
    setIngredients([...ingredients, emptyIngredient()]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    const cleanIngredients = ingredients.filter((i) => i.name.trim());
    if (cleanIngredients.length === 0) {
      Alert.alert('Error', 'Agrega al menos un ingrediente');
      return;
    }

    if (!preparation.trim()) {
      Alert.alert('Error', 'Los pasos de preparación son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        image,
        ingredients: cleanIngredients,
        preparation: preparation.trim(),
        groupIds: selectedGroupIds,
      };

      if (isEditing) {
        await recipesApi.update(id!, payload);
        Alert.alert('Éxito', 'Receta actualizada');
      } else {
        await recipesApi.create(payload);
        Alert.alert(
          'Receta publicada',
          'Tu receta ya está visible para todos en Recetas Generales.'
        );
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScroll contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title={isEditing ? 'Editar receta' : 'Nueva receta'}
          onBack={() => router.back()}
        />

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={36} color={colors.primary} />
              <Text style={styles.imageText}>Agregar imagen (opcional)</Text>
            </View>
          )}
        </TouchableOpacity>

        <Input
          label="Título"
          placeholder="Nombre de la receta"
          value={title}
          onChangeText={(v) => setTitle(truncate(v, LIMITS.title))}
          maxLength={LIMITS.title}
          showCount
        />

        <Text style={styles.label}>Grupos</Text>
        <View style={styles.groupChips}>
          {groups.map((g) => {
            const selected = selectedGroupIds.includes(g._id);
            return (
              <TouchableOpacity
                key={g._id}
                style={[
                  styles.chip,
                  { borderColor: g.color },
                  selected && { backgroundColor: g.color + '33' },
                ]}
                onPress={() => toggleGroup(g._id)}
              >
                <Text style={[styles.chipText, { color: g.color }]}>{g.name}</Text>
                {selected && <Ionicons name="checkmark" size={16} color={g.color} />}
              </TouchableOpacity>
            );
          })}
          {groups.length === 0 && (
            <Text style={styles.hint}>Crea grupos primero en la pestaña Grupos</Text>
          )}
        </View>

        <Text style={styles.label}>Ingredientes</Text>
        {ingredients.map((ing, i) => (
          <View key={i} style={styles.ingredientCard}>
            <View style={styles.ingredientHeader}>
              <Text style={styles.ingredientLabel}>Ingrediente {i + 1}</Text>
              {ingredients.length > 1 && (
                <TouchableOpacity onPress={() => removeIngredient(i)}>
                  <Ionicons name="close-circle" size={22} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
            <Input
              placeholder="Nombre (ej: Manzana)"
              value={ing.name}
              onChangeText={(v) => updateIngredient(i, 'name', v)}
              maxLength={LIMITS.ingredientName}
              style={{ marginBottom: spacing.sm }}
            />
            <View style={styles.quantityRow}>
              <View style={styles.quantityInput}>
                <Input
                  placeholder="Cantidad"
                  value={ing.quantity}
                  onChangeText={(v) => updateIngredient(i, 'quantity', v)}
                  keyboardType="decimal-pad"
                  maxLength={LIMITS.ingredientQuantity}
                  style={{ marginBottom: 0 }}
                />
              </View>
              <UnitSelect
                value={ing.unit}
                onChange={(unit) => updateIngredient(i, 'unit', unit)}
              />
            </View>
          </View>
        ))}
        <Button
          title="+ Agregar ingrediente"
          variant="outline"
          onPress={addIngredient}
          style={{ marginBottom: spacing.md }}
        />

        <Input
          label="Pasos de preparación"
          placeholder="Describe todos los pasos aquí. Puedes escribir varios párrafos..."
          value={preparation}
          onChangeText={(v) => setPreparation(truncate(v, LIMITS.preparation))}
          multiline
          maxLength={LIMITS.preparation}
          showCount
        />

        <Button
          title={isEditing ? 'Guardar cambios' : 'Crear receta'}
          onPress={handleSubmit}
          loading={loading}
        />
    </KeyboardAwareScroll>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
    paddingBottom: layout.screenPaddingBottom,
  },
  imagePicker: { marginBottom: spacing.md },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.lg,
  },
  imagePlaceholder: {
    height: 140,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  imageText: { color: colors.textLight, marginTop: 8 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  groupChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
  },
  chipText: { fontWeight: '600', fontSize: 13 },
  hint: { color: colors.textLight, fontSize: 13 },
  ingredientCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ingredientLabel: { fontSize: 13, fontWeight: '600', color: colors.textLight },
  quantityRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  quantityInput: { flex: 1 },
});
