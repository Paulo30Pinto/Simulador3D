import type { SvgIconComponent } from '@mui/icons-material';
import Hardware from '@mui/icons-material/Hardware';
import Air from '@mui/icons-material/Air';
import RotateRight from '@mui/icons-material/RotateRight';
import DonutLarge from '@mui/icons-material/DonutLarge';
import Waves from '@mui/icons-material/Waves';
import TrackChanges from '@mui/icons-material/TrackChanges';
import CropSquare from '@mui/icons-material/CropSquare';
import ElectricalServices from '@mui/icons-material/ElectricalServices';
import Visibility from '@mui/icons-material/Visibility';
import Build from '@mui/icons-material/Build';
import Search from '@mui/icons-material/Search';
import Handyman from '@mui/icons-material/Handyman';
import Bolt from '@mui/icons-material/Bolt';
import Thermostat from '@mui/icons-material/Thermostat';
import Hearing from '@mui/icons-material/Hearing';
import type { Fase, ToolId } from '../parts/partsData';

export const ICONE_PECA: Record<string, SvgIconComponent> = {
  tampa: CropSquare,
  parafusos: Hardware,
  ventoinha: Air,
  rotor: RotateRight,
  estator: DonutLarge,
  bobinas: Waves,
  rolamentos: TrackChanges,
  carcaca: ElectricalServices,
  caixa: ElectricalServices,
};

export const ICONE_FERRAMENTA: Record<ToolId, SvgIconComponent> = {
  multimetro: Bolt,
  termometro: Thermostat,
  estetoscopio: Hearing,
};

export const ICONE_FASE: Record<Fase, SvgIconComponent> = {
  explorar: Visibility,
  desmontar: Build,
  diagnosticar: Search,
  reparar: Handyman,
  concluido: Handyman,
};
