/**
 * Búsqueda de rutas (origen/destino). Por ahora respuesta simulada; luego conectar al API de rutas.
 */
export const buscarRutas = async (origen: string, destino: string) => {
  console.log('Consultando rutas...', origen, destino);
  return new Promise<{
    success: boolean;
    rutas: { id: string; nombre: string }[];
  }>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        rutas: [
          { id: '1', nombre: 'Ruta centro' },
          { id: '2', nombre: 'Ruta norte' },
        ],
      });
    }, 1500);
  });
};
