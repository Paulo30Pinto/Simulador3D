
import BarChartIcon from '@mui/icons-material/BarChart';
//import MotorIcon from '../../public/icone/motor1.svg';
import {
  type Navigation,
} from '@toolpad/core/AppProvider';

//export { Navigation };  // Export for type checking in AppProvider.tsx file.  // Import in App.tsx file.
const MotorIcon = () => (
  <img src="/public/icone/motor1.svg" alt="Motor Icon" style={{width: '24px', height: '24px'}} />
);
const RotorIcon = () => (
  <img src="/public/img/Rotor.png" alt="Motor Icon" style={{width: '24px', height: '24px'}} />
);
const EstatorIcon = () => (
  <img src="/public/img/Estator.png" alt="Motor Icon" style={{width: '24px', height: '24px'}} />
);


const NAVIGATION: Navigation = [
  {
    segment: "home",
    title: "Home",
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
    segment: "estator",
    title: "Estator",
    icon: <BarChartIcon />,
  }
];
  export default NAVIGATION;