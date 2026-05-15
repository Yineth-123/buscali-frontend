export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type CoordenadaMapa = { latitude: number; longitude: number };

/** Pantallas tras iniciar sesión: flujo de rutas (diseño original front-movil-buscali) + perfil. */
export type AppStackParamList = {
  Inicio: undefined;
  PlanearRuta: undefined;
  ListaRutas: {
    origen: string;
    destino: string;
    origenCoord: CoordenadaMapa;
    destinoCoord: CoordenadaMapa;
    rutas: { id: string; nombre: string; proximidad_m?: number }[];
  };
  MapaRuta: {
    origen: string;
    destino: string;
    rutaId: string;
    rutaNombre: string;
    origenCoord: CoordenadaMapa;
    destinoCoord: CoordenadaMapa;
  };
  Perfil: undefined;
};
