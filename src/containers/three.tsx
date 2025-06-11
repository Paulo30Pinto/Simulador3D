import { useRef, useEffect } from "react";
import { createThreeScene } from "./three.ts";

const ThreeViewer = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (mountNode) {
      const { renderer } = createThreeScene(mountNode);
      return () => {
        // Limpeza ao desmontar
        mountNode.removeChild(renderer.domElement);
      };
    }
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "90vh" }} />;
};

export default ThreeViewer;