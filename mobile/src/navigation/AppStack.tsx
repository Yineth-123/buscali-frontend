import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types/navigation';
import { C, F } from '../theme/buscaliTheme';
import InicioRutasScreen from '../screens/InicioRutasScreen';
import OrigenDestinoScreen from '../screens/OrigenDestinoScreen';
import ListaRutasScreen from '../screens/ListaRutasScreen';
import MapaRutaScreen from '../screens/MapaRutaScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Inicio"
      screenOptions={{
        headerStyle: { backgroundColor: C.surface },
        headerTintColor: C.primary,
        headerTitleStyle: { fontFamily: F.headlineMed, color: C.onSurface },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Inicio"
        component={InicioRutasScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PlanearRuta"
        component={OrigenDestinoScreen}
        options={{ title: 'Planear ruta' }}
      />
      <Stack.Screen
        name="ListaRutas"
        component={ListaRutasScreen}
        options={{ title: 'Rutas disponibles' }}
      />
      <Stack.Screen
        name="MapaRuta"
        component={MapaRutaScreen}
        options={{ title: 'Mapa' }}
      />
      <Stack.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ title: 'Mi cuenta' }}
      />
    </Stack.Navigator>
  );
}
