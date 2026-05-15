import { getApiBaseUrl } from '../config/api';

export type RutaBusquedaItem = {
  id: string;
  nombre: string;
  proximidad_m?: number;
};

type ApiSugerirOk = {
  status: string;
  data?: Array<{
    id_ruta: string;
    nombre_ruta: string;
    proximidad_total_m: number;
  }>;
};

type ApiSugerirErr = {
  status?: string;
  message?: string;
  errors?: string[];
};

/**
 * Sugiere rutas óptimas según cercanía del origen y destino del usuario al LINESTRING de cada ruta (backend PostGIS).
 */
export const buscarRutas = async (
  _origen: string,
  _destino: string,
  origenLat: number,
  origenLng: number,
  destinoLat: number,
  destinoLng: number,
): Promise<{
  success: boolean;
  rutas: RutaBusquedaItem[];
  error?: string;
}> => {
  const base = getApiBaseUrl();
  const qs = new URLSearchParams({
    origenLat: String(origenLat),
    origenLng: String(origenLng),
    destinoLat: String(destinoLat),
    destinoLng: String(destinoLng),
  });
  const url = `${base}/api/v1/rutas/sugerir?${qs.toString()}`;

  try {
    const res = await fetch(url);
    const json = (await res.json()) as ApiSugerirOk & ApiSugerirErr;

    if (!res.ok || json.status !== 'success') {
      const msg =
        json.errors?.join('; ') || json.message || 'Error al consultar rutas';
      return { success: false, rutas: [], error: msg };
    }

    const rows = json.data ?? [];
    return {
      success: true,
      rutas: rows.map((r) => ({
        id: r.id_ruta,
        nombre: r.nombre_ruta,
        proximidad_m: r.proximidad_total_m,
      })),
    };
  } catch (e) {
    console.log('error consultando rutas', e);
    return {
      success: false,
      rutas: [],
      error: e instanceof Error ? e.message : 'Sin conexión',
    };
  }
};

export type PuntosAcceso = {
  coordenadas: { type: 'LineString'; coordinates: [number, number][] };
  colorhex: string;
  parada_subida: {
    latitud: number;
    longitud: number;
    distancia_desde_referencia_m: number;
  };
  parada_bajada: {
    latitud: number;
    longitud: number;
    distancia_desde_referencia_m: number;
  };
};

export type FetchPuntosAccesoResult =
  | { ok: true; data: PuntosAcceso }
  | { ok: false; error: string };

type ApiPuntosOk = {
  status: string;
  data?: PuntosAcceso;
};

/**
 * Punto del recorrido (LINESTRING) más cercano al origen y al destino del usuario: subida y bajada.
 */
export async function fetchPuntosAcceso(
  rutaId: string,
  origenLat: number,
  origenLng: number,
  destinoLat: number,
  destinoLng: number,
): Promise<FetchPuntosAccesoResult> {
  const base = getApiBaseUrl();
  const qs = new URLSearchParams({
    idRuta: rutaId,
    origenLat: String(origenLat),
    origenLng: String(origenLng),
    destinoLat: String(destinoLat),
    destinoLng: String(destinoLng),
  });
  const url = `${base}/api/v1/rutas/puntos-acceso?${qs.toString()}`;

  try {
    const res = await fetch(url);
    const json = (await res.json()) as ApiPuntosOk & ApiSugerirErr;

    if (!res.ok || json.status !== 'success' || !json.data) {
      const msg =
        json.errors?.join('; ') || json.message || 'Error al obtener paradas';
      return { ok: false, error: msg };
    }
    return { ok: true, data: json.data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Sin conexión',
    };
  }
};
