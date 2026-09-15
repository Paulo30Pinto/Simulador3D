/**
 * Núcleo de física do motor de indução trifásico — camada de composição.
 *
 * As fórmulas elétricas vivem agora em `src/engineering/` (módulos puros e
 * testáveis isoladamente).  Este ficheiro compõe-as num ponto de operação
 * e integra a dinâmica mecânica no tempo, sem React e sem 3D.
 *
 *   J dω/dt = T_em − T_load − B ω
 *
 * Referência: modelo clássico do motor de indução (NPTEL / Fitzgerald).
 */
import { clamp } from './motorTypes';
import type { MotorParameters, MotorSnapshot } from './motorTypes';
import { MotorState, initialMotorSnapshot } from './motorTypes';

import { synchronousSpeed, synchronousAngularSpeed } from '../engineering/synchronousSpeed';
import { slipFromSpeed } from '../engineering/slip';
import { theveninEquivalent } from '../engineering/thevenin';
import { electromagneticTorque, breakdownSlip, breakdownTorque } from '../engineering/torque';
import { statorCurrentAndPowerFactor } from '../engineering/current';
import { mechanicalPower, inputPower } from '../engineering/power';
import { efficiency } from '../engineering/efficiency';

// Reexporta as funções de engenharia para retrocompatibilidade de imports.
export {
  synchronousSpeed,
  synchronousAngularSpeed,
  slipFromSpeed,
  theveninEquivalent,
  electromagneticTorque,
  breakdownSlip,
  breakdownTorque,
};

const TWO_PI = 2 * Math.PI;
const RAD_PER_RPM = TWO_PI / 60;

/* ------------------------------------------------------------------ */
/* Ponto de operação — composição das funções de engenharia            */
/* ------------------------------------------------------------------ */

export interface OperatingPoint {
  torque: number; // torque eletromagnético [Nm]
  current: number; // corrente de linha [A]
  power: number; // potência mecânica desenvolvida [W]
  inputPower: number; // potência elétrica de entrada [W]
  powerFactor: number; // fator de potência [0..1]
  efficiency: number; // rendimento [0..1]
}

/**
 * Ponto de operação do motor para um dado escorregamento, usando o circuito
 * equivalente completo.  Compõe as funções de `engineering/`.
 */
export const operatingPoint = (slip: number, p: MotorParameters): OperatingPoint => {
  const { current, powerFactor } = statorCurrentAndPowerFactor(slip, p);
  const torque = electromagneticTorque(slip, p);
  const power = mechanicalPower(slip, p);
  const inp = inputPower(current, powerFactor, p.voltage);
  return { torque, current, power, inputPower: inp, powerFactor, efficiency: efficiency(power, inp) };
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

  // --- Desligado: nada flui ---
  if (previous.state === MotorState.Off) {
    return { ...previous, synchronousRpm, slip: 1, time: previous.time + dt };
  }

  // --- Parando: sem torque eletromagnético, só inércia + atrito + carga ---
  if (previous.state === MotorState.Stopping) {
    const omega = previous.rpm * RAD_PER_RPM;
    const netTorque = -parameters.loadTorque - parameters.friction * omega;
    const accel = netTorque / Math.max(parameters.inertia, 1e-3);
    const nextRpm = clamp(previous.rpm + (accel * dt) / RAD_PER_RPM, 0, synchronousRpm * 1.01);
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
