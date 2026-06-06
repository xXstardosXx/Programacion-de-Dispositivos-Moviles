import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, getErrorMessage } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { KeyboardAwareScroll } from '../../components/ui/KeyboardAwareScroll';
import { UserAvatar } from '../../components/ui/UserAvatar';
import { colors, spacing, borderRadius, shadows, layout } from '../../constants/theme';
import { LIMITS } from '../../constants/limits';
import { truncate } from '../../utils/validation';

export default function ProfileScreen() {
  const { user, updateProfile, deleteAccount, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para la foto de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const mime = result.assets[0].mimeType || 'image/jpeg';
      const base64Image = `data:${mime};base64,${result.assets[0].base64}`;

      if (base64Image.length > 1_500_000) {
        Alert.alert('Imagen muy grande', 'Selecciona una foto más pequeña.');
        return;
      }

      setAvatar(base64Image);
    }
  };

  const removeAvatar = () => {
    Alert.alert('Quitar foto', '¿Eliminar tu foto de perfil?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: () => setAvatar('') },
    ]);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const data: {
        name?: string;
        email?: string;
        password?: string;
        avatar?: string;
      } = {};

      if (name !== user?.name) data.name = name;
      if (email !== user?.email) data.email = email;
      if (password) data.password = password;
      if (avatar !== (user?.avatar || '')) data.avatar = avatar;

      if (Object.keys(data).length === 0) {
        Alert.alert('Info', 'No hay cambios para guardar');
        return;
      }

      await updateProfile(data);
      setPassword('');
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción es irreversible. Se eliminarán tu cuenta, grupos y recetas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Error', getErrorMessage(error));
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <KeyboardAwareScroll contentContainerStyle={styles.scroll}>
      <ScreenHeader title="Mi Perfil" subtitle="Gestiona tu cuenta" />

      <View style={styles.avatarCard}>
        <TouchableOpacity onPress={pickAvatar} activeOpacity={0.85}>
          <View style={styles.avatarWrap}>
            <UserAvatar name={name} avatar={avatar} size={100} />
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={18} color="#FFF" />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.avatarHint}>Toca para cambiar tu foto</Text>

        {avatar ? (
          <TouchableOpacity onPress={removeAvatar} style={styles.removePhotoBtn}>
            <Text style={styles.removePhotoText}>Quitar foto</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.userName}>{name}</Text>
        <Text style={styles.userEmail}>{email}</Text>
      </View>

      <Text style={styles.sectionTitle}>Editar datos</Text>
      <Input
        label="Nombre"
        value={name}
        onChangeText={(v) => setName(truncate(v, LIMITS.name))}
        maxLength={LIMITS.name}
      />
      <Input
        label="Email"
        value={email}
        onChangeText={(v) => setEmail(truncate(v, LIMITS.email))}
        keyboardType="email-address"
        autoCapitalize="none"
        maxLength={LIMITS.email}
      />
      <Input
        label="Nueva contraseña (opcional)"
        value={password}
        onChangeText={(v) => setPassword(truncate(v, LIMITS.password))}
        secureTextEntry
        placeholder="Dejar vacío para no cambiar"
        maxLength={LIMITS.password}
      />

      <Button title="Guardar cambios" onPress={handleUpdate} loading={loading} />

      <View style={styles.divider} />

      <Button title="Cerrar sesión" onPress={handleLogout} variant="outline" />

      <Button
        title="Eliminar cuenta"
        onPress={handleDelete}
        variant="danger"
        style={{ marginTop: spacing.md }}
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
  avatarCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  avatarWrap: { position: 'relative', marginBottom: spacing.sm },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarHint: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  removePhotoBtn: { marginBottom: spacing.sm },
  removePhotoText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
  },
  userName: { fontSize: 22, fontWeight: '700', color: colors.text },
  userEmail: { fontSize: 14, color: colors.textLight, marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
});
