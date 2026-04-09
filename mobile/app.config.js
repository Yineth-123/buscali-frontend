/**
 * Inyecta la clave de Google Maps en Android/iOS (mismo valor que EXPO_PUBLIC_GOOGLE_MAPS_KEY en .env).
 * Habilita en Google Cloud: Maps SDK for Android, Maps SDK for iOS, Geocoding API.
 */
module.exports = ({ config }) => {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';
  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...(config.android?.config ?? {}),
        googleMaps: { apiKey: key },
      },
    },
    ios: {
      ...config.ios,
      config: {
        ...(config.ios?.config ?? {}),
        googleMapsApiKey: key,
      },
    },
  };
};
