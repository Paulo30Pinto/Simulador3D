import { useEffect, useRef } from "react";
import { registerAudio } from '../utils/audioManager';

// Adicione tipagem global para evitar erro do TypeScript
declare global {
  interface Window {
    Sketchfab?: new (iframe: HTMLIFrameElement) => {
      init: (
        uid: string,
        options: {
          success: (api: unknown) => void;
          error: () => void;
        }
      ) => void;
    };
  }
}

const SKETCHFAB_URL = "https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js";
const MODEL_UID = "023f8252affe4c90a0ba14125d30ba87";
const audio = new Audio("/mp3/motor-loop-83480.mp3");
registerAudio(audio);


export default function MotorLigado() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Carrega o script da API se ainda não estiver carregado
    if (!window.Sketchfab) {
      const script = document.createElement("script");
      script.src = SKETCHFAB_URL;
      script.async = true;
      script.onload = () => initSketchfab();
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    } else {
      initSketchfab();
    }

    function initSketchfab() {
      if (!iframeRef.current || !window.Sketchfab) return;
        const params =
    "?autostart=1&ui_controls=0&ui_infos=0&ui_hint=0&ui_watermark=0&ui_stop=0&ui_ar=0&ui_fullscreen=0&ui_inspector=0&ui_settings=0&transparent=1&ui_theme=dark";
  iframeRef.current.src = `https://sketchfab.com/models/${MODEL_UID}/embed${params}`;

      const client = new window.Sketchfab(iframeRef.current);
      client.init(MODEL_UID, {
       
   
        success: function (api: unknown) {
          
          // If you know the type, you can replace 'unknown' with the correct interface/type
          (api as {
            start: () => void;
            addEventListener: (event: string, callback: () => void) => void;
          }).start();

          (api as {
            start: () => void;
            addEventListener: (event: string, callback: () => void) => void;
          }).addEventListener("viewerready", function () {
            audio.play();
            //loop audio
            audio.loop = true;
            console.log("Viewer is ready");
            // Aqui você pode mostrar um alerta ou atualizar o estado
            // alert("Modelo carregado com sucesso!");
            console.log("Modelo carregado com sucesso!");
            // Tocar audio ou executar outras ações




          });
        },
        
        error: function () {
          console.log("Viewer error");
          
        },
        
      });
    }
    // Limpeza do efeito
  }, []);

  return (
    <iframe
      ref={iframeRef}
      id="api-frame"
      title="Sketchfab 3D Viewer"
      allow="autoplay; fullscreen; xr-spatial-tracking; ui_controls=0"
      width="100%"
      height="600px"
      allow-scripts
      allow-same-origin
      allow-popups
      allow-forms

      style={{ border: "none", backgroundColor: "transparent" }}
    />
  );
}