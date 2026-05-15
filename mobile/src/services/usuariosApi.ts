import { getApiBaseUrl } from '../config/api';

const USUARIOS_V1 = '/api/v1/usuarios';

export type UsuarioPublico = {
  id: number;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  rol: string;
  createdAt: string;
  updatedAt: string;
};

type ApiSuccess<T> = {
  status: string;
  code: number;
  message: string;
  data?: T;
};

type ApiErrorBody = {
  status?: string;
  message?: string;
  errors?: string[];
};

function mapUsuarioApiToPublico(u: {
  id_usuario?: number;
  nombre?: string;
  apellido?: string;
  correo?: string | null;
  telefono?: string | null;
  fecha_registro?: string | Date;
}): UsuarioPublico {
  const created =
    u.fecha_registro != null
      ? typeof u.fecha_registro === 'string'
        ? u.fecha_registro
        : u.fecha_registro.toISOString()
      : new Date().toISOString();
  return {
    id: u.id_usuario ?? 0,
    nombre: u.nombre ?? '',
    apellido: u.apellido ?? '',
    email: u.correo ?? null,
    telefono: u.telefono ?? null,
    rol: 'usuario',
    createdAt: created,
    updatedAt: created,
  };
}

function parseErrorMessage(data: unknown, fallback: string): string {
  if (typeof data !== 'object' || data === null) return fallback;
  const d = data as ApiErrorBody;
  if (Array.isArray(d.errors) && d.errors.length > 0) {
    return d.errors.join(' ');
  }
  if (typeof d.message === 'string' && d.message) return d.message;
  return fallback;
}

export async function registrarUsuario(body: {
  nombre: string;
  apellido: string;
  telefono: string;
  password: string;
  email?: string;
}): Promise<UsuarioPublico> {
  const base = getApiBaseUrl();
  const correo = (body.email ?? '').trim();
  const telefonoDigits = body.telefono.replace(/\D/g, '');
  let res: Response;
  try {
    res = await fetch(`${base}${USUARIOS_V1}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: body.nombre.trim(),
        apellido: body.apellido.trim(),
        correo,
        telefono: telefonoDigits || undefined,
        password: body.password,
        aceptaTerminos: true,
      }),
    });
  } catch {
    throw new Error(
      `Sin conexión al servidor (${base}). Comprueba que el backend esté en marcha y el mismo puerto. ` +
        'En celular no uses localhost ni https local: deja EXPO_PUBLIC_API_URL vacío para usar la IP LAN de Expo, o pon http://TU_IP:PUERTO (ej. http://192.168.1.10:3001).'
    );
  }
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, `Error del servidor (${res.status})`));
  }
  const wrapped = data as ApiSuccess<Record<string, unknown>>;
  const raw = wrapped.data;
  if (!raw || typeof raw !== 'object') {
    throw new Error('Respuesta de registro inválida');
  }
  return mapUsuarioApiToPublico(raw as Parameters<typeof mapUsuarioApiToPublico>[0]);
}

/** Inicia sesión con correo o teléfono y contraseña. */
export async function iniciarSesion(body: {
  identificador: string;
  password: string;
}): Promise<UsuarioPublico> {
  const base = getApiBaseUrl();
  const id = body.identificador.trim();
  const payload: Record<string, string> = { password: body.password };
  if (id.includes('@')) {
    payload.correo = id;
  } else {
    payload.telefono = id.replace(/\D/g, '');
  }
  let res: Response;
  try {
    res = await fetch(`${base}${USUARIOS_V1}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      `Sin conexión al servidor (${base}). Backend en marcha y firewall permitiendo el puerto. ` +
        'En físico: sin localhost; usa IP de tu PC o deja la URL vacía en .env para detección LAN.'
    );
  }
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, `Error del servidor (${res.status})`));
  }
  const wrapped = data as ApiSuccess<{ usuario?: Record<string, unknown> }>;
  const raw = wrapped.data?.usuario;
  if (!raw || typeof raw !== 'object') {
    throw new Error('Respuesta de login inválida');
  }
  return mapUsuarioApiToPublico(raw as Parameters<typeof mapUsuarioApiToPublico>[0]);
}
