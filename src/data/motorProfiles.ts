/**
 * Perfis de motor pré-configurados, selecionáveis pelo utilizador.
 *
 * Os parâmetros do circuito equivalente (R1, X1, R2, X2, Xm) são
 * aproximações educacionais, calibrados a partir de valores típicos em
 * p.u. para a classe de potência — suficientes para um simulador didático,
 * não para dimensionamento real.
 */
import type { MotorParameters } from '../simulation/motorTypes';

export interface MotorProfile {
  id: string;
  name: string;
  description: string;
  parameters: MotorParameters;
}

export const motorProfiles: MotorProfile[] = [
  {
    id: 'motor-4p-10kw',
    name: '4 polos · 50 Hz · 380 V · 10 kW',
    description: 'Motor de indução trifásico, rotor em gaiola — referência do MVP.',
    parameters: {
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
    },
  },
  {
    id: 'motor-2p-5-5kw',
    name: '2 polos · 60 Hz · 220 V · 5,5 kW',
    description: 'Motor de alta velocidade (Ns = 3600 rpm), menor inércia.',
    parameters: {
      voltage: 220,
      frequency: 60,
      poles: 2,
      ratedPower: 5_500,
      inertia: 0.06,
      loadTorque: 12,
      friction: 0.012,
      statorResistance: 0.7,
      statorReactance: 0.7,
      rotorResistance: 0.55,
      rotorReactance: 0.7,
      magnetizingReactance: 15,
    },
  },
  {
    id: 'motor-6p-7-5kw',
    name: '6 polos · 50 Hz · 400 V · 7,5 kW',
    description: 'Motor de baixa velocidade (Ns = 1000 rpm), maior torque.',
    parameters: {
      voltage: 400,
      frequency: 50,
      poles: 6,
      ratedPower: 7_500,
      inertia: 0.35,
      loadTorque: 55,
      friction: 0.03,
      statorResistance: 0.6,
      statorReactance: 0.6,
      rotorResistance: 0.5,
      rotorReactance: 0.6,
      magnetizingReactance: 22,
    },
  },
  {
    id: 'motor-8p-15kw',
    name: '8 polos · 60 Hz · 460 V · 15 kW',
    description: 'Motor de baixa velocidade (Ns = 900 rpm), alta potência.',
    parameters: {
      voltage: 460,
      frequency: 60,
      poles: 8,
      ratedPower: 15_000,
      inertia: 0.6,
      loadTorque: 120,
      friction: 0.04,
      statorResistance: 0.3,
      statorReactance: 0.35,
      rotorResistance: 0.25,
      rotorReactance: 0.35,
      magnetizingReactance: 18,
    },
  },
];

export const defaultProfileId = 'motor-4p-10kw';

/** Obtém um perfil pelo id (fallback para o perfil de referência). */
export const getProfile = (id: string): MotorProfile =>
  motorProfiles.find((m) => m.id === id) ?? motorProfiles[0];
