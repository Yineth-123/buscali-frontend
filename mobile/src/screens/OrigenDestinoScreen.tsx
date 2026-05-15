import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types/navigation';
import { buscarRutas } from '../services/routeService';
import { C, F } from '../theme/buscaliTheme';
import RutaMapPicker from '../components/RutaMapPicker';
import {
  offsetDestinoDesdeOrigen,
  type MapaPaso,
} from '../components/RutaMapPicker.shared';

const DEFAULT_COORD = { latitude: 3.4516, longitude: -76.532 };

type Props = NativeStackScreenProps<AppStackParamList, 'PlanearRuta'>;

export default function OrigenDestinoScreen({ navigation }: Props) {
  const [paso, setPaso] = useState<MapaPaso>('origen');
  const [origenCoord, setOrigenCoord] = useState(DEFAULT_COORD);
  const [destinoCoord, setDestinoCoord] = useState(() =>
    offsetDestinoDesdeOrigen(DEFAULT_COORD.latitude, DEFAULT_COORD.longitude)
  );
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [loading, setLoading] = useState(false);

  const onOrigenChange = useCallback((address: string, lat: number, lng: number) => {
    setOrigenCoord({ latitude: lat, longitude: lng });
    if (address.trim()) setOrigen(address);
  }, []);

  const onDestinoChange = useCallback((address: string, lat: number, lng: number) => {
    setDestinoCoord({ latitude: lat, longitude: lng });
    if (address.trim()) setDestino(address);
  }, []);

  const confirmarOrigen = () => {
    const off = offsetDestinoDesdeOrigen(origenCoord.latitude, origenCoord.longitude);
    setDestinoCoord(off);
    setDestino('');
    setPaso('destino');
  };

  const handleBuscar = async () => {
    if (paso !== 'destino' || !origen.trim() || !destino.trim()) {
      return;
    }
    try {
      setLoading(true);
      const response = await buscarRutas(
        origen,
        destino,
        origenCoord.latitude,
        origenCoord.longitude,
        destinoCoord.latitude,
        destinoCoord.longitude,
      );
      if (!response.success) {
        Alert.alert('Buscar ruta', response.error ?? 'No se pudo obtener sugerencias.');
        return;
      }
      navigation.navigate('ListaRutas', {
        origen,
        destino,
        origenCoord: { ...origenCoord },
        destinoCoord: { ...destinoCoord },
        rutas: response.rutas,
      });
    } catch (error) {
      console.log('error consultando rutas', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Planear ruta</Text>
        <Text style={styles.hint}>
          {paso === 'origen'
            ? 'Ajusta el pin verde (origen). Luego confirma para colocar el destino con el pin rojo.'
            : 'Arrastra el pin rojo al destino. Puedes editar las direcciones abajo y buscar la ruta.'}
        </Text>

        <Text style={styles.sectionLabel}>
          {paso === 'origen' ? 'Origen en el mapa' : 'Origen y destino en el mapa'}
        </Text>
        <RutaMapPicker
          paso={paso}
          origen={origenCoord}
          destino={destinoCoord}
          onOrigenChange={onOrigenChange}
          onDestinoChange={onDestinoChange}
        />

        <Text style={styles.sectionLabel}>Origen (puedes editar el texto)</Text>
        <TextInput
          placeholder="Dirección de origen"
          placeholderTextColor={`${C.outline}99`}
          value={origen}
          onChangeText={setOrigen}
          style={styles.input}
        />

        <Text style={styles.sectionLabel}>Destino</Text>
        <TextInput
          placeholder={
            paso === 'origen'
              ? 'Confirma el origen para elegir destino en el mapa'
              : 'Dirección de destino'
          }
          placeholderTextColor={`${C.outline}99`}
          value={destino}
          onChangeText={setDestino}
          style={[styles.input, paso === 'origen' && styles.inputDisabled]}
          editable={paso === 'destino'}
        />

        {paso === 'origen' ? (
          <TouchableOpacity style={styles.buttonSecondary} onPress={confirmarOrigen}>
            <Text style={styles.buttonSecondaryText}>Confirmar origen</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleBuscar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={C.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>Buscar ruta</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.surface,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontFamily: F.headline,
    fontSize: 26,
    marginBottom: 8,
    textAlign: 'center',
    color: C.onSurface,
  },
  hint: {
    fontFamily: F.bodyMed,
    fontSize: 14,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  sectionLabel: {
    fontFamily: F.bodyBold,
    fontSize: 13,
    color: C.primary,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: C.outlineVariant,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: F.body,
    color: C.onSurface,
    backgroundColor: C.surfaceContainerLowest,
  },
  inputDisabled: {
    opacity: 0.55,
  },
  button: {
    backgroundColor: C.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonSecondary: {
    backgroundColor: C.surfaceContainerHigh,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: C.outlineVariant,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: C.onPrimary,
    fontFamily: F.headlineMed,
    fontSize: 16,
  },
  buttonSecondaryText: {
    color: C.primary,
    fontFamily: F.headlineMed,
    fontSize: 16,
  },
});
