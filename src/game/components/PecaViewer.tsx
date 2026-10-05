import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import type { Sintoma } from '../parts/partsData';

interface Props {
  modelo: string;
  ligado: boolean;
  sintoma: Sintoma | null;
}

/** Bancada 3D: mostra o conjunto montado ou a peça selecionada, com o sintoma aplicado. */
export function PecaViewer({ modelo, ligado, sintoma }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setCarregado(false);
    const el = ref.current;
    if (!el) return;
    const pronto = () => setCarregado(true);
    el.addEventListener('load', pronto);
    return () => el.removeEventListener('load', pronto);
  }, [modelo]);

  const tremer = ligado && (sintoma === 'vibracao' || sintoma === 'torto' || sintoma === 'folga');
  const torto = ligado && sintoma === 'torto';

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        transform: torto ? 'rotate(2.5deg)' : 'none',
        transition: 'transform 300ms ease',
      }}
      className={tremer ? 'gg-vibrate' : undefined}
    >
      <model-viewer
        ref={ref}
        src={modelo}
        alt="Motor elétrico"
        camera-controls
        interaction-prompt="none"
        environment-image="neutral"
        exposure="1.05"
        shadow-intensity="1.4"
        shadow-softness="0.7"
        touch-action="pan-y"
        {...(ligado && !tremer ? { 'auto-rotate': true, 'rotation-per-second': '45deg' } : {})}
        style={{ width: '100%', height: '100%', outline: 'none' }}
      />
      {!carregado && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <CircularProgress size={28} sx={{ color: 'rgba(148,163,184,0.6)' }} />
        </Box>
      )}
    </Box>
  );
}
