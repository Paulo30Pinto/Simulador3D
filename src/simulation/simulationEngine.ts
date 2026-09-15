/**
 * Motor de simulação — agnóstico a framework.
 *
 * Encapsula o estado do motor e expõe um método `step(dt)` que avança a
 * simulação usando a física de `motorPhysics`.  Não depende do React: é a
 * mesma física usada pelo hook `useMotorSimulation`, agora acessível em
 * contextos de teste e sem UI.
 */
import { calculateSnapshot } from './motorPhysics';
import {
  defaultMotorParameters,
  initialMotorSnapshot,
  MotorState,
  type MotorParameters,
  type MotorSnapshot,
} from './motorTypes';

export class MotorSimulation {
  parameters: MotorParameters;
  snapshot: MotorSnapshot;

  constructor(parameters: MotorParameters = defaultMotorParameters) {
    this.parameters = { ...parameters };
    this.snapshot = { ...initialMotorSnapshot, loadTorque: parameters.loadTorque };
  }

  /** Liga o motor (DESLIGADO → PARTIDA). */
  start(): void {
    this.snapshot = { ...this.snapshot, state: MotorState.Starting, time: 0 };
  }

  /** Desliga o motor (→ PARANDO → DESLIGADO, por inércia). */
  stop(): void {
    this.snapshot = { ...this.snapshot, state: MotorState.Stopping };
  }

  /** Ajusta o torque resistivo da carga [Nm]. */
  setLoadTorque(loadTorque: number): void {
    this.parameters = { ...this.parameters, loadTorque };
    this.snapshot = { ...this.snapshot, loadTorque };
  }

  /** Substitui (parcialmente) os parâmetros do motor. */
  setParameters(patch: Partial<MotorParameters>): void {
    this.parameters = { ...this.parameters, ...patch };
  }

  /**
   * Avança a simulação de `dt` segundos e devolve o novo instantâneo.
   * O RPM resulta da dinâmica (J·dω/dt = T_em − T_load − B·ω) — nunca de
   * incrementos fixos.
   */
  step(dt: number): MotorSnapshot {
    this.snapshot = calculateSnapshot(this.snapshot, this.parameters, dt);
    return this.snapshot;
  }
}
