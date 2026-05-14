export type MapaPaso = 'origen' | 'destino';

/** Desplazamiento inicial del destino respecto al origen (~1 km al norte) */
export function offsetDestinoDesdeOrigen(lat: number, lng: number): {
  latitude: number;
  longitude: number;
} {
  return { latitude: lat + 0.009, longitude: lng };
}
