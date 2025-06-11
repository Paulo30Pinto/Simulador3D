import * as THREE from 'three';


export function createThreeScene( container : HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, container.clientWidth / container.clientHeight, 0.1, 1000 );
  const axesHelper = new THREE.AxesHelper( 5 );
  scene.add( axesHelper );
  //camera.position.z = 5;
  //camera.position.y = 1;
  camera.position.set(0, 2, 5);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  function animate() {
    
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
 
  renderer.setAnimationLoop(animate);

  return { renderer, scene, camera, cube };

}