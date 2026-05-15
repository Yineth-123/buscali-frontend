import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types/navigation';
import { C, F } from '../theme/buscaliTheme';

type Props = NativeStackScreenProps<AppStackParamList, 'ListaRutas'>;

export default function ListaRutasScreen({ route, navigation }: Props) {
  const { origen, destino, origenCoord, destinoCoord, rutas } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rutas disponibles</Text>
      <Text style={styles.meta}>Origen: {origen}</Text>
      <Text style={styles.meta}>Destino: {destino}</Text>
      <FlatList
        data={rutas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('MapaRuta', {
                origen,
                destino,
                rutaId: item.id,
                rutaNombre: item.nombre,
                origenCoord,
                destinoCoord,
              })
            }
          >
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            {item.proximidad_m != null ? (
              <Text style={styles.cardSub}>
                Proximidad al trayecto: ~{item.proximidad_m} m (menor es mejor)
              </Text>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: C.surface,
  },
  title: {
    fontFamily: F.headline,
    fontSize: 22,
    marginBottom: 10,
    color: C.onSurface,
  },
  meta: {
    fontFamily: F.bodyMed,
    color: C.onSurfaceVariant,
    marginBottom: 4,
  },
  card: {
    padding: 16,
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: `${C.outlineVariant}44`,
  },
  cardTitle: {
    fontFamily: F.bodySemi,
    fontSize: 16,
    color: C.onSurface,
  },
  cardSub: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.onSurfaceVariant,
    marginTop: 6,
  },
});
