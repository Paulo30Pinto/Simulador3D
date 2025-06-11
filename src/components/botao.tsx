import { Button } from '@mui/material';
import React from 'react';

interface BotaoProps {
  label: string;
  onClick: () => void;
  style?: React.CSSProperties;
}

const Botao: React.FC<BotaoProps> = ({ label, onClick, style,  }) => {
    return (
      <>
        <Button
          variant="contained"
          onClick={onClick}
          style={style}
          sx={{ marginX: "5px" }}
        >
          {label}
        </Button>
      </>
    );
};

export default Botao;
