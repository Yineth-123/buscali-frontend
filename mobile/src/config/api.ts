import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Host que Expo usa para Metro en desarrollo (suele ser la IP de tu PC en la WiFi).
 */
function devHostFromExpo(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0]?.trim();
    if (host) return host;
  }
  const debuggerHost = Constants.expoGoConfig?.debuggerHost;
  if (debuggerHost) {
    const host = debuggerHost.split(':')[0]?.trim();
    if (host) return host;
  }
  return null;
}

const DEFAULT_DEV_PORT =
  process.env.EXPO_PUBLIC_API_PORT?.trim() || '3001';

function normalizeDevUrl(url: string): string {
  let u = url.trim().replace(/\/$/, '');
  if (__DEV__ && Platform.OS !== 'web' && /^https:\/\/(localhost|127\.0\.0\.1)/i.test(u)) {
    u = u.replace(/^https:\/\//i, 'http://');
  }
  return u;
}

/**
 * En celular físico / emulador, localhost del .env apunta al dispositivo, no a tu PC.
 * Sustituye el host por la IP que Expo conoce (LAN) o por 10.0.2.2 en emulador Android.
 */
function rewriteLoopbackForNativeDev(url: string): string {
  if (!__DEV__ || Platform.OS === 'web') return url;
  let parsed: URL;
  try {
    const raw = url.includes('://') ? url : `http://${url}`;
    parsed = new URL(raw);
  } catch {
    return url;
  }
  const h = parsed.hostname;
  if (h !== 'localhost' && h !== '127.0.0.1') {
    return normalizeDevUrl(url);
  }
  const port = parsed.port || DEFAULT_DEV_PORT;
  const lan = devHostFromExpo();
  if (lan && lan !== 'localhost' && lan !== '127.0.0.1') {
    parsed.protocol = 'http:';
    parsed.hostname = lan;
    parsed.port = port;
    return parsed.toString().replace(/\/$/, '');
  }
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${port}`;
  }
  return normalizeDevUrl(url);
}

/**
 * URL base del backend. Prioridad:
 * 1) EXPO_PUBLIC_API_URL en .env (en nativo + dev, localhost se reescribe a la IP LAN de Expo)
 * 2) En desarrollo + Expo Go: IP del host de Metro + EXPO_PUBLIC_API_PORT (por defecto 3001)
 * 3) Android emulador: 10.0.2.2
 * 4) localhost (solo web o simulador iOS en la misma máquina)
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');
  if (fromEnv) {
    return rewriteLoopbackForNativeDev(normalizeDevUrl(fromEnv));
  }

  if (__DEV__) {
    const host = devHostFromExpo();
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:${DEFAULT_DEV_PORT}`;
    }
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:${DEFAULT_DEV_PORT}`;
    }
  }

  return `http://localhost:${DEFAULT_DEV_PORT}`;
}
