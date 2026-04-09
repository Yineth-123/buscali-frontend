import { getApiBaseUrl } from '../config/api';

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

export async function registrarUsuario(body: {
  nombre: string;
  apellido: string;
  telefono: string;
  password: string;
  email?: string;
}): Promise<UsuarioPublico> {
  const base = getApiBaseUrl();
  let res: Response;
  try {
    res = await fetch(`${base}/api/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      `Sin conexión al servidor (${base}). ¿Backend en marcha en el puerto 3000? ` +
        'En celular físico no uses localhost: define EXPO_PUBLIC_API_URL con la IP de tu PC (ej. http://192.168.1.10:3000) o abre Expo en modo LAN.'
    );
  }
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `Error del servidor (${res.status})`;
    throw new Error(msg);
  }
  return data as UsuarioPublico;
}

/** Inicia sesión con correo o teléfono y contraseña. */
export async function iniciarSesion(body: {
  identificador: string;
  password: string;
}): Promise<UsuarioPublico> {
  const base = getApiBaseUrl();
  let res: Response;
  try {
    res = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      `Sin conexión al servidor (${base}). Comprueba que el backend esté en marcha y la URL de red.`
    );
  }
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `Error del servidor (${res.status})`;
    throw new Error(msg);
  }
  return data as UsuarioPublico;
}
