import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Box, Grid } from '@mui/material';
import './game.css';
import { Bandeja } from './components/Bandeja';
import { Celebracao } from './components/Celebracao';
import { Hud } from './components/Hud';
import { PartChip, type EstadoChip } from './components/PartChip';
import { PecaViewer } from './components/PecaViewer';
import { SintomaOverlay } from './components/SintomaOverlay';
import { ICONE_PECA } from './components/partIcons';
import { PARTS, getPart, vistaDoConjunto } from './parts/partsData';
import { DisassemblePhase } from './phases/DisassemblePhase';
import { DiagnosePhase } from './phases/DiagnosePhase';
import { ExplorePhase } from './phases/ExplorePhase';
import { RepairPhase } from './phases/RepairPhase';
import { GameProvider, useGame } from './state/GameProvider';
import { proximaDesmontar, proximaMontar } from './state/gameRules';

type Origem = 'motor' | 'bandeja';

function Oficina() {
  const {
    estado,
    selecionar,
    remover,
    montar,
    escolherFerramenta,
    alternarMotor,
    lerPeca,
    apontar,
    avancar,
    irParaFase,
    reiniciar,
  } = useGame();

  const bancadaRef = useRef<HTMLDivElement>(null);
  const bandejaRef = useRef<HTMLDivElement>(null);
  const arrastoRef = useRef<{ id: string; origem: Origem } | null>(null);
  const inicioRef = useRef<{ x: number; y: number } | null>(null);
  const [fantasma, setFantasma] = useState<{ x: number; y: number; id: string } | null>(null);

  const clicar = (id: string) => {
    if (estado.fase === 'diagnosticar') {
      if (estado.defeitoEncontrado) apontar(id);
      else lerPeca(id);
      return;
    }
    selecionar(id);
  };

  const iniciarArrasto = (e: ReactPointerEvent, id: string, origem: Origem) => {
    e.preventDefault();
    inicioRef.current = { x: e.clientX, y: e.clientY };
    arrastoRef.current = { id, origem };
    setFantasma({ x: e.clientX, y: e.clientY, id });
  };

  useEffect(() => {
    const mover = (e: PointerEvent) => {
      const a = arrastoRef.current;
      if (a) setFantasma({ x: e.clientX, y: e.clientY, id: a.id });
    };
    const soltar = (e: PointerEvent) => {
      const a = arrastoRef.current;
      if (!a) return;
      arrastoRef.current = null;
      setFantasma(null);
      const inicio = inicioRef.current;
      const dist = inicio ? Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) : 0;
      if (dist < 8) {
        clicar(a.id);
        return;
      }
      const alvo = document.elementFromPoint(e.clientX, e.clientY);
      const naBandeja = !!bandejaRef.current && !!alvo && bandejaRef.current.contains(alvo);
      const naBancada = !!bancadaRef.current && !!alvo && bancadaRef.current.contains(alvo);
      if (a.origem === 'motor' && naBandeja) remover(a.id);
      else if (a.origem === 'bandeja' && naBancada) montar(a.id);
    };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', soltar);
    return () => {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', soltar);
    };
  });

  const removidas = PARTS.length - estado.montadas.length;
  const pecaSel = getPart(estado.selecionada);
  const modelo = pecaSel?.modelo ?? vistaDoConjunto(removidas);
  const defeitoMontado =
    estado.defeito && estado.montadas.includes(estado.defeito) && estado.fase !== 'concluido'
      ? estado.defeito
      : null;
  const sintoma = defeitoMontado ? getPart(defeitoMontado)?.sintoma ?? null : null;

  const podeAvancar =
    estado.fase === 'explorar'
      ? true
      : estado.fase === 'desmontar'
        ? estado.montadas.length === 0
        : estado.fase === 'diagnosticar'
          ? estado.defeitoEncontrado
          : false;

  const estadoChip = (id: string): EstadoChip => {
    if (estado.erro === id) return 'erro';
    if (estado.selecionada === id) return 'selecionada';
    if (estado.fase === 'desmontar' && proximaDesmontar(estado) === id) return 'guia';
    if (estado.fase === 'reparar' && proximaMontar(estado) === id) return 'guia';
    if (estado.defeito === id && (estado.defeitoEncontrado || estado.erro)) return 'doente';
    return 'normal';
  };

  const pecaDefeito = defeitoMontado ? getPart(defeitoMontado) : null;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        p: { xs: 1.25, md: 2 },
        minHeight: { xs: '72vh', md: '78vh' },
        background:
          'radial-gradient(120% 80% at 25% 0%, rgba(56,189,248,0.12) 0%, rgba(2,6,23,0) 55%), linear-gradient(180deg, #101827 0%, #0b1220 60%, #070c16 100%)',
        border: '1px solid rgba(148,163,184,0.18)',
      }}
    >
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            ref={bancadaRef}
            data-testid="bancada"
            className="gg-fade"
            sx={{
              position: 'relative',
              height: { xs: '46vh', md: '62vh' },
              borderRadius: 3,
              overflow: 'hidden',
              background:
                'radial-gradient(80% 55% at 50% 8%, rgba(226,232,240,0.10) 0%, rgba(2,6,23,0) 70%), linear-gradient(180deg, rgba(30,41,59,0.55) 0%, rgba(2,6,23,0.85) 100%)',
              border: '1px solid rgba(148,163,184,0.18)',
              boxShadow: 'inset 0 0 90px rgba(2,6,23,0.75)',
            }}
          >
            {/* Superfície da bancada */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '22%',
                background: 'linear-gradient(180deg, rgba(120,72,34,0.5) 0%, rgba(66,39,19,0.85) 100%)',
                borderTop: '1px solid rgba(226,232,240,0.16)',
              }}
            />

            <PecaViewer modelo={modelo} ligado={estado.motorLigado} sintoma={sintoma} />

            {estado.montadas.map((id) => {
              const peca = getPart(id);
              if (!peca) return null;
              return (
                <PartChip
                  key={id}
                  id={id}
                  nome={peca.nome}
                  x={peca.pos.x}
                  y={peca.pos.y}
                  estado={estadoChip(id)}
                  onPointerDown={(e) => iniciarArrasto(e, id, 'motor')}
                />
              );
            })}

            {sintoma && pecaDefeito && (
              <SintomaOverlay sintoma={sintoma} ativo x={pecaDefeito.pos.x} y={pecaDefeito.pos.y} />
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Bandeja
            ref={bandejaRef}
            ids={estado.bandeja}
            guia={estado.fase === 'reparar' ? proximaMontar(estado) : null}
            nova={estado.nova}
            erro={estado.erro}
            selecionada={estado.selecionada}
            onPointerDown={(e, id) => iniciarArrasto(e, id, 'bandeja')}
          />
        </Grid>
      </Grid>

      <Hud
        fase={estado.fase}
        montadas={estado.montadas.length}
        total={PARTS.length}
        ligado={estado.motorLigado}
        ferramenta={estado.ferramenta}
        mostrarFerramentas={estado.fase === 'diagnosticar'}
        podeAvancar={podeAvancar}
        onPower={alternarMotor}
        onFerramenta={escolherFerramenta}
        onAvancar={avancar}
        onFase={irParaFase}
      />

      {estado.fase === 'explorar' && <ExplorePhase />}
      {estado.fase === 'desmontar' && <DisassemblePhase />}
      {estado.fase === 'diagnosticar' && <DiagnosePhase />}
      {estado.fase === 'reparar' && <RepairPhase />}

      {estado.fase === 'concluido' && <Celebracao onReiniciar={reiniciar} />}

      {fantasma &&
        (() => {
          const Icone = ICONE_PECA[fantasma.id] ?? ICONE_PECA.caixa;
          return (
            <Box
              sx={{
                position: 'fixed',
                left: fantasma.x,
                top: fantasma.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 60,
                pointerEvents: 'none',
                width: 46,
                height: 46,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(56,189,248,0.92)',
                color: '#0f172a',
                boxShadow: '0 10px 24px rgba(2,6,23,0.6)',
              }}
            >
              <Icone fontSize="small" />
            </Box>
          );
        })()}
    </Box>
  );
}

/** Modo jogo: montar, desmontar, diagnosticar e reparar o motor. */
export default function GameMode() {
  return (
    <GameProvider>
      <Oficina />
    </GameProvider>
  );
}
