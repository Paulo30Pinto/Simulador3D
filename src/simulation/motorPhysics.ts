import { clamp } from './motorTypes';
import type { MotorParameters, MotorSnapshot } from './motorTypes';
import { MotorState } from './motorTypes';

export const synchronousSpeed = (frequency: number, poles: number) =>
  (120 * frequency) / Math.max(poles, 2);

export const slipFromSpeed = (synchronousRpm: number, rpm: number) =>
  synchronousRpm <= 0 ? 1 : clamp((synchronousRpm - rpm) / synchronousRpm, 0, 1);

export const torqueSpeedCurve = (
  slip: number,
  parameters: MotorParameters,
) => {
  const safeSlip = clamp(slip, 0.001, 1);
  const numerator = 3 * parameters.voltage ** 2 * (parameters.rotorResistance / safeSlip);
  const denominator =
    2 * Math.PI * (parameters.frequency / (parameters.poles / 2)) *
    ((parameters.statorResistance + parameters.rotorResistance / safeSlip) ** 2 +
      parameters.magnetizingReactance ** 2);
  return Math.max(0, numerator / Math.max(denominator, 0.001));
};

export const calculateSnapshot = (
  previous: MotorSnapshot,
  parameters: MotorParameters,
  dt: number,
): MotorSnapshot => {
  const synchronousRpm = synchronousSpeed(parameters.frequency, parameters.poles);
  const slip = slipFromSpeed(synchronousRpm, previous.rpm);
  const electromagneticTorque = torqueSpeedCurve(slip, parameters);
  const netTorque = electromagneticTorque - parameters.loadTorque - parameters.friction * (previous.rpm * (2 * Math.PI / 60));
  const angularAcceleration = netTorque / Math.max(parameters.inertia, 0.001);
  const nextRpm = clamp(previous.rpm + angularAcceleration * dt * 60 / (2 * Math.PI), 0, synchronousRpm * 0.999);
  const nextSlip = slipFromSpeed(synchronousRpm, nextRpm);
  const current = previous.state === MotorState.Off
    ? 0
    : clamp((parameters.voltage / Math.sqrt(3)) / Math.sqrt(parameters.statorResistance ** 2 + (parameters.magnetizingReactance * nextSlip) ** 2) * (0.25 + 0.75 * nextSlip), 0, 120);
  const shaftPower = Math.max(0, electromagneticTorque * nextRpm * 2 * Math.PI / 60);
  const inputPower = parameters.voltage * current * Math.sqrt(3) * 0.82;
  const efficiency = inputPower > 0 ? clamp(shaftPower / inputPower, 0, 0.98) : 0;
  const state = nextRpm <= 1
    ? MotorState.Starting
    : nextSlip > 0.12
      ? MotorState.Accelerating
      : nextSlip <= 0.04
        ? MotorState.Running
        : MotorState.Accelerating;

  return {
    time: previous.time + dt,
    state,
    rpm: nextRpm,
    synchronousRpm,
    slip: nextSlip,
    torque: electromagneticTorque,
    loadTorque: parameters.loadTorque,
    current,
    power: shaftPower,
    powerFactor: current > 0 ? 0.82 : 0,
    efficiency,
  };
};
