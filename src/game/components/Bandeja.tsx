import { forwardRef, type PointerEvent as ReactPointerEvent } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { getPart } from '../parts/partsData';
import { ICONE_PECA } from './partIcons';

interface Props {
  ids: string[];
  guia: string | null;
  nova: string | null;
  erro: string | null;
  selecionada: string | null;
  onPointerDown: (e: ReactPointerEvent, id: string) => void;
}

/** Bandeja lateral para onde as peças arrastadas saem do motor. */
export const Bandeja = forwardRef<HTMLDivElement, Props>(function Bandeja(
  { ids, guia, nova, erro, selecionada, onPointerDown },
  ref,
) {
  return (
    <Box
      ref={ref}
      data-testid="bandeja"
      sx={{
        height: '100%',
        minHeight: 280,
        borderRadius: 3,
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        background: 'linear-gradient(180deg, rgba(30,41,59,0.72) 0%, rgba(15,23,42,0.85) 100%)',
        border: '1px solid rgba(148,163,184,0.22)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: 'rgba(148,163,184,0.85)',
          fontWeight: 700,
        }}
      >
        Bandeja
      </Typography>

      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ alignContent: 'flex-start', overflowY: 'auto' }}>
        {ids.map((id) => {
          const peca = getPart(id);
          if (!peca) return null;
          const Icone = ICONE_PECA[id] ?? ICONE_PECA.caixa;
          const eNova = nova === id;
          const cor = erro === id ? '#f87171' : eNova ? '#22c55e' : guia === id ? '#38bdf8' : 'rgba(148,163,184,0.8)';
          return (
            <Box
              key={id}
              className={`gg-chip ${guia === id ? 'gg-pulse-ring' : ''} ${erro === id ? 'gg-shake' : ''} ${eNova ? 'gg-glow' : ''}`}
              role="button"
              aria-label={peca.nome}
              tabIndex={0}
              onPointerDown={(e) => onPointerDown(e, id)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                width: 72,
                p: 1,
                borderRadius: 2,
                cursor: 'grab',
                color: selecionada === id ? '#f8fafc' : cor,
                border: `2px solid ${selecionada === id ? '#f8fafc' : cor}`,
                bgcolor: 'rgba(2,6,23,0.55)',
                '&:active': { cursor: 'grabbing' },
              }}
            >
              <Icone fontSize="small" />
              <Typography sx={{ fontSize: 10.5, lineHeight: 1.15, textAlign: 'center', color: 'inherit' }}>
                {peca.nome}
              </Typography>
            </Box>
          );
        })}
        {ids.length === 0 && (
          <Typography sx={{ fontSize: 12, color: 'rgba(148,163,184,0.55)', px: 0.5 }}>vazia</Typography>
        )}
      </Stack>
    </Box>
  );
});
