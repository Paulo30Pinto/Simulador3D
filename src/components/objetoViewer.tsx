import React, { useEffect, useState } from 'react';

const ObjModelViewer = () => {
    // Referenciando o Canvas
    const canvas = document.getElementById('meu_canvas') as HTMLCanvasElement;
    // Obtendo o contexto gráfico
    const context = canvas?.getContext('2d');
    // Desenhando um retângulo
    context?.fillRect(50, 50, 100, 100);
   

    return (
        <div className="objetoViewer">
            <canvas id="meu_canvas" width="200" height="200"></canvas>
        </div>
    );
};
export {
    ObjModelViewer,
};
