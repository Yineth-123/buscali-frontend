import type { Conductor } from "../../domain/entities/Conductor";
import type { ConductorRepository } from "../../domain/repositories/ConductorRepository";

export const RegisterConductor = async (
  repository: ConductorRepository,
  conductor: Conductor
) => {
  await repository.save(conductor);
};