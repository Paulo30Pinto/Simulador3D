export enum MotorState {
  Off = 'DESLIGADO',
  Starting = 'PARTIDA',
  Accelerating = 'ACELERANDO',
  Running = 'REGIME',
  Overload = 'SOBRECARGA',
  Stopping = 'PARANDO',
}

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
}

export const defaultMotorParameters: MotorParameters = {
  voltage: 380,
  frequency: 50,
  poles: 4,
  ratedPower: 10_000,
  inertia: 0.18,
  loadTorque: 18,
  friction: 0.018,
  statorResistance: 0.42,
  rotorResistance: 0.28,
  magnetizingReactance: 18,
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
