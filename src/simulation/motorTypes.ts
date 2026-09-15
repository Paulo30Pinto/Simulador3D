/**
 * Tipos partilhados pelo núcleo de simulação do motor de indução.
 *
 * A simulação é pura (sem React, sem 3D): dado um instantâneo anterior e os
 * parâmetros do motor, `motorPhysics.ts` calcula o próximo instantâneo.
 */

export enum MotorState {
  Off = 'DESLIGADO',
  Starting = 'PARTIDA',
  Accelerating = 'ACELERANDO',
  Running = 'REGIME',
  Overload = 'SOBRECARGA',
  Stopping = 'PARANDO',
  Failure = 'FALHA',
}

/**
 * Parâmetros elétricos por fase do circuito equivalente do motor
 * (valores referidos ao estator).  Estes são os inputs de engenharia que
 * definem o comportamento do motor — tensão, frequência, polos e os
 * elementos R/X do circuito equivalente.
 */
export interface MotorParameters {
  /** Tensão de linha [V] */
  voltage: number;
  /** Frequência da rede [Hz] */
  frequency: number;
  /** Número de polos (sempre par) */
  poles: number;
  /** Potência nominal no eixo [W] */
  ratedPower: number;
  /** Momento de inércia total [kg·m²] */
  inertia: number;
  /** Torque resistivo da carga [Nm] */
  loadTorque: number;
  /** Coeficiente de atrito viscoso [Nm·s/rad] */
  friction: number;
  /** Resistência do estator por fase [Ω] (R1) */
  statorResistance: number;
  /** Reatância de dispersão do estator [Ω] (X1) */
  statorReactance: number;
  /** Resistência do rotor referida ao estator [Ω] (R2) */
  rotorResistance: number;
  /** Reatância de dispersão do rotor referida [Ω] (X2) */
  rotorReactance: number;
  /** Reatância de magnetização [Ω] (Xm) */
  magnetizingReactance: number;
}

/**
 * Instantâneo do estado do motor num dado instante.  É o que a interface
 * (3D, gráficos, multímetro) consome — nunca calcula, só exibe.
 */
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

/**
 * Motor de referência: indução trifásica, rotor em gaiola,
 * 4 polos · 50 Hz · 380 V · ~10 kW.
 *
 * Parâmetros do circuito equivalente (referidos ao estator) calibrados a
 * partir de valores típicos em unidades por unidade para uma máquina de
 * ~13 cv: corrente de partida ~6-7× a nominal, torque de partida ~1,3× o
 * nominal, torque de ruptura ~2,5-3× o nominal.
 */
export const defaultMotorParameters: MotorParameters = {
  voltage: 380,
  frequency: 50,
  poles: 4,
  ratedPower: 10_000,
  inertia: 0.2,
  loadTorque: 40,
  friction: 0.02,
  statorResistance: 0.53,
  statorReactance: 0.53,
  rotorResistance: 0.43,
  rotorReactance: 0.53,
  magnetizingReactance: 21.4,
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
