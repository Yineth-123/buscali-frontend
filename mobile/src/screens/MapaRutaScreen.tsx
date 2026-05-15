import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import type { LatLng } from 'react-native-maps';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types/navigation';
import { fetchPuntosAcceso, type PuntosAcceso } from '../services/routeService';
import { C, F } from '../theme/buscaliTheme';
import { MaterialIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AppStackParamList, 'MapaRuta'>;

const hasGoogleMapsKey = !!(
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY &&
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY.length > 0
);

function lineStringToLatLng(
  line: PuntosAcceso['coordenadas'],
): LatLng[] {
  return line.coordinates.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));
}

/** Reduce puntos solo para `fitToCoordinates` (polilíneas enormes). */
function sampleCoordsForFit(coords: LatLng[], maxPoints: number): LatLng[] {
  if (coords.length <= maxPoints) return coords;
  const step = Math.ceil(coords.length / maxPoints);
  const out: LatLng[] = [];
  for (let i = 0; i < coords.length; i += step) {
    out.push(coords[i]);
  }
  const last = coords[coords.length - 1];
  const prev = out[out.length - 1];
  if (prev.latitude !== last.latitude || prev.longitude !== last.longitude) {
    out.push(last);
  }
  return out;
}

function hexStrokeColor(hex: string | undefined, fallback: string): string {
  if (!hex || typeof hex !== 'string') return fallback;
  const t = hex.trim();
  return /^#[0-9A-Fa-f]{6}$/.test(t) ? t : fallback;
}

/** Longitudes acumuladas aproximadas (plano lat/lng) para recorrer la polilínea a velocidad uniforme. */
function longitudesAcumuladas(coords: LatLng[]): number[] {
  const cum: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1];
    const b = coords[i];
    const dx = b.longitude - a.longitude;
    const dy = b.latitude - a.latitude;
    cum.push(cum[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  return cum;
}

/** Punto en la polilínea con `progreso` entre 0 (inicio) y 1 (fin). */
function puntoEnPolilinea(
  coords: LatLng[],
  cum: number[],
  progreso: number,
): LatLng {
  if (coords.length === 0) {
    return { latitude: 0, longitude: 0 };
  }
  if (coords.length === 1) return coords[0];
  const total = cum[cum.length - 1];
  if (total <= 0) return coords[0];
  const fraccion = progreso - Math.floor(progreso);
  const objetivo = fraccion * total;
  let i = 0;
  while (i < cum.length - 1 && cum[i + 1] < objetivo) i += 1;
  const inicio = cum[i];
  const fin = cum[i + 1];
  const u = fin > inicio ? (objetivo - inicio) / (fin - inicio) : 0;
  const a = coords[i];
  const b = coords[i + 1];
  return {
    latitude: a.latitude + u * (b.latitude - a.latitude),
    longitude: a.longitude + u * (b.longitude - a.longitude),
  };
}

/** Marcador con una sola palabra encima; el ancla queda en la base del punto. */
function PinEtiquetado({
  coordinate,
  etiqueta,
  color,
  zIndex,
}: {
  coordinate: LatLng;
  etiqueta: string;
  color: string;
  zIndex: number;
}) {
  const appleSinGoogle = Platform.OS === 'ios' && !hasGoogleMapsKey;
  const [puedeCongelarVista, setPuedeCongelarVista] = useState(false);
  useEffect(() => {
    if (appleSinGoogle) return;
    const delay = Platform.OS === 'ios' ? 1400 : 900;
    const id = setTimeout(() => setPuedeCongelarVista(true), delay);
    return () => clearTimeout(id);
  }, [appleSinGoogle]);

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={!puedeCongelarVista}
      zIndex={zIndex}
    >
      <View style={styles.pinColumn} collapsable={false}>
        <View style={styles.pinLabelBubble} collapsable={false}>
          <Text style={styles.pinLabelText} numberOfLines={1}>
            {etiqueta}
          </Text>
        </View>
        <View
          style={[styles.pinDot, { backgroundColor: color }]}
          collapsable={false}
        />
      </View>
    </Marker>
  );
}

const MAP_SLOT_BASE_PX = 340;
const MAP_SLOT_ALTO_FACTOR = 1.8;

export default function MapaRutaScreen({ route }: Props) {
  const { height: altoVentana } = useWindowDimensions();
  const alturaMapa = Math.min(
    Math.round(MAP_SLOT_BASE_PX * MAP_SLOT_ALTO_FACTOR),
    Math.round(altoVentana * 0.88),
  );
  const estiloMapaSlot = [styles.mapSlot, { height: alturaMapa }];
  const { origen, destino, rutaNombre, rutaId, origenCoord, destinoCoord } =
    route.params;

  const [loading, setLoading] = useState(true);
  const [puntos, setPuntos] = useState<PuntosAcceso | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setPuntos(null);
      const res = await fetchPuntosAcceso(
        rutaId,
        origenCoord.latitude,
        origenCoord.longitude,
        destinoCoord.latitude,
        destinoCoord.longitude,
      );
      if (cancelled) return;
      setLoading(false);
      if (!res.ok) {
        Alert.alert('Paradas del recorrido', res.error);
        return;
      }
      const d = res.data;
      if (
        !d.coordenadas?.coordinates ||
        d.coordenadas.coordinates.length < 2
      ) {
        Alert.alert(
          'Paradas del recorrido',
          'La ruta no incluye un trazado válido para mostrar en el mapa.',
        );
        return;
      }
      setPuntos(d);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    rutaId,
    origenCoord.latitude,
    origenCoord.longitude,
    destinoCoord.latitude,
    destinoCoord.longitude,
  ]);

  const encuadrarMapa = useCallback(() => {
    if (!puntos || !mapRef.current) return;
    const line = lineStringToLatLng(puntos.coordenadas);
    const lineFit = sampleCoordsForFit(line, 120);
    const sub: LatLng = {
      latitude: puntos.parada_subida.latitud,
      longitude: puntos.parada_subida.longitud,
    };
    const baj: LatLng = {
      latitude: puntos.parada_bajada.latitud,
      longitude: puntos.parada_bajada.longitud,
    };
    const o: LatLng = {
      latitude: origenCoord.latitude,
      longitude: origenCoord.longitude,
    };
    const d: LatLng = {
      latitude: destinoCoord.latitude,
      longitude: destinoCoord.longitude,
    };
    mapRef.current.fitToCoordinates([...lineFit, sub, baj, o, d], {
      edgePadding: { top: 70, right: 44, bottom: 100, left: 44 },
      animated: true,
    });
  }, [puntos, origenCoord, destinoCoord]);

  useEffect(() => {
    if (!puntos || Platform.OS === 'web') return;
    const t = setTimeout(() => encuadrarMapa(), 450);
    return () => clearTimeout(t);
  }, [puntos, encuadrarMapa]);

  const mapProvider =
    Platform.OS === 'ios' && !hasGoogleMapsKey ? undefined : PROVIDER_GOOGLE;

  const lineCoords = useMemo(
    () => (puntos ? lineStringToLatLng(puntos.coordenadas) : []),
    [puntos],
  );

  const [busCoord, setBusCoord] = useState<LatLng | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' || lineCoords.length < 2) {
      setBusCoord(null);
      return;
    }
    const cum = longitudesAcumuladas(lineCoords);
    let progreso = 0;
    let direccion = 1;
    setBusCoord(puntoEnPolilinea(lineCoords, cum, 0));

    const MS = 70;
    const avance = 0.0065;

    const id = setInterval(() => {
      progreso += avance * direccion;
      if (progreso >= 1) {
        progreso = 1;
        direccion = -1;
      } else if (progreso <= 0) {
        progreso = 0;
        direccion = 1;
      }
      setBusCoord(puntoEnPolilinea(lineCoords, cum, progreso));
    }, MS);

    return () => clearInterval(id);
  }, [lineCoords]);

  const strokeColor = puntos
    ? hexStrokeColor(puntos.colorhex, C.primary)
    : C.primary;

  const subCoord: LatLng | null = puntos
    ? {
        latitude: puntos.parada_subida.latitud,
        longitude: puntos.parada_subida.longitud,
      }
    : null;
  const bajCoord: LatLng | null = puntos
    ? {
        latitude: puntos.parada_bajada.latitud,
        longitude: puntos.parada_bajada.longitud,
      }
    : null;

  const coordsAcercamiento: LatLng[] =
    subCoord && origenCoord
      ? [
          {
            latitude: origenCoord.latitude,
            longitude: origenCoord.longitude,
          },
          subCoord,
        ]
      : [];
  const coordsTramoFinal: LatLng[] =
    bajCoord && destinoCoord
      ? [
          bajCoord,
          {
            latitude: destinoCoord.latitude,
            longitude: destinoCoord.longitude,
          },
        ]
      : [];

  const initialRegion =
    lineCoords.length > 0
      ? {
          latitude: lineCoords[0].latitude,
          longitude: lineCoords[0].longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }
      : {
          latitude: origenCoord.latitude,
          longitude: origenCoord.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        };

  return (
    <View style={styles.root}>
      {Platform.OS === 'web' ? (
        <View style={styles.webBanner}>
          <Text style={styles.webBannerText}>
            El mapa interactivo con el recorrido está disponible en la app en
            iOS o Android (Expo Go / build nativo).
          </Text>
        </View>
      ) : loading ? (
        <View style={estiloMapaSlot}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : puntos ? (
        <View style={estiloMapaSlot}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={mapProvider}
            initialRegion={initialRegion}
            showsUserLocation={false}
            rotateEnabled
          >
            <Polyline
              coordinates={lineCoords}
              strokeColor={strokeColor}
              strokeWidth={5}
              lineJoin="round"
              lineCap="round"
              zIndex={1}
            />
            {coordsAcercamiento.length === 2 ? (
              <Polyline
                coordinates={coordsAcercamiento}
                strokeColor={C.outline}
                strokeWidth={3}
                lineDashPattern={[12, 10]}
                lineJoin="round"
                lineCap="round"
                zIndex={2}
              />
            ) : null}
            {coordsTramoFinal.length === 2 ? (
              <Polyline
                coordinates={coordsTramoFinal}
                strokeColor={C.outline}
                strokeWidth={3}
                lineDashPattern={[12, 10]}
                lineJoin="round"
                lineCap="round"
                zIndex={2}
              />
            ) : null}
            <PinEtiquetado
              coordinate={origenCoord}
              etiqueta="Partida"
              color="#2e7d32"
              zIndex={30}
            />
            <PinEtiquetado
              coordinate={destinoCoord}
              etiqueta="Destino"
              color="#c62828"
              zIndex={33}
            />
            {subCoord ? (
              <PinEtiquetado
                coordinate={subCoord}
                etiqueta="Subir"
                color="#1565c0"
                zIndex={31}
              />
            ) : null}
            {bajCoord ? (
              <PinEtiquetado
                coordinate={bajCoord}
                etiqueta="Bajar"
                color="#6a1b9a"
                zIndex={32}
              />
            ) : null}
            {busCoord ? (
              <Marker
                coordinate={busCoord}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={50}
                tracksViewChanges
                accessibilityLabel="Bus en recorrido"
              >
                <View style={styles.busMarkerWrap} collapsable={false}>
                  <Text style={styles.busEmoji} allowFontScaling={false}>
                    🚌
                  </Text>
                </View>
              </Marker>
            ) : null}
          </MapView>
          <TouchableOpacity
            style={styles.fitFab}
            onPress={encuadrarMapa}
            accessibilityLabel="Encuadrar mapa"
            activeOpacity={0.85}
          >
            <MaterialIcons name="fit-screen" size={24} color={C.primary} />
          </TouchableOpacity>
          <View style={styles.mapLeyenda} pointerEvents="none">
            <Text style={styles.mapLeyendaTitle}>Leyenda</Text>
            <Text style={styles.mapLeyendaLine}>Sólida: recorrido del bus</Text>
            <Text style={styles.mapLeyendaLine}>
              Punteada: Partida→Subir y Bajar→Destino
            </Text>
            <Text style={styles.mapLeyendaLine}>🚌 ida y vuelta sobre la ruta</Text>
          </View>
        </View>
      ) : (
        <View style={estiloMapaSlot} />
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Tu ruta</Text>
        <Text style={styles.line}>Ruta: {rutaNombre}</Text>
        <Text style={styles.line}>Origen: {origen}</Text>
        <Text style={styles.line}>Destino: {destino}</Text>

        <Text style={styles.section}>Paradas sugeridas</Text>
        <Text style={styles.hint}>
          Las líneas punteadas unen tu partida con el punto para subir, y el punto
          para bajar con tu destino. Cada pin muestra una sola palabra encima.
        </Text>

        {loading && Platform.OS !== 'web' ? (
          <ActivityIndicator style={styles.loader} color={C.primary} />
        ) : null}

        {puntos ? (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Subir al bus</Text>
              <Text style={styles.cardLine}>
                ~{puntos.parada_subida.distancia_desde_referencia_m} m desde tu
                punto de partida
              </Text>
              <Text style={styles.coord}>
                Lat {puntos.parada_subida.latitud.toFixed(5)}, Lng{' '}
                {puntos.parada_subida.longitud.toFixed(5)}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Bajar del bus</Text>
              <Text style={styles.cardLine}>
                ~{puntos.parada_bajada.distancia_desde_referencia_m} m desde tu
                punto de llegada
              </Text>
              <Text style={styles.coord}>
                Lat {puntos.parada_bajada.latitud.toFixed(5)}, Lng{' '}
                {puntos.parada_bajada.longitud.toFixed(5)}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surface },
  mapSlot: {
    flexShrink: 0,
    borderBottomWidth: 1,
    borderBottomColor: `${C.outlineVariant}66`,
    backgroundColor: C.surfaceContainerHigh,
  },
  map: { ...StyleSheet.absoluteFillObject },
  mapLeyenda: {
    position: 'absolute',
    left: 10,
    top: 10,
    maxWidth: '72%',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 12,
    padding: 10,
  },
  mapLeyendaTitle: {
    fontFamily: F.bodyBold,
    fontSize: 12,
    color: C.onSurface,
    marginBottom: 4,
  },
  mapLeyendaLine: {
    fontFamily: F.body,
    fontSize: 10,
    color: C.onSurfaceVariant,
    lineHeight: 14,
  },
  fitFab: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  webBanner: {
    padding: 16,
    backgroundColor: C.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: `${C.outlineVariant}66`,
  },
  webBannerText: {
    fontFamily: F.bodyMed,
    fontSize: 13,
    color: C.onSurfaceVariant,
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  container: {
    padding: 20,
    paddingBottom: 40,
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
    fontSize: 16,
    color: C.onSurface,
  },
  hint: {
    marginTop: 8,
    fontFamily: F.body,
    fontSize: 13,
    color: C.outline,
    lineHeight: 18,
  },
  loader: { marginTop: 24 },
  card: {
    marginTop: 14,
    padding: 16,
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${C.outlineVariant}44`,
  },
  cardTitle: {
    fontFamily: F.bodyBold,
    fontSize: 15,
    color: C.primary,
    marginBottom: 6,
  },
  cardLine: {
    fontFamily: F.bodyMed,
    fontSize: 14,
    color: C.onSurface,
  },
  coord: {
    marginTop: 8,
    fontFamily: F.body,
    fontSize: 13,
    color: C.onSurfaceVariant,
  },
  pinColumn: {
    alignItems: 'center',
    alignSelf: 'center',
    minHeight: 40,
    minWidth: 24,
  },
  pinLabelBubble: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${C.outlineVariant}99`,
    marginBottom: 4,
    maxWidth: 120,
  },
  pinLabelText: {
    fontFamily: F.bodyBold,
    fontSize: 11,
    color: C.onSurface,
    textAlign: 'center',
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: C.surfaceContainerLowest,
  },
  busMarkerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  busEmoji: {
    fontSize: 30,
    lineHeight: 34,
    textAlign: 'center',
  },
});
