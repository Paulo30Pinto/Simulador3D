import { useCallback, useEffect, useMemo, useState } from 'react';
import { calculateSnapshot } from './motorPhysics';
import {
  defaultMotorParameters,
  initialMotorSnapshot,
  MotorState,
  type MotorHistoryPoint,
  type MotorParameters,
} from './motorTypes';

const TICK_SECONDS = 0.05;
const MAX_HISTORY = 240;

export function useMotorSimulation(initialParameters: MotorParameters = defaultMotorParameters) {
  const [parameters, setParameters] = useState(initialParameters);
  const [snapshot, setSnapshot] = useState(initialMotorSnapshot);
  const [history, setHistory] = useState<MotorHistoryPoint[]>([]);

  useEffect(() => {
    if (snapshot.state === MotorState.Off) return;
    const timer = window.setInterval(() => {
      setSnapshot((current) => {
        const next = calculateSnapshot(current, parameters, TICK_SECONDS);
        setHistory((points) => [...points, {
          time: next.time,
          rpm: next.rpm,
          current: next.current,
          torque: next.torque,
          slip: next.slip,
        }].slice(-MAX_HISTORY));
        return next;
      });
    }, TICK_SECONDS * 1000);
    return () => window.clearInterval(timer);
  }, [parameters, snapshot.state]);

  const start = useCallback(() => {
    setSnapshot((current) => ({ ...current, state: MotorState.Starting, time: 0 }));
    setHistory([]);
  }, []);

  const stop = useCallback(() => {
    setSnapshot((current) => ({
      ...current,
      state: MotorState.Stopping,
      loadTorque: parameters.loadTorque,
    }));
  }, [parameters.loadTorque]);

  const setLoadTorque = useCallback((loadTorque: number) => {
    setParameters((current) => ({ ...current, loadTorque }));
    setSnapshot((current) => ({ ...current, loadTorque }));
  }, []);

  return useMemo(() => ({ parameters, snapshot, history, start, stop, setLoadTorque }), [parameters, snapshot, history, start, stop, setLoadTorque]);
}
