/**
 * Engenharia elétrica — potências.
 *
 *   P_mec = T_em · ωm = T_em · (1 − s) · ωs   potência mecânica desenvolvida [W]
 *   P_in  = 3 · V_fase · I1 · FP             potência elétrica de entrada [W]
 */
import type { MotorParameters } from '../simulation/motorTypes';
import { electromagneticTorque } from './torque';
import { synchronousAngularSpeed } from './synchronousSpeed';

const guardSlip = (slip: number) =>
  Math.abs(slip) < 1e-6 ? Math.sign(slip || 1) * 1e-6 : slip;

/** Potência mecânica desenvolvida [W] para um escorregamento. */
export const mechanicalPower = (slip: number, p: MotorParameters): number => {
  const safeSlip = guardSlip(slip);
  const torque = electromagneticTorque(slip, p);
  const ws = synchronousAngularSpeed(p.frequency, p.poles);
  return torque * (1 - safeSlip) * ws;
};

/** Potência elétrica de entrada [W] a partir da corrente e fator de potência. */
export const inputPower = (
  current: number,
  powerFactor: number,
  lineVoltage: number,
): number => 3 * (lineVoltage / Math.sqrt(3)) * current * powerFactor;
