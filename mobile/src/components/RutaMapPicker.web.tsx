import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { reverseGeocode } from '../services/geocoding';
import { C, F } from '../theme/buscaliTheme';
import type { MapaPaso } from './RutaMapPicker.shared';

type Props = {
  paso: MapaPaso;
  origen: { latitude: number; longitude: number };
  destino: { latitude: number; longitude: number };
  onOrigenChange: (address: string, lat: number, lng: number) => void;
  onDestinoChange: (address: string, lat: number, lng: number) => void;
  onConfirmarOrigen?: () => void;
};

/**
 * Vista web: sin react-native-maps (no soportado en bundle web).
 * Ofrece texto informativo y sincroniza direcciones vía geocodificación si hay clave.
 */
export default function RutaMapPicker({
  paso,
  origen,
  destino,
  onOrigenChange,
  onDestinoChange,
  onConfirmarOrigen,
}: Props) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { latitude: lat, longitude: lng } = origen;
      onOrigenChange('', lat, lng);
      const address = await reverseGeocode(lat, lng);
      if (!cancelled) onOrigenChange(address, lat, lng);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (paso !== 'destino') return;
    let cancelled = false;
    (async () => {
      const { latitude, longitude } = destino;
      onDestinoChange('', latitude, longitude);
      const address = await reverseGeocode(latitude, longitude);
      if (!cancelled) onDestinoChange(address, latitude, longitude);
    })();
    return () => {
      cancelled = true;
    };
  }, [paso, destino.latitude, destino.longitude, onDestinoChange]);

  return (
    <View style={styles.wrap}>
      <View style={styles.panel}>
        <MaterialIcons name="map" size={40} color={C.primary} />
        <Text style={styles.title}>Mapa en la app móvil</Text>
        <Text style={styles.body}>
          En el navegador no se carga el mapa nativo. Usa Android, iOS o el emulador para arrastrar
          los pins. Aquí puedes seguir editando origen y destino en los campos de texto.
        </Text>
        <Text style={styles.coords}>
          Origen: {origen.latitude.toFixed(4)}, {origen.longitude.toFixed(4)}
          {'\n'}
          {paso === 'destino'
            ? `Destino: ${destino.latitude.toFixed(4)}, ${destino.longitude.toFixed(4)}`
            : 'Confirma el origen para fijar destino.'}
        </Text>
        {paso === 'origen' && onConfirmarOrigen ? (
          <TouchableOpacity style={styles.confirm} onPress={onConfirmarOrigen} activeOpacity={0.85}>
            <Text style={styles.confirmText}>Confirmar origen</Text>
            <MaterialIcons name="arrow-forward" size={22} color={C.onPrimary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 340,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: C.surfaceContainerHigh,
    justifyContent: 'center',
  },
  panel: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: F.headlineMed,
    fontSize: 18,
    color: C.onSurface,
    textAlign: 'center',
  },
  body: {
    fontFamily: F.bodyMed,
    fontSize: 14,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  coords: {
    fontFamily: F.body,
    fontSize: 12,
    color: C.outline,
    textAlign: 'center',
  },
  confirm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 8,
  },
  confirmText: {
    fontFamily: F.headlineMed,
    fontSize: 16,
    color: C.onPrimary,
  },
});
