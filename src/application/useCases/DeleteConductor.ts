// DeleteConductor.ts
//export const DeleteConductor = (id: string) => {
 // console.log(`Conductor con id ${id} eliminado`);
//};

import type { ConductorRepository } from "../../domain/repositories/ConductorRepository";

export const DeleteConductor = async (
  repository: ConductorRepository,
  id: number
) => {
  await repository.delete(id);
};
