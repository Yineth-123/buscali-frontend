//export class Conductor {
 // constructor(
   // public id: number,
    //public nombre: string,
    //public cedula: string,
    //public celular: string,
    //public correo: string,
    //public activo: boolean = false,
  //) {}
//}

export interface Conductor {
  id: number;
  nombre: string;
  licencia: string;
  cedula: number;
  celular: number;
  correo: string;
  activo: boolean;

}