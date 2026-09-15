/**
 * Engenharia elétrica — equivalente de Thevenin do circuito do motor.
 *
 *   V_th = V_fase · jXm / (R1 + j(X1 + Xm))     tensão de Thevenin
 *   Z_th = (R1 + jX1) || jXm                    impedância de Thevenin
 *
 * Constantes para um dado motor (dependem só de R1, X1, Xm e V), por isso
 * são memorizadas em cache.
 */
import type { MotorParameters } from '../simulation/motorTypes';

export interface Thevenin {
  /** |V_th| [V] */
  voltage: number;
  /** R_th [Ω] */
  resistance: number;
  /** X_th [Ω] */
  reactance: number;
}

/** Calcula o equivalente de Thevenin visto do rotor. */
export const theveninEquivalent = (p: MotorParameters): Thevenin => {
  const vPhase = p.voltage / Math.sqrt(3);
  const denom =
    p.statorResistance ** 2 + (p.statorReactance + p.magnetizingReactance) ** 2;
  const voltage = (vPhase * p.magnetizingReactance) / Math.sqrt(denom);
  const resistance = (p.statorResistance * p.magnetizingReactance ** 2) / denom;
  const reactance =
    (p.magnetizingReactance *
      (p.statorResistance ** 2 +
        p.statorReactance * (p.statorReactance + p.magnetizingReactance))) /
    denom;
  return { voltage, resistance, reactance };
};

const cache = new Map<string, Thevenin>();
const keyFor = (p: MotorParameters) =>
  `${p.voltage}|${p.statorResistance}|${p.statorReactance}|${p.magnetizingReactance}`;

/** Equivalente de Thevenin com cache (constante por motor). */
export const thevenin = (p: MotorParameters): Thevenin => {
  const key = keyFor(p);
  let value = cache.get(key);
  if (!value) {
    value = theveninEquivalent(p);
    cache.set(key, value);
  }
  return value;
};
