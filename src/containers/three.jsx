import React, { useRef, useEffect } from "react";
import { createThreeScene } from "./three.js";

const ThreeViewer = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const { renderer } = createThreeScene(mountRef.current);
    return () => {
      // Limpeza ao desmontar
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "400px" }} />;
};

export default ThreeViewer;