import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types/navigation';
import { C, F } from '../theme/buscaliTheme';

type Props = NativeStackScreenProps<AppStackParamList, 'MapaRuta'>;

export default function MapaRutaScreen({ route }: Props) {
  const { origen, destino, rutaNombre } = route.params;

  const [busPosition, setBusPosition] = useState(0);
  const simulatedRoute = [
    { lat: 3.26, lng: -76.534 },
    { lat: 3.3, lng: -76.54 },
    { lat: 3.35, lng: -76.52 },
    { lat: 3.4516, lng: -76.532 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBusPosition((prev) =>
        prev < simulatedRoute.length - 1 ? prev + 1 : 0
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mapa de rutas</Text>
      <Text style={styles.line}>Origen: {origen}</Text>
      <Text style={styles.line}>Destino: {destino}</Text>
      <Text style={styles.line}>Ruta: {rutaNombre}</Text>
      <Text style={styles.section}>Bus en movimiento</Text>
      <Text style={styles.line}>
        Latitud: {simulatedRoute[busPosition].lat}
      </Text>
      <Text style={styles.line}>
        Longitud: {simulatedRoute[busPosition].lng}
      </Text>
      <Text style={styles.hint}>Aquí se renderizará el mapa</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: C.surface,
  },
  title: {
    fontFamily: F.headline,
    fontSize: 22,
    marginBottom: 12,
    color: C.onSurface,
  },
  line: {
    fontFamily: F.bodyMed,
    fontSize: 15,
    color: C.onSurfaceVariant,
    marginBottom: 6,
  },
  section: {
    marginTop: 20,
    fontFamily: F.bodyBold,
    color: C.onSurface,
  },
  hint: {
    marginTop: 20,
    fontFamily: F.body,
    color: C.outline,
  },
});
