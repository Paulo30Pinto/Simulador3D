import { Box, Fab, IconButton, Stack, Tooltip } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HandymanIcon from '@mui/icons-material/Handyman';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { FASES, FERRAMENTAS, NOME_FASE, type Fase, type ToolId } from '../parts/partsData';
import { ICONE_FASE, ICONE_FERRAMENTA } from './partIcons';

interface Props {
  fase: Fase;
  montadas: number;
  total: number;
  ligado: boolean;
  ferramenta: ToolId | null;
  mostrarFerramentas: boolean;
  podeAvancar: boolean;
  onPower: () => void;
  onFerramenta: (id: ToolId | null) => void;
  onAvancar: () => void;
  onFase: (fase: Fase) => void;
}

/** HUD minimalista: ícones de fase, progresso, ferramentas e botão de ligar. */
export function Hud({
  fase,
  montadas,
  total,
  ligado,
  ferramenta,
  mostrarFerramentas,
  podeAvancar,
  onPower,
  onFerramenta,
  onAvancar,
  onFase,
}: Props) {
  return (
    <>
      {/* Fases + progresso */}
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 12,
          px: 1.5,
          py: 0.75,
          borderRadius: 999,
          bgcolor: 'rgba(2,6,23,0.62)',
          border: '1px solid rgba(148,163,184,0.2)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {FASES.map((f) => {
          const Icone = ICONE_FASE[f];
          const atual = fase === f;
          const feito = FASES.indexOf(f) < FASES.indexOf(fase as (typeof FASES)[number]);
          return (
            <Tooltip key={f} title={NOME_FASE[f]}>
              <IconButton
                size="small"
                aria-label={NOME_FASE[f]}
                onClick={() => onFase(f)}
                sx={{ p: 0.25 }}
              >
                <Icone
                  fontSize="small"
                  sx={{
                    color: atual ? '#38bdf8' : feito ? 'rgba(34,197,94,0.85)' : 'rgba(148,163,184,0.45)',
                    transform: atual ? 'scale(1.15)' : 'none',
                    transition: 'all 200ms ease',
                  }}
                />
              </IconButton>
            </Tooltip>
          );
        })}

        <Box sx={{ width: 1, height: 20, bgcolor: 'rgba(148,163,184,0.25)' }} />

        <Stack direction="row" spacing={0.25} alignItems="center">
          {Array.from({ length: total }).map((_, i) => (
            <Box key={i} sx={{ display: 'grid', placeItems: 'center' }}>
              {i < montadas ? (
                <CheckCircleIcon sx={{ fontSize: 15, color: '#22c55e' }} />
              ) : (
                <RadioButtonUncheckedIcon sx={{ fontSize: 15, color: 'rgba(148,163,184,0.4)' }} />
              )}
            </Box>
          ))}
        </Stack>
      </Stack>

      {/* Ferramentas (fase de diagnóstico) */}
      {mostrarFerramentas && (
        <Stack
          spacing={1}
          sx={{ position: 'absolute', left: 14, bottom: 14, zIndex: 12, alignItems: 'center' }}
        >
          <Tooltip title="Ferramentas" placement="right">
            <Fab
              size="small"
              aria-label="Ferramentas"
              sx={{ bgcolor: ferramenta ? 'rgba(56,189,248,0.25)' : 'rgba(2,6,23,0.7)', color: '#e2e8f0', border: '1px solid rgba(148,163,184,0.3)' }}
              onClick={() => onFerramenta(null)}
            >
              <HandymanIcon fontSize="small" />
            </Fab>
          </Tooltip>
          {(Object.keys(FERRAMENTAS) as ToolId[]).map((id) => {
            const Icone = ICONE_FERRAMENTA[id];
            const ativa = ferramenta === id;
            return (
              <Tooltip key={id} title={FERRAMENTAS[id].nome} placement="right">
                <Fab
                  size="small"
                  aria-label={FERRAMENTAS[id].nome}
                  onClick={() => onFerramenta(ativa ? null : id)}
                  sx={{
                    bgcolor: ativa ? 'rgba(56,189,248,0.85)' : 'rgba(2,6,23,0.7)',
                    color: ativa ? '#0f172a' : '#e2e8f0',
                    border: '1px solid rgba(148,163,184,0.3)',
                    boxShadow: ativa ? '0 0 16px rgba(56,189,248,0.55)' : 'none',
                  }}
                >
                  <Icone fontSize="small" />
                </Fab>
              </Tooltip>
            );
          })}
        </Stack>
      )}

      {/* Avançar de fase */}
      {podeAvancar && (
        <Tooltip title="Avançar" placement="left">
          <Fab
            size="small"
            aria-label="Avançar"
            onClick={onAvancar}
            className="gg-pulse-ring"
            sx={{
              position: 'absolute',
              right: 14,
              bottom: 14,
              zIndex: 12,
              bgcolor: 'rgba(56,189,248,0.9)',
              color: '#0f172a',
            }}
          >
            <ArrowForwardIcon fontSize="small" />
          </Fab>
        </Tooltip>
      )}

      {/* Ligar / Desligar */}
      <Tooltip title={ligado ? 'Desligar' : 'Ligar'} placement="left">
        <Fab
          aria-label={ligado ? 'Desligar' : 'Ligar'}
          onClick={onPower}
          sx={{
            position: 'absolute',
            right: 14,
            top: 12,
            zIndex: 12,
            bgcolor: ligado ? 'rgba(34,197,94,0.9)' : 'rgba(2,6,23,0.7)',
            color: ligado ? '#062d15' : '#e2e8f0',
            border: '1px solid rgba(148,163,184,0.3)',
            boxShadow: ligado ? '0 0 20px rgba(34,197,94,0.6)' : 'none',
            '&:hover': { bgcolor: ligado ? 'rgba(34,197,94,1)' : 'rgba(15,23,42,0.85)' },
          }}
        >
          <PowerSettingsNewIcon />
        </Fab>
      </Tooltip>
    </>
  );
}
