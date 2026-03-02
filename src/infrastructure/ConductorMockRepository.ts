import type { Conductor } from "../domain/entities/Conductor";
import type { ConductorRepository } from "../domain/repositories/ConductorRepository";

const STORAGE_KEY = "conductores";

export class ConductorMockRepository implements ConductorRepository {

  private getStorage(): Conductor[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveStorage(conductores: Conductor[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conductores));
  }

  async getAll(): Promise<Conductor[]> {
    return this.getStorage();
  }

  async save(conductor: Conductor): Promise<void> {
    const conductores = this.getStorage();
    conductores.push(conductor);
    this.saveStorage(conductores);
  }

  async delete(id: number): Promise<void> {
    const conductores = this.getStorage().filter(c => c.id !== id);
    this.saveStorage(conductores);
  }

  async update(updated: Conductor): Promise<void> {
    const conductores = this.getStorage().map(c =>
      c.id === updated.id ? updated : c
    );
    this.saveStorage(conductores);
  }

  async getById(id: number): Promise<Conductor | undefined> {
    return this.getStorage().find(c => c.id === id);
  }

  async getByCedula(cedula: number): Promise<Conductor | undefined> {
    return this.getStorage().find(c => c.cedula === cedula);
  }
}