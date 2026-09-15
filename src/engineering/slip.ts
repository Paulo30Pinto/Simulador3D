/**
 * Engenharia elétrica — escorregamento.
 *
 *   s = (Ns − N) / Ns
 *
 * Permite escorregamento NEGATIVO (N > Ns): nessa região o motor opera como
 * gerador/freno regenerativo, produzindo torque de frenagem — o que amortece
 * naturalmente qualquer ultrapassagem da velocidade síncrona e estabiliza a
 * simulação.
 */
import { clamp } from '../simulation/motorTypes';

/** Escorregamento a partir da rotação: s = (Ns − N) / Ns (admite s < 0). */
export const slipFromSpeed = (synchronousRpm: number, rpm: number): number =>
  synchronousRpm <= 0 ? 1 : clamp((synchronousRpm - rpm) / synchronousRpm, -0.5, 1);
