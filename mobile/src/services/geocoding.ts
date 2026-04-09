/**
 * Geocodificación con Google Geocoding API (misma clave que Maps si está habilitada en Cloud Console).
 * Sin clave: solo devuelve coordenadas formateadas.
 */
const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  if (!apiKey.trim()) {
    return fallback;
  }
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}` +
      `&key=${encodeURIComponent(apiKey)}&language=es`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      status: string;
      results?: { formatted_address: string }[];
    };
    if (data.status === 'OK' && data.results?.[0]?.formatted_address) {
      return data.results[0].formatted_address;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/** Abre Street View / vista de calle en Google Maps para un punto. */
export function streetViewUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}
