import { useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Slider,
  Stack,
  Tooltip,
  Typography,
  Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import SyncIcon from '@mui/icons-material/Sync';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import PowerIcon from '@mui/icons-material/Power';
import { MotorViewer } from '../components/model-viewer';
import { Oscilloscope } from '../components/Oscilloscope';
import { FaultInjectionPanel } from '../components/FaultInjectionPanel';
import { MotorState } from '../simulation/motorTypes';
import { useMotorSimulation } from '../simulation/useMotorSimulation';

const format = (value: number, digits = 0) => value.toFixed(digits);

const getStateColor = (state: MotorState): string => {
  switch (state) {
    case MotorState.Running:
      return '#22c55e';
    case MotorState.Accelerating:
      return '#3b82f6';
    case MotorState.Starting:
      return '#f59e0b';
    case MotorState.Stopping:
      return '#ea580c';
    case MotorState.Overload:
      return '#ef4444';
    case MotorState.Fault:
      return '#dc2626';
    case MotorState.Off:
    default:
      return '#94a3b8';
  }
};

export default function Home() {
  const simulation = useMotorSimulation();
  const { snapshot, parameters, history, faults, toggleFault, resetFaults } = simulation;
  const statusColor = getStateColor(snapshot.state);
  const chartPoints = useMemo(() => history.slice(-80), [history]);

  const isOff = snapshot.state === MotorState.Off;
  const isStopping = snapshot.state === MotorState.Stopping;

  const metricCards = [
    {
      label: 'RPM Mecânico',
      value: `${format(snapshot.rpm)} rpm`,
      icon: <SpeedIcon fontSize="small" color="primary" />,
      tooltip: 'Velocidade angular instantânea do rotor em rotações por minuto: N = (1 - s) × Ns.',
    },
    {
      label: 'Velocidade Síncrona',
      value: `${format(snapshot.synchronousRpm)} rpm`,
      icon: <SyncIcon fontSize="small" color="info" />,
      tooltip: 'Velocidade síncrona do campo magnético girante do estator: Ns = 120 × f / P = 1500 rpm.',
    },
    {
      label: 'Escorregamento (s)',
      value: `${format(snapshot.slip * 100, 2)} %`,
      icon: <TrendingDownIcon fontSize="small" color={snapshot.slip > 0.08 ? 'warning' : 'success'} />,
      tooltip: 'Diferença relativa entre a rotação síncrona e a mecânica: s = (Ns - N) / Ns.',
    },
    {
      label: 'Corrente Estatórica',
      value: `${format(snapshot.current, 2)} A`,
      icon: <ElectricBoltIcon fontSize="small" color={snapshot.current > 25 ? 'error' : 'secondary'} />,
      tooltip: 'Corrente elétrica eficaz (RMS) solicitada da rede trifásica por fase nas bobinas do estator.',
    },
    {
      label: 'Torque Eletromecânico',
      value: `${format(snapshot.torque, 2)} Nm`,
      icon: <RotateRightIcon fontSize="small" color="primary" />,
      tooltip: 'Conjugado eletromagnético motriz gerado no rotor pela interação de Faraday-Lorentz.',
    },
    {
      label: 'Potência no Eixo',
      value: `${format(snapshot.power / 1000, 2)} kW`,
      icon: <PowerIcon fontSize="small" color="success" />,
      tooltip: 'Potência mecânica líquida útil entregue à carga: P = Torque × Velocidade angular.',
    },
  ];

  return (
    <Box sx={{ color: 'text.primary' }}>
      {/* Cabeçalho de Controle e Status */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2} mb={2}>
        <Box>
          <Typography variant="overline" color="text.secondary">Laboratório Virtual & Bancada de Testes</Typography>
          <Typography variant="h4" fontWeight={700}>Motor de Indução Trifásico</Typography>
          <Typography color="text.secondary">Modelo 4 polos · 50 Hz · 380 V (10 kW / 13.6 cv) · Sistema Offline</Typography>
        </Box>

        {/* Painel de Ações com Tooltips Contextuais */}
        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <Tooltip title={`Estado operacional do motor na simulação física: ${snapshot.state}.`} arrow>
            <Chip
              sx={{ fontWeight: 700 }}
              avatar={<Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: statusColor }} />}
              label={snapshot.state}
              variant="outlined"
            />
          </Tooltip>

          <Tooltip title="Aciona o contator principal e aplica alimentação trifásica nominal (380V / 50Hz) ao estator." arrow>
            <span>
              <Button
                variant="contained"
                color="success"
                startIcon={<PlayArrowIcon />}
                onClick={simulation.start}
                disabled={!isOff}
              >
                Ligar
              </Button>
            </span>
          </Tooltip>

          <Tooltip title="Abre o circuito elétrico. O motor corta a corrente e desacelera suavemente pela inércia e atrito mecânico." arrow>
            <span>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<StopIcon />}
                onClick={simulation.stop}
                disabled={isOff || isStopping}
              >
                Parar
              </Button>
            </span>
          </Tooltip>

          <Tooltip title="Restaura a simulação física ao estado de fábrica desligado e zera os buffers temporais." arrow>
            <Button
              variant="text"
              color="inherit"
              startIcon={<RestartAltIcon />}
              onClick={simulation.reset}
            >
              Reset
            </Button>
          </Tooltip>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {/* Painel Visualizador 3D */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ minHeight: 460, bgcolor: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <CardContent sx={{ height: '100%', p: 1 }}>
              <MotorViewer rpm={snapshot.rpm} state={snapshot.state} />
            </CardContent>
          </Card>
        </Grid>

        {/* Painel Lateral de Métricas & Diagnósticos */}
        <Grid size={{ xs: 12, lg: 5 }}>
          {/* Métricas Principais com Tooltips Contextuais */}
          <Grid container spacing={1.5}>
            {metricCards.map((metric) => (
              <Grid size={{ xs: 6 }} key={metric.label}>
                <Tooltip title={metric.tooltip} arrow placement="top">
                  <Card sx={{ height: '100%', bgcolor: 'background.paper', cursor: 'help', transition: 'border-color 0.2s', '&:hover': { borderColor: 'primary.main' } }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
                        {metric.icon}
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {metric.label}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={700}>
                        {metric.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              </Grid>
            ))}
          </Grid>

          {/* Painel de Controle de Carga Mecânica com Tooltip */}
          <Card sx={{ mt: 1.5, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Tooltip title="Torque de frenagem imposto pela máquina industrial acoplada ao eixo do motor (0 Nm a 100 Nm)." arrow>
                  <Typography fontWeight={700} sx={{ cursor: 'help' }}>
                    Carga Mecânica (Torque Resistente)
                  </Typography>
                </Tooltip>
                <Typography fontWeight={700} color="primary.main">
                  {format(parameters.loadTorque)} Nm
                </Typography>
              </Stack>
              <Tooltip title="Arraste para ajustar continuamente a carga mecânica no eixo." arrow>
                <Slider
                  value={parameters.loadTorque}
                  min={0}
                  max={100}
                  step={1}
                  valueLabelDisplay="auto"
                  onChange={(_, value) => simulation.setLoadTorque(value as number)}
                  aria-label="Torque da carga mecânica"
                />
              </Tooltip>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">0 Nm (Vazio)</Typography>
                <Typography variant="caption" color="text.secondary">65 Nm (Nominal)</Typography>
                <Typography variant="caption" color="text.secondary">100 Nm (Sobrecarga)</Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* Painel de Injeção de Falhas */}
          <Box sx={{ mt: 1.5 }}>
            <FaultInjectionPanel
              faults={faults}
              onToggleFault={toggleFault}
              onResetFaults={resetFaults}
              vibration={snapshot.vibration}
              isRunning={!isOff}
            />
          </Box>
        </Grid>

        {/* Osciloscópio Digital Trifásico com Recharts */}
        <Grid size={{ xs: 12 }}>
          <Oscilloscope
            state={snapshot.state}
            voltage={parameters.voltage}
            frequency={parameters.frequency}
            current={snapshot.current}
            slip={snapshot.slip}
            powerFactor={snapshot.powerFactor}
            faults={faults}
            phaseCurrents={snapshot.phaseCurrents}
          />
        </Grid>

        {/* Curva de Aceleração e Dinâmica Temporal */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={1}>
                <Box>
                  <Typography fontWeight={700}>Curva de Aceleração & Dinâmica Temporal</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Evolução da velocidade rotórica ({chartPoints.length} amostras) · Ns = {format(snapshot.synchronousRpm)} rpm
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Tooltip title="Fator de potência médio da operação elétrica do motor trifásico" arrow>
                    <Typography variant="body2" color="text.secondary" sx={{ cursor: 'help' }}>
                      FP: <b>{format(snapshot.powerFactor, 2)}</b>
                    </Typography>
                  </Tooltip>
                  <Tooltip title="Eficiência energética da conversão de potência elétrica em potência mecânica de eixo" arrow>
                    <Typography variant="body2" color="text.secondary" sx={{ cursor: 'help' }}>
                      Rendimento: <b>{format(snapshot.efficiency * 100, 1)}%</b>
                    </Typography>
                  </Tooltip>
                  <Tooltip title="Torque de tombamento / conjugado máximo suportável antes da perda de sincronismo (Kloss)" arrow>
                    <Typography variant="body2" color="text.secondary" sx={{ cursor: 'help' }}>
                      T_máx: <b>~185 Nm</b>
                    </Typography>
                  </Tooltip>
                </Stack>
              </Stack>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'end',
                  gap: 0.5,
                  height: 90,
                  mt: 2,
                  px: 1,
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 1,
                  p: 1,
                }}
                aria-label="Gráfico de velocidade ao longo do tempo"
              >
                {chartPoints.length > 0 ? (
                  chartPoints.map((point, index) => (
                    <Tooltip
                      key={`${point.time}-${index}`}
                      title={`${point.time}s: ${format(point.rpm)} rpm | ${format(point.current, 1)}A | ${format(point.torque, 1)}Nm`}
                      arrow
                    >
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 2,
                          height: `${Math.max(4, (point.rpm / Math.max(snapshot.synchronousRpm, 1)) * 100)}%`,
                          bgcolor: point.slip > 0.1 ? 'warning.main' : 'primary.main',
                          borderRadius: '2px 2px 0 0',
                          transition: 'height 0.08s ease',
                          cursor: 'pointer',
                        }}
                      />
                    </Tooltip>
                  ))
                ) : (
                  <Typography color="text.secondary" variant="body2" sx={{ m: 'auto' }}>
                    Pressione &quot;Ligar&quot; para iniciar a simulação e a aquisição temporal de dados.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

