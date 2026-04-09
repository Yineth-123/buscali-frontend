import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import type { AppStackParamList } from '../types/navigation';
import { C, F } from '../theme/buscaliTheme';

type Props = NativeStackScreenProps<AppStackParamList, 'Inicio'>;

export default function InicioRutasScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileBtn}
        onPress={() => navigation.navigate('Perfil')}
        accessibilityLabel="Mi cuenta"
      >
        <MaterialIcons name="account-circle" size={32} color={C.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>BusCali</Text>
      <Text style={styles.sub}>Muévete al ritmo de la ciudad</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('PlanearRuta')}
      >
        <Text style={styles.buttonText}>Ingresar origen y destino</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surface },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: C.surface,
  },
  profileBtn: {
    position: 'absolute',
    top: 8,
    right: 16,
    padding: 4,
  },
  title: {
    fontFamily: F.headline,
    fontSize: 32,
    color: C.primary,
    marginBottom: 8,
  },
  sub: {
    fontFamily: F.bodyMed,
    fontSize: 16,
    color: C.onSurfaceVariant,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: C.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  buttonText: {
    color: C.onPrimary,
    fontFamily: F.headlineMed,
    fontSize: 16,
  },
});
