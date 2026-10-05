import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Cue } from '../components/Cue';
import { ICONE_PECA } from '../components/partIcons';
import { getPart } from '../parts/partsData';
import { useGame } from '../state/GameProvider';
import { proximaDesmontar } from '../state/gameRules';

/** Fase 2 — Desmontar: ordem obrigatória, peça guiada e arrasto para a bandeja. */
export function DisassemblePhase() {
  const { estado } = useGame();
  const proxima = proximaDesmontar(estado);
  const Icone = ICONE_PECA[proxima ?? 'caixa'];
  const peca = getPart(proxima);

  if (!proxima) {
    return <Cue icones={[MoveToInboxIcon]} etiqueta="Bandeja" tom="ok" />;
  }

  return <Cue icones={[Icone, DragIndicatorIcon, MoveToInboxIcon]} etiqueta={peca?.nome} />;
}
