import { useEffect, useRef, useState, useCallback } from "react";
import { Box, Button, Card, CardContent, Stack, Typography, Chip, Switch, FormControlLabel, Tooltip } from "@mui/material";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { MotorViewer } from "./model-viewer";
import { registerAudio, stopAllAudios } from "../utils/audioManager";

export default function MotorLigado() {
  const [isRunning, setIsRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rpm, setRpm] = useState(1440);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize offline audio
  useEffect(() => {
    const audio = new Audio("/mp3/motor-loop-83480.mp3");
    audio.loop = true;
    audio.volume = 0.4;
    registerAudio(audio);
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      stopAllAudios();
    };
  }, []);

  // Manage audio play/pause on state change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isRunning && soundEnabled) {
      audio.play().catch(() => {
        // Handled silently if autoplay policy requires user interaction
      });
    } else {
      audio.pause();
    }
  }, [isRunning, soundEnabled]);

  const toggleRun = useCallback(() => {
    setIsRunning((prev) => {
      const next = !prev;
      setRpm(next ? 1440 : 0);
      return next;
    });
  }, []);

  return (
    <Box sx={{ color: "text.primary" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="overline" color="text.secondary">
            Visualização Dinâmica 3D
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            Motor em Operação
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Modelo 3D local em tempo real com rotação física síncrona
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Ativa ou desativa o efeito sonoro de rotação e zumbido eletromagnético do motor" arrow>
            <FormControlLabel
              control={
                <Switch
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {soundEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
                  <Typography variant="body2">Áudio</Typography>
                </Stack>
              }
            />
          </Tooltip>

          <Tooltip title={isRunning ? "Desliga o motor e cessa a rotação do rotor 3D" : "Aciona o motor acelerando-o até a velocidade nominal de 1440 RPM"} arrow>
            <Button
              variant="contained"
              color={isRunning ? "error" : "success"}
              startIcon={isRunning ? <StopIcon /> : <PlayArrowIcon />}
              onClick={toggleRun}
            >
              {isRunning ? "Desligar" : "Acionar"}
            </Button>
          </Tooltip>
        </Stack>
      </Stack>

      <Card sx={{ bgcolor: "rgba(17, 24, 39, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <CardContent sx={{ p: 1.5 }}>
          <MotorViewer
            rpm={rpm}
            state={isRunning ? "Em Rotação (Nominal)" : "Desligado"}
            height="62vh"
          />
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1.5} mt={2} flexWrap="wrap">
        <Tooltip title="Estado de operação mecânica do motor" arrow>
          <Chip label={`Status: ${isRunning ? "Ligado" : "Parado"}`} color={isRunning ? "success" : "default"} />
        </Tooltip>
        <Tooltip title="Velocidade de rotação mecânica angular atual no eixo" arrow>
          <Chip label={`Velocidade: ${rpm} RPM`} color="primary" variant="outlined" />
        </Tooltip>
        <Tooltip title="Tensão nominal de alimentação trifásica entre fases (tensão de linha)" arrow>
          <Chip label="Tensão: 380 V (Trifásico)" variant="outlined" />
        </Tooltip>
        <Tooltip title="Frequência fundamental da rede de alimentação elétrica" arrow>
          <Chip label="Frequência: 50 Hz" variant="outlined" />
        </Tooltip>
        <Tooltip title="Potência mecânica nominal de regime contínuo (S1)" arrow>
          <Chip label="Potência: 10 kW (13.6 cv)" variant="outlined" />
        </Tooltip>
      </Stack>
    </Box>
  );
}

