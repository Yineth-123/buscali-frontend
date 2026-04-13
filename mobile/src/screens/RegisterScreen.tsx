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
import { getApiBaseUrl } from '../config/api';
import { C, F } from '../theme/buscaliTheme';
import BusCaliTextField from '../components/BusCaliTextField';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

type Feedback = {
  type: 'error' | 'success';
  text: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function RegisterScreen({ navigation }: Props) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  const handleRegister = async () => {
    setFeedback(null);

    if (!nombre.trim()) {
      setFeedback({ type: 'error', text: 'El nombre es obligatorio.' });
      return;
    }
    if (!apellido.trim()) {
      setFeedback({ type: 'error', text: 'El apellido es obligatorio.' });
      return;
    }
    if (!email.trim()) {
      setFeedback({ type: 'error', text: 'El correo electrónico es obligatorio.' });
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setFeedback({ type: 'error', text: 'Ingresa un correo válido.' });
      return;
    }
    if (!telefono.trim()) {
      setFeedback({ type: 'error', text: 'El teléfono es obligatorio.' });
      return;
    }
    if (telefono.trim().length > 20) {
      setFeedback({ type: 'error', text: 'El teléfono admite máximo 20 caracteres.' });
      return;
    }
    if (password.length < 8) {
      setFeedback({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    if (!passwordRegex.test(password)) {
      setFeedback({
        type: 'error',
        text: 'La contraseña debe incluir mayúscula, minúscula y número.',
      });
      return;
    }
    if (password !== confirm) {
      setFeedback({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    if (!terms) {
      setFeedback({ type: 'error', text: 'Debes aceptar los términos y condiciones.' });
      return;
    }

    try {
      setLoading(true);
      await registrarUsuario({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
        password,
        email: email.trim(),
      });
      setFeedback({
        type: 'success',
        text: 'Registro exitoso. Te llevamos al login.',
      });
      setTimeout(() => navigation.navigate('Login'), 900);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo registrar';
      setFeedback({ type: 'error', text: message });
    } finally {
      setLoading(false);
    }
  };

  const socialSoon = () =>
    Alert.alert('Próximamente', 'El registro con redes sociales se activará más adelante.');

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
            <Pressable style={styles.backButton} onPress={handleGoBack}>
              <MaterialIcons name="arrow-back-ios" size={18} color={C.primary} />
              <Text style={styles.backText}>Volver</Text>
            </Pressable>
            <Text style={styles.logo}>BUSCALI</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkTop}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Únete a la</Text>
              <Text style={[styles.title, styles.titleAccent]}>movida</Text>
            </View>
            <Text style={styles.subtitle}>
              Regístrate para personalizar tus rutas y recibir alertas en vivo.
            </Text>

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
              placeholder="Ej. Manrique"
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
            <BusCaliTextField
              label="Contraseña"
              icon="lock-outline"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              containerStyle={styles.fieldSpace}
            />
            <BusCaliTextField
              label="Confirmar contraseña"
              icon="verified-user"
              placeholder="••••••••"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              containerStyle={styles.fieldSpace}
            />

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
                Acepto los <Text style={styles.termsBold}>Términos y Condiciones</Text> y la política de privacidad
              </Text>
            </Pressable>

            {feedback ? (
              <View
                style={[
                  styles.feedback,
                  feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess,
                ]}
              >
                <Text
                  style={[
                    styles.feedbackText,
                    feedback.type === 'error' ? styles.feedbackTextError : styles.feedbackTextSuccess,
                  ]}
                >
                  {feedback.text}
                </Text>
              </View>
            ) : null}

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

            <Text style={styles.loginHint}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
                Inicia sesión
              </Text>
            </Text>
          </View>

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
    paddingTop: 18,
    paddingBottom: 48,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontFamily: F.bodyBold,
    fontSize: 14,
    color: C.primary,
  },
  logo: {
    fontFamily: F.headline,
    fontSize: 26,
    letterSpacing: -0.5,
    color: C.primary,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 32,
    padding: 26,
    borderWidth: 1,
    borderColor: C.surfaceContainerHigh,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 10,
  },
  titleBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  title: {
    fontFamily: F.headline,
    fontSize: 34,
    color: C.onSurface,
    lineHeight: 42,
  },
  titleAccent: {
    color: C.secondary,
  },
  subtitle: {
    fontFamily: F.bodyMed,
    fontSize: 15,
    color: C.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 26,
  },
  fieldSpace: { marginTop: 18 },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    paddingRight: 4,
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
  feedback: {
    marginTop: 18,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  feedbackError: {
    backgroundColor: '#fee9ea',
    borderWidth: 1,
    borderColor: '#f1c1c5',
  },
  feedbackSuccess: {
    backgroundColor: '#e8f7e7',
    borderWidth: 1,
    borderColor: '#9dd7a8',
  },
  feedbackText: {
    fontFamily: F.bodyMed,
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackTextError: { color: '#dd0000' },
  feedbackTextSuccess: { color: '#008000' },
  ctaWrap: {
    marginTop: 24,
    borderRadius: 999,
    overflow: 'hidden',
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
  loginHint: {
    marginTop: 20,
    textAlign: 'center',
    fontFamily: F.bodyMed,
    fontSize: 15,
    color: C.onSurfaceVariant,
  },
  loginLink: {
    fontFamily: F.bodyBold,
    color: '#0000dd',
  },
  loginLinkTop: {
    fontFamily: F.bodyBold,
    color: '#006666',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 26,
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
  devHint: {
    marginTop: 22,
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
