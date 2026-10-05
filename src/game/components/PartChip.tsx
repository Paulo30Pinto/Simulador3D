import type { PointerEvent as ReactPointerEvent } from 'react';
import { Box, Chip } from '@mui/material';
import { ICONE_PECA } from './partIcons';

export type EstadoChip = 'normal' | 'guia' | 'selecionada' | 'erro' | 'doente';

interface Props {
  id: string;
  nome: string;
  x: number;
  y: number;
  estado: EstadoChip;
  onPointerDown: (e: ReactPointerEvent) => void;
}

const CORES: Record<EstadoChip, string> = {
  normal: 'rgba(148,163,184,0.85)',
  guia: '#38bdf8',
  selecionada: '#f8fafc',
  erro: '#f87171',
  doente: '#fca5a5',
};

/** Ponto interactivo sobre a bancada: identifica e arrasta uma peça. */
export function PartChip({ id, nome, x, y, estado, onPointerDown }: Props) {
  const Icone = ICONE_PECA[id] ?? ICONE_PECA.caixa;
  const cor = CORES[estado];

  return (
    <Box
      className="gg-chip"
      sx={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 8,
      }}
    >
      {estado === 'selecionada' && (
        <Chip
          label={nome}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(15,23,42,0.92)',
            color: '#f8fafc',
            fontWeight: 600,
            border: '1px solid rgba(148,163,184,0.35)',
            whiteSpace: 'nowrap',
          }}
        />
      )}
      <Box
        role="button"
        aria-label={nome}
        data-testid={`peca-${id}`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        className={`gg-chip ${estado === 'guia' ? 'gg-pulse-ring' : ''} ${estado === 'erro' ? 'gg-shake' : ''}`}
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          cursor: 'grab',
          color: estado === 'selecionada' ? '#0f172a' : cor,
          bgcolor: estado === 'selecionada' ? 'rgba(248,250,252,0.92)' : 'rgba(15,23,42,0.78)',
          border: `2px solid ${cor}`,
          backdropFilter: 'blur(4px)',
          transition: 'transform 160ms ease, color 160ms ease',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <Icone fontSize="small" />
      </Box>
    </Box>
  );
}
