import type { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

interface Props {
  icones: SvgIconComponent[];
  /** Etiqueta curta opcional (2–4 palavras) */
  etiqueta?: string;
  tom?: 'guia' | 'ok' | 'erro';
  children?: ReactNode;
}

const TONS = {
  guia: { cor: '#38bdf8', bg: 'rgba(56,189,248,0.14)', borda: 'rgba(56,189,248,0.45)' },
  ok: { cor: '#22c55e', bg: 'rgba(34,197,94,0.16)', borda: 'rgba(34,197,94,0.5)' },
  erro: { cor: '#f87171', bg: 'rgba(248,113,113,0.16)', borda: 'rgba(248,113,113,0.5)' },
};

/** Dica visual da fase: só ícones (e, no máximo, uma etiqueta curta). */
export function Cue({ icones, etiqueta, tom = 'guia', children }: Props) {
  const t = TONS[tom];
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 12,
        px: 1.5,
        py: 0.75,
        borderRadius: 999,
        bgcolor: 'rgba(2,6,23,0.7)',
        border: `1px solid ${t.borda}`,
        backdropFilter: 'blur(6px)',
      }}
    >
      {icones.map((Icone, i) => (
        <Icone key={i} fontSize="small" sx={{ color: i === 0 ? t.cor : 'rgba(226,232,240,0.7)' }} />
      ))}
      {etiqueta && (
        <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: t.cor, whiteSpace: 'nowrap' }}>
          {etiqueta}
        </Typography>
      )}
      {children}
    </Stack>
  );
}
