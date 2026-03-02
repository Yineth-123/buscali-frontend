import type { ConductorRepository } from "../../domain/repositories/ConductorRepository";

export const GetConductores = async (
  repository: ConductorRepository
) => {
  return await repository.getAll();
};