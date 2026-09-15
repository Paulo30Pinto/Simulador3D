/**
 * Engenharia elétrica — velocidade síncrona.
 *
 * Funções puras, independentes do React e do 3D, testáveis isoladamente.
 *
 *   Ns = 120 · f / P        velocidade síncrona [rpm]
 *   ωs = 2π · f / (P/2)     velocidade síncrona angular [rad/s]
 */

/** Velocidade síncrona [rpm]: Ns = 120·f / P. */
export const synchronousSpeed = (frequency: number, poles: number): number =>
  (120 * frequency) / Math.max(poles, 2);

/** Velocidade síncrona angular [rad/s]: ωs = 2π·f / (P/2). */
export const synchronousAngularSpeed = (frequency: number, poles: number): number =>
  (2 * Math.PI * frequency) / (poles / 2);
