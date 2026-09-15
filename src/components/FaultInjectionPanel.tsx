import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import VibrationIcon from '@mui/icons-material/Vibration';
import type { MotorFaults } from '../simulation/motorTypes';

interface FaultInjectionPanelProps {
  faults: MotorFaults;
  onToggleFault: (faultKey: keyof MotorFaults) => void;
  onResetFaults: () => void;
  vibration?: number;
  isRunning: boolean;
}

export function FaultInjectionPanel({
  faults,
  onToggleFault,
  onResetFaults,
  vibration = 1.2,
  isRunning,
}: FaultInjectionPanelProps) {
  const hasActiveFault = faults.openPhase || faults.rotorImbalance;

  return (
    <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <CardContent>
        {/* Cabeçalho do Painel */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <BuildCircleIcon color={hasActiveFault ? 'warning' : 'primary'} />
            <Typography variant="h6" fontWeight={700}>
              Injeção de Falhas (Diagnóstico)
            </Typography>
          </Stack>
          <Tooltip
            title={
              hasActiveFault
                ? 'O motor está operando sob regime de falha induzida. Observe o impacto no osciloscópio e nos medidores.'
                : 'Condição nominal equilibrada: todas as 3 fases e o rotor operam dentro das especificações de projeto.'
            }
            arrow
          >
            <Chip
              icon={hasActiveFault ? <WarningAmberIcon /> : <CheckCircleOutlineIcon />}
              label={hasActiveFault ? 'FALHA ATIVA' : 'SISTEMA NORMAL'}
              color={hasActiveFault ? 'error' : 'success'}
              size="small"
              variant="outlined"
            />
          </Tooltip>
        </Stack>

        <Typography variant="body2" color="text.secondary" paragraph>
          Simule anomalias eletromecânicas e analise os efeitos em tempo real na rotação, corrente e formas de onda.
        </Typography>

        {/* Toggles de Falha com Tooltips Contextuais */}
        <Stack spacing={1.5}>
          {/* Falha 1: Fase Aberta */}
          <Box
            sx={{
              p: 1.25,
              borderRadius: 1,
              bgcolor: faults.openPhase ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.02)',
              border: faults.openPhase ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Fase Aberta (Open Phase)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Perda do condutor da fase A (queima de fusível monofásico)
                </Typography>
              </Box>
              <Tooltip
                title="Ativar/desativar perda de fase: rompe a fase A, forçando operação bifásica. Impede a partida a partir do repouso e causa sobrecorrente nas fases B e C."
                arrow
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={faults.openPhase}
                      onChange={() => onToggleFault('openPhase')}
                      color="error"
                    />
                  }
                  label=""
                  sx={{ m: 0 }}
                />
              </Tooltip>
            </Stack>

            {faults.openPhase && (
              <Alert severity="error" sx={{ mt: 1, py: 0.25, fontSize: '0.8rem' }}>
                <b>Impacto severo:</b> Conjugado de partida = 0 Nm. Corrente nas fases sãs sobe para 173%. Vibração a 100 Hz (9.4 mm/s).
              </Alert>
            )}
          </Box>

          {/* Falha 2: Desbalanceamento Rotórico */}
          <Box
            sx={{
              p: 1.25,
              borderRadius: 1,
              bgcolor: faults.rotorImbalance ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.02)',
              border: faults.rotorImbalance ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Desbalanceamento Rotórico (Rotor Imbalance)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Barras partidas na gaiola ou assimetria mecânica/elétrica
                </Typography>
              </Box>
              <Tooltip
                title="Ativar/desativar desbalanceamento do rotor: simula barras quebradas na gaiola de esquilo. Causa pulsação de conjugado na frequência de escorregamento 2·s·f e modulação de corrente visível no osciloscópio."
                arrow
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={faults.rotorImbalance}
                      onChange={() => onToggleFault('rotorImbalance')}
                      color="warning"
                    />
                  }
                  label=""
                  sx={{ m: 0 }}
                />
              </Tooltip>
            </Stack>

            {faults.rotorImbalance && (
              <Alert severity="warning" sx={{ mt: 1, py: 0.25, fontSize: '0.8rem' }}>
                <b>Impacto detectado:</b> Modulação harmônica na corrente estatórica (bandas laterais MCSA). Vibração mecânica elevada ({vibration.toFixed(1)} mm/s).
              </Alert>
            )}
          </Box>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* Telemetria de Vibração e Ação de Normalização */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Tooltip title="Medição de vibração global RMS no mancal dianteiro segundo a norma ISO 10816 (Zona A: < 1.8 mm/s; Zona D: > 7.1 mm/s)" arrow>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <VibrationIcon fontSize="small" color={vibration > 4.5 ? 'error' : vibration > 2.8 ? 'warning' : 'success'} />
              <Typography variant="caption" color="text.secondary">Vibração RMS:</Typography>
              <Typography
                variant="body2"
                fontWeight={700}
                color={vibration > 4.5 ? 'error.main' : vibration > 2.8 ? 'warning.main' : 'success.main'}
              >
                {isRunning ? `${vibration.toFixed(1)} mm/s` : '0.0 mm/s'}
              </Typography>
            </Stack>
          </Tooltip>

          <Tooltip title="Restaura todas as falhas elétricas e mecânicas para o estado nominal equilibrado de fábrica" arrow>
            <span>
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                disabled={!hasActiveFault}
                onClick={onResetFaults}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Normalizar Sistema
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}
