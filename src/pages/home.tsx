import { useMemo } from 'react';
import { Box, Button, Card, CardContent, Grid, Slider, Stack, Typography } from '@mui/material';
import { MotorViewer } from '../components/model-viewer';
import { MotorState } from '../simulation/motorTypes';
import { useMotorSimulation } from '../simulation/useMotorSimulation';

const format = (value: number, digits = 0) => value.toFixed(digits);

export default function Home() {
  const simulation = useMotorSimulation();
  const { snapshot, parameters, history } = simulation;
  const statusColor = snapshot.state === MotorState.Running ? '#55d68a' : '#f2b84b';
  const chartPoints = useMemo(() => history.slice(-80), [history]);

  return (
    <Box sx={{ color: 'text.primary' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} mb={2}>
        <Box>
          <Typography variant="overline" color="text.secondary">Laboratório virtual</Typography>
          <Typography variant="h4" fontWeight={700}>Motor de indução trifásico</Typography>
          <Typography color="text.secondary">Modelo 4 polos · 50 Hz · 380 V</Typography>
        </Box>
        <Stack direction="row" gap={1} alignItems="center">
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: statusColor }} />
          <Typography fontWeight={600}>{snapshot.state}</Typography>
          <Button variant="contained" onClick={simulation.start} disabled={snapshot.state !== MotorState.Off}>Ligar</Button>
          <Button variant="outlined" onClick={simulation.stop} disabled={snapshot.state === MotorState.Off}>Parar</Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ minHeight: 430, bgcolor: 'rgba(17, 24, 39, 0.7)' }}>
            <CardContent sx={{ height: '100%', p: 1 }}>
              <MotorViewer />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Grid container spacing={1.5}>
            {[
              ['RPM', `${format(snapshot.rpm)} rpm`],
              ['Velocidade síncrona', `${format(snapshot.synchronousRpm)} rpm`],
              ['Escorregamento', `${format(snapshot.slip * 100, 2)} %`],
              ['Corrente', `${format(snapshot.current, 2)} A`],
              ['Torque', `${format(snapshot.torque, 2)} Nm`],
              ['Potência mecânica', `${format(snapshot.power / 1000, 2)} kW`],
            ].map(([label, value]) => (
              <Grid size={{ xs: 6 }} key={label}>
                <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="h6" fontWeight={700}>{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Card sx={{ mt: 1.5 }}>
            <CardContent>
              <Typography fontWeight={700} gutterBottom>Carga mecânica</Typography>
              <Slider
                value={parameters.loadTorque}
                min={0}
                max={45}
                step={1}
                valueLabelDisplay="auto"
                onChange={(_, value) => simulation.setLoadTorque(value as number)}
                aria-label="Torque da carga mecânica"
              />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">0 Nm</Typography>
                <Typography variant="caption" color="text.secondary">{format(parameters.loadTorque)} Nm</Typography>
                <Typography variant="caption" color="text.secondary">45 Nm</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
                <Box>
                  <Typography fontWeight={700}>Curva de aceleração</Typography>
                  <Typography variant="caption" color="text.secondary">RPM observado durante a partida ({chartPoints.length} amostras)</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  FP {format(snapshot.powerFactor, 2)} · Eficiência {format(snapshot.efficiency * 100, 1)}%
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', alignItems: 'end', gap: 0.5, height: 100, mt: 2, px: 1 }} aria-label="Gráfico de RPM ao longo do tempo">
                {chartPoints.length > 0 ? chartPoints.map((point, index) => (
                  <Box key={`${point.time}-${index}`} sx={{ flex: 1, minWidth: 2, height: `${Math.max(3, point.rpm / Math.max(snapshot.synchronousRpm, 1) * 100)}%`, bgcolor: 'primary.main', borderRadius: '2px 2px 0 0' }} title={`${format(point.rpm)} rpm`} />
                )) : <Typography color="text.secondary">Ligue o motor para iniciar a medição.</Typography>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
