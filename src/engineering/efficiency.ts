/**
 * Engenharia elétrica — rendimento.
 *
 *   η = P_mec / P_in   (limitado a 98 % — perdas não modeladas no MVP)
 */
import { clamp } from '../simulation/motorTypes';

/** Rendimento [0..1] a partir das potências mecânica e de entrada. */
export const efficiency = (mechanicalPower: number, inputPower: number): number =>
  inputPower > 0 ? clamp(mechanicalPower / inputPower, 0, 0.98) : 0;
