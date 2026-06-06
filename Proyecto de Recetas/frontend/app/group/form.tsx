import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { groupsApi, getErrorMessage } from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { KeyboardAwareScroll } from '../../components/ui/KeyboardAwareScroll';
import { colors, spacing, borderRadius, layout } from '../../constants/theme';
import { LIMITS } from '../../constants/limits';
import { truncate } from '../../utils/validation';

const COLOR_OPTIONS = [
  '#E07A5F', '#F4A261', '#2A9D8F', '#3D5A80',
  '#E9C46A', '#9B5DE5', '#F15BB5', '#00BBF9',
];

export default function GroupFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) loadGroup();
  }, [id]);

  const loadGroup = async () => {
    try {
      const { data } = await groupsApi.getById(id!);
      setName(data.group.name);
      setDescription(data.group.description);
      setColor(data.group.color);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del grupo es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const payload = { name: name.trim(), description: description.trim(), color };

      if (isEditing) {
        await groupsApi.update(id!, payload);
        Alert.alert('Éxito', 'Grupo actualizado');
      } else {
        await groupsApi.create(payload);
        Alert.alert('Éxito', 'Grupo creado');
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
          title={isEditing ? 'Editar grupo' : 'Nuevo grupo'}
          onBack={() => router.back()}
        />

        <Input
          label="Nombre"
          placeholder='Ej: "Desayunos"'
          value={name}
          onChangeText={(v) => setName(truncate(v, LIMITS.groupName))}
          maxLength={LIMITS.groupName}
        />
        <Input
          label="Descripción (opcional)"
          placeholder="Describe este grupo"
          value={description}
          onChangeText={(v) => setDescription(truncate(v, LIMITS.groupDescription))}
          multiline
          maxLength={LIMITS.groupDescription}
          showCount
        />

        <Text style={styles.label}>Color</Text>
        <View style={styles.colors}>
          {COLOR_OPTIONS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                color === c && styles.colorSelected,
              ]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <Button
          title={isEditing ? 'Guardar cambios' : 'Crear grupo'}
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: spacing.lg,
  },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: colors.text,
  },
});
