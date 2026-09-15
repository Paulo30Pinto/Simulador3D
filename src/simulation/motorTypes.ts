export enum MotorState {
  Off = 'DESLIGADO',
  Starting = 'PARTIDA',
  Accelerating = 'ACELERANDO',
  Running = 'REGIME',
  Overload = 'SOBRECARGA',
  Stopping = 'PARANDO',
  Fault = 'FALHA',
}

export interface MotorFaults {
  openPhase: boolean; // Perda de uma das 3 fases (fase aberta)
  rotorImbalance: boolean; // Desbalanceamento mecânico/elétrico no rotor (barras partidas)
}

export const defaultMotorFaults: MotorFaults = {
  openPhase: false,
  rotorImbalance: false,
};

export interface MotorParameters {
  voltage: number;
  frequency: number;
  poles: number;
  ratedPower: number;
  inertia: number;
  loadTorque: number;
  friction: number;
  statorResistance: number;
  rotorResistance: number;
  statorLeakageReactance?: number;
  rotorLeakageReactance?: number;
  magnetizingReactance: number;
}

export interface MotorSnapshot {
  time: number;
  state: MotorState;
  rpm: number;
  synchronousRpm: number;
  slip: number;
  torque: number;
  loadTorque: number;
  current: number;
  power: number;
  powerFactor: number;
  efficiency: number;
  maxTorque?: number;
  criticalSlip?: number;
  startingTorque?: number;
  startingCurrent?: number;
  faults?: MotorFaults;
  vibration?: number; // Nível de vibração RMS mm/s
  phaseCurrents?: {
    phaseA: number;
    phaseB: number;
    phaseC: number;
  };
}


export const defaultMotorParameters: MotorParameters = {
  voltage: 380,
  frequency: 50,
  poles: 4,
  ratedPower: 10_000,
  inertia: 0.15,
  loadTorque: 25,
  friction: 0.012,
  statorResistance: 0.42,
  rotorResistance: 0.32,
  statorLeakageReactance: 0.95,
  rotorLeakageReactance: 0.95,
  magnetizingReactance: 22.0,
};

export const initialMotorSnapshot: MotorSnapshot = {
  time: 0,
  state: MotorState.Off,
  rpm: 0,
  synchronousRpm: 0,
  slip: 1,
  torque: 0,
  loadTorque: defaultMotorParameters.loadTorque,
  current: 0,
  power: 0,
  powerFactor: 0,
  efficiency: 0,
};

export interface MotorHistoryPoint {
  time: number;
  rpm: number;
  current: number;
  torque: number;
  slip: number;
}

export interface MotorSimulation {
  parameters: MotorParameters;
  snapshot: MotorSnapshot;
  history: MotorHistoryPoint[];
  start: () => void;
  stop: () => void;
  setLoadTorque: (loadTorque: number) => void;
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
