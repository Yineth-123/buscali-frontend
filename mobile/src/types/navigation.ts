export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

/** Pantallas tras iniciar sesión: flujo de rutas (diseño original front-movil-buscali) + perfil. */
export type AppStackParamList = {
  Inicio: undefined;
  PlanearRuta: undefined;
  ListaRutas: {
    origen: string;
    destino: string;
    rutas: { id: string; nombre: string }[];
  };
  MapaRuta: {
    origen: string;
    destino: string;
    rutaId: string;
    rutaNombre: string;
  };
  Perfil: undefined;
};
