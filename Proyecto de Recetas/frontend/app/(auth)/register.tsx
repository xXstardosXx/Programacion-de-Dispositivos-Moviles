import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, getErrorMessage } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { KeyboardAwareScroll } from '../../components/ui/KeyboardAwareScroll';
import { colors, spacing, layout } from '../../constants/theme';
import { LIMITS } from '../../constants/limits';
import {
  getEmailError,
  getPasswordError,
  getPasswordChecks,
  truncate,
} from '../../utils/validation';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'El nombre es obligatorio';

    const emailError = getEmailError(email);
    if (emailError) e.email = emailError;

    const passwordError = getPasswordError(password);
    if (passwordError) e.password = passwordError;

    if (password !== confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const Requirement = ({ ok, text }: { ok: boolean; text: string }) => (
    <View style={styles.requirement}>
      <Ionicons
        name={ok ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={ok ? colors.success : colors.textLight}
      />
      <Text style={[styles.requirementText, ok && styles.requirementOk]}>{text}</Text>
    </View>
  );

  return (
    <KeyboardAwareScroll contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Crear cuenta"
          subtitle="Únete y empieza a guardar tus recetas"
          onBack={() => router.back()}
        />

        <Input
          label="Nombre"
          placeholder="Tu nombre"
          value={name}
          onChangeText={(v) => setName(truncate(v, LIMITS.name))}
          maxLength={LIMITS.name}
          error={errors.name}
        />
        <Input
          label="Email"
          placeholder="usuario@gmail.com"
          value={email}
          onChangeText={(v) => setEmail(truncate(v, LIMITS.email))}
          keyboardType="email-address"
          autoCapitalize="none"
          maxLength={LIMITS.email}
          error={errors.email}
        />
        <Text style={styles.hint}>Solo se permiten emails @gmail.com o @hotmail.com</Text>

        <Input
          label="Contraseña"
          placeholder="Crea una contraseña segura"
          value={password}
          onChangeText={(v) => setPassword(truncate(v, LIMITS.password))}
          secureTextEntry
          maxLength={LIMITS.password}
          error={errors.password}
        />

        <View style={styles.requirementsBox}>
          <Text style={styles.requirementsTitle}>La contraseña debe tener:</Text>
          <Requirement ok={passwordChecks.length} text="Mínimo 8 caracteres" />
          <Requirement ok={passwordChecks.uppercase} text="Al menos una mayúscula" />
          <Requirement ok={passwordChecks.lowercase} text="Al menos una minúscula" />
          <Requirement ok={passwordChecks.number} text="Al menos un número" />
          <Requirement ok={passwordChecks.symbol} text="Al menos un símbolo (!@#$%...)" />
        </View>

        <Input
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          value={confirmPassword}
          onChangeText={(v) => setConfirmPassword(truncate(v, LIMITS.password))}
          secureTextEntry
          maxLength={LIMITS.password}
          error={errors.confirmPassword}
        />

        <Button title="Registrarse" onPress={handleRegister} loading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <Link href="/(auth)/login" style={styles.link}>
            Inicia sesión
          </Link>
        </View>
    </KeyboardAwareScroll>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
    paddingBottom: layout.screenPaddingBottom,
  },
  hint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  requirementsBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  requirementText: { fontSize: 13, color: colors.textLight },
  requirementOk: { color: colors.success },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { color: colors.textLight },
  link: { color: colors.primary, fontWeight: '700' },
});
