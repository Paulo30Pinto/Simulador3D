import { Box, Chip, Fab, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';

const CORES = ['#22c55e', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa'];

/** Veredito final: motor a girar suave + selo "Motor OK". */
export function Celebracao({ onReiniciar }: { onReiniciar: () => void }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'rgba(2,6,23,0.45)',
        backdropFilter: 'blur(2px)',
      }}
    >
      {Array.from({ length: 28 }).map((_, i) => (
        <Box
          key={i}
          className="gg-confetti-piece"
          sx={{
            left: `${(i * 97) % 100}%`,
            bgcolor: CORES[i % CORES.length],
            animationDelay: `${(i % 10) * 0.18}s`,
            animationDuration: `${2.2 + (i % 5) * 0.25}s`,
          }}
        />
      ))}
      <Stack alignItems="center" spacing={2} className="gg-seal">
        <Box
          sx={{
            width: 118,
            height: 118,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(34,197,94,0.16)',
            border: '3px solid #22c55e',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 76, color: '#22c55e' }} />
        </Box>
        <Chip
          label="Motor OK"
          sx={{ bgcolor: 'rgba(34,197,94,0.92)', color: '#062d15', fontWeight: 800, fontSize: 16, px: 1 }}
        />
        <Fab
          size="small"
          aria-label="Reiniciar"
          onClick={onReiniciar}
          sx={{ bgcolor: 'rgba(2,6,23,0.75)', color: '#e2e8f0', border: '1px solid rgba(148,163,184,0.35)' }}
        >
          <ReplayIcon fontSize="small" />
        </Fab>
      </Stack>
    </Box>
  );
}
