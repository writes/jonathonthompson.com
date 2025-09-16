'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stage, useGLTF, Html, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useControls } from 'leva';
import * as THREE from 'three';
// import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';

interface ChampionViewerProps {
  championKey: string;
  championName: string;
  skinId?: number;
  onSkinChange?: (skinId: number) => void;
}

// Champion model component
function ChampionModel({ championKey, skinId = 0 }: { championKey: string; skinId: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const [modelError, setModelError] = useState(false);
  
  // For demo purposes, we'll use a placeholder model
  // In production, you would load actual champion models from Riot's assets
  const modelUrl = `/models/champions/${championKey}_skin${skinId}.glb`;
  
  // Placeholder animation
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const handleError = () => {
    setModelError(true);
  };

  if (modelError) {
    // Fallback to a simple 3D representation
    return (
      <group ref={meshRef}>
        <mesh>
          <boxGeometry args={[1, 2, 0.5]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>
        <Html center>
          <div className="bg-black/80 text-white px-3 py-1 rounded text-xs">
            3D Model Loading...
          </div>
        </Html>
      </group>
    );
  }

  // Placeholder mesh while actual model would load
  return (
    <group ref={meshRef} scale={[1.5, 1.5, 1.5]}>
      <mesh position={[0, 1, 0]}>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial 
          color="#6366f1"
          metalness={0.6}
          roughness={0.4}
          emissive="#3730a3"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color="#8b5cf6"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// Loading component
function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-white text-sm">Loading Champion...</span>
      </div>
    </Html>
  );
}

export default function ChampionViewer({ 
  championKey, 
  championName, 
  skinId = 0,
  onSkinChange 
}: ChampionViewerProps) {
  const [selectedSkin, setSelectedSkin] = useState(skinId);
  const [autoRotate, setAutoRotate] = useState(true);

  // Leva controls for development
  const { 
    ambientIntensity, 
    spotlightIntensity,
    // bloomIntensity,
    // chromaticAberration,
    // vignetteIntensity
  } = useControls('Lighting & Effects', {
    ambientIntensity: { value: 0.5, min: 0, max: 2, step: 0.1 },
    spotlightIntensity: { value: 1, min: 0, max: 3, step: 0.1 },
    // bloomIntensity: { value: 0.8, min: 0, max: 2, step: 0.1 },
    // chromaticAberration: { value: 0.02, min: 0, max: 0.1, step: 0.01 },
    // vignetteIntensity: { value: 0.4, min: 0, max: 1, step: 0.1 }
  });

  // Mock skin data - in production, fetch from API
  const skins = [
    { id: 0, name: 'Classic' },
    { id: 1, name: 'Championship' },
    { id: 2, name: 'Project' },
    { id: 3, name: 'Dark Star' }
  ];

  const handleSkinSelect = (skin: typeof skins[0]) => {
    setSelectedSkin(skin.id);
    onSkinChange?.(skin.id);
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        className="w-full h-full"
      >
        <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={50} />
        
        {/* Lighting */}
        <ambientLight intensity={ambientIntensity} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={spotlightIntensity}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        {/* Environment */}
        <Environment preset="city" />
        
        {/* Champion Model */}
        <Suspense fallback={<LoadingSpinner />}>
          <Stage
            shadows={{ type: 'contact', opacity: 0.8 }}
            environment="city"
            intensity={0.6}
          >
            <ChampionModel championKey={championKey} skinId={selectedSkin} />
          </Stage>
        </Suspense>
        
        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={8}
          autoRotate={autoRotate}
          autoRotateSpeed={2}
        />
        
        {/* Post-processing effects - temporarily disabled */}
        {/* <EffectComposer>
          <Bloom intensity={bloomIntensity} luminanceThreshold={0.8} />
          <ChromaticAberration offset={[chromaticAberration, chromaticAberration]} />
          <Vignette eskil={false} offset={0.1} darkness={vignetteIntensity} />
        </EffectComposer> */}
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">{championName}</h2>
            <p className="text-gray-400">3D Model Viewer</p>
          </div>
          
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-colors"
          >
            {autoRotate ? 'Stop Rotation' : 'Start Rotation'}
          </button>
        </motion.div>
      </div>

      {/* Skin Selector */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/60 backdrop-blur-md rounded-lg p-4"
        >
          <h3 className="text-white font-medium mb-3">Select Skin</h3>
          <div className="grid grid-cols-4 gap-2">
            <AnimatePresence>
              {skins.map((skin) => (
                <motion.button
                  key={skin.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSkinSelect(skin)}
                  className={`
                    relative px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${selectedSkin === skin.id 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }
                  `}
                >
                  {skin.name}
                  {selectedSkin === skin.id && (
                    <motion.div
                      layoutId="skinSelector"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Loading States */}
      <AnimatePresence>
        {false && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white">Loading {championName} model...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}