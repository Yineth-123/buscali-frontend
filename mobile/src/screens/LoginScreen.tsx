import { useState } from 'react';

import {

  View,

  Text,

  TouchableOpacity,

  StyleSheet,

  KeyboardAvoidingView,

  Platform,

  Alert,

  ScrollView,

  Pressable,

  ActivityIndicator,

} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { MaterialIcons, AntDesign, Ionicons } from '@expo/vector-icons';

import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '../types/navigation';

import { getApiBaseUrl } from '../config/api';

import { iniciarSesion } from '../services/usuariosApi';
import { useAuth } from '../context/AuthContext';
import { C, F } from '../theme/buscaliTheme';

import BusCaliTextField from '../components/BusCaliTextField';



type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;



export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [identificador, setIdentificador] = useState('');

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);



  const handleLogin = async () => {

    const id = identificador.trim();

    if (!id) {

      Alert.alert('Validación', 'Ingresa tu correo o teléfono.');

      return;

    }

    if (!password) {

      Alert.alert('Validación', 'Ingresa tu contraseña.');

      return;

    }



    try {

      setLoading(true);

      const user = await iniciarSesion({ identificador: id, password });
      signIn(user);

    } catch (e) {

      const message = e instanceof Error ? e.message : 'No se pudo iniciar sesión';

      Alert.alert('Inicio de sesión', message);

    } finally {

      setLoading(false);

    }

  };



  const socialSoon = () =>

    Alert.alert('Próximamente', 'El acceso con Google o Apple se configurará más adelante.');



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

        <View style={styles.blobTop} />

        <View style={styles.blobBottom} />



        <View style={styles.inner}>

          <View style={styles.brandBlock}>

            <Text style={styles.brandTitle}>BUSCALI</Text>

            <View style={styles.brandBar} />

          </View>



          <View style={styles.glassCard}>

            <Text style={styles.welcomeTitle}>Bienvenido de nuevo</Text>

            <Text style={styles.welcomeSub}>Siente el ritmo de la ciudad.</Text>



            <BusCaliTextField

              label="Correo o teléfono"

              icon="mail-outline"

              placeholder="correo@ejemplo.com o 3001234567"

              value={identificador}

              onChangeText={setIdentificador}

              autoCapitalize="none"

              keyboardType="default"

              containerStyle={styles.fieldGap}

            />



            <View style={styles.pwdHeader}>

              <Text style={styles.pwdLabel}>Contraseña</Text>

              <Pressable

                onPress={() =>

                  Alert.alert('Recuperar contraseña', 'Esta función estará disponible pronto.')

                }

              >

                <Text style={styles.forgot}>Olvidé mi contraseña</Text>

              </Pressable>

            </View>

            <BusCaliTextField

              label=""

              icon="lock-outline"

              placeholder="••••••••"

              value={password}

              onChangeText={setPassword}

              secureTextEntry

              containerStyle={styles.fieldTight}

            />



            <TouchableOpacity

              activeOpacity={0.92}

              onPress={handleLogin}

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

                    <Text style={styles.ctaText}>Iniciar sesión</Text>

                    <MaterialIcons name="arrow-forward" size={22} color={C.onSecondaryContainer} />

                  </>

                )}

              </LinearGradient>

            </TouchableOpacity>



            <View style={styles.dividerRow}>

              <View style={styles.dividerLine} />

              <Text style={styles.dividerText}>O continúa con</Text>

              <View style={styles.dividerLine} />

            </View>



            <View style={styles.socialRow}>

              <TouchableOpacity style={styles.socialBtn} onPress={socialSoon}>

                <AntDesign name="google" size={22} color={C.onSurface} />

              </TouchableOpacity>

              <TouchableOpacity style={styles.socialBtn} onPress={socialSoon}>

                <Ionicons name="logo-apple" size={26} color={C.onSurface} />

              </TouchableOpacity>

            </View>

          </View>



          <Text style={styles.footer}>

            ¿No tienes cuenta?{' '}

            <Text style={styles.footerLink} onPress={() => navigation.navigate('Register')}>

              Regístrate

            </Text>

          </Text>



          {__DEV__ ? (

            <Text style={styles.devHint} numberOfLines={2}>

              API: {getApiBaseUrl()}

            </Text>

          ) : null}

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

    flexGrow: 1,

    paddingHorizontal: 24,

    paddingTop: 16,

    paddingBottom: 40,

  },

  blobTop: {

    position: 'absolute',

    top: -80,

    left: -60,

    width: 260,

    height: 260,

    borderRadius: 200,

    backgroundColor: C.surfaceContainerHigh,

    opacity: 0.55,

  },

  blobBottom: {

    position: 'absolute',

    bottom: 40,

    right: -40,

    width: 220,

    height: 220,

    borderRadius: 200,

    backgroundColor: C.primaryContainer,

    opacity: 0.35,

  },

  inner: { flex: 1, zIndex: 1 },

  brandBlock: { marginBottom: 28, marginTop: 8 },

  brandTitle: {

    fontFamily: F.headline,

    fontSize: 40,

    letterSpacing: -1,

    color: C.primary,

    fontStyle: 'italic',

  },

  brandBar: {

    width: 88,

    height: 5,

    borderRadius: 3,

    backgroundColor: C.secondaryContainer,

    marginTop: 6,

  },

  glassCard: {

    backgroundColor: 'rgba(255,255,255,0.72)',

    borderRadius: 32,

    padding: 28,

    borderWidth: 1,

    borderColor: 'rgba(71, 127, 134, 0.12)',

    shadowColor: '#003439',

    shadowOffset: { width: 0, height: 16 },

    shadowOpacity: 0.1,

    shadowRadius: 32,

    elevation: 8,

  },

  welcomeTitle: {

    fontFamily: F.headline,

    fontSize: 26,

    color: C.onSurface,

    marginBottom: 4,

  },

  welcomeSub: {

    fontFamily: F.bodyMed,

    fontSize: 15,

    color: C.onSurfaceVariant,

    marginBottom: 22,

  },

  fieldGap: { marginBottom: 4 },

  fieldTight: { marginTop: -6, marginBottom: 8 },

  pwdHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 8,

    marginTop: 12,

    paddingHorizontal: 4,

  },

  pwdLabel: {

    fontFamily: F.bodyBold,

    fontSize: 13,

    color: C.onSurfaceVariant,

  },

  forgot: {

    fontFamily: F.bodyBold,

    fontSize: 11,

    color: C.primary,

  },

  ctaWrap: { marginTop: 16, borderRadius: 18, overflow: 'hidden' },

  ctaDisabled: { opacity: 0.85 },

  ctaGrad: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 10,

    paddingVertical: 18,

  },

  ctaText: {

    fontFamily: F.headlineMed,

    fontSize: 17,

    color: C.onSecondaryContainer,

  },

  dividerRow: {

    flexDirection: 'row',

    alignItems: 'center',

    marginVertical: 26,

    gap: 10,

  },

  dividerLine: { flex: 1, height: 1, backgroundColor: `${C.outlineVariant}44` },

  dividerText: {

    fontFamily: F.bodyBold,

    fontSize: 10,

    letterSpacing: 1.2,

    color: C.outline,

    textTransform: 'uppercase',

  },

  socialRow: { flexDirection: 'row', gap: 12 },

  socialBtn: {

    flex: 1,

    height: 52,

    borderRadius: 14,

    backgroundColor: C.surfaceContainerLow,

    alignItems: 'center',

    justifyContent: 'center',

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

    marginTop: 20,

    textAlign: 'center',

    fontSize: 10,

    color: C.outline,

    fontFamily: F.body,

  },

});

