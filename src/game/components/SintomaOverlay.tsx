import { Box } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CloudIcon from '@mui/icons-material/Cloud';
import type { Sintoma } from '../parts/partsData';

interface Props {
  sintoma: Sintoma;
  ativo: boolean;
  x: number;
  y: number;
}

/** Efeitos visuais do sintoma (sem números): fumo, calor, faísca, folga, desalinhamento. */
export function SintomaOverlay({ sintoma, ativo, x, y }: Props) {
  if (!ativo) return null;

  const base = {
    position: 'absolute' as const,
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none' as const,
    zIndex: 6,
  };

  if (sintoma === 'fumaca') {
    return (
      <Box sx={base}>
        <Box sx={{ position: 'relative', width: 70, height: 70 }}>
          <Box className="gg-smoke" sx={{ position: 'absolute', inset: 0, color: '#e2e8f0' }}>
            <CloudIcon sx={{ fontSize: 40 }} />
          </Box>
          <Box className="gg-smoke" sx={{ position: 'absolute', inset: 10, color: '#94a3b8', animationDelay: '0.8s' }}>
            <CloudIcon sx={{ fontSize: 30 }} />
          </Box>
          <LocalFireDepartmentIcon sx={{ position: 'absolute', bottom: 2, left: 20, fontSize: 26, color: '#fb923c' }} />
        </Box>
      </Box>
    );
  }

  if (sintoma === 'faisca') {
    return (
      <Box sx={{ ...base, width: 80, height: 80 }}>
        <Box className="gg-flash" sx={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, rgba(253,224,71,0.85) 0%, rgba(253,224,71,0) 70%)' }} />
        <Box className="gg-spark" sx={{ position: 'absolute', inset: 20, color: '#fde047' }}>⚡</Box>
      </Box>
    );
  }

  if (sintoma === 'folga') {
    return (
      <Box sx={{ ...base, width: 90, height: 90 }} className="gg-vibrate">
        <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px dashed rgba(248,113,113,0.7)' }} />
      </Box>
    );
  }

  const cor = sintoma === 'vibracao' ? '#f87171' : '#fbbf24';
  return (
    <Box sx={base}>
      <Box className={sintoma === 'vibracao' ? 'gg-vibrate' : 'gg-pulse-ring'} sx={{ width: 74, height: 74, borderRadius: '50%', border: `3px solid ${cor}`, opacity: 0.9 }} />
    </Box>
  );
}
