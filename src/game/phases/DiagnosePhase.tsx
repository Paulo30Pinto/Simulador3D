import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HandymanIcon from '@mui/icons-material/Handyman';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import { Cue } from '../components/Cue';
import { ICONE_FERRAMENTA } from '../components/partIcons';
import { useGame } from '../state/GameProvider';

/** Fase 3 — Diagnosticar: avaria sorteada, ferramentas e leitura verde/vermelha. */
export function DiagnosePhase() {
  const { estado } = useGame();
  const { feedback, ferramenta, defeitoEncontrado } = estado;

  if (feedback) {
    const Icone = feedback.ok ? CheckCircleIcon : CancelIcon;
    const Ferramenta = ferramenta ? ICONE_FERRAMENTA[ferramenta] : TouchAppIcon;
    return (
      <Cue
        icones={[Icone, Ferramenta]}
        tom={feedback.ok ? 'ok' : 'erro'}
        etiqueta={feedback.ok ? 'Encontrado' : 'Errado'}
      />
    );
  }

  if (defeitoEncontrado) {
    return <Cue icones={[MyLocationIcon]} etiqueta="Apontar" tom="ok" />;
  }

  return <Cue icones={[HandymanIcon, TouchAppIcon]} etiqueta="Ferramentas" />;
}
