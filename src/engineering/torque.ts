/**
 * Engenharia elétrica — torque eletromagnético.
 *
 *   T_em = 3 · V_th² · (R2/s) / [ωs · ((R_th + R2/s)² + (X_th + X2)²)]
 *
 * Inclui torque de ruptura (máximo) e o escorregamento onde ocorre, usados
 * para detetar sobrecarga.
 */
import type { MotorParameters } from '../simulation/motorTypes';
import { thevenin } from './thevenin';
import { synchronousAngularSpeed } from './synchronousSpeed';

/** Guarda contra divisão por zero em s ≈ 0; mantém o sinal (s<0 = frenagem). */
const guardSlip = (slip: number) =>
  Math.abs(slip) < 1e-6 ? Math.sign(slip || 1) * 1e-6 : slip;

/** Torque eletromagnético [Nm] para um escorregamento (admite s < 0). */
export const electromagneticTorque = (slip: number, p: MotorParameters): number => {
  const safeSlip = guardSlip(slip);
  const { voltage: vTh, resistance: rTh, reactance: xTh } = thevenin(p);
  const ws = synchronousAngularSpeed(p.frequency, p.poles);
  const r2s = p.rotorResistance / safeSlip;
  const zSq = (rTh + r2s) ** 2 + (xTh + p.rotorReactance) ** 2;
  return (3 * vTh ** 2 * r2s) / (ws * zSq);
};

/** Escorregamento de ruptura (onde o torque é máximo). */
export const breakdownSlip = (p: MotorParameters): number => {
  const { resistance: rTh, reactance: xTh } = thevenin(p);
  return p.rotorResistance / Math.sqrt(rTh ** 2 + (xTh + p.rotorReactance) ** 2);
};

/** Torque de ruptura (máximo) [Nm]. */
export const breakdownTorque = (p: MotorParameters): number => {
  const { voltage: vTh, resistance: rTh, reactance: xTh } = thevenin(p);
  const ws = synchronousAngularSpeed(p.frequency, p.poles);
  return (3 * vTh ** 2) / (2 * ws * (rTh + Math.sqrt(rTh ** 2 + (xTh + p.rotorReactance) ** 2)));
};
