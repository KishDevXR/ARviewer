import React, { useState, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Center } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

// Loading spinner component
const LoadingSpinner = () => (
    <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
  
);

const ModelViewer = ({ model }) => {
  const { camera, controls } = useThree();

  React.useEffect(() => {
    if (model) {
      const box = new THREE.Box3().setFromObject(model.scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Center the model by adjusting its position
      model.scene.position.sub(center); // Move the model to the origin

      // Adjust camera to fit the model
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180); // Convert to radians
      const cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));

      // Set camera position, ensuring the model is visible
      camera.position.set(center.x, center.y, cameraZ + maxDim);
      camera.lookAt(center);

      // Update controls target
      if (controls) {
        controls.target.set(center.x, center.y, center.z);
        controls.update();
      }
    }
  }, [model, camera, controls]);

  if (!model) return null;
  return <primitive object={model.scene} />;
};

const ModelLoader = () => {
  const [uploadedModel, setUploadedModel] = useState(null);
  const [loading, setLoading] = useState(false); // Track loading state
  const controlsRef = useRef();

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (file && (file.name.endsWith('.gltf') || file.name.endsWith('.glb'))) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const loader = new GLTFLoader();

        // Show loading spinner while model is loading
        setLoading(true);

        loader.parse(e.target.result, '', (gltf) => {
          setUploadedModel(gltf);
          setLoading(false); // Hide loader after model is loaded
        });

        // You can also use `onProgress` to show the progress if necessary
        loader.load(
          '', 
          (gltf) => {
            setUploadedModel(gltf);
            setLoading(false);
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          },
          (error) => {
            console.error('An error happened while loading the model', error);
            setLoading(false);
          }
        );
      };

      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a .gltf or .glb file');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="model-loader-container"
    >
      {!uploadedModel && !loading && (
         <div className="drag-drop-message">
         Drag and drop a 3D model (.gltf or .glb) here
       </div>
      )}

      {/* Show loading spinner while model is loading */}
      {loading && <LoadingSpinner />}

      <Canvas camera={{ position: [0, 0, 3], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls ref={controlsRef} />
        
        {/* ContactShadows adjusted to be below the model */}
        <ContactShadows
          position={[0, -0.4, 0]}  // Adjust shadow position to be closer to model base
          opacity={0.5}
          scale={10}
          blur={1.5}
          far={1}
        />
        
        <Environment preset="city" background blur={1} />
        <Center>
          <ModelViewer model={uploadedModel} />
        </Center>
      </Canvas>
    </div>
  );
};

export default ModelLoader;
