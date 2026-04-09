import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, AntDesign, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../types/navigation';
import { registrarUsuario } from '../services/usuariosApi';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../config/api';
import { C, F } from '../theme/buscaliTheme';
import BusCaliTextField from '../components/BusCaliTextField';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const socialSoon = () =>
    Alert.alert('Próximamente', 'El registro con redes sociales se activará más adelante.');

  const handleRegister = async () => {
    if (!nombre.trim()) {
      Alert.alert('Validación', 'El nombre es obligatorio.');
      return;
    }
    if (!apellido.trim()) {
      Alert.alert('Validación', 'El apellido es obligatorio.');
      return;
    }
    if (!telefono.trim()) {
      Alert.alert('Validación', 'El teléfono es obligatorio.');
      return;
    }
    if (telefono.trim().length > 20) {
      Alert.alert('Validación', 'El teléfono admite máximo 20 caracteres.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Validación', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Validación', 'Las contraseñas no coinciden.');
      return;
    }
    if (!terms) {
      Alert.alert('Validación', 'Debes aceptar los términos y condiciones.');
      return;
    }

    try {
      setLoading(true);
      const user = await registrarUsuario({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
        password,
        email: email.trim() || undefined,
      });
      signIn(user);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo registrar';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Text style={styles.logo}>BUSCALI</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerBlock}>
          <Text style={styles.titleLine1}>Únete a la </Text>
          <Text style={styles.titleMovida}>movida</Text>
          <Text style={styles.subtitle}>
            Regístrate para personalizar tus rutas y recibir alertas en vivo.
          </Text>
        </View>

        <BusCaliTextField
          label="Nombre"
          icon="person-outline"
          placeholder="Ej. Jairo"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
        />
        <BusCaliTextField
          label="Apellido"
          icon="badge"
          placeholder="Ej. Varela"
          value={apellido}
          onChangeText={setApellido}
          autoCapitalize="words"
          containerStyle={styles.fieldSpace}
        />
        <BusCaliTextField
          label="Correo electrónico"
          icon="alternate-email"
          placeholder="tu@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          containerStyle={styles.fieldSpace}
        />
        <BusCaliTextField
          label="Teléfono"
          icon="smartphone"
          placeholder="Ej. 3001234567"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
          maxLength={20}
          containerStyle={styles.fieldSpace}
        />

        <View style={styles.pwdGrid}>
          <BusCaliTextField
            label="Contraseña"
            icon="lock-outline"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            containerStyle={styles.pwdHalf}
          />
          <BusCaliTextField
            label="Confirmar"
            icon="verified-user"
            placeholder="••••••••"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            containerStyle={styles.pwdHalf}
          />
        </View>

        <Pressable
          style={styles.termsRow}
          onPress={() => setTerms((t) => !t)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: terms }}
        >
          <View style={[styles.checkbox, terms && styles.checkboxOn]}>
            {terms ? (
              <MaterialIcons name="check" size={16} color={C.onPrimary} />
            ) : null}
          </View>
          <Text style={styles.termsText}>
            Acepto los{' '}
            <Text style={styles.termsBold}>Términos y Condiciones</Text> y la política de
            privacidad de BusCali.
          </Text>
        </Pressable>

        <TouchableOpacity
          activeOpacity={0.92}
          onPress={handleRegister}
          disabled={loading}
          style={[styles.ctaWrap, loading && styles.ctaDisabled]}
        >
          <LinearGradient
            colors={[C.secondaryContainer, C.secondaryFixedDim]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGrad}
          >
            {loading ? (
              <ActivityIndicator color={C.onSecondaryContainer} />
            ) : (
              <>
                <Text style={styles.ctaText}>Crear cuenta</Text>
                <MaterialIcons name="trending-flat" size={26} color={C.onSecondaryContainer} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O únete con</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn} onPress={socialSoon}>
            <AntDesign name="google" size={20} color={C.onSurface} />
            <Text style={styles.socialLabel}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, styles.socialFb]} onPress={socialSoon}>
            <FontAwesome name="facebook" size={22} color={C.white} />
            <Text style={styles.socialLabelFb}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          ¿Ya tienes cuenta?{' '}
          <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
            Inicia sesión
          </Text>
        </Text>

        {__DEV__ ? (
          <Text style={styles.devHint} numberOfLines={1}>
            POST /api/usuarios · {getApiBaseUrl()}
          </Text>
        ) : null}

        <View style={styles.decorBus} pointerEvents="none">
          <MaterialIcons name="directions-bus" size={120} color={`${C.primary}22`} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surface },
  root: { flex: 1, backgroundColor: C.surface },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 48,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  logo: {
    fontFamily: F.headline,
    fontSize: 26,
    letterSpacing: -0.5,
    color: C.primary,
    fontStyle: 'italic',
  },
  loginLink: {
    fontFamily: F.bodyBold,
    fontSize: 14,
    color: C.primary,
    textDecorationLine: 'underline',
  },
  headerBlock: { marginBottom: 28 },
  titleLine1: {
    fontFamily: F.headline,
    fontSize: 36,
    lineHeight: 40,
    color: C.onSurface,
    letterSpacing: -1,
  },
  titleMovida: {
    fontFamily: F.headline,
    fontSize: 36,
    lineHeight: 40,
    color: C.secondary,
    letterSpacing: -1,
    marginTop: -4,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: F.bodyMed,
    fontSize: 16,
    lineHeight: 24,
    color: C.onSurfaceVariant,
  },
  fieldSpace: { marginTop: 16 },
  pwdGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  pwdHalf: { flex: 1, minWidth: 140 },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.outline,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surfaceContainerLowest,
  },
  checkboxOn: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  termsText: {
    flex: 1,
    fontFamily: F.bodyMed,
    fontSize: 13,
    lineHeight: 20,
    color: C.onSurfaceVariant,
  },
  termsBold: { fontFamily: F.bodyBold, color: C.primary },
  ctaWrap: {
    marginTop: 24,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: C.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaDisabled: { opacity: 0.75 },
  ctaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  ctaText: {
    fontFamily: F.headline,
    fontSize: 18,
    color: C.onSecondaryFixed,
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: `${C.outline}22` },
  dividerText: {
    fontFamily: F.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: C.outline,
    textTransform: 'uppercase',
  },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.surfaceContainerLow,
    borderWidth: 1,
    borderColor: `${C.outline}14`,
  },
  socialFb: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  socialLabel: {
    fontFamily: F.bodyBold,
    fontSize: 14,
    color: C.onSurface,
  },
  socialLabelFb: {
    fontFamily: F.bodyBold,
    fontSize: 14,
    color: C.white,
  },
  footer: {
    marginTop: 28,
    textAlign: 'center',
    fontFamily: F.bodyMed,
    fontSize: 15,
    color: C.onSurfaceVariant,
  },
  footerLink: {
    fontFamily: F.bodyBold,
    color: C.primary,
  },
  devHint: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 10,
    color: C.outline,
    fontFamily: F.body,
  },
  decorBus: {
    position: 'absolute',
    bottom: -10,
    right: -20,
    transform: [{ rotate: '12deg' }],
  },
});
