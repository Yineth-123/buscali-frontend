import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { reverseGeocode, streetViewUrl } from '../services/geocoding';
import { C, F } from '../theme/buscaliTheme';
import type { MapaPaso } from './RutaMapPicker.shared';

const DEFAULT_LAT = 3.4516;
const DEFAULT_LNG = -76.532;

const DEFAULT_REGION = {
  latitude: DEFAULT_LAT,
  longitude: DEFAULT_LNG,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

type Props = {
  paso: MapaPaso;
  origen: { latitude: number; longitude: number };
  destino: { latitude: number; longitude: number };
  onOrigenChange: (address: string, lat: number, lng: number) => void;
  onDestinoChange: (address: string, lat: number, lng: number) => void;
  /** Botón visible en el mapa al ajustar el pin de origen (paso origen). */
  onConfirmarOrigen?: () => void;
};

const hasGoogleMapsKey = !!(
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY &&
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY.length > 0
);

export default function RutaMapPicker({
  paso,
  origen,
  destino,
  onOrigenChange,
  onDestinoChange,
  onConfirmarOrigen,
}: Props) {
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [loading, setLoading] = useState(true);
  const [geoOrigen, setGeoOrigen] = useState(false);
  const [geoDestino, setGeoDestino] = useState(false);
  const [permissionMsg, setPermissionMsg] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);
  const debounceOrigen = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceDestino = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onOrigenChangeRef = useRef(onOrigenChange);
  const onDestinoChangeRef = useRef(onDestinoChange);
  const pasoAnterior = useRef<MapaPaso>(paso);
  onOrigenChangeRef.current = onOrigenChange;
  onDestinoChangeRef.current = onDestinoChange;

  const aplicarOrigen = useCallback(async (lat: number, lng: number) => {
    onOrigenChangeRef.current('', lat, lng);
    setGeoOrigen(true);
    try {
      const address = await reverseGeocode(lat, lng);
      onOrigenChangeRef.current(address, lat, lng);
    } finally {
      setGeoOrigen(false);
    }
  }, []);

  const aplicarDestino = useCallback(async (lat: number, lng: number) => {
    onDestinoChangeRef.current('', lat, lng);
    setGeoDestino(true);
    try {
      const address = await reverseGeocode(lat, lng);
      onDestinoChangeRef.current(address, lat, lng);
    } finally {
      setGeoDestino(false);
    }
  }, []);

  const programarOrigen = useCallback(
    (lat: number, lng: number) => {
      onOrigenChangeRef.current('', lat, lng);
      if (debounceOrigen.current) clearTimeout(debounceOrigen.current);
      debounceOrigen.current = setTimeout(() => aplicarOrigen(lat, lng), 450);
    },
    [aplicarOrigen]
  );

  const programarDestino = useCallback(
    (lat: number, lng: number) => {
      onDestinoChangeRef.current('', lat, lng);
      if (debounceDestino.current) clearTimeout(debounceDestino.current);
      debounceDestino.current = setTimeout(() => aplicarDestino(lat, lng), 450);
    },
    [aplicarDestino]
  );

  /** Primera carga: GPS → origen */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== 'granted') {
          setPermissionMsg(
            'Sin permiso de ubicación se usa Cali como referencia; puedes mover el pin de origen.'
          );
          setLoading(false);
          await aplicarOrigen(DEFAULT_LAT, DEFAULT_LNG);
          setRegion({
            ...DEFAULT_REGION,
            latitude: DEFAULT_LAT,
            longitude: DEFAULT_LNG,
          });
          return;
        }
        setPermissionMsg(null);
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        const { latitude, longitude } = loc.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        });
        await aplicarOrigen(latitude, longitude);
      } catch {
        if (!cancelled) {
          setPermissionMsg('No se pudo leer el GPS. Ajusta el pin de origen en el mapa.');
          await aplicarOrigen(DEFAULT_LAT, DEFAULT_LNG);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (debounceOrigen.current) clearTimeout(debounceOrigen.current);
      if (debounceDestino.current) clearTimeout(debounceDestino.current);
    };
  }, [aplicarOrigen]);

  /** Al confirmar origen y pasar a destino: geocodificar posición inicial del pin rojo */
  useEffect(() => {
    if (pasoAnterior.current === 'origen' && paso === 'destino') {
      aplicarDestino(destino.latitude, destino.longitude);
    }
    pasoAnterior.current = paso;
  }, [paso, destino.latitude, destino.longitude, aplicarDestino]);

  /** Encuadrar ambos puntos */
  useEffect(() => {
    if (paso !== 'destino' || !mapRef.current) return;
    const t = setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        [
          { latitude: origen.latitude, longitude: origen.longitude },
          { latitude: destino.latitude, longitude: destino.longitude },
        ],
        {
          edgePadding: { top: 100, right: 50, bottom: 80, left: 50 },
          animated: true,
        }
      );
    }, 400);
    return () => clearTimeout(t);
  }, [paso, origen.latitude, origen.longitude, destino.latitude, destino.longitude]);

  const recentrarOrigen = async () => {
    if (paso !== 'origen') return;
    try {
      setLoading(true);
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const r = await Location.requestForegroundPermissionsAsync();
        if (r.status !== 'granted') {
          Alert.alert('Ubicación', 'Activa el permiso en ajustes para usar tu posición.');
          return;
        }
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
      await aplicarOrigen(latitude, longitude);
    } catch {
      Alert.alert('Ubicación', 'No se pudo obtener tu posición.');
    } finally {
      setLoading(false);
    }
  };

  const encuadrarRuta = () => {
    mapRef.current?.fitToCoordinates(
      [
        { latitude: origen.latitude, longitude: origen.longitude },
        { latitude: destino.latitude, longitude: destino.longitude },
      ],
      { edgePadding: { top: 100, right: 50, bottom: 80, left: 50 }, animated: true }
    );
  };

  const abrirStreetView = () => {
    const t = paso === 'destino' ? destino : origen;
    Linking.openURL(streetViewUrl(t.latitude, t.longitude)).catch(() => {});
  };

  const mapProvider =
    Platform.OS === 'ios' && !hasGoogleMapsKey ? undefined : PROVIDER_GOOGLE;

  return (
    <View style={styles.wrap}>
      {loading && paso === 'origen' ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingTxt}>Obteniendo ubicación…</Text>
        </View>
      ) : null}

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={mapProvider}
        region={region}
        onRegionChangeComplete={(r) => setRegion(r)}
        showsUserLocation={paso === 'origen'}
        showsMyLocationButton={false}
      >
        <Marker
          coordinate={origen}
          pinColor="green"
          draggable={paso === 'origen'}
          title="Origen"
          description="Arrastra para ajustar"
          onDragEnd={(e) => {
            const c = e.nativeEvent.coordinate;
            programarOrigen(c.latitude, c.longitude);
            setRegion((prev) => ({
              ...prev,
              latitude: c.latitude,
              longitude: c.longitude,
            }));
          }}
        />
        {paso === 'destino' ? (
          <Marker
            coordinate={destino}
            pinColor="red"
            draggable
            title="Destino"
            description="Arrastra el pin rojo"
            onDragEnd={(e) => {
              const c = e.nativeEvent.coordinate;
              programarDestino(c.latitude, c.longitude);
            }}
          />
        ) : null}
      </MapView>

      <View style={styles.bottomBar} pointerEvents="box-none">
        {paso === 'origen' && onConfirmarOrigen ? (
          <TouchableOpacity
            style={styles.confirmOrigen}
            onPress={onConfirmarOrigen}
            accessibilityLabel="Confirmar origen y elegir destino"
            activeOpacity={0.85}
          >
            <Text style={styles.confirmOrigenText}>Confirmar origen</Text>
            <MaterialIcons name="arrow-forward" size={22} color={C.onPrimary} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.svBtn} onPress={abrirStreetView}>
            <MaterialIcons name="explore" size={22} color={C.onSurface} />
            <Text style={styles.svBtnText}>Street View</Text>
          </TouchableOpacity>
          {paso === 'origen' ? (
            <TouchableOpacity
              style={styles.myLocBtn}
              onPress={recentrarOrigen}
              accessibilityLabel="Mi ubicación"
            >
              <MaterialIcons name="my-location" size={26} color={C.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.myLocBtn} onPress={encuadrarRuta}>
              <MaterialIcons name="fit-screen" size={24} color={C.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.leyenda}>
        <View style={styles.leyendaRow}>
          <View style={[styles.dot, { backgroundColor: '#2e7d32' }]} />
          <Text style={styles.leyendaTxt}>Origen</Text>
        </View>
        {paso === 'destino' ? (
          <View style={styles.leyendaRow}>
            <View style={[styles.dot, { backgroundColor: '#c62828' }]} />
            <Text style={styles.leyendaTxt}>Destino</Text>
          </View>
        ) : null}
      </View>

      {permissionMsg ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{permissionMsg}</Text>
        </View>
      ) : null}
      {(geoOrigen || geoDestino) && (
        <View style={styles.geoTag}>
          <ActivityIndicator size="small" color={C.primary} />
          <Text style={styles.geoTagText}> Buscando dirección…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 340,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: C.surfaceContainerHigh,
  },
  map: { ...StyleSheet.absoluteFillObject },
  loadingBox: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(225,251,255,0.85)',
  },
  loadingTxt: { marginTop: 8, fontFamily: F.bodyMed, color: C.onSurfaceVariant },
  bottomBar: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    gap: 10,
  },
  confirmOrigen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  confirmOrigenText: {
    fontFamily: F.headlineMed,
    fontSize: 16,
    color: C.onPrimary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  myLocBtn: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 28,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  svBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
  },
  svBtnText: { fontFamily: F.bodyBold, fontSize: 12, color: C.onSurface },
  leyenda: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 8,
    gap: 6,
  },
  leyendaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  leyendaTxt: { fontFamily: F.bodyMed, fontSize: 12, color: C.onSurface },
  banner: {
    position: 'absolute',
    top: 52,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 8,
    borderRadius: 10,
  },
  bannerText: { fontFamily: F.body, fontSize: 11, color: C.onSurfaceVariant },
  geoTag: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  geoTagText: { fontFamily: F.bodyMed, fontSize: 12, color: C.onSurface },
});
