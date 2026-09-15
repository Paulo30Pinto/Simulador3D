import { clamp, MotorState } from './motorTypes';
import type { MotorFaults, MotorParameters, MotorSnapshot } from './motorTypes';

/**
 * Retorna a velocidade síncrona do campo magnético girante em RPM.
 * Ns = 120 * f / P
 */
export const synchronousSpeed = (frequency: number, poles: number): number => {
  const safePoles = Math.max(Math.round(poles), 2);
  return (120 * Math.max(frequency, 1)) / safePoles;
};

/**
 * Retorna a velocidade síncrona angular em rad/s.
 * ωs = 2 * π * Ns / 60
 */
export const synchronousAngularSpeed = (frequency: number, poles: number): number => {
  const ns = synchronousSpeed(frequency, poles);
  return (2 * Math.PI * ns) / 60;
};

/**
 * Calcula o escorregamento relativo s.
 * s = (Ns - N) / Ns
 */
export const slipFromSpeed = (synchronousRpm: number, rpm: number): number => {
  if (synchronousRpm <= 0) return 1;
  return clamp((synchronousRpm - rpm) / synchronousRpm, -1, 1);
};

/**
 * Parâmetros de Thevenin do circuito equivalente monofásico do motor de indução,
 * visto a partir do ramo rotórico.
 */
export interface TheveninParameters {
  vTh: number;
  rTh: number;
  xTh: number;
  r2: number;
  x2: number;
  xEq: number;
  omegaS: number;
  maxTorque: number;
  criticalSlip: number;
  startingTorque: number;
  startingCurrent: number;
}

export const calculateTheveninParameters = (parameters: MotorParameters): TheveninParameters => {
  const vPhase = parameters.voltage / Math.sqrt(3);
  const r1 = Math.max(parameters.statorResistance, 0.001);
  const r2 = Math.max(parameters.rotorResistance, 0.001);
  const x1 = Math.max(parameters.statorLeakageReactance ?? 0.95, 0.01);
  const x2 = Math.max(parameters.rotorLeakageReactance ?? 0.95, 0.01);
  const xm = Math.max(parameters.magnetizingReactance, 0.1);

  const z1m = Math.sqrt(r1 ** 2 + (x1 + xm) ** 2);
  const vTh = (vPhase * xm) / z1m;
  const kTh = xm / (x1 + xm);
  const rTh = r1 * (kTh ** 2);
  const xTh = x1 * kTh;
  const xEq = xTh + x2;

  const omegaS = synchronousAngularSpeed(parameters.frequency, parameters.poles);

  // Escorregamento crítico no ponto de torque máximo (breakdown slip)
  const criticalSlip = clamp(r2 / Math.sqrt(rTh ** 2 + xEq ** 2), 0.01, 0.95);

  // Torque máximo de desagregação / tombamento (Kloss / Thevenin)
  const maxTorque = (3 * (vTh ** 2)) / (2 * omegaS * (rTh + Math.sqrt(rTh ** 2 + xEq ** 2)));

  // Torque de partida a rotor bloqueado (s = 1)
  const denomStart = (rTh + r2) ** 2 + xEq ** 2;
  const startingTorque = (3 * (vTh ** 2) * r2) / (omegaS * Math.max(denomStart, 0.0001));

  // Corrente aproximada de partida (rotor bloqueado s = 1)
  const zBlockedPhase = Math.sqrt((r1 + r2) ** 2 + (x1 + x2) ** 2);
  const startingCurrent = vPhase / Math.max(zBlockedPhase, 0.05);

  return {
    vTh,
    rTh,
    xTh,
    r2,
    x2,
    xEq,
    omegaS,
    maxTorque,
    criticalSlip,
    startingTorque,
    startingCurrent,
  };
};

/**
 * Calcula o torque eletromagnético Te para um dado escorregamento s.
 */
export const torqueSpeedCurve = (slip: number, parameters: MotorParameters): number => {
  if (slip <= 0.0001) return 0;
  const thev = calculateTheveninParameters(parameters);
  const safeSlip = clamp(slip, 0.0005, 1);

  const denom = (thev.rTh + thev.r2 / safeSlip) ** 2 + thev.xEq ** 2;
  const torque = (3 * (thev.vTh ** 2) * (thev.r2 / safeSlip)) / (thev.omegaS * Math.max(denom, 0.0001));
  return Math.max(0, torque);
};

/**
 * Calcula o torque eletromagnético considerando falhas ativas (Fase aberta ou Desbalanceamento rotórico).
 */
export const torqueSpeedCurveWithFaults = (
  slip: number,
  parameters: MotorParameters,
  faults?: MotorFaults,
  time: number = 0,
): number => {
  let baseTorque = torqueSpeedCurve(slip, parameters);

  // Falha 1: Fase Aberta (Perda de uma das 3 fases)
  if (faults?.openPhase) {
    if (slip >= 0.95) {
      // Motor trifásico energizado com fase aberta a partir do repouso NÃO produz conjugado de partida!
      return 0;
    }
    // Em movimento, o torque útil cai para ~40% e surge componente oscilatória de 100 Hz (2*f)
    const forwardTorque = baseTorque * 0.45;
    const backwardSlip = clamp(2 - slip, 1, 2);
    const backwardTorque = torqueSpeedCurve(backwardSlip, parameters) * 0.15;
    const ripple = 0.25 * Math.sin(2 * Math.PI * 2 * parameters.frequency * time);
    baseTorque = Math.max(0, (forwardTorque - backwardTorque) * (1 + ripple));
  }

  // Falha 2: Desbalanceamento Rotórico (Barras partidas ou assimetria mecânica)
  if (faults?.rotorImbalance) {
    const slipFreq = Math.max(0.5, 2 * Math.abs(slip) * parameters.frequency);
    const imbalanceOscillation = 0.18 * Math.sin(2 * Math.PI * slipFreq * time);
    baseTorque = Math.max(0, baseTorque * (1 + imbalanceOscillation));
  }

  return baseTorque;
};

/**
 * Calcula os parâmetros elétricos instantâneos (corrente de estator, fator de potência, potência ativa).
 */
export const calculateElectricalOperatingPoint = (
  slip: number,
  parameters: MotorParameters,
  thev: TheveninParameters,
) => {
  const safeSlip = clamp(slip, 0.0005, 1);
  const vPhase = parameters.voltage / Math.sqrt(3);
  const r1 = Math.max(parameters.statorResistance, 0.001);
  const x1 = Math.max(parameters.statorLeakageReactance ?? 0.95, 0.01);
  const r2 = thev.r2;
  const x2 = thev.x2;
  const xm = Math.max(parameters.magnetizingReactance, 0.1);

  // Ramo do rotor refletido ao estator: Z2 = (R2/s) + jX2
  const r2Slip = r2 / safeSlip;
  const z2Squared = r2Slip ** 2 + x2 ** 2;

  // Admitância do rotor: Y2 = G2 - jB2
  const g2 = r2Slip / z2Squared;
  const b2 = x2 / z2Squared;

  // Admitância de magnetização: Ym = -j(1/Xm)
  const bm = 1 / xm;

  // Admitância da combinação em paralelo Yp = G2 - j(B2 + Bm)
  const gp = g2;
  const bp = b2 + bm;
  const ypSquared = gp ** 2 + bp ** 2;

  // Impedância em paralelo Zp = Rp + jXp
  const rp = gp / Math.max(ypSquared, 0.00001);
  const xp = bp / Math.max(ypSquared, 0.00001);

  // Impedância total de entrada por fase Zin = (R1 + Rp) + j(X1 + Xp)
  const rTotal = r1 + rp;
  const xTotal = x1 + xp;
  const zTotal = Math.sqrt(rTotal ** 2 + xTotal ** 2);

  // Corrente estatórica RMS por fase (igual à corrente de linha em Y)
  const statorCurrent = vPhase / Math.max(zTotal, 0.05);

  // Fator de potência cos(φ)
  const powerFactor = clamp(rTotal / Math.max(zTotal, 0.0001), 0.05, 0.98);

  // Potência elétrica ativa total trifásica
  const inputPower = Math.sqrt(3) * parameters.voltage * statorCurrent * powerFactor;

  return {
    statorCurrent,
    powerFactor,
    inputPower,
  };
};

/**
 * Executa um passo de integração temporal dt (em segundos),
 * atualizando o snapshot físico do motor através da equação dinâmica:
 * J * dω/dt = Te - TL - B*ω
 */
export const calculateSnapshot = (
  previous: MotorSnapshot,
  parameters: MotorParameters,
  dt: number,
  faults?: MotorFaults,
): MotorSnapshot => {
  const synchronousRpm = synchronousSpeed(parameters.frequency, parameters.poles);
  const thev = calculateTheveninParameters(parameters);
  const omegaPrevious = (previous.rpm * 2 * Math.PI) / 60;
  const currentTime = previous.time + dt;

  // CASO 1: Motor está DESLIGADO e em repouso
  if (previous.state === MotorState.Off) {
    return {
      time: 0,
      state: MotorState.Off,
      rpm: 0,
      synchronousRpm,
      slip: 1,
      torque: 0,
      loadTorque: parameters.loadTorque,
      current: 0,
      power: 0,
      powerFactor: 0,
      efficiency: 0,
      maxTorque: thev.maxTorque,
      criticalSlip: thev.criticalSlip,
      startingTorque: thev.startingTorque,
      startingCurrent: thev.startingCurrent,
      faults,
      vibration: 0,
      phaseCurrents: { phaseA: 0, phaseB: 0, phaseC: 0 },
    };
  }

  // CASO 2: Motor está no processo de PARADA (tensão cortada, desacelera por inércia e atrito)
  if (previous.state === MotorState.Stopping) {
    const subSteps = 10;
    const h = dt / subSteps;
    let omega = omegaPrevious;

    for (let i = 0; i < subSteps; i++) {
      const friction = parameters.friction * omega;
      const resistiveTorque = parameters.loadTorque + friction;
      const deceleration = resistiveTorque / Math.max(parameters.inertia, 0.01);
      omega = Math.max(0, omega - deceleration * h);
      if (omega <= 0.05) {
        omega = 0;
        break;
      }
    }

    const nextRpm = (omega * 60) / (2 * Math.PI);
    if (nextRpm <= 0.5) {
      return {
        time: currentTime,
        state: MotorState.Off,
        rpm: 0,
        synchronousRpm,
        slip: 1,
        torque: 0,
        loadTorque: parameters.loadTorque,
        current: 0,
        power: 0,
        powerFactor: 0,
        efficiency: 0,
        maxTorque: thev.maxTorque,
        criticalSlip: thev.criticalSlip,
        startingTorque: thev.startingTorque,
        startingCurrent: thev.startingCurrent,
        faults,
        vibration: 0,
        phaseCurrents: { phaseA: 0, phaseB: 0, phaseC: 0 },
      };
    }

    const nextSlip = slipFromSpeed(synchronousRpm, nextRpm);
    return {
      time: currentTime,
      state: MotorState.Stopping,
      rpm: nextRpm,
      synchronousRpm,
      slip: nextSlip,
      torque: 0,
      loadTorque: parameters.loadTorque,
      current: 0,
      power: 0,
      powerFactor: 0,
      efficiency: 0,
      maxTorque: thev.maxTorque,
      criticalSlip: thev.criticalSlip,
      startingTorque: thev.startingTorque,
      startingCurrent: thev.startingCurrent,
      faults,
      vibration: 0.8 * (nextRpm / 1500),
      phaseCurrents: { phaseA: 0, phaseB: 0, phaseC: 0 },
    };
  }

  // CASO 3: Motor energizado (Partida, Aceleração, Regime, Sobrecarga ou Falha)
  const subSteps = 20;
  const h = dt / subSteps;
  let omega = omegaPrevious;

  for (let i = 0; i < subSteps; i++) {
    const currentRpm = (omega * 60) / (2 * Math.PI);
    const currentSlip = slipFromSpeed(synchronousRpm, currentRpm);
    const te = torqueSpeedCurveWithFaults(currentSlip, parameters, faults, currentTime);
    const friction = parameters.friction * omega;
    const netTorque = te - parameters.loadTorque - friction;
    const alpha = netTorque / Math.max(parameters.inertia, 0.01);

    // Heun predictor-corrector / RK2
    const omegaPredict = clamp(omega + alpha * h, 0, thev.omegaS * 0.9995);
    const rpmPredict = (omegaPredict * 60) / (2 * Math.PI);
    const slipPredict = slipFromSpeed(synchronousRpm, rpmPredict);
    const tePredict = torqueSpeedCurveWithFaults(slipPredict, parameters, faults, currentTime + h);
    const frictionPredict = parameters.friction * omegaPredict;
    const netTorquePredict = tePredict - parameters.loadTorque - frictionPredict;
    const alphaPredict = netTorquePredict / Math.max(parameters.inertia, 0.01);

    omega = clamp(omega + 0.5 * (alpha + alphaPredict) * h, 0, thev.omegaS * 0.9995);
  }

  const nextOmega = omega;
  const nextRpm = (nextOmega * 60) / (2 * Math.PI);
  const nextSlip = slipFromSpeed(synchronousRpm, nextRpm);
  const electromagneticTorque = torqueSpeedCurveWithFaults(nextSlip, parameters, faults, currentTime);

  // Cálculos elétricos
  const electrical = calculateElectricalOperatingPoint(nextSlip, parameters, thev);
  let effectiveCurrent = electrical.statorCurrent;
  let effectivePowerFactor = electrical.powerFactor;

  // Modificação de correntes por falha
  let currentA = effectiveCurrent;
  let currentB = effectiveCurrent;
  let currentC = effectiveCurrent;
  let vibration = 1.2; // mm/s normal

  if (faults?.openPhase) {
    currentA = 0; // Fase A aberta
    // As fases restantes puxam maior corrente (sobrecarga bifásica)
    currentB = effectiveCurrent * 1.73;
    currentC = effectiveCurrent * 1.73;
    effectiveCurrent = (currentB + currentC) / 2;
    effectivePowerFactor = clamp(effectivePowerFactor * 0.75, 0.1, 0.9);
    vibration = 9.4; // Forte vibração a 100 Hz
  }

  if (faults?.rotorImbalance) {
    const mod = 0.14 * Math.sin(2 * Math.PI * (2 * Math.abs(nextSlip) * parameters.frequency) * currentTime);
    currentA = currentA * (1 + mod);
    currentB = currentB * (1 - mod * 0.5);
    currentC = currentC * (1 - mod * 0.5);
    vibration = Math.max(vibration, 5.8);
  }

  const shaftPower = Math.max(0, electromagneticTorque * nextOmega - parameters.friction * (nextOmega ** 2));
  const efficiency = electrical.inputPower > 10 ? clamp(shaftPower / (electrical.inputPower * (faults?.openPhase ? 1.5 : 1)), 0, 0.96) : 0;

  // Classificação de estados
  let nextState = MotorState.Running;
  if (faults?.openPhase) {
    nextState = MotorState.Fault;
  } else if (faults?.rotorImbalance && nextSlip > 0.1) {
    nextState = MotorState.Fault;
  } else if (parameters.loadTorque > thev.maxTorque * 0.98 && nextSlip > thev.criticalSlip) {
    nextState = MotorState.Overload;
  } else if (nextRpm <= 15) {
    nextState = MotorState.Starting;
  } else if (nextSlip > 0.08) {
    nextState = MotorState.Accelerating;
  } else {
    nextState = MotorState.Running;
  }

  return {
    time: currentTime,
    state: nextState,
    rpm: nextRpm,
    synchronousRpm,
    slip: nextSlip,
    torque: electromagneticTorque,
    loadTorque: parameters.loadTorque,
    current: effectiveCurrent,
    power: shaftPower,
    powerFactor: effectivePowerFactor,
    efficiency,
    maxTorque: thev.maxTorque,
    criticalSlip: thev.criticalSlip,
    startingTorque: thev.startingTorque,
    startingCurrent: thev.startingCurrent,
    faults,
    vibration,
    phaseCurrents: {
      phaseA: currentA,
      phaseB: currentB,
      phaseC: currentC,
    },
  };
};

