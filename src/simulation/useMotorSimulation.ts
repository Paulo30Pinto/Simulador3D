import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calculateSnapshot } from './motorPhysics';
import {
  defaultMotorFaults,
  defaultMotorParameters,
  initialMotorSnapshot,
  MotorState,
  type MotorFaults,
  type MotorHistoryPoint,
  type MotorParameters,
  type MotorSnapshot,
} from './motorTypes';

const TICK_SECONDS = 0.05;
const MAX_HISTORY = 240;

export interface UseMotorSimulationReturn {
  parameters: MotorParameters;
  snapshot: MotorSnapshot;
  history: MotorHistoryPoint[];
  faults: MotorFaults;
  start: () => void;
  stop: () => void;
  reset: () => void;
  setLoadTorque: (loadTorque: number) => void;
  setVoltage: (voltage: number) => void;
  setFrequency: (frequency: number) => void;
  toggleFault: (faultKey: keyof MotorFaults) => void;
  setFault: (faultKey: keyof MotorFaults, active: boolean) => void;
  resetFaults: () => void;
}

export function useMotorSimulation(initialParameters: MotorParameters = defaultMotorParameters): UseMotorSimulationReturn {
  const [parameters, setParameters] = useState<MotorParameters>(initialParameters);
  const [snapshot, setSnapshot] = useState<MotorSnapshot>(initialMotorSnapshot);
  const [history, setHistory] = useState<MotorHistoryPoint[]>([]);
  const [faults, setFaults] = useState<MotorFaults>(defaultMotorFaults);

  const paramsRef = useRef(parameters);
  paramsRef.current = parameters;

  const faultsRef = useRef(faults);
  faultsRef.current = faults;

  const isOff = snapshot.state === MotorState.Off;

  useEffect(() => {
    if (isOff) return;

    const timer = window.setInterval(() => {
      setSnapshot((current) => {
        const next = calculateSnapshot(current, paramsRef.current, TICK_SECONDS, faultsRef.current);
        setHistory((points) => [
          ...points,
          {
            time: Number(next.time.toFixed(2)),
            rpm: next.rpm,
            current: next.current,
            torque: next.torque,
            slip: next.slip,
          },
        ].slice(-MAX_HISTORY));
        return next;
      });
    }, TICK_SECONDS * 1000);

    return () => window.clearInterval(timer);
  }, [isOff]);

  const start = useCallback(() => {
    setSnapshot((current) => ({
      ...current,
      state: MotorState.Starting,
      time: 0,
      rpm: 0,
      faults: faultsRef.current,
    }));
    setHistory([]);
  }, []);

  const stop = useCallback(() => {
    setSnapshot((current) => {
      if (current.state === MotorState.Off) return current;
      return {
        ...current,
        state: MotorState.Stopping,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setSnapshot({
      ...initialMotorSnapshot,
      loadTorque: paramsRef.current.loadTorque,
      faults: defaultMotorFaults,
    });
    setFaults(defaultMotorFaults);
    setHistory([]);
  }, []);

  const setLoadTorque = useCallback((loadTorque: number) => {
    setParameters((current) => ({ ...current, loadTorque }));
    setSnapshot((current) => ({ ...current, loadTorque }));
  }, []);

  const setVoltage = useCallback((voltage: number) => {
    setParameters((current) => ({ ...current, voltage }));
  }, []);

  const setFrequency = useCallback((frequency: number) => {
    setParameters((current) => ({ ...current, frequency }));
  }, []);

  const toggleFault = useCallback((faultKey: keyof MotorFaults) => {
    setFaults((prev) => {
      const next = { ...prev, [faultKey]: !prev[faultKey] };
      setSnapshot((cur) => ({ ...cur, faults: next }));
      return next;
    });
  }, []);

  const setFault = useCallback((faultKey: keyof MotorFaults, active: boolean) => {
    setFaults((prev) => {
      const next = { ...prev, [faultKey]: active };
      setSnapshot((cur) => ({ ...cur, faults: next }));
      return next;
    });
  }, []);

  const resetFaults = useCallback(() => {
    setFaults(defaultMotorFaults);
    setSnapshot((cur) => ({ ...cur, faults: defaultMotorFaults }));
  }, []);

  return useMemo(
    () => ({
      parameters,
      snapshot,
      history,
      faults,
      start,
      stop,
      reset,
      setLoadTorque,
      setVoltage,
      setFrequency,
      toggleFault,
      setFault,
      resetFaults,
    }),
    [parameters, snapshot, history, faults, start, stop, reset, setLoadTorque, setVoltage, setFrequency, toggleFault, setFault, resetFaults],
  );
}

