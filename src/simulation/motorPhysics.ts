/**
 * Núcleo de física do motor de indução trifásico.
 *
 * Implementa o circuito equivalente por fase (Thevenin) — sem React e sem
 * 3D.  Tudo aqui é função pura de (instantâneo anterior, parâmetros, dt).
 *
 * Referência: modelo clássico do motor de indução (NPTEL / Fitzgerald).
 *   ω_s = 2π f / (P/2)            velocidade síncrona angular [rad/s]
 *   Ns = 120 f / P                velocidade síncrona [rpm]
 *   s  = (Ns − N) / Ns            escorregamento
 *   V_th, Z_th                    equivalente de Thevenin visto do rotor
 *   T_em = 3 V_th² (R2/s) / [ω_s ((R_th + R2/s)² + (X_th + X2)²)]
 *   J dω/dt = T_em − T_load − B ω   dinâmica mecânica
 */
import { clamp } from './motorTypes';
import type { MotorParameters, MotorSnapshot } from './motorTypes';
import { MotorState, initialMotorSnapshot } from './motorTypes';

const TWO_PI = 2 * Math.PI;
const RAD_PER_RPM = TWO_PI / 60;

/* ------------------------------------------------------------------ */
/* Engenharia — equações base                                         */
/* ------------------------------------------------------------------ */

/** Velocidade síncrona [rpm]: Ns = 120 f / P */
export const synchronousSpeed = (frequency: number, poles: number) =>
  (120 * frequency) / Math.max(poles, 2);

/** Velocidade síncrona angular [rad/s]: ω_s = 2π f / (P/2) */
export const synchronousAngularSpeed = (frequency: number, poles: number) =>
  (TWO_PI * frequency) / (poles / 2);

/**
 * Escorregamento a partir da rotação: s = (Ns − N) / Ns.
 *
 * Permite escorregamento NEGATIVO (N > Ns): nessa região o motor opera como
 * gerador/freno regenerativo, produzindo torque de frenagem — o que amortece
 * naturalmente qualquer ultrapassagem da velocidade síncrona durante a
 * partida e estabiliza a simulação.
 */
export const slipFromSpeed = (synchronousRpm: number, rpm: number) =>
  synchronousRpm <= 0 ? 1 : clamp((synchronousRpm - rpm) / synchronousRpm, -0.5, 1);

/* ------------------------------------------------------------------ */
/* Equivalente de Thevenin (constantes para um dado motor)             */
/* ------------------------------------------------------------------ */

interface Thevenin {
  voltage: number; // |V_th| [V]
  resistance: number; // R_th [Ω]
  reactance: number; // X_th [Ω]
}

/**
 * Tensão e impedância de Thevenin vistas do rotor:
 *   V_th = V_fase · jXm / (R1 + j(X1 + Xm))
 *   Z_th = (R1 + jX1) || jXm
 */
export const theveninEquivalent = (p: MotorParameters): Thevenin => {
  const vPhase = p.voltage / Math.sqrt(3);
  const denom = p.statorResistance ** 2 + (p.statorReactance + p.magnetizingReactance) ** 2;
  const voltage = (vPhase * p.magnetizingReactance) / Math.sqrt(denom);
  const resistance = (p.statorResistance * p.magnetizingReactance ** 2) / denom;
  const reactance =
    (p.magnetizingReactance * (p.statorResistance ** 2 + p.statorReactance * (p.statorReactance + p.magnetizingReactance))) / denom;
  return { voltage, resistance, reactance };
};

/* ------------------------------------------------------------------ */
/* Torque, corrente e potência em função do escorregamento             */
/* ------------------------------------------------------------------ */

interface OperatingPoint {
  torque: number; // torque eletromagnético [Nm]
  current: number; // corrente de linha [A]
  power: number; // potência mecânica desenvolvida [W]
  inputPower: number; // potência elétrica de entrada [W]
  powerFactor: number; // fator de potência [0..1]
  efficiency: number; // rendimento [0..1]
}

const th = new Map<string, Thevenin>();
const thevenin = (p: MotorParameters): Thevenin => {
  const key = `${p.voltage}|${p.statorResistance}|${p.statorReactance}|${p.rotorReactance}|${p.magnetizingReactance}`;
  let v = th.get(key);
  if (!v) {
    v = theveninEquivalent(p);
    th.set(key, v);
  }
  return v;
};

/**
 * Ponto de operação do motor para um dado escorregamento, usando o
 * circuito equivalente completo (corrente do estator calculada pela
 * impedância de entrada, não por heurística).
 */
export const operatingPoint = (slip: number, p: MotorParameters): OperatingPoint => {
  // Guarda contra divisão por zero em s ≈ 0; mantém o sinal (s<0 = frenagem).
  const safeSlip = Math.abs(slip) < 1e-6 ? Math.sign(slip || 1) * 1e-6 : slip;
  const vPhase = p.voltage / Math.sqrt(3);
  const { voltage: vTh, resistance: rTh, reactance: xTh } = thevenin(p);
  const ws = synchronousAngularSpeed(p.frequency, p.poles);

  // Rotor (referido): Z2 = R2/s + jX2
  const r2s = p.rotorResistance / safeSlip;

  // Torque eletromagnético
  const zRotorSq = (rTh + r2s) ** 2 + (xTh + p.rotorReactance) ** 2;
  const torque = (3 * vTh ** 2 * r2s) / (ws * zRotorSq);

  // Corrente do rotor (referida)
  const i2 = vTh / Math.sqrt(zRotorSq);

  // Corrente do estator pela impedância de entrada completa:
  //   Z_in = (R1 + jX1) + [jXm || (R2/s + jX2)]
  // Aritmética complexa (real, imag).
  const z2re = r2s;
  const z2im = p.rotorReactance;
  // jXm || Z2 = (jXm · Z2) / (jXm + Z2)
  const numRe = -p.magnetizingReactance * z2im; // (0+jXm)(z2re+jz2im) -> real = -Xm*z2im
  const numIm = p.magnetizingReactance * z2re; // imag = Xm*z2re
  const denRe = z2re;
  const denIm = p.magnetizingReactance + z2im;
  const den = denRe * denRe + denIm * denIm;
  const parRe = (numRe * denRe + numIm * denIm) / den;
  const parIm = (numIm * denRe - numRe * denIm) / den;
  const zinRe = p.statorResistance + parRe;
  const zinIm = p.statorReactance + parIm;
  const zinMag = Math.sqrt(zinRe * zinRe + zinIm * zinIm);
  const current = vPhase / Math.max(zinMag, 1e-6);

  // Potências
  const pAirGap = 3 * i2 ** 2 * r2s; // potência transferida ao rotor
  const power = (1 - safeSlip) * pAirGap; // potência mecânica desenvolvida
  const powerFactor = clamp(zinRe / Math.max(zinMag, 1e-6), 0, 1);
  const inputPower = 3 * vPhase * current * powerFactor;
  const efficiency = inputPower > 0 ? clamp(power / inputPower, 0, 0.98) : 0;

  return { torque, current, power, inputPower, powerFactor, efficiency };
};

/**
 * Torque de ruptura (máximo) e o escorregamento onde ocorre — útil para
 * detetar sobrecarga (carga além do torque máximo → motor estolal).
 */
export const breakdownSlip = (p: MotorParameters) => {
  const { resistance: rTh, reactance: xTh } = thevenin(p);
  return p.rotorResistance / Math.sqrt(rTh ** 2 + (xTh + p.rotorReactance) ** 2);
};

export const breakdownTorque = (p: MotorParameters) => {
  const { voltage: vTh, resistance: rTh, reactance: xTh } = thevenin(p);
  const ws = synchronousAngularSpeed(p.frequency, p.poles);
  return (3 * vTh ** 2) / (2 * ws * (rTh + Math.sqrt(rTh ** 2 + (xTh + p.rotorReactance) ** 2)));
};

/* ------------------------------------------------------------------ */
/* Integração temporal — a "simulação"                                */
/* ------------------------------------------------------------------ */

const ENERGIZED = new Set<MotorState>([
  MotorState.Starting,
  MotorState.Accelerating,
  MotorState.Running,
  MotorState.Overload,
]);

/** Classifica o sub-estado durante o funcionamento (energizado). */
const classifyEnergized = (slip: number): MotorState => {
  if (slip >= 0.999) return MotorState.Starting;
  if (slip > 0.06) return MotorState.Accelerating;
  return MotorState.Running;
};

/**
 * Calcula o próximo instantâneo a partir do anterior.
 *
 *   J dω/dt = T_em − T_load − B ω
 *
 * @param previous instantâneo anterior
 * @param parameters parâmetros do motor
 * @param dt passo de tempo [s]
 */
export const calculateSnapshot = (
  previous: MotorSnapshot,
  parameters: MotorParameters,
  dt: number,
): MotorSnapshot => {
  const synchronousRpm = synchronousSpeed(parameters.frequency, parameters.poles);
  const ws = synchronousAngularSpeed(parameters.frequency, parameters.poles);

  // --- Desligado: nada flui ---
  if (previous.state === MotorState.Off) {
    return { ...previous, synchronousRpm, slip: 1, time: previous.time + dt };
  }

  // --- Parando: sem torque eletromagnético, só inércia + atrito + carga ---
  if (previous.state === MotorState.Stopping) {
    const omega = previous.rpm * RAD_PER_RPM;
    const netTorque = -parameters.loadTorque - parameters.friction * omega;
    const accel = netTorque / Math.max(parameters.inertia, 1e-3);
    const nextRpm = clamp(previous.rpm + accel * dt / RAD_PER_RPM, 0, synchronousRpm * 1.01);
    if (nextRpm <= 0.5) {
      return { ...initialMotorSnapshotRef(parameters), synchronousRpm, time: previous.time + dt };
    }
    return {
      ...previous,
      time: previous.time + dt,
      rpm: nextRpm,
      synchronousRpm,
      slip: slipFromSpeed(synchronousRpm, nextRpm),
      torque: 0,
      current: 0,
      power: 0,
      powerFactor: 0,
      efficiency: 0,
    };
  }

  // --- Energizado: circuito equivalente ativo ---
  // Subpassos para estabilidade numérica: o sistema é rígido (torque alto,
  // inércia pequena), pelo que integramos com passo interno ≤ 5 ms.
  if (ENERGIZED.has(previous.state)) {
    const SUB_DT = 0.005;
    const steps = Math.max(1, Math.ceil(dt / SUB_DT));
    const h = dt / steps;
    let rpm = previous.rpm;
    let t = previous.time;
    for (let i = 0; i < steps; i++) {
      const slip = slipFromSpeed(synchronousRpm, rpm);
      const op = operatingPoint(slip, parameters);
      const omega = rpm * RAD_PER_RPM;
      const netTorque = op.torque - parameters.loadTorque - parameters.friction * omega;
      const accel = netTorque / Math.max(parameters.inertia, 1e-3);
      rpm = clamp(rpm + (accel * h) / RAD_PER_RPM, 0, synchronousRpm * 1.5);
      t += h;
    }
    const finalSlip = slipFromSpeed(synchronousRpm, rpm);
    const finalOp = operatingPoint(finalSlip, parameters);

    // Sobrecarga: carga superior ao torque de ruptura → motor estola
    const tMax = breakdownTorque(parameters);
    const overloaded = parameters.loadTorque >= tMax && rpm < synchronousRpm * 0.1;

    const state = overloaded ? MotorState.Overload : classifyEnergized(finalSlip);

    return {
      time: t,
      state,
      rpm,
      synchronousRpm,
      slip: finalSlip,
      torque: finalOp.torque,
      loadTorque: parameters.loadTorque,
      current: finalOp.current,
      power: finalOp.power,
      powerFactor: finalOp.powerFactor,
      efficiency: finalOp.efficiency,
    };
  }

  // Fallback (Falha, etc.) — mantém parado
  return { ...previous, synchronousRpm, time: previous.time + dt };
};

/** Instantâneo "motor parado" preservando a carga configurada. */
const initialMotorSnapshotRef = (p: MotorParameters): MotorSnapshot => ({
  ...initialMotorSnapshot,
  loadTorque: p.loadTorque,
});
