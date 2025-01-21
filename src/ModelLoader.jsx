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

  const handleFile = (file) => {
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
      };

      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a .gltf or .glb file');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    handleFile(file);
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
        <div className="upload-options">
          <div className="drag-drop-message">
            Drag and drop a 3D model (.gltf or .glb) here
          </div>
          <input
            type="file"
            accept=".gltf,.glb"
            onChange={handleFileInputChange}
            className="file-input"
          />
        </div>
      )}

      {/* Show loading spinner while model is loading */}
      {loading && <LoadingSpinner />}

      <Canvas camera={{ position: [0, 0, 3], fov: 40 }} dpr={[1, 2]} className='AppBg'>
        <ambientLight intensity={0.2} />
        <OrbitControls ref={controlsRef} />
        <ContactShadows
          position={[0, -0.4, 0]} // Adjust shadow position to be closer to model base
          opacity={0.5}
          scale={10}
          blur={1.5}
          far={1}
        />
        <Environment preset="studio" background={false} />
        <Center>
          <ModelViewer model={uploadedModel} />
        </Center>
      </Canvas>
    </div>
  );
};

export default ModelLoader;
