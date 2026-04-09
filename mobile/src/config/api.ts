import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Host que Expo usa para Metro en desarrollo (misma máquina que suele tener el API).
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

/**
 * URL base del backend. Prioridad:
 * 1) EXPO_PUBLIC_API_URL en .env
 * 2) En desarrollo + Expo Go: IP del host de Metro (tu PC en la WiFi)
 * 3) Android emulador: 10.0.2.2
 * 4) localhost (solo sirve en web o simulador iOS en la misma máquina)
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (__DEV__) {
    const host = devHostFromExpo();
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:3000`;
    }
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
  }

  return 'http://localhost:3000';
}
