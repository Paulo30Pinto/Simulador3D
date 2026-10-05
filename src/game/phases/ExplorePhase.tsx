import TouchAppIcon from '@mui/icons-material/TouchApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { Cue } from '../components/Cue';
import { useGame } from '../state/GameProvider';

/** Fase 1 — Explorar: observar peças e ligar o motor, sem texto explicativo. */
export function ExplorePhase() {
  const { estado } = useGame();
  return (
    <Cue
      icones={estado.motorLigado ? [TouchAppIcon, VisibilityIcon] : [TouchAppIcon, PowerSettingsNewIcon]}
      etiqueta={estado.motorLigado ? 'Explorar' : 'Ligar'}
    />
  );
}
