
import DashboardIcon from '@mui/icons-material/Dashboard';
//import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';

import {
  type Navigation,
} from '@toolpad/core/AppProvider';
import Moto1 from '/public/icone/motor1.svg';
import Rotor from 'public/img/Rotor.png';
import Estator from '../../public/img/Estator.png';

//export { Navigation };  // Export for type checking in AppProvider.tsx file.  // Import in App.tsx file.
const MotorIcon = () => (
  <img src={Moto1} alt="Motor Icon" style={{width: '24px', height: '24px'}} />
);
const RotorIcon = () => (
  <img src={Rotor} alt="Motor Icon" style={{width: '24px', height: '24px'}} />
);
const EstatorIcon = () => (
  <img src={Estator} alt="Motor Icon" style={{width: '24px', height: '24px'}} />
);


const NAVIGATION: Navigation = [
  {
    segment: "motor",
    title: "Motor",
    icon: <MotorIcon />,
  },
  {
    segment: "rotor",
    title: "Rotor",
    icon: <RotorIcon  />,
  },
  {
    segment: "estator",
    title: "Estator",
    icon: <EstatorIcon />,
  },
  {
    segment: "bobina",
    title: "Bobina",
    icon: <DashboardIcon />,
  },

  {
    segment: "outros",
    title: "Outros",
    icon: <BarChartIcon  />,
  }
];
  export default NAVIGATION;