import "@google/model-viewer";


const MotorViewer = () => {
  return (
    <model-viewer
      src="/assets/elementos3d/motor.glb"
      alt="Modelo 3D"
      auto-rotate
      camera-controls
      ar
      id="motor"
      poster="/img/motorAssincono.png"
      ar-modes="webxr scene-viewer quick-look"
      style={{ width: '100%', height: '70vh' }}
    ></model-viewer>
  );
};

const RotorViewer = () => {
  return (
    <model-viewer
      src="/assets/elementos3d/ac_induction_motor.glb"
      alt="Modelo 3D"
      auto-rotate
      camera-controls
      ar
      style={{ width: '100%', height: '70vh' }}
    ></model-viewer>
  );
};
const EstatorViewer = () => {
  return (
    <model-viewer
      src="/assets/elementos3d/estator2.glb"
      alt="Modelo 3D"
      auto-rotate
      camera-controls
      ar
      style={{ width: '90%', height: '70vh' }}
    ></model-viewer>
  );
};
const BobinaViewer = () => {
  return (
    <model-viewer
      src="/assets/elementos3d/bobina5.glb"
      alt="Modelo 3D"
      auto-rotate
      camera-controls
      ar
      style={{ width: '90%', height: '70vh' }}
    ></model-viewer>
  );
};

export{
  MotorViewer,
  RotorViewer,
  EstatorViewer,
  BobinaViewer
}