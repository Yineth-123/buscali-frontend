import type { Conductor } from "../entities/Conductor";

export interface ConductorRepository {
  getAll(): Promise<Conductor[]>;
  save(conductor: Conductor): Promise<void>;
  delete(id: number): Promise<void>;
  update(conductor: Conductor): Promise<void>;
}