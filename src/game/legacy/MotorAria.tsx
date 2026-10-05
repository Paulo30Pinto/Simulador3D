/* eslint-disable @typescript-eslint/no-explicit-any */
// Estrutura inicial com base no fluxograma do PDF
import { useState, useEffect } from 'react';
import { Button, Typography, Box, Slider, Grid, Card, CardContent } from '@mui/material';


interface Parameters {
  voltage: number;
  resistance: number;
  inertia: number;
  nominalRPM: number;
}

interface State {
  isRunning: boolean;
  rpm: number;
  torque: number;
  current: number;
  powerFactor: number;
  efficiency: number;
}

const initialParameters: Parameters = {
  voltage: 220,
  resistance: 1.2,
  inertia: 0.01,
  nominalRPM: 3000,
};

const initialState: State = {
  isRunning: false,
  rpm: 0,
  torque: 0,
  current: 0,
  powerFactor: 0,
  efficiency: 0,
};

export default function MotorSimulator() {
  const [params, setParams] = useState(initialParameters);
  const [state, setState] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.isRunning && state.rpm < params.nominalRPM * 0.95) {
      const interval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          rpm: Math.min(prev.rpm + 200, params.nominalRPM),
        }));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [state.isRunning, state.rpm, params.nominalRPM]);

  const startMotor = () => {
    if (params.voltage <= 0 || params.resistance <= 0) {
      setError('Parâmetros inválidos');
      return;
    }
    setError(null);
    setState((prev) => ({
      ...prev,
      isRunning: true,
      current: params.voltage / params.resistance,
      rpm: 0,
      torque: 5,
    }));
  };

  const stopMotor = () => {
    setState({ ...initialState });
  };

  const handleSliderChange = (field: keyof Parameters) => (_: any, value: number | number[]) => {
    setParams((prev) => ({ ...prev, [field]: value as number }));
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Simulador de Motor Elétrico Assíncrono
      </Typography>

      <Grid container spacing={2}>
        <Grid component="div" container spacing={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Parâmetros</Typography>
              {["voltage", "resistance", "inertia", "nominalRPM"].map(
                (field) => (
                  <Box key={field} my={2}>
                    <Typography gutterBottom>{field}</Typography>
                    <Slider
                      value={params[field as keyof Parameters]}
                      onChange={handleSliderChange(field as keyof Parameters)}
                      min={field === "nominalRPM" ? 1000 : 0.1}
                      max={field === "nominalRPM" ? 4000 : 300}
                      step={field === "nominalRPM" ? 100 : 0.1}
                    />
                  </Box>
                )
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid component="div" container spacing={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Estado do Motor</Typography>
              <Typography>RPM: {state.rpm.toFixed(0)}</Typography>
              <Typography>Corrente: {state.current.toFixed(2)} A</Typography>
              <Typography>Torque: {state.torque.toFixed(2)} Nm</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={startMotor}
          disabled={state.isRunning}
        >
          Iniciar Motor
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={stopMotor}
          disabled={!state.isRunning}
          sx={{ ml: 2 }}
        >
          Parar Motor
        </Button>
      </Box>

      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
