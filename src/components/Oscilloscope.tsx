import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { MotorState, type MotorFaults } from '../simulation/motorTypes';

interface OscilloscopeProps {
  state: MotorState;
  voltage: number;
  frequency: number;
  current: number;
  slip: number;
  powerFactor: number;
  faults?: MotorFaults;
  phaseCurrents?: {
    phaseA: number;
    phaseB: number;
    phaseC: number;
  };
}

type SignalMode = 'voltage' | 'current' | 'power';

export function Oscilloscope({
  state,
  voltage,
  frequency,
  current,
  slip,
  powerFactor,
  faults,
  phaseCurrents,
}: OscilloscopeProps) {
  const [signalMode, setSignalMode] = useState<SignalMode>('voltage');
  const [timeWindowMs, setTimeWindowMs] = useState<number>(40); // 40ms = 2 ciclos a 50Hz
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [phaseOffset, setPhaseOffset] = useState<number>(0);

  const isRunning = state !== MotorState.Off;

  // Animação contínua da defasagem no tempo do osciloscópio
  useEffect(() => {
    if (isPaused || !isRunning) return;

    const interval = window.setInterval(() => {
      setPhaseOffset((prev) => (prev + 0.15) % (2 * Math.PI));
    }, 40);

    return () => window.clearInterval(interval);
  }, [isPaused, isRunning]);

  // Geração dos pontos da forma de onda
  const waveformData = useMemo(() => {
    const pointsCount = 100;
    const dt = timeWindowMs / pointsCount;
    const f = Math.max(frequency, 1);
    const omega = 2 * Math.PI * f;

    // Amplitude de tensão de fase de pico: Vp = V_linha * sqrt(2) / sqrt(3)
    const vPhaseRms = voltage / Math.sqrt(3);
    const vPeak = isRunning ? vPhaseRms * Math.SQRT2 : 0;

    // Amplitude de corrente de estator de pico
    const currentA = phaseCurrents?.phaseA ?? current;
    const currentB = phaseCurrents?.phaseB ?? current;
    const currentC = phaseCurrents?.phaseC ?? current;
    const iPeakA = isRunning ? currentA * Math.SQRT2 : 0;
    const iPeakB = isRunning ? currentB * Math.SQRT2 : 0;
    const iPeakC = isRunning ? currentC * Math.SQRT2 : 0;

    // Ângulo de defasagem de corrente devido ao fator de potência: cos(phi) = fp => phi = acos(fp)
    const phiAngle = isRunning ? Math.acos(Math.min(Math.max(powerFactor, 0.05), 1)) : 0;

    const data = [];

    for (let i = 0; i <= pointsCount; i++) {
      const tMs = i * dt;
      const tSec = tMs / 1000;
      const angle = omega * tSec + phaseOffset;

      if (signalMode === 'voltage') {
        let va = vPeak * Math.sin(angle);
        let vb = vPeak * Math.sin(angle - (2 * Math.PI) / 3);
        let vc = vPeak * Math.sin(angle + (2 * Math.PI) / 3);

        // Se a fase A estiver rompida
        if (faults?.openPhase) {
          va = 0;
          // As tensões entre as fases restantes operam com defasagem de 180°
          vb = vPeak * 0.866 * Math.sin(angle);
          vc = -vb;
        }

        data.push({
          time: Number(tMs.toFixed(1)),
          'Fase A (Va)': Number(va.toFixed(1)),
          'Fase B (Vb)': Number(vb.toFixed(1)),
          'Fase C (Vc)': Number(vc.toFixed(1)),
        });
      } else if (signalMode === 'current') {
        let ia = iPeakA * Math.sin(angle - phiAngle);
        let ib = iPeakB * Math.sin(angle - (2 * Math.PI) / 3 - phiAngle);
        let ic = iPeakC * Math.sin(angle + (2 * Math.PI) / 3 - phiAngle);

        if (faults?.openPhase) {
          ia = 0;
          ib = iPeakB * Math.sin(angle - phiAngle);
          ic = -ib; // Corrente de retorno da malha bifásica
        }

        if (faults?.rotorImbalance) {
          const modA = 0.15 * Math.sin(2 * Math.PI * (2 * Math.abs(slip) * f) * tSec);
          ia = ia * (1 + modA);
          ib = ib * (1 - modA * 0.5);
          ic = ic * (1 - modA * 0.5);
        }

        data.push({
          time: Number(tMs.toFixed(1)),
          'Fase A (Ia)': Number(ia.toFixed(2)),
          'Fase B (Ib)': Number(ib.toFixed(2)),
          'Fase C (Ic)': Number(ic.toFixed(2)),
        });
      } else {
        // Potência instantânea trifásica: p(t) = va*ia + vb*ib + vc*ic
        const va = faults?.openPhase ? 0 : vPeak * Math.sin(angle);
        const vb = vPeak * Math.sin(angle - (2 * Math.PI) / 3);
        const vc = vPeak * Math.sin(angle + (2 * Math.PI) / 3);

        const ia = faults?.openPhase ? 0 : iPeakA * Math.sin(angle - phiAngle);
        const ib = iPeakB * Math.sin(angle - (2 * Math.PI) / 3 - phiAngle);
        const ic = iPeakC * Math.sin(angle + (2 * Math.PI) / 3 - phiAngle);

        const pa = (va * ia) / 1000;
        const pb = (vb * ib) / 1000;
        const pc = (vc * ic) / 1000;
        const pTotal = pa + pb + pc;

        data.push({
          time: Number(tMs.toFixed(1)),
          'Potência Total (kW)': Number(pTotal.toFixed(2)),
          'Fase A (kW)': Number(pa.toFixed(2)),
          'Fase B (kW)': Number(pb.toFixed(2)),
          'Fase C (kW)': Number(pc.toFixed(2)),
        });
      }
    }

    return data;
  }, [timeWindowMs, frequency, voltage, isRunning, phaseCurrents, current, powerFactor, signalMode, phaseOffset, faults, slip]);

  const periodMs = frequency > 0 ? (1000 / frequency).toFixed(1) : '20.0';
  const unitLabel = signalMode === 'voltage' ? 'V' : signalMode === 'current' ? 'A' : 'kW';

  return (
    <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <CardContent>
        {/* Cabeçalho do Osciloscópio */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={1.5} mb={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ShowChartIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Osciloscópio Digital Trifásico
              </Typography>
              <Chip
                size="small"
                label={isPaused ? 'CONGELADO' : isRunning ? 'EM TEMPO REAL' : 'DESLIGADO'}
                color={isPaused ? 'warning' : isRunning ? 'success' : 'default'}
                variant="outlined"
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Análise de sinais de tensão, corrente e potência com defasagem angular e harmônicas
            </Typography>
          </Box>

          {/* Controles do Osciloscópio com Tooltips Contextuais */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Tooltip title="Selecione a grandeza elétrica a ser exibida nas três fases (Tensão, Corrente ou Potência Instantânea)" arrow>
              <ToggleButtonGroup
                size="small"
                value={signalMode}
                exclusive
                onChange={(_, next) => next && setSignalMode(next)}
                aria-label="Modo de sinal do osciloscópio"
              >
                <ToggleButton value="voltage" sx={{ px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 600 }}>
                  Tensão (V)
                </ToggleButton>
                <ToggleButton value="current" sx={{ px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 600 }}>
                  Corrente (A)
                </ToggleButton>
                <ToggleButton value="power" sx={{ px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 600 }}>
                  Potência (kW)
                </ToggleButton>
              </ToggleButtonGroup>
            </Tooltip>

            <Tooltip title="Ajuste a base de tempo da varredura horizontal do osciloscópio (janela de tempo em milissegundos)" arrow>
              <ToggleButtonGroup
                size="small"
                value={timeWindowMs}
                exclusive
                onChange={(_, next) => next && setTimeWindowMs(next)}
                aria-label="Base de tempo"
              >
                <ToggleButton value={20} sx={{ px: 1, py: 0.5, fontSize: '0.75rem' }}>
                  20 ms (1T)
                </ToggleButton>
                <ToggleButton value={40} sx={{ px: 1, py: 0.5, fontSize: '0.75rem' }}>
                  40 ms (2T)
                </ToggleButton>
                <ToggleButton value={60} sx={{ px: 1, py: 0.5, fontSize: '0.75rem' }}>
                  60 ms (3T)
                </ToggleButton>
              </ToggleButtonGroup>
            </Tooltip>

            <Tooltip title={isPaused ? "Retomar a varredura contínua do osciloscópio" : "Congelar a forma de onda atual para análise detalhada (Hold)"} arrow>
              <IconButton
                size="small"
                color={isPaused ? 'warning' : 'primary'}
                onClick={() => setIsPaused((prev) => !prev)}
                sx={{ border: '1px solid rgba(255, 255, 255, 0.15)' }}
              >
                {isPaused ? <PlayArrowIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Redefinir ponto de disparo e fase do osciloscópio" arrow>
              <IconButton
                size="small"
                onClick={() => setPhaseOffset(0)}
                sx={{ border: '1px solid rgba(255, 255, 255, 0.15)' }}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Display Gráfico Recharts */}
        <Box
          sx={{
            width: '100%',
            height: 280,
            bgcolor: 'rgba(9, 14, 26, 0.95)',
            borderRadius: 1.5,
            p: 1,
            border: '1px solid rgba(34, 197, 94, 0.2)',
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.6)',
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={waveformData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis
                dataKey="time"
                stroke="rgba(255, 255, 255, 0.4)"
                tick={{ fontSize: 11 }}
                unit=" ms"
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.4)"
                tick={{ fontSize: 11 }}
                unit={` ${unitLabel}`}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#fff',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: 12, paddingBottom: 6 }}
              />
              <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.2)" strokeDasharray="2 2" />

              {signalMode === 'power' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="Potência Total (kW)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Fase A (kW)"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Fase B (kW)"
                    stroke="#06b6d4"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Fase C (kW)"
                    stroke="#ec4899"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={false}
                    isAnimationActive={false}
                  />
                </>
              ) : (
                <>
                  {/* Fase A: Dourado / Âmbar */}
                  <Line
                    type="monotone"
                    dataKey={signalMode === 'voltage' ? 'Fase A (Va)' : 'Fase A (Ia)'}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  {/* Fase B: Ciano */}
                  <Line
                    type="monotone"
                    dataKey={signalMode === 'voltage' ? 'Fase B (Vb)' : 'Fase B (Ib)'}
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  {/* Fase C: Rosa / Magenta */}
                  <Line
                    type="monotone"
                    dataKey={signalMode === 'voltage' ? 'Fase C (Vc)' : 'Fase C (Ic)'}
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Painel de Telemetria Digital do Osciloscópio com Tooltips */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          gap={1.5}
          mt={1.5}
          p={1}
          sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 1 }}
        >
          <Tooltip title="Frequência fundamental da rede elétrica de alimentação (50 Hz)" arrow>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ElectricBoltIcon fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">Freq:</Typography>
              <Typography variant="body2" fontWeight={700}>{frequency.toFixed(1)} Hz</Typography>
            </Stack>
          </Tooltip>

          <Tooltip title="Período fundamental da senoide (T = 1 / f = 20 ms a 50 Hz)" arrow>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="body2" color="text.secondary">Período (T):</Typography>
              <Typography variant="body2" fontWeight={700}>{periodMs} ms</Typography>
            </Stack>
          </Tooltip>

          <Tooltip title="Defasagem angular geométrica e temporal normal entre fases equilibradas (120° ou 2π/3 rad)" arrow>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="body2" color="text.secondary">Defasagem:</Typography>
              <Typography variant="body2" fontWeight={700} color={faults?.openPhase ? 'error.main' : 'success.main'}>
                {faults?.openPhase ? 'Assimétrica (Fase Aberta)' : '120° Simétrica'}
              </Typography>
            </Stack>
          </Tooltip>

          <Tooltip title="Fator de potência elétrico cos(φ) que determina a defasagem entre tensão e corrente" arrow>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="body2" color="text.secondary">cos(φ):</Typography>
              <Typography variant="body2" fontWeight={700}>{powerFactor.toFixed(2)}</Typography>
            </Stack>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}
