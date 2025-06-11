import React, { useRef, useEffect } from "react";
import { createThreeScene } from "./three.ts";

const ThreeViewer = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mountRef.current) {
      const { renderer } = createThreeScene(mountRef.current);
      return () => {
        // Limpeza ao desmontar
        if (mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };
    }
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "90vh" }} />;
};

export default ThreeViewer;