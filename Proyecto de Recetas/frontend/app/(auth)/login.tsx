import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, getErrorMessage } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { KeyboardAwareScroll } from '../../components/ui/KeyboardAwareScroll';
import { colors, spacing, borderRadius, shadows, layout } from '../../constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'El email es obligatorio';
    if (!password) e.password = 'La contraseña es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScroll
        contentContainerStyle={styles.scroll}
        keyboardVerticalOffset={0}
      >
        <View style={styles.hero}>
          <Ionicons
            name="pizza-outline"
            size={80}
            color="rgba(255,255,255,0.08)"
            style={styles.heroDecor1}
          />
          <Ionicons
            name="cafe-outline"
            size={60}
            color="rgba(255,255,255,0.06)"
            style={styles.heroDecor2}
          />

          <View style={styles.logoCircle}>
            <Ionicons name="restaurant" size={36} color={colors.primaryDark} />
          </View>
          <Text style={styles.heroTitle}>Mis Recetas</Text>
          <Text style={styles.heroSubtitle}>
            Guarda, organiza y comparte tus platos favoritos
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar sesión</Text>

          <Text style={styles.label}>Email</Text>
          <View style={[styles.field, errors.email && styles.fieldError]}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <TextInput
              style={styles.fieldInput}
              placeholder="usuario@gmail.com"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors((e) => ({ ...e, email: '' }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.field, errors.password && styles.fieldError]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
            <TextInput
              style={styles.fieldInput}
              placeholder="Tu contraseña"
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errors.password) setErrors((e) => ({ ...e, password: '' }));
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textLight}
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Nuevo por aquí? </Text>
            <Link href="/(auth)/register" style={styles.link}>
              Regístrate
            </Link>
          </View>
        </View>
      </KeyboardAwareScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: layout.screenPaddingBottom,
  },
  hero: {
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 72,
    paddingHorizontal: layout.screenPaddingHorizontal,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroDecor1: {
    position: 'absolute',
    top: 24,
    right: 20,
  },
  heroDecor2: {
    position: 'absolute',
    bottom: 30,
    left: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 280,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: -44,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  fieldError: {
    borderColor: colors.error,
    marginBottom: 4,
  },
  fieldInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: -8,
    marginBottom: spacing.sm,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.textLight,
    fontSize: 15,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
});
