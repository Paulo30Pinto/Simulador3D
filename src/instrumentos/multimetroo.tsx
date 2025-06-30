import React, { useState } from 'react';
import './index.css';
import { useDraggable } from '../utils/dragandrop';

export function Multimetro() {
  const [rotationAngle, setRotationAngle] = useState(0);
  const preto = useDraggable({ x: 1250, y: 300 });
  const vermelho = useDraggable({ x: 1300, y: 300 });


  const handleImageClick = () => {
    // Incrementa o ângulo de rotação em 90 graus a cada clique
    setRotationAngle(prevAngle => prevAngle + 25);
    if (rotationAngle + 25 > 150) {
      setRotationAngle(0); // Reseta o ângulo se ultrapassar 360 graus
    }
    console.log(`Imagem clicada! Ângulo atual: ${rotationAngle + 25} graus`);
  };

  return (
    <article className="">
      <div className="area-multimetro">
        <div className="flex flex-row">
          <div
            ref={preto.ref}
            style={preto.style}
            onMouseDown={preto.onMouseDown}
            onTouchStart={preto.onTouchStart}
          >
            <img
              src="/img/conector-preto.png"
              className="conector_preto_drag"
              alt="Multimeter"
              id="conector_preto_drag"
            />
          </div>
          <div
            ref={vermelho.ref}
            style={vermelho.style}
            onMouseDown={vermelho.onMouseDown}
            onTouchStart={vermelho.onTouchStart}
          >
            <img
              src="/img/conector-vermelha.png"
              className="conector_vermelho_drag"
              alt="Multimeter"
              id="conector_vermelho_drag"
            />
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            position: "relative",
          }}
          className="d-flex flex-column align-items-center justify-content-center"
        >
          <img
            src="/img/multimetro2.png"
            style={{ maxWidth: "200px", height: "400px" }}
            alt="Multimeter"
          />
          <img
            src="/img/roda_multimetro_btn.png" // Assumindo que rodaMultimetro.src se refere à fonte da imagem
            alt="Multimeter Dial"
            onClick={handleImageClick}
            style={{
              width: "90px", // Ajuste o tamanho conforme necessário
              height: "90px", // Ajuste o tamanho conforme necessário
              transform: `rotate(${rotationAngle}deg)`,
              transition: "transform 0.3s ease-in-out", // Transição suave para a rotação
              cursor: "pointer", // Indica que a imagem é clicável
              position: "absolute",
              top: "174px",
              left: "45px",
            }}
          />
        </div>
      </div>
      <p>Rotação Atual: {rotationAngle} graus</p>
    </article>
  );
};


