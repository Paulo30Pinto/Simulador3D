import * as React from 'react';
import Box from '@mui/material/Box';
import Home from '../pages/home';
import Rotor from '../pages/rotor';
import Estator from '../pages/estator';
import Bobina from '../pages/bobina';
import ThreeViewer from './three.tsx';


export default function PageContent({ pathname }: { pathname: string }) {
    const renderPage = () => {
        switch (pathname.replace('/', '')) {
            case 'motor':
                return <Home />;
            case 'rotor':
                return <Rotor />;
            case 'estator':
                return <Estator />;
            case 'bobina':
                return <Bobina />;
            case 'outros':
                return <ThreeViewer />;
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