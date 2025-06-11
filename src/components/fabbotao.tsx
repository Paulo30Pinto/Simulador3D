import React from 'react';
import { Fab } from '@mui/material';



interface FabBotaoProps {
    label: string;
    onClick: () => void;
}

const FabBotao: React.FC<FabBotaoProps> = ({ label, onClick }) => {


    return (
        <>
            <Fab  color="primary" aria-label="add" onClick={onClick} variant="extended" size="medium">
              
                    
                    {label}
              
            </Fab>

        </>


    );
};

export default FabBotao;