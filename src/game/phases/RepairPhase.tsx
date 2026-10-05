import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import WarningIcon from '@mui/icons-material/Warning';
import { Cue } from '../components/Cue';
import { ICONE_PECA } from '../components/partIcons';
import { PARTS, getPart } from '../parts/partsData';
import { useGame } from '../state/GameProvider';
import { proximaMontar } from '../state/gameRules';

/** Fase 4 — Reparar e remontar: encaixe guiado e veredito do botão Ligar. */
export function RepairPhase() {
  const { estado } = useGame();
  const proxima = proximaMontar(estado);
  const peca = getPart(proxima);

  // Ligou cedo demais: sintoma persiste e o passo em falta fica destacado.
  if (estado.motorLigado && estado.montadas.length < PARTS.length) {
    const Icone = ICONE_PECA[estado.defeito ?? 'caixa'];
    return <Cue icones={[WarningIcon, Icone]} tom="erro" etiqueta="Falta" />;
  }

  if (!proxima) {
    return <Cue icones={[PowerSettingsNewIcon]} etiqueta="Ligar" tom="ok" />;
  }

  const Icone = ICONE_PECA[proxima];
  return <Cue icones={[Icone, ArrowForwardIcon, PowerSettingsNewIcon]} etiqueta={peca?.nome} />;
}
