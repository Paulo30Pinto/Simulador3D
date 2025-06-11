import React, { useState } from 'react';
import { stopAllAudios } from '../utils/audioManager';
import { MotorViewer } from '../components/model-viewer';
import MotorLigado from '../components/ligarmotor';
import MotorComponetesPage from '../components/motorComp';
import Botao from '../components/botao';

export default function Home() {
  const [componente, setComponente] = useState<'ligar' | 'componete' | 'grafico' | 'circuito' | 'motor'>('motor');

  const renderViewer = () => {
    switch (componente) {
      case 'ligar':
        return <MotorLigado />;
      case 'componete':
        return <MotorComponetesPage />;
      case 'grafico':
        return <MotorViewer />;
      case 'circuito':
        return <MotorViewer />;
      case 'motor':
        return <MotorViewer />;
      default:
        return <MotorViewer />;
    }
  };

  return (
    <div>
      <div className='container flex flex-row'>
   
        <Botao label="Motor" onClick={function () { stopAllAudios(); setComponente('motor'); }} style={cssBotao}/>
        <Botao label="Ligar" onClick={() => { setComponente('ligar')}} style={cssBotao}/>
        <Botao label="Componete" onClick={() =>{stopAllAudios(); setComponente('componete')}} style={cssBotao}/>
        <Botao label="Gráfico" onClick={() => setComponente('grafico')} style={cssBotao}/>
        <Botao label="Circuito" onClick={() => setComponente('circuito')} style={cssBotao}/>
      </div>
      {renderViewer()}
    </div>
  );
}

const cssBotao = {
  backgroundColor: 'gray',
  color: 'white',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'black',
  },
};