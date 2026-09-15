/**
 * Engenharia elétrica — corrente do estator e fator de potência.
 *
 * Calculados pela impedância de entrada COMPLETA (não por heurística):
 *
 *   Z_in = (R1 + jX1) + [jXm ‖ (R2/s + jX2)]
 *   I1   = V_fase / |Z_in|
 *   FP   = cos(∠Z_in) = Re(Z_in) / |Z_in|
 */
import type { MotorParameters } from '../simulation/motorTypes';

const guardSlip = (slip: number) =>
  Math.abs(slip) < 1e-6 ? Math.sign(slip || 1) * 1e-6 : slip;

export interface StatorCurrentResult {
  /** Corrente de linha [A] */
  current: number;
  /** Fator de potência [0..1] */
  powerFactor: number;
}

/** Corrente do estator [A] e fator de potência para um escorregamento. */
export const statorCurrentAndPowerFactor = (
  slip: number,
  p: MotorParameters,
): StatorCurrentResult => {
  const safeSlip = guardSlip(slip);
  const vPhase = p.voltage / Math.sqrt(3);
  const r2s = p.rotorResistance / safeSlip;

  // jXm ‖ (R2/s + jX2) = (jXm · Z2) / (jXm + Z2)  — aritmética complexa (re, im)
  const z2re = r2s;
  const z2im = p.rotorReactance;
  const numRe = -p.magnetizingReactance * z2im;
  const numIm = p.magnetizingReactance * z2re;
  const denRe = z2re;
  const denIm = p.magnetizingReactance + z2im;
  const den = denRe * denRe + denIm * denIm;
  const parRe = (numRe * denRe + numIm * denIm) / den;
  const parIm = (numIm * denRe - numRe * denIm) / den;

  const zinRe = p.statorResistance + parRe;
  const zinIm = p.statorReactance + parIm;
  const zinMag = Math.sqrt(zinRe * zinRe + zinIm * zinIm);

  const current = vPhase / Math.max(zinMag, 1e-6);
  const powerFactor = Math.max(0, Math.min(1, zinRe / Math.max(zinMag, 1e-6)));
  return { current, powerFactor };
};
