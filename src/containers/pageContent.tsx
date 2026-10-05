
import Box from '@mui/material/Box';
import Home from '../pages/home';
import Rotor from '../pages/rotor';
import Estator from '../pages/estator';
import Bobina from '../pages/bobina';
import MotorComponetesPage from '../components/motorComp';
import GameMode from '../game/GameMode';


export default function PageContent({ pathname }: { pathname: string }) {
    const renderPage = () => {
        switch (pathname.replace('/', '')) {
            case 'oficina':
                return <GameMode />;
            case 'motor':
                return <Home />;
            case 'rotor':
                return <Rotor />;
            case 'estator':
                return <Estator />;
            case 'bobina':
                return <Bobina />;
            case 'outros':
                return <MotorComponetesPage />;
            default:
                return <Home />;
        }
    };

    return (
        <Box
            sx={{
                flexGrow: 1,
                p: 3,
                height: '90vh',
                backgroundColor: 'background.default',
            }}
        >
            {renderPage()}
        </Box>
    );
}