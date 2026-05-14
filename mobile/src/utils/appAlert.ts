import { Alert, Platform } from 'react-native';

/** Alert que en web usa `window.alert` (más fiable que RN Alert en el navegador). */
export function appAlert(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    const text =
      message !== undefined && message !== '' ? `${title}\n\n${message}` : title;
    window.alert(text);
    return;
  }
  if (message !== undefined && message !== '') {
    Alert.alert(title, message);
  } else {
    Alert.alert(title);
  }
}
