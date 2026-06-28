import React, { Suspense, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from '@inertiajs/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, useGLTF, Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import { playSound } from '@/lib/audio';

// ─── Reusable GLB Furniture (non-interactive) ────────────────

function FurnitureModel({
  position,
  modelUrl,
  desiredHeight = 1,
  rotationY = 0,
}: {
  position: [number, number, number];
  modelUrl: string;
  desiredHeight?: number;
  rotationY?: number;
}) {
  const { scene } = useGLTF(modelUrl);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);
    return clone;
  }, [scene]);

  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = (maxDim === 0 || !isFinite(maxDim)) ? 1 : desiredHeight / maxDim;
    const o: [number, number, number] = [-center.x, -box.min.y, -center.z];
    return { scale: s, offset: o };
  }, [clonedScene, desiredHeight]);

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive object={clonedScene} position={offset} castShadow receiveShadow />
    </group>
  );
}

// ─── Hazard Object (interactive, loads GLB) ──────────────────

function ModelHazardObject({
  position,
  name,
  modelUrl,
  desiredHeight = 1,
  rotationY = 0,
  onDiscover,
  isLightOn = true,
  children,
}: {
  position: [number, number, number];
  name: string;
  modelUrl: string;
  desiredHeight?: number;
  rotationY?: number;
  onDiscover: (name: string) => void;
  isLightOn?: boolean;
  children?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const [discovered, setDiscovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const baseRotation = useRef(rotationY);

  const { scene } = useGLTF(modelUrl);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);
    return clone;
  }, [scene]);

  // Update emissive materials of the GLB meshes dynamically based on isLightOn
  React.useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (modelUrl.includes('heater')) {
          const nameLower = child.name.toLowerCase();
          const isCoil = nameLower.includes('coil') || nameLower.includes('heating') || nameLower.includes('filament') || nameLower.includes('element') || nameLower.includes('glow') || nameLower.includes('grill');
          const isReddish = child.material.color && (child.material.color.r > 0.5 && child.material.color.g < 0.4 && child.material.color.b < 0.4);
          
          if (isCoil || isReddish) {
            // Clone material so we don't mutate the cached template
            if (Array.isArray(child.material)) {
              child.material = child.material.map((mat: any) => {
                if (!mat.__isCloned) {
                  const cloned = mat.clone();
                  cloned.__isCloned = true;
                  return cloned;
                }
                return mat;
              });
            } else if (!child.material.__isCloned) {
              child.material = child.material.clone();
              child.material.__isCloned = true;
            }

            // Apply emissive glow in dark mode
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat: any) => {
              if (!isLightOn) {
                mat.emissive = new THREE.Color("#ff3700");
                mat.emissiveIntensity = 4.0;
                if (mat.toneMapped !== undefined) {
                  mat.toneMapped = false;
                }
              } else {
                mat.emissive = new THREE.Color("#000000");
                mat.emissiveIntensity = 0.0;
                if (mat.toneMapped !== undefined) {
                  mat.toneMapped = true;
                }
              }
              mat.needsUpdate = true;
            });
          }
        }
      }
    });
  }, [clonedScene, isLightOn, modelUrl]);

  const { uniformScale, modelOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = (maxDim === 0 || !isFinite(maxDim)) ? 1 : desiredHeight / maxDim;
    const offset: [number, number, number] = [-center.x, -box.min.y, -center.z];
    return { uniformScale: scale, modelOffset: offset };
  }, [clonedScene, desiredHeight]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (hovered && !discovered) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.08;
      groupRef.current.scale.setScalar(uniformScale * pulse);
    } else {
      const currentScale = groupRef.current.scale.x;
      const targetScale = uniformScale;
      const scaleDiff = Math.abs(currentScale - targetScale);

      const currentRot = groupRef.current.rotation.y;
      const targetRot = baseRotation.current;
      const rotDiff = Math.abs(currentRot - targetRot);

      if (scaleDiff > 0.001) {
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      } else if (currentScale !== targetScale) {
        groupRef.current.scale.setScalar(targetScale);
      }

      if (rotDiff > 0.001) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRot, targetRot, 0.1);
      } else if (currentRot !== targetRot) {
        groupRef.current.rotation.y = targetRot;
      }
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    
    // Play tap sound on click
    playSound('/sounds/tap.mp3', 'general');

    if (!discovered) {
      setDiscovered(true);
      onDiscover(name);
    }
  };

  return (
    <group position={position}>
      <group
        ref={groupRef}
        scale={uniformScale}
        rotation={[0, rotationY, 0]}
        onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = discovered ? 'default' : 'pointer'; }}
        onPointerLeave={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={handleClick}
      >
        <primitive object={clonedScene} position={modelOffset} castShadow receiveShadow />
        {children}
        {/* Always render ring, toggle visibility to prevent scene graph flash */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={discovered}>
          <ringGeometry args={[desiredHeight * 0.35, desiredHeight * 0.45, 32]} />
          <meshBasicMaterial color="#4ade80" opacity={0.7} transparent />
        </mesh>
      </group>

      {/* Green glow on discovery, orange hint/hover glow before discovery */}
      <pointLight
        position={[0, desiredHeight * 0.5, 0]}
        color={discovered ? "#4ade80" : "#f97316"}
        intensity={discovered ? 2.5 : hovered ? 4.0 : 0.6}
        distance={2.5}
      />
    </group>
  );
}

function PrimitiveHazardObject({
  position,
  name,
  desiredHeight = 1,
  onDiscover,
  children,
}: {
  position: [number, number, number];
  name: string;
  desiredHeight?: number;
  onDiscover: (name: string) => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const [discovered, setDiscovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  const handleClick = (e: any) => {
    e.stopPropagation();
    
    // Play tap sound on click
    playSound('/sounds/tap.mp3', 'general');

    if (!discovered) {
      setDiscovered(true);
      onDiscover(name);
    }
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (hovered && !discovered) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.08;
      groupRef.current.scale.setScalar(pulse);
    } else {
      const currentScale = groupRef.current.scale.x;
      const scaleDiff = Math.abs(currentScale - 1);

      const currentRot = groupRef.current.rotation.y;
      const rotDiff = Math.abs(currentRot - 0);

      if (scaleDiff > 0.001) {
        groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      } else if (currentScale !== 1) {
        groupRef.current.scale.setScalar(1);
      }

      if (rotDiff > 0.001) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(currentRot, 0, 0.1);
      } else if (currentRot !== 0) {
        groupRef.current.rotation.y = 0;
      }
    }
  });

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = discovered ? 'default' : 'pointer'; }}
        onPointerLeave={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={handleClick}
      >
        {children}
        {/* Ring indicator */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={discovered}>
          <ringGeometry args={[desiredHeight * 0.35, desiredHeight * 0.45, 32]} />
          <meshBasicMaterial color="#4ade80" opacity={0.7} transparent />
        </mesh>
      </group>

      {/* Green glow on discovery, orange hint/hover glow before discovery */}
      <pointLight
        position={[0, desiredHeight * 0.5, 0]}
        color={discovered ? "#4ade80" : "#f97316"}
        intensity={discovered ? 2.5 : hovered ? 4.0 : 0.6}
        distance={2.5}
      />
    </group>
  );
}

function BedDecorations() {
  return (
    <group position={[-2, 0, -2.5]}>
      {/* Pillows */}
      <mesh position={[-0.32, 0.24, -0.65]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[0.46, 0.08, 0.32]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.9} />
      </mesh>
      <mesh position={[0.32, 0.24, -0.65]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[0.46, 0.08, 0.32]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.9} />
      </mesh>
      {/* Duvet / Folded blanket */}
      <mesh position={[0, 0.22, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.04, 1.2]} />
        <meshStandardMaterial color="#475569" roughness={0.8} /> {/* Slate grey blanket */}
      </mesh>
    </group>
  );
}

function DeskUnit({ isLightOn }: { isLightOn: boolean }) {
  return (
    <group position={[4.6, 0, -1.2]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Desk top */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.04, 0.6]} />
        <meshStandardMaterial color="#d4a373" roughness={0.4} /> {/* Light Maple wood */}
      </mesh>
      {/* Left drawer pedestal */}
      <mesh position={[-0.5, 0.34, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.68, 0.5]} />
        <meshStandardMaterial color="#f4efe8" roughness={0.6} />
      </mesh>
      {/* Desk Legs (Right side) */}
      <mesh position={[0.55, 0.35, -0.2]} castShadow>
        <boxGeometry args={[0.04, 0.7, 0.04]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.55, 0.35, 0.2]} castShadow>
        <boxGeometry args={[0.04, 0.7, 0.04]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Modern Open Laptop */}
      <group position={[0, 0.74, 0.05]} rotation={[0, -0.1, 0]}>
        {/* Laptop base */}
        <mesh castShadow>
          <boxGeometry args={[0.32, 0.015, 0.22]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Laptop screen (angled open) */}
        <mesh position={[0, 0.1, -0.1]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.32, 0.2, 0.012]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Emissive Screen Face */}
        <mesh position={[0, 0.1, -0.092]} rotation={[0.3, 0, 0]}>
          <planeGeometry args={[0.3, 0.18]} />
          <meshBasicMaterial color="#e0f2fe" toneMapped={false} />
        </mesh>
        {/* Soft blue glow from screen in the dark */}
        {!isLightOn && (
          <pointLight position={[0, 0.1, 0.15]} color="#93c5fd" intensity={0.6} distance={1.2} />
        )}
      </group>

      {/* Desk Mat / Notebook */}
      <mesh position={[0, 0.725, 0.08]} castShadow>
        <boxGeometry args={[0.55, 0.005, 0.3]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
      </mesh>

      {/* Coffee Mug */}
      <group position={[-0.45, 0.74, 0.12]} rotation={[0, 0.5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.03, 0.08, 8]} />
          <meshStandardMaterial color="#0d9488" roughness={0.5} />
        </mesh>
        <mesh position={[0.035, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.015, 0.04, 0.01]} />
          <meshStandardMaterial color="#0d9488" roughness={0.5} />
        </mesh>
      </group>

      {/* Computer Mouse */}
      <mesh position={[0.34, 0.74, 0.1]} rotation={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[0.04, 0.02, 0.075]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>

      {/* Modern Chair */}
      <group position={[0, 0, 0.55]} rotation={[0, 0.15, 0]}>
        {/* Seat Cushion */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.42, 0.06, 0.42]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, 0.76, 0.18]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.38, 0.4, 0.04]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        {/* Swivel base pedestal */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Star base legs */}
        <mesh position={[0, 0.02, 0]} rotation={[0, 0, 0]} castShadow><boxGeometry args={[0.36, 0.03, 0.04]} /><meshStandardMaterial color="#475569" metalness={0.7} /></mesh>
        <mesh position={[0, 0.02, 0]} rotation={[0, Math.PI / 2, 0]} castShadow><boxGeometry args={[0.36, 0.03, 0.04]} /><meshStandardMaterial color="#475569" metalness={0.7} /></mesh>
      </group>

      {/* Bookshelf above desk */}
      <group position={[0, 1.4, -0.175]}>
        {/* Floating Shelf Board */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.03, 0.25]} />
          <meshStandardMaterial color="#d4a373" roughness={0.4} />
        </mesh>
        {/* Dynamic Colorful Books standing on shelf */}
        <mesh position={[-0.3, 0.12, 0]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.04, 0.2, 0.18]} />
          <meshStandardMaterial color="#dc2626" roughness={0.7} />
        </mesh>
        <mesh position={[-0.25, 0.12, 0]} rotation={[0, 0, -0.05]} castShadow>
          <boxGeometry args={[0.036, 0.22, 0.18]} />
          <meshStandardMaterial color="#2563eb" roughness={0.7} />
        </mesh>
        <mesh position={[-0.20, 0.12, 0]} rotation={[0, 0, -0.1]} castShadow>
          <boxGeometry args={[0.044, 0.19, 0.18]} />
          <meshStandardMaterial color="#16a34a" roughness={0.7} />
        </mesh>
        <mesh position={[0.2, 0.12, 0]} rotation={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.04, 0.21, 0.18]} />
          <meshStandardMaterial color="#d97706" roughness={0.7} />
        </mesh>
        {/* Small Succulent Potted Plant */}
        <group position={[0.4, 0.06, 0]}>
          {/* Pot */}
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.035, 0.09, 8]} />
            <meshStandardMaterial color="#e07a5f" roughness={0.9} />
          </mesh>
          {/* Plant sphere representing succulent */}
          <mesh position={[0, 0.07, 0]} castShadow>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color="#4d7c0f" roughness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function CornerPlant() {
  return (
    <group position={[-4.2, 0, 3]}>
      {/* Ceramic Pot */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.20, 0.5, 12]} />
        <meshStandardMaterial color="#fcfcfc" roughness={0.4} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.49, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.02, 12]} />
        <meshStandardMaterial color="#451a03" roughness={0.95} />
      </mesh>
      {/* Muted green organic leaves/stems */}
      <group position={[0, 0.5, 0]}>
        {/* Stems */}
        <mesh position={[0, 0.3, 0]} rotation={[0.2, 0.1, -0.2]} castShadow>
          <boxGeometry args={[0.02, 0.6, 0.02]} />
          <meshStandardMaterial color="#2d4a22" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.35, 0]} rotation={[-0.15, -0.3, 0.15]} castShadow>
          <boxGeometry args={[0.02, 0.7, 0.02]} />
          <meshStandardMaterial color="#2d4a22" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.4, 0]} rotation={[0.1, 0.4, 0.1]} castShadow>
          <boxGeometry args={[0.02, 0.8, 0.02]} />
          <meshStandardMaterial color="#2d4a22" roughness={0.8} />
        </mesh>
        {/* Large leaves */}
        <mesh position={[-0.18, 0.55, 0.15]} rotation={[0.4, 0.2, -0.5]} scale={[1, 0.03, 1.6]} castShadow>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshStandardMaterial color="#3f6212" roughness={0.9} />
        </mesh>
        <mesh position={[0.22, 0.65, -0.1]} rotation={[-0.3, -0.4, 0.6]} scale={[1, 0.03, 1.8]} castShadow>
          <sphereGeometry args={[0.24, 8, 8]} />
          <meshStandardMaterial color="#3f6212" roughness={0.9} />
        </mesh>
        <mesh position={[0.05, 0.8, 0.2]} rotation={[0.2, 0.5, 0.2]} scale={[1, 0.03, 1.8]} castShadow>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial color="#4d7c0f" roughness={0.9} />
        </mesh>
        <mesh position={[-0.1, 0.75, -0.22]} rotation={[-0.4, 0.1, -0.3]} scale={[1, 0.03, 1.6]} castShadow>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshStandardMaterial color="#3f6212" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function NightstandDecor() {
  return (
    <group position={[0.2, 0.7, -3.2]}>
      {/* Small closed book */}
      <mesh position={[-0.1, 0.015, 0.08]} rotation={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.18, 0.03, 0.14]} />
        <meshStandardMaterial color="#854d0e" roughness={0.8} />
      </mesh>
      {/* Tiny succulent plant */}
      <group position={[0.12, 0.02, -0.06]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.03, 0.05, 8]} />
          <meshStandardMaterial color="#fafaf9" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.04, 0]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#16a34a" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function Wastebasket() {
  return (
    <group position={[4.4, 0, -0.5]}>
      {/* Basket container */}
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.09, 0.28, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>
      {/* Metallic rim */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.125, 0.125, 0.015, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function WallMirror() {
  return (
    <group position={[-4.92, 1.9, -0.8]} rotation={[0, Math.PI / 2, 0]}>
      {/* Gold Frame */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.04, 24]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Reflective Glass */}
      <mesh position={[0, 0, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.51, 0.51, 0.005, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} envMapIntensity={1.5} />
      </mesh>
    </group>
  );
}

function BedsideSlippers() {
  return (
    <group position={[-1.2, 0.01, -1.8]} rotation={[0, Math.PI / 5, 0]}>
      {/* Left Slipper */}
      <mesh position={[-0.08, 0.015, 0]} castShadow>
        <boxGeometry args={[0.11, 0.03, 0.22]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      <mesh position={[-0.08, 0.035, -0.04]} castShadow>
        <boxGeometry args={[0.11, 0.02, 0.1]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.8} />
      </mesh>
      {/* Right Slipper */}
      <mesh position={[0.08, 0.015, 0]} castShadow>
        <boxGeometry args={[0.11, 0.03, 0.22]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      <mesh position={[0.08, 0.035, -0.04]} castShadow>
        <boxGeometry args={[0.11, 0.02, 0.1]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.8} />
      </mesh>
    </group>
  );
}

function BedBench() {
  return (
    <group position={[-2, 0, -0.8]}>
      {/* Cushion */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[1.0, 0.08, 0.32]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      {/* Wood Base */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[1.0, 0.04, 0.32]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.45, 0.15, -0.11]} castShadow><boxGeometry args={[0.04, 0.3, 0.04]} /><meshStandardMaterial color="#78350f" roughness={0.6} /></mesh>
      <mesh position={[-0.45, 0.15, 0.11]} castShadow><boxGeometry args={[0.04, 0.3, 0.04]} /><meshStandardMaterial color="#78350f" roughness={0.6} /></mesh>
      <mesh position={[0.45, 0.15, -0.11]} castShadow><boxGeometry args={[0.04, 0.3, 0.04]} /><meshStandardMaterial color="#78350f" roughness={0.6} /></mesh>
      <mesh position={[0.45, 0.15, 0.11]} castShadow><boxGeometry args={[0.04, 0.3, 0.04]} /><meshStandardMaterial color="#78350f" roughness={0.6} /></mesh>
    </group>
  );
}

function WallPoster() {
  return (
    <group position={[-2, 2.1, -3.9]}>
      {/* Black Frame */}
      <mesh castShadow>
        <boxGeometry args={[1.5, 1.0, 0.04]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
      {/* Poster Canvas */}
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[1.4, 0.9]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.9} />
      </mesh>
      {/* Minimalist Art Design shapes on poster */}
      <mesh position={[0, -0.1, 0.03]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshStandardMaterial color="#f97316" roughness={0.9} /> {/* Orange Sun */}
      </mesh>
      <mesh position={[-0.2, -0.2, 0.032]}>
        <planeGeometry args={[0.6, 0.3]} />
        <meshStandardMaterial color="#475569" roughness={0.9} /> {/* Dark grey hill */}
      </mesh>
      <mesh position={[0.2, -0.25, 0.034]}>
        <planeGeometry args={[0.5, 0.2]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.9} /> {/* Light grey hill */}
      </mesh>
    </group>
  );
}

// ─── Primitive Geometry Helpers ───────────────────────────────

function WindowFrame({ position, isLightOn }: { position: [number, number, number]; isLightOn: boolean }) {
  return (
    <group position={position}>
      {/* Sky/light behind window */}
      <mesh position={[0, 0, -0.08]}>
        <planeGeometry args={[1.6, 1.4]} />
        <meshBasicMaterial color={isLightOn ? "#87ceeb" : "#020617"} />
      </mesh>
      {/* Frame pieces */}
      <mesh position={[0, 0.75, 0]} castShadow><boxGeometry args={[1.8, 0.1, 0.1]} /><meshStandardMaterial color="#e8e0d8" roughness={0.5} /></mesh>
      <mesh position={[0, -0.75, 0]} castShadow><boxGeometry args={[1.8, 0.1, 0.1]} /><meshStandardMaterial color="#e8e0d8" roughness={0.5} /></mesh>
      <mesh position={[-0.85, 0, 0]} castShadow><boxGeometry args={[0.1, 1.6, 0.1]} /><meshStandardMaterial color="#e8e0d8" roughness={0.5} /></mesh>
      <mesh position={[0.85, 0, 0]} castShadow><boxGeometry args={[0.1, 1.6, 0.1]} /><meshStandardMaterial color="#e8e0d8" roughness={0.5} /></mesh>
      <mesh position={[0, 0, 0]} castShadow><boxGeometry args={[0.06, 1.5, 0.06]} /><meshStandardMaterial color="#e8e0d8" roughness={0.5} /></mesh>
      <mesh position={[0, 0, 0]} castShadow><boxGeometry args={[1.7, 0.06, 0.06]} /><meshStandardMaterial color="#e8e0d8" roughness={0.5} /></mesh>
    </group>
  );
}

function DoorFrame({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Door panel (slightly ajar) */}
      <mesh position={[0.45, 1.15, 0.04]} rotation={[0, -0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 2.3, 0.06]} />
        <meshStandardMaterial color="#8b6914" roughness={0.6} />
      </mesh>
      {/* Door handle */}
      <mesh position={[0.12, 1.1, 0.12]} rotation={[0, -0.3, 0]} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Frame */}
      <mesh position={[-0.02, 1.15, 0]} castShadow><boxGeometry args={[0.1, 2.4, 0.12]} /><meshStandardMaterial color="#e8e0d8" roughness={0.5} /></mesh>
      <mesh position={[0.98, 1.15, 0]} castShadow><boxGeometry args={[0.1, 2.4, 0.12]} /><meshStandardMaterial color="#e8e0d8" roughness={0.5} /></mesh>
      <mesh position={[0.48, 2.35, 0]} castShadow><boxGeometry args={[1.1, 0.1, 0.12]} /><meshStandardMaterial color="#e8e0d8" roughness={0.5} /></mesh>
    </group>
  );
}

function LightSwitch({
  isLightOn,
  setIsLightOn,
}: {
  isLightOn: boolean;
  setIsLightOn: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={[4.88, 1.4, 1.0]}
      rotation={[0, -Math.PI / 2, 0]}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerLeave={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => {
        e.stopPropagation();
        playSound('/sounds/tap.mp3', 'general');
        setIsLightOn((prev) => !prev);
      }}
    >
      {/* Switch Plate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.12, 0.01]} />
        <meshStandardMaterial color={hovered ? "#f1f5f9" : "#fafaf9"} roughness={0.5} />
      </mesh>
      {/* Toggle Lever */}
      <mesh position={[0, isLightOn ? 0.015 : -0.015, 0.008]} rotation={[isLightOn ? 0.25 : -0.25, 0, 0]} castShadow>
        <boxGeometry args={[0.015, 0.025, 0.025]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Tiny Status Indicator light */}
      <mesh position={[0, 0.04, 0.006]}>
        <sphereGeometry args={[0.006, 8, 8]} />
        <meshBasicMaterial color={isLightOn ? "#ef4444" : "#22c55e"} />
      </mesh>
    </group>
  );
}

// ─── Flickering Flame & Heater Glow Components for Night Mode ───

function FlickeringFlame({ isLightOn }: { isLightOn: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Simulate flickering by combining sine waves of different frequencies
    const flicker = Math.sin(t * 12) * Math.cos(t * 7) * 0.15 + 1.0;
    
    if (lightRef.current) {
      const baseIntensity = isLightOn ? 1.5 : 4.5;
      lightRef.current.intensity = baseIntensity * flicker;
    }
    if (flameRef.current) {
      // Scale flame up/down and wobble slightly
      flameRef.current.scale.set(
        1 + Math.sin(t * 20) * 0.05,
        1 + Math.cos(t * 15) * 0.1,
        1 + Math.sin(t * 20) * 0.05
      );
    }
  });

  return (
    <group>
      {/* Inner hot core */}
      <mesh ref={flameRef} position={[0, 0.24, 0]}>
        <coneGeometry args={[0.02, 0.06, 8]} />
        <meshBasicMaterial color="#f59e0b" toneMapped={false} />
      </mesh>
      {/* Outer halo */}
      <mesh position={[0, 0.24, 0]} scale={[1.4, 1.4, 1.4]}>
        <coneGeometry args={[0.02, 0.06, 8]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0.3, 0]}
        color="#f59e0b"
        intensity={isLightOn ? 1.5 : 4.5}
        distance={isLightOn ? 1.8 : 4.0}
        castShadow={!isLightOn}
        shadow-bias={-0.001}
      />
    </group>
  );
}

function HeaterGlowLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (lightRef.current) {
      lightRef.current.intensity = 2.5 + Math.sin(t * 4) * 0.5;
    }
  });
  return (
    <pointLight
      ref={lightRef}
      position={[0, 0, 0.1]}
      color="#ff2200"
      intensity={2.5}
      distance={2.5}
      castShadow
      shadow-bias={-0.001}
    />
  );
}

// ─── New Low-Poly Decorative Props ───

function HangingPlant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Ceiling hanger plate */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.01, 8]} />
        <meshStandardMaterial color="#fafaf9" />
      </mesh>
      {/* Cord */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.003, 0.003, 0.8, 4]} />
        <meshStandardMaterial color="#57534e" />
      </mesh>
      {/* Planter Pot */}
      <mesh position={[0, -0.85, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.09, 0.16, 8]} />
        <meshStandardMaterial color="#fcfcfc" roughness={0.3} />
      </mesh>
      {/* Plant soil */}
      <mesh position={[0, -0.76, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.01, 8]} />
        <meshStandardMaterial color="#451a03" roughness={0.95} />
      </mesh>
      {/* Cascading Ivy Leaves */}
      <group position={[0, -0.75, 0]}>
        <mesh position={[0.06, -0.05, 0.08]} rotation={[0.4, 0.2, -0.4]} castShadow>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial color="#3f6212" roughness={0.9} />
        </mesh>
        <mesh position={[-0.08, -0.08, 0.06]} rotation={[0.2, -0.3, 0.5]} castShadow>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshStandardMaterial color="#4d7c0f" roughness={0.9} />
        </mesh>
        <mesh position={[0.02, -0.15, -0.08]} rotation={[-0.3, 0.5, 0.2]} castShadow>
          <sphereGeometry args={[0.065, 6, 6]} />
          <meshStandardMaterial color="#3f6212" roughness={0.9} />
        </mesh>
        {/* Long vine hanging down */}
        <group position={[0, -0.1, 0.08]}>
          <mesh position={[0, -0.08, 0]} rotation={[0.1, 0, 0.2]} castShadow>
            <sphereGeometry args={[0.05, 5, 5]} />
            <meshStandardMaterial color="#65a30d" />
          </mesh>
          <mesh position={[0.02, -0.16, 0.02]} rotation={[0.2, 0, -0.1]} castShadow>
            <sphereGeometry args={[0.045, 5, 5]} />
            <meshStandardMaterial color="#4d7c0f" />
          </mesh>
          <mesh position={[0, -0.24, 0.04]} rotation={[0.3, 0.1, 0]} castShadow>
            <sphereGeometry args={[0.035, 5, 5]} />
            <meshStandardMaterial color="#3f6212" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function LaundryHamper({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Hamper Basket */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.18, 0.5, 12]} />
        <meshStandardMaterial color="#d6c4ae" roughness={0.9} /> {/* Woven tan color */}
      </mesh>
      {/* Rim border */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <torusGeometry args={[0.22, 0.015, 8, 16]} />
        <meshStandardMaterial color="#b59c7d" roughness={0.8} />
      </mesh>
      {/* Tilted Lid */}
      <group position={[0.05, 0.52, 0.05]} rotation={[0.3, 0, -0.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.23, 0.23, 0.02, 12]} />
          <meshStandardMaterial color="#d6c4ae" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.025, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.03, 8]} />
          <meshStandardMaterial color="#b59c7d" roughness={0.8} />
        </mesh>
      </group>
      {/* Clothes peeking out */}
      <mesh position={[-0.08, 0.5, 0.05]} rotation={[0.2, 0.4, 0.5]} castShadow>
        <boxGeometry args={[0.15, 0.08, 0.15]} />
        <meshStandardMaterial color="#ef4444" roughness={0.8} /> {/* Red shirt peeking */}
      </mesh>
      <mesh position={[0.06, 0.5, -0.06]} rotation={[-0.3, 0.1, -0.2]} castShadow>
        <boxGeometry args={[0.16, 0.06, 0.12]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.8} /> {/* Blue shirt peeking */}
      </mesh>
    </group>
  );
}

function FloorBookshelf({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main outer wood frame */}
      {/* Left side */}
      <mesh position={[-0.38, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 1.0, 0.28]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} /> {/* Walnut wood */}
      </mesh>
      {/* Right side */}
      <mesh position={[0.38, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 1.0, 0.28]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>
      {/* Top board */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.04, 0.28]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>
      {/* Bottom board */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.04, 0.28]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>
      {/* Middle shelf */}
      <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.03, 0.26]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>

      {/* Decorative items on shelves */}
      {/* Bottom shelf items */}
      <group position={[0, 0.08, 0]}>
        {/* Book stack */}
        <mesh position={[-0.2, 0.02, 0]} castShadow>
          <boxGeometry args={[0.18, 0.04, 0.2]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.7} />
        </mesh>
        <mesh position={[-0.2, 0.06, 0.01]} rotation={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.17, 0.036, 0.19]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.7} />
        </mesh>
        <mesh position={[-0.19, 0.096, -0.01]} rotation={[0, -0.05, 0]} castShadow>
          <boxGeometry args={[0.16, 0.032, 0.18]} />
          <meshStandardMaterial color="#047857" roughness={0.7} />
        </mesh>

        {/* Small bowl/dish */}
        <mesh position={[0.18, 0.04, 0.02]} castShadow>
          <cylinderGeometry args={[0.08, 0.05, 0.05, 8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.1} />
        </mesh>
      </group>

      {/* Middle shelf items */}
      <group position={[0, 0.535, 0]}>
        {/* Standing books */}
        <mesh position={[-0.15, 0.15, 0]} castShadow>
          <boxGeometry args={[0.04, 0.26, 0.2]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>
        <mesh position={[-0.10, 0.14, 0.01]} rotation={[0, 0, -0.08]} castShadow>
          <boxGeometry args={[0.045, 0.24, 0.2]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        <mesh position={[-0.04, 0.13, 0.02]} rotation={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[0.038, 0.22, 0.2]} />
          <meshStandardMaterial color="#4f46e5" />
        </mesh>

        {/* Small Potted Cactus */}
        <group position={[0.22, 0.04, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.04, 0.07, 8]} />
            <meshStandardMaterial color="#d1fae5" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.09, 0]} castShadow>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#15803d" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* Top shelf items */}
      <group position={[0, 1.02, 0]}>
        {/* Decorative globe/sphere sculpture */}
        <mesh position={[-0.16, 0.11, 0]} castShadow>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-0.16, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>

        {/* Small Succulent Pot */}
        <group position={[0.18, 0.03, 0.02]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.045, 0.035, 0.06, 8]} />
            <meshStandardMaterial color="#fafaf9" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.06, 0]} castShadow>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#166534" roughness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function FloorPouf({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main cushion */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.24, 10]} />
        <meshStandardMaterial color="#c2410c" roughness={0.9} /> {/* Terracotta red */}
      </mesh>
      {/* Indentation top button */}
      <mesh position={[0, 0.24, 0]} castShadow>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#ea580c" roughness={0.8} />
      </mesh>
    </group>
  );
}

function WallClock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      {/* Outer black ring */}
      <mesh castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 24]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      {/* Clock Face */}
      <mesh position={[0, 0.005, 0.015]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.01, 24]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.8} />
      </mesh>
      {/* Hour Hand */}
      <mesh position={[-0.03, 0.015, 0.022]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.07, 0.012, 0.005]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* Minute Hand */}
      <mesh position={[0, 0.045, 0.022]} rotation={[0, 0, -0.8]}>
        <boxGeometry args={[0.012, 0.11, 0.005]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* Center cap */}
      <mesh position={[0, 0.005, 0.025]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

function CozyArmchair({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Seat Cushion */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.16, 0.58]} />
        <meshStandardMaterial color="#0f766e" roughness={0.8} /> {/* Dark Teal */}
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.46, -0.22]} rotation={[-0.08, 0, 0]} castShadow>
        <boxGeometry args={[0.62, 0.42, 0.14]} />
        <meshStandardMaterial color="#0f766e" roughness={0.8} />
      </mesh>
      {/* Left Armrest */}
      <mesh position={[-0.34, 0.28, 0.02]} castShadow>
        <boxGeometry args={[0.08, 0.32, 0.54]} />
        <meshStandardMaterial color="#115e59" roughness={0.7} />
      </mesh>
      {/* Right Armrest */}
      <mesh position={[0.34, 0.28, 0.02]} castShadow>
        <boxGeometry args={[0.08, 0.32, 0.54]} />
        <meshStandardMaterial color="#115e59" roughness={0.7} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.26, 0.05, -0.2]} castShadow>
        <cylinderGeometry args={[0.02, 0.015, 0.1, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>
      <mesh position={[0.26, 0.05, -0.2]} castShadow>
        <cylinderGeometry args={[0.02, 0.015, 0.1, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>
      <mesh position={[-0.26, 0.05, 0.2]} castShadow>
        <cylinderGeometry args={[0.02, 0.015, 0.1, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>
      <mesh position={[0.26, 0.05, 0.2]} castShadow>
        <cylinderGeometry args={[0.02, 0.015, 0.1, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>
      {/* Throw Pillow */}
      <mesh position={[0.12, 0.28, -0.1]} rotation={[0.1, -0.2, 0.2]} castShadow>
        <boxGeometry args={[0.22, 0.22, 0.06]} />
        <meshStandardMaterial color="#ea580c" roughness={0.8} /> {/* Orange accent pillow */}
      </mesh>
    </group>
  );
}

function ModernChandelier({ isLightOn }: { isLightOn: boolean }) {
  return (
    <group position={[0, 3.5, -1]}>
      {/* Ceiling mounting plate */}
      <mesh castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Light 1 (Low) */}
      <group position={[0.14, 0, 0.08]}>
        {/* Cord */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.6, 4]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        {/* Shade */}
        <mesh position={[0, -0.64, 0]} castShadow>
          <coneGeometry args={[0.07, 0.12, 10]} />
          <meshStandardMaterial color="#fafaf9" metalness={0.2} roughness={0.6} />
        </mesh>
        {/* Inside gold rim */}
        <mesh position={[0, -0.7, 0]} rotation={[Math.PI, 0, 0]}>
          <ringGeometry args={[0.06, 0.07, 10]} />
          <meshBasicMaterial color="#d4af37" />
        </mesh>
        {/* Bulb */}
        <mesh position={[0, -0.68, 0]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial
            color={isLightOn ? "#fef3c7" : "#475569"}
            emissive={isLightOn ? "#fef3c7" : "#000000"}
            emissiveIntensity={isLightOn ? 3.0 : 0.0}
          />
        </mesh>
      </group>

      {/* Light 2 (Medium) */}
      <group position={[-0.14, 0, -0.08]}>
        {/* Cord */}
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.44, 4]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        {/* Shade */}
        <mesh position={[0, -0.48, 0]} castShadow>
          <coneGeometry args={[0.07, 0.12, 10]} />
          <meshStandardMaterial color="#fafaf9" metalness={0.2} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.54, 0]} rotation={[Math.PI, 0, 0]}>
          <ringGeometry args={[0.06, 0.07, 10]} />
          <meshBasicMaterial color="#d4af37" />
        </mesh>
        <mesh position={[0, -0.52, 0]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial
            color={isLightOn ? "#fef3c7" : "#475569"}
            emissive={isLightOn ? "#fef3c7" : "#000000"}
            emissiveIntensity={isLightOn ? 3.0 : 0.0}
          />
        </mesh>
      </group>

      {/* Light 3 (High) */}
      <group position={[0, 0, -0.15]}>
        {/* Cord */}
        <mesh position={[0, -0.38, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.76, 4]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        {/* Shade */}
        <mesh position={[0, -0.82, 0]} castShadow>
          <coneGeometry args={[0.07, 0.12, 10]} />
          <meshStandardMaterial color="#fafaf9" metalness={0.2} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.88, 0]} rotation={[Math.PI, 0, 0]}>
          <ringGeometry args={[0.06, 0.07, 10]} />
          <meshBasicMaterial color="#d4af37" />
        </mesh>
        <mesh position={[0, -0.86, 0]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial
            color={isLightOn ? "#fef3c7" : "#475569"}
            emissive={isLightOn ? "#fef3c7" : "#000000"}
            emissiveIntensity={isLightOn ? 3.0 : 0.0}
          />
        </mesh>
      </group>
    </group>
  );
}

function SleepingCat({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.3, 0]}>
      {/* Curled Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial color="#d97706" roughness={0.9} /> {/* Ginger cat */}
      </mesh>
      {/* Head */}
      <mesh position={[0.06, 0.03, 0.04]} castShadow>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#d97706" roughness={0.9} />
      </mesh>
      {/* Ears */}
      <mesh position={[0.07, 0.08, 0.06]} rotation={[0.2, 0, -0.2]}>
        <coneGeometry args={[0.012, 0.025, 4]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0.09, 0.07, 0.02]} rotation={[0.2, 0.2, -0.2]}>
        <coneGeometry args={[0.012, 0.025, 4]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.06, -0.02, -0.04]} rotation={[0.2, 0.8, -0.4]}>
        <cylinderGeometry args={[0.015, 0.01, 0.14, 6]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
    </group>
  );
}

function DoubleFrames() {
  return (
    <group>
      {/* Left vertical frame */}
      <group position={[-4.92, 1.85, -2.4]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.55, 0.03]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} /> {/* Dark slate frame */}
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[0.34, 0.49]} />
          <meshStandardMaterial color="#fef08a" roughness={0.9} /> {/* Yellow art */}
        </mesh>
      </group>

      {/* Right vertical frame */}
      <group position={[-4.92, 1.85, -1.8]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.55, 0.03]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[0.34, 0.49]} />
          <meshStandardMaterial color="#93c5fd" roughness={0.9} /> {/* Light blue art */}
        </mesh>
      </group>
    </group>
  );
}

// ─── Bedroom Scene ───────────────────────────────────────────

function BedroomScene({
  onHazardFound,
  isLightOn,
  setIsLightOn,
}: {
  onHazardFound: (name: string) => void;
  isLightOn: boolean;
  setIsLightOn: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <group>
      {/* ── Floor (modern oak wood) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#c5a880" roughness={0.7} />
      </mesh>

      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.5, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#f8f4ef" roughness={0.9} />
      </mesh>

      {/* ── Back Wall (Alabaster) ── */}
      <mesh position={[0, 1.75, -4]} receiveShadow>
        <boxGeometry args={[10, 3.5, 0.15]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.7} />
      </mesh>

      {/* ── Left Wall (Slate Blue Accent) ── */}
      <mesh position={[-5, 1.75, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[8, 3.5, 0.15]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* ── Right Wall (Alabaster) ── */}
      <mesh position={[5, 1.75, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[8, 3.5, 0.15]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.7} />
      </mesh>

      {/* ── Baseboards ── */}
      <mesh position={[0, 0.06, -3.9]} castShadow><boxGeometry args={[10, 0.12, 0.06]} /><meshStandardMaterial color="#e8e0d8" roughness={0.5} /></mesh>
      <mesh position={[-4.9, 0.06, 0]} rotation={[0, Math.PI / 2, 0]} castShadow><boxGeometry args={[8, 0.12, 0.06]} /><meshStandardMaterial color="#e8e0d8" roughness={0.5} /></mesh>
      <mesh position={[4.9, 0.06, 0]} rotation={[0, Math.PI / 2, 0]} castShadow><boxGeometry args={[8, 0.12, 0.06]} /><meshStandardMaterial color="#e8e0d8" roughness={0.5} /></mesh>

      {/* ── Modern Ivory Rug ── */}
      <mesh position={[0, 0.005, -0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.2, 4.5]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.9} />
      </mesh>

      {/* ── Decorative room elements ── */}
      <BedDecorations />
      <DeskUnit isLightOn={isLightOn} />
      <CornerPlant />
      <WallPoster />
      <NightstandDecor />
      <Wastebasket />
      <WallMirror />
      <BedsideSlippers />
      <BedBench />

      {/* New Low-Poly Decorative Props */}
      <HangingPlant position={[-3.8, 3.5, 2.5]} />
      <LaundryHamper position={[-4.1, 0, -0.6]} />
      <FloorBookshelf position={[3.0, 0, -3.75]} />
      <FloorPouf position={[1.0, 0, 1.2]} />
      <WallClock position={[-0.8, 2.4, -3.9]} />
      
      {/* Additional low-poly props */}
      <CozyArmchair position={[-3.2, 0, 2.7]} rotationY={Math.PI / 4} />
      <DoubleFrames />
      <SleepingCat position={[-2.2, 0.44, -0.8]} />
      
      {/* Bedside Mug on Nightstand */}
      <group position={[0.12, 0.72, -3.1]} rotation={[0, 1.2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.035, 0.025, 0.07, 8]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} /> {/* Red mug */}
        </mesh>
        <mesh position={[0.03, 0, 0]}>
          <boxGeometry args={[0.012, 0.03, 0.01]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
      </group>

      {/* ── Furniture (GLB Models) ── */}
      {/* Bed – headboard against the back wall, left side */}
      <FurnitureModel
        position={[-2, 0, -2.5]}
        modelUrl="/models/bed.glb"
        desiredHeight={1.8}
        rotationY={Math.PI}
      />

      {/* Nightstand – next to the bed */}
      <FurnitureModel
        position={[0.2, 0, -3.2]}
        modelUrl="/models/nightstand.glb"
        desiredHeight={0.7}
        rotationY={0}
      />

      {/* Wardrobe – flush against the left wall */}
      <FurnitureModel
        position={[-4.6, 0, 1]}
        modelUrl="/models/wardrobe.glb"
        desiredHeight={2.4}
        rotationY={-Math.PI / 2}
      />

      {/* Table lamp – on the nightstand */}
      <FurnitureModel
        position={[0.2, 0.6, -3.2]}
        modelUrl="/models/lamp.glb"
        desiredHeight={0.4}
        rotationY={0}
      />

      {/* Curtain – directly on the window, top aligned */}
      <FurnitureModel
        position={[1.5, 0.35, -3.85]}
        modelUrl="/models/curtain.glb"
        desiredHeight={2.8}
        rotationY={0}
      />

      {/* ── Window & Door (primitive geometry) ── */}
      <WindowFrame position={[1.5, 2.2, -3.9]} isLightOn={isLightOn} />
      {/* Door embedded within the right wall */}
      <DoorFrame position={[4.85, 0, 2]} rotation={-Math.PI / 2} />

      {/* ── Ceiling Light ── */}
      <ModernChandelier isLightOn={isLightOn} />
      <pointLight position={[0, 2.6, -1]} color="#fef3c7" intensity={isLightOn ? 0.85 : 0} distance={8} />

      {/* Warm lamp glow on the nightstand */}
      <pointLight position={[0.2, 1.1, -3.2]} color="#fde68a" intensity={isLightOn ? 0.5 : 0} distance={3} />

      {/* ── Hazard Objects ── */}
      {/* 1. Overloaded socket on the back wall, near the bed */}
      <ModelHazardObject
        position={[-1, 0.8, -3.85]}
        name="Overloaded Socket"
        modelUrl="/models/socket.glb"
        desiredHeight={0.4}
        onDiscover={onHazardFound}
        isLightOn={isLightOn}
      >
        {/* Multi-plug Adapter Block */}
        <mesh position={[0, 0, 0.05]} castShadow>
          <boxGeometry args={[0.15, 0.1, 0.06]} />
          <meshStandardMaterial color="#ea580c" roughness={0.5} /> {/* Bright Orange Adapter */}
        </mesh>
        
        {/* Plug 1 & its cord to the lamp */}
        <group>
          {/* Plug body */}
          <mesh position={[-0.04, 0, 0.09]} castShadow>
            <boxGeometry args={[0.035, 0.035, 0.04]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          {/* Cable wire */}
          <mesh position={[-0.04, 0, 0.12]} castShadow>
            <boxGeometry args={[0.01, 0.01, 0.03]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Cable drop */}
          <mesh position={[-0.04, -0.08, 0.14]} castShadow>
            <boxGeometry args={[0.01, 0.16, 0.01]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Cable run along wall to nightstand */}
          <mesh position={[0.56, -0.16, 0.14]} castShadow>
            <boxGeometry args={[1.2, 0.01, 0.01]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Cable turn to lamp */}
          <mesh position={[1.16, -0.16, 0.44]} castShadow>
            <boxGeometry args={[0.01, 0.01, 0.6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
        </group>

        {/* Plug 2 & its cord dangling to the floor */}
        <group>
          {/* Plug body */}
          <mesh position={[0, 0.025, 0.09]} castShadow>
            <boxGeometry args={[0.035, 0.035, 0.04]} />
            <meshStandardMaterial color="#fafafa" roughness={0.6} />
          </mesh>
          {/* Cable wire */}
          <mesh position={[0, 0.025, 0.12]} castShadow>
            <boxGeometry args={[0.01, 0.01, 0.03]} />
            <meshStandardMaterial color="#fafafa" roughness={0.8} />
          </mesh>
          {/* Cable drop all the way to floor */}
          <mesh position={[0, -0.37, 0.14]} castShadow>
            <boxGeometry args={[0.01, 0.8, 0.01]} />
            <meshStandardMaterial color="#fafafa" roughness={0.8} />
          </mesh>
          {/* Cable run on floor */}
          <mesh position={[0, -0.77, 0.44]} castShadow>
            <boxGeometry args={[0.01, 0.01, 0.6]} />
            <meshStandardMaterial color="#fafafa" roughness={0.8} />
          </mesh>
        </group>

        {/* Plug 3 & its cord going towards the bed */}
        <group>
          {/* Plug body */}
          <mesh position={[0.04, -0.025, 0.09]} castShadow>
            <boxGeometry args={[0.035, 0.035, 0.04]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.6} />
          </mesh>
          {/* Cable wire */}
          <mesh position={[0.04, -0.025, 0.12]} castShadow>
            <boxGeometry args={[0.01, 0.01, 0.03]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
          </mesh>
          {/* Cable drop */}
          <mesh position={[0.04, -0.25, 0.14]} castShadow>
            <boxGeometry args={[0.01, 0.48, 0.01]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
          </mesh>
          {/* Cable run towards bed */}
          <mesh position={[-0.46, -0.49, 0.14]} castShadow>
            <boxGeometry args={[1.0, 0.01, 0.01]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
          </mesh>
        </group>
      </ModelHazardObject>

      {/* 2. Space heater too close to bed/curtain */}
      <ModelHazardObject
        position={[1.8, 0, -3.2]}
        name="Unattended Heater"
        modelUrl="/models/heater.glb"
        desiredHeight={0.9}
        rotationY={-Math.PI / 4}
        onDiscover={onHazardFound}
        isLightOn={isLightOn}
      >
        {/* Glow of heating coils when lights are off */}
        {!isLightOn && (
          <group position={[0, 0.35, 0.05]}>
            {/* Coil 1 */}
            <mesh position={[0, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.45, 8]} />
              <meshBasicMaterial color="#ff4500" toneMapped={false} />
            </mesh>
            {/* Coil 2 */}
            <mesh position={[0, 0.0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.45, 8]} />
              <meshBasicMaterial color="#ff4500" toneMapped={false} />
            </mesh>
            {/* Coil 3 */}
            <mesh position={[0, -0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.45, 8]} />
              <meshBasicMaterial color="#ff4500" toneMapped={false} />
            </mesh>
            {/* Back reflector plate inside heater */}
            <mesh position={[0, 0, -0.05]}>
              <boxGeometry args={[0.5, 0.4, 0.02]} />
              <meshBasicMaterial color="#7f1d1d" transparent opacity={0.6} toneMapped={false} />
            </mesh>
            {/* Dynamic pulsing pointLight */}
            <HeaterGlowLight />
          </group>
        )}
      </ModelHazardObject>

      {/* 3. Boxes blocking the door/exit */}
      <ModelHazardObject
        position={[4.4, 0, 1.9]}
        name="Blocked Exit"
        modelUrl="/models/boxes.glb"
        desiredHeight={0.8}
        onDiscover={onHazardFound}
        isLightOn={isLightOn}
      />

      {/* 4. Burning Candle on desk too close to laptop/books (New - Primitives) */}
      <PrimitiveHazardObject
        position={[4.45, 0.74, -1.5]}
        name="Burning Candle"
        desiredHeight={0.4}
        onDiscover={onHazardFound}
      >
        {/* Candle Holder */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.1, 8]} />
          <meshStandardMaterial color="#78716c" roughness={0.8} />
        </mesh>
        {/* Candle Wax */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.12, 8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.7} />
        </mesh>
        {/* Flickering Flame & Dynamic Shadow-casting Light */}
        <FlickeringFlame isLightOn={isLightOn} />
      </PrimitiveHazardObject>

      {/* 5. Unattended Iron on Floor near wardrobe (New - Primitives) */}
      <PrimitiveHazardObject
        position={[-3.6, 0, 1.2]}
        name="Unattended Iron"
        desiredHeight={0.5}
        onDiscover={onHazardFound}
      >
        <group rotation={[0, Math.PI / 3, 0]}>
          {/* Baseplate */}
          <mesh position={[0, 0.015, 0]} castShadow>
            <boxGeometry args={[0.34, 0.03, 0.18]} />
            <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Iron Body */}
          <mesh position={[-0.04, 0.11, 0]} castShadow>
            <boxGeometry args={[0.22, 0.16, 0.16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
          <mesh position={[0.1, 0.075, 0]} rotation={[0, 0, -0.4]} castShadow>
            <boxGeometry args={[0.16, 0.1, 0.16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
          {/* Handle */}
          <mesh position={[-0.04, 0.22, 0]} castShadow>
            <boxGeometry args={[0.24, 0.04, 0.06]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          <mesh position={[-0.14, 0.16, 0]} castShadow>
            <boxGeometry args={[0.04, 0.08, 0.06]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          {/* Heating Dial */}
          <mesh position={[0.06, 0.12, 0.085]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#ef4444" toneMapped={false} />
          </mesh>
          {/* Iron warning light glow in the dark */}
          {!isLightOn && (
            <pointLight position={[0.06, 0.12, 0.12]} color="#ef4444" intensity={1.2} distance={1.0} />
          )}
        </group>
      </PrimitiveHazardObject>

      {/* Light Switch next to the door */}
      <LightSwitch isLightOn={isLightOn} setIsLightOn={setIsLightOn} />

      {/* ── Shadows & Environment Map (apartment env reflections only active when lights are on) ── */}
      <ContactShadows position={[0, 0.01, 0]} opacity={isLightOn ? 0.45 : 0.15} scale={14} blur={2.5} far={5} frames={1} />
      {isLightOn && <Environment preset="apartment" />}
    </group>
  );
}

// ─── Main Container ──────────────────────────────────────────

export default function GameContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wasPortraitRef = useRef(true);
  const hasPlayedWinSound = useRef(false);
  const hasPlayedLossSound = useRef(false);
  const [score, setScore] = useState(0);
  const [foundHazards, setFoundHazards] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [needsRotation, setNeedsRotation] = useState(false);
  const [gameId, setGameId] = useState(0);
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 120 seconds (2 minutes)
  const [isLightOn, setIsLightOn] = useState(true); // Room light state (toggled via 3D switch)
  const totalHazards = 5;



  // Monitor device type and orientation
  React.useEffect(() => {
    const checkLayout = () => {
      const mobileAgent = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth < 1024;
      const mobileMode = mobileAgent || isSmallScreen;
      setIsMobile(mobileMode);

      const isPortrait = window.innerHeight > window.innerWidth;
      setNeedsRotation(mobileMode && isPortrait);

      if (mobileMode && isPortrait) {
        setIsMaximized(false);
        wasPortraitRef.current = true;
        // Exit native fullscreen if active when rotated to portrait
        if (typeof document !== 'undefined') {
          const isCurrentlyFull = !!(
            document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).mozFullscreenElement ||
            (document as any).msFullscreenElement
          );
          if (isCurrentlyFull) {
            const exit = 
              document.exitFullscreen ||
              (document as any).webkitExitFullscreen ||
              (document as any).mozCancelFullScreen ||
              (document as any).msExitFullscreen;
            if (exit) {
              exit.call(document).catch(() => {});
            }
          }
        }
      } else if (mobileMode && !isPortrait) {
        // Prime the help instructions overlay when they rotate to landscape
        wasPortraitRef.current = true;
      }
    };

    checkLayout();
    window.addEventListener('resize', checkLayout);
    window.addEventListener('orientationchange', checkLayout);
    return () => {
      window.removeEventListener('resize', checkLayout);
      window.removeEventListener('orientationchange', checkLayout);
    };
  }, []);

  // Listen for native full-screen change events to sync state
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const container = containerRef.current;
      const isFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullscreenElement ||
        (document as any).msFullscreenElement
      );
      
      if (isFull) {
        const currentFullEl = 
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullscreenElement ||
          (document as any).msFullscreenElement;
        
        if (currentFullEl === container) {
          setIsMaximized(true);
        }
      } else {
        setIsMaximized(false);
      }
    };

    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    events.forEach(event => {
      document.addEventListener(event, handleFullscreenChange);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    };
  }, []);

  // Determine if we are showing overlays or maximized
  const shouldHidePageElements = isMaximized || needsRotation || (isMobile && !isMaximized && !needsRotation);

  // Lock body scroll and fix position when maximized or overlays are active to prevent dynamic layout adjustments
  React.useEffect(() => {
    if (shouldHidePageElements) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100dvh';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [shouldHidePageElements]);

  // Automatically show help instructions when the game is maximized
  React.useEffect(() => {
    if (isMaximized) {
      setShowHelp(true);
    }
  }, [isMaximized]);

  // Auto-dismiss help after 8 seconds
  React.useEffect(() => {
    if (showHelp) {
      const timer = setTimeout(() => setShowHelp(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showHelp]);

  // Countdown Timer
  React.useEffect(() => {
    if (showHelp || score === totalHazards || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [showHelp, score, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Play outcome sounds on Win or Loss (time's up)
  React.useEffect(() => {
    if (score === totalHazards && !hasPlayedWinSound.current) {
      hasPlayedWinSound.current = true;
      playSound('/sounds/wingame.mp3', 'notification');
    }
  }, [score, totalHazards]);

  React.useEffect(() => {
    if (timeLeft === 0 && score < totalHazards && !hasPlayedLossSound.current) {
      hasPlayedLossSound.current = true;
      playSound('/sounds/failed.mp3', 'games');
    }
  }, [timeLeft, score, totalHazards]);

  const toggleMaximize = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const container = containerRef.current;
    if (!container) return;

    // Check if browser supports native fullscreen on the container
    const isFullscreenSupported = typeof document !== 'undefined' && (
      document.fullscreenEnabled || 
      (document as any).webkitFullscreenEnabled || 
      (document as any).mozFullscreenEnabled || 
      (document as any).msFullscreenEnabled
    );

    if (isFullscreenSupported) {
      try {
        const isCurrentlyFull = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullscreenElement ||
          (document as any).msFullscreenElement
        );

        if (isCurrentlyFull) {
          const exit = 
            document.exitFullscreen ||
            (document as any).webkitExitFullscreen ||
            (document as any).mozCancelFullScreen ||
            (document as any).msExitFullscreen;
          if (exit) {
            await exit.call(document);
          } else {
            setIsMaximized(false);
          }
        } else {
          const req = 
            container.requestFullscreen ||
            (container as any).webkitRequestFullscreen ||
            (container as any).mozRequestFullScreen ||
            (container as any).msRequestFullscreen;
          if (req) {
            await req.call(container);
          } else {
            setIsMaximized(true);
          }
        }
      } catch (err) {
        console.warn('Native fullscreen request failed, falling back to CSS:', err);
        setIsMaximized(prev => !prev);
      }
    } else {
      setIsMaximized(prev => !prev);
    }
  };

  const restartGame = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setScore(0);
    setFoundHazards([]);
    setShowHelp(true);
    setTimeLeft(120); // Reset timer to 2 minutes
    setIsChecklistExpanded(false);
    setIsLightOn(true); // Reset lights to ON
    hasPlayedWinSound.current = false;
    hasPlayedLossSound.current = false;
    setGameId(prev => prev + 1);
  };

  const handleHazardFound = (name: string) => {
    setScore((s) => s + 1);
    setFoundHazards((prev) => [...prev, name]);
    setIsChecklistExpanded(true); // Auto-expand when a hazard is found
  };

  const renderPortal = (children: React.ReactNode) => {
    if (typeof document !== 'undefined' && document.body) {
      return createPortal(children, document.body);
    }
    return null;
  };

  const gameContent = (
    <div
      ref={containerRef}
      className={`w-full bg-slate-900 overflow-hidden transition-all duration-300 ${
        isMaximized
          ? 'fixed inset-0 z-[9999] w-screen h-screen w-[100dvw] h-[100dvh] rounded-none border-none top-0 left-0 right-0 bottom-0 m-0 p-0'
          : 'relative h-[720px] rounded-2xl border border-slate-700/50 shadow-2xl'
      }`}
    >
      {shouldHidePageElements && (
        <style>{`
          nav, footer, .ss-chatbot-toggle, .ss-chatbot-window, .chatbot-window-container {
            display: none !important;
          }
          main > section > div.mb-6,
          main > section > div.mb-8 {
            display: none !important;
          }
          main {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
        `}</style>
      )}

      {/* ── UI Overlay ── */}
      <div className="absolute top-0 left-0 w-full p-3 sm:p-6 z-10 flex justify-between items-start pointer-events-none">
        <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-2.5 sm:p-4 border border-slate-700/50 pointer-events-auto flex flex-col items-start gap-0.5 sm:gap-1 max-w-[55%] sm:max-w-none">
          <h2 className="text-xs sm:text-base md:text-lg font-bold text-white tracking-tight leading-tight sm:leading-none">
            SafeScape <span className="text-orange-400">Hazard Hunt</span>
          </h2>
          <p className="text-slate-400 text-[10px] sm:text-xs md:text-sm mt-0.5 hidden sm:block">
            Find fire hazards hidden in the bedroom.
          </p>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowHelp(true); }}
            className="mt-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-orange-500 hover:bg-orange-600 text-white text-[9px] sm:text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer pointer-events-auto shadow-sm"
          >
            <span>📖</span> Instructions
          </button>
        </div>
        <div className="flex gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Timer Pill */}
          <div className="bg-slate-900/70 backdrop-blur-md px-3 py-1.5 sm:px-5 sm:py-3 rounded-2xl border border-slate-700/50 flex items-center gap-1 sm:gap-2">
            <p className="text-white font-medium text-[10px] sm:text-base flex items-center gap-1 sm:gap-1.5">
              <span className="text-slate-400 text-[9px] sm:text-xs font-semibold uppercase">Time:</span>
              <span className={`font-black text-xs sm:text-xl transition-all ${timeLeft <= 20 ? 'text-rose-500 animate-pulse' : 'text-orange-400'}`}>
                {formatTime(timeLeft)}
              </span>
            </p>
          </div>
          <div className="bg-slate-900/70 backdrop-blur-md px-3 py-1.5 sm:px-5 sm:py-3 rounded-2xl border border-slate-700/50 flex items-center">
            <p className="text-white font-medium text-[10px] sm:text-base">
              Found: <span className="text-orange-400 font-bold text-xs sm:text-xl ml-1">{score}/{totalHazards}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={toggleMaximize}
            className="bg-slate-900/70 hover:bg-slate-800/90 backdrop-blur-md p-2 sm:p-3 rounded-2xl border border-slate-700/50 text-white hover:text-orange-400 transition-all shadow-lg flex items-center justify-center cursor-pointer"
            title={isMaximized ? "Exit Fullscreen" : "Maximize Game"}
          >
            {isMaximized ? (
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Navigation Instructions ── */}
      {showHelp && (
        <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none" style={{ zIndex: 15 }}>
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 landscape:p-4 md:landscape:p-8 border border-slate-600/50 shadow-2xl max-w-md landscape:max-w-2xl md:landscape:max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto pointer-events-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-5 landscape:mb-3 md:landscape:mb-6">
              <h3 className="text-white font-extrabold text-lg sm:text-xl md:text-2xl landscape:text-base md:landscape:text-2xl uppercase tracking-wider flex items-center gap-2">
                <span>🎮</span> How to Play
              </h3>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowHelp(false); }}
                className="text-slate-400 hover:text-white transition-colors text-2xl landscape:text-xl md:landscape:text-2xl leading-none p-1 cursor-pointer"
                aria-label="Close instructions"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 landscape:space-y-0 landscape:grid landscape:grid-cols-3 landscape:gap-4 md:landscape:gap-8">
              <div className="flex items-center gap-4 landscape:flex-col landscape:items-center landscape:text-center landscape:gap-2 md:landscape:gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 landscape:w-9 landscape:h-9 md:landscape:w-16 md:landscape:h-16 rounded-xl md:rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner">
                  <svg className="w-6 h-6 landscape:w-5 landscape:h-5 md:landscape:w-8 md:landscape:h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                </div>
                <div>
                  <p className="text-white text-sm sm:text-base landscape:text-xs md:landscape:text-lg font-bold">
                    {isMobile ? "Swipe to Rotate" : "Left Click + Drag"}
                  </p>
                  <p className="text-slate-400 text-xs sm:text-sm landscape:text-[10px] md:landscape:text-sm landscape:leading-snug md:landscape:leading-relaxed mt-0.5 md:landscape:mt-1.5">
                    {isMobile ? "Swipe with one finger to rotate camera and view the bedroom" : "Rotate the camera to view the bedroom from different angles"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 landscape:flex-col landscape:items-center landscape:text-center landscape:gap-2 md:landscape:gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 landscape:w-9 landscape:h-9 md:landscape:w-16 md:landscape:h-16 rounded-xl md:rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner">
                  <svg className="w-6 h-6 landscape:w-5 landscape:h-5 md:landscape:w-8 md:landscape:h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                </div>
                <div>
                  <p className="text-white text-sm sm:text-base landscape:text-xs md:landscape:text-lg font-bold">
                    {isMobile ? "Pinch to Zoom" : "Scroll Wheel"}
                  </p>
                  <p className="text-slate-400 text-xs sm:text-sm landscape:text-[10px] md:landscape:text-sm landscape:leading-snug md:landscape:leading-relaxed mt-0.5 md:landscape:mt-1.5">
                    {isMobile ? "Pinch screen with two fingers to zoom in or out of the room" : "Zoom in to inspect details or zoom out to see the whole room"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 landscape:flex-col landscape:items-center landscape:text-center landscape:gap-2 md:landscape:gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 landscape:w-9 landscape:h-9 md:landscape:w-16 md:landscape:h-16 rounded-xl md:rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner">
                  <svg className="w-6 h-6 landscape:w-5 landscape:h-5 md:landscape:w-8 md:landscape:h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <div>
                  <p className="text-white text-sm sm:text-base landscape:text-xs md:landscape:text-lg font-bold">
                    {isMobile ? "Tap Glowing Objects" : "Click Glowing Objects"}
                  </p>
                  <p className="text-slate-400 text-xs sm:text-sm landscape:text-[10px] md:landscape:text-sm landscape:leading-snug md:landscape:leading-relaxed mt-0.5 md:landscape:mt-1.5">
                    {isMobile ? "Tap on highlighted hazards to identify them" : "Find and click the fire hazards to resolve them"}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-xs landscape:text-[10px] md:landscape:text-xs text-center mt-5 landscape:mt-2 md:landscape:mt-6 italic">This helper will close automatically in a few seconds.</p>
          </div>
        </div>
      )}

      {/* ── Hazard checklist (bottom) ── */}
      <div className="absolute bottom-4 left-0 w-full px-4 z-10 pointer-events-none flex justify-center">
        {!isChecklistExpanded ? (
          <button
            type="button"
            onClick={() => setIsChecklistExpanded(true)}
            className="pointer-events-auto bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-slate-700/80 hover:border-orange-500/50 text-white font-extrabold text-[10px] sm:text-xs md:text-sm flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-orange-500/10 active:scale-95 transition-all text-center leading-none uppercase tracking-wider select-none animate-bounce"
            style={{ animationDuration: '2s' }}
            title="Expand hazards checklist"
          >
            <span>📋</span> Targets Checklist ({score}/{totalHazards}) <span className="text-orange-400 text-[8px] sm:text-xs">▲</span>
          </button>
        ) : (
          <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3 sm:p-4 md:p-5 shadow-2xl flex flex-col items-center gap-2.5 sm:gap-3.5 transition-all animate-in slide-in-from-bottom-5 duration-300 max-w-[95vw] sm:max-w-2xl w-full select-none">
            {/* Header */}
            <div className="w-full flex items-center justify-between border-b border-slate-850 pb-2 mb-1">
              <h4 className="text-white font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
                <span>📋</span> Target Fire Hazards
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                  Found: <span className="text-orange-400 font-bold">{score}/{totalHazards}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsChecklistExpanded(false)}
                  className="text-slate-400 hover:text-white transition-colors text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-800 cursor-pointer leading-none"
                  title="Minimize checklist"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* List items */}
            <div className="flex gap-1.5 sm:gap-2.5 justify-center flex-wrap">
              {['Overloaded Socket', 'Unattended Heater', 'Blocked Exit', 'Burning Candle', 'Unattended Iron'].map((hazard) => {
                const isFound = foundHazards.includes(hazard);
                return (
                  <div
                    key={hazard}
                    className={`px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-full text-[9px] sm:text-xs md:text-sm font-extrabold transition-all duration-300 border shadow-md flex items-center gap-1.5 ${
                      isFound
                        ? 'bg-emerald-600/90 text-white border-emerald-500 shadow-emerald-950/40'
                        : 'bg-slate-900/90 text-slate-300 border-slate-700 shadow-slate-950/60'
                    }`}
                  >
                    {isFound ? (
                      <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-300"></span>
                      </span>
                    ) : (
                      <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-500"></span>
                    )}
                    <span>{hazard}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Win Screen ── */}
      {score === totalHazards && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <style>{`
            .hazard-badge-overlay {
              display: none !important;
            }
          `}</style>
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center max-w-sm sm:max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-300">
            {/* Shield Complete Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_24px_rgba(16,185,129,0.15)] animate-pulse">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight leading-none">Room Cleared!</h3>
            <div className="text-orange-400 font-extrabold text-[10px] sm:text-xs uppercase tracking-widest mb-4 flex items-center justify-center gap-1.5 select-none">
              <span></span> Challenge Completed <span></span>
            </div>
            
            <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed max-w-[280px] mx-auto">
              Excellent! You identified and resolved all fire hazards in the bedroom.
            </p>
            
            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={restartGame}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-3 px-6 rounded-xl shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] transition-all transform active:scale-95 duration-200 cursor-pointer flex-1 text-xs sm:text-sm uppercase tracking-wide leading-none"
              >
                Play Again
              </button>
              <Link
                href="/kids/challenges"
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl border border-slate-700/50 hover:border-slate-600 hover:text-orange-400 transition-all transform active:scale-95 duration-200 cursor-pointer flex-1 text-xs sm:text-sm flex items-center justify-center decoration-none shadow-md uppercase tracking-wide leading-none"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Time's Up / Game Over Screen ── */}
      {timeLeft === 0 && score < totalHazards && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <style>{`
            .hazard-badge-overlay {
              display: none !important;
            }
          `}</style>
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center max-w-sm sm:max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-300">
            {/* Alarm clock icon badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_24px_rgba(244,63,94,0.15)] animate-pulse">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight leading-none">Time's Up!</h3>
            <div className="text-rose-400 font-extrabold text-[10px] sm:text-xs uppercase tracking-widest mb-4 flex items-center justify-center gap-1.5 select-none">
              <span></span> Challenge Failed <span></span>
            </div>
            
            <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed max-w-[280px] mx-auto">
              You couldn't find all {totalHazards} hazards in time. Don't worry, try again to sharpen your safety search!
            </p>
            
            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={restartGame}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-3 px-6 rounded-xl shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] transition-all transform active:scale-95 duration-200 cursor-pointer flex-1 text-xs sm:text-sm uppercase tracking-wide leading-none"
              >
                Try Again
              </button>
              <Link
                href="/kids/challenges"
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl border border-slate-700/50 hover:border-slate-600 hover:text-orange-400 transition-all transform active:scale-95 duration-200 cursor-pointer flex-1 text-xs sm:text-sm flex items-center justify-center decoration-none shadow-md uppercase tracking-wide leading-none"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 3D Canvas ── */}
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ position: [0, 6.5, 9], fov: 52 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#0a0a16']} />
          <ambientLight intensity={isLightOn ? 0.45 : 0.02} />
          <directionalLight position={[6, 8, 4]} intensity={isLightOn ? 1.0 : 0.02} castShadow={isLightOn} shadow-mapSize={[1024, 1024]} />
          {/* Moonlight shining through the window in dark mode */}
          {!isLightOn && (
            <directionalLight
              position={[1.5, 3.0, -6.0]}
              color="#7dd3fc"
              intensity={0.4}
              castShadow
              shadow-mapSize={[1024, 1024]}
              shadow-bias={-0.002}
            />
          )}
          <pointLight position={[-3, 2.5, 1]} color="#fde68a" intensity={isLightOn ? 0.35 : 0.0} distance={6} />
          <BedroomScene
            key={gameId}
            onHazardFound={handleHazardFound}
            isLightOn={isLightOn}
            setIsLightOn={setIsLightOn}
          />
          <OrbitControls
            makeDefault
            target={[0, 1.2, -0.5]}
            minPolarAngle={0.3}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={5}
            maxDistance={14}
            enablePan={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );

  return (
    <>
      {/* Always render inline — CSS fixed positioning handles fullscreen, portal would destroy the WebGL Canvas */}
      {gameContent}

      {/* ── Orientation Lock Overlay (Mobile Portrait) ── */}
      {needsRotation && renderPortal(
        <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center p-6 text-center pointer-events-auto select-none overflow-hidden overscroll-behavior-none">
          {/* Back to Dashboard Button */}
          <div className="absolute top-4 left-4 z-[10001]">
            <Link
              href="/kids/challenges"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-white font-semibold rounded-xl border border-slate-700/50 hover:text-orange-400 hover:border-orange-500/50 transition-all shadow-lg text-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Activities</span>
            </Link>
          </div>

          <div className="w-20 h-20 mb-6 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center animate-bounce">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Rotate Your Device</h2>
          <p className="text-slate-400 max-w-sm text-sm sm:text-base mb-6">
            SafeScape Hazard Hunt is designed to be played in landscape mode. Please turn your device sideways to start playing.
          </p>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-10 border-2 border-slate-700 rounded-md flex items-center justify-center">
              <div className="w-1.5 h-3 bg-slate-700 rounded-sm absolute left-1"></div>
              <svg className="w-6 h-6 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ animationDuration: '3s' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Landscape Maximize Requirement ── */}
      {isMobile && !isMaximized && !needsRotation && renderPortal(
        <div className="fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center pointer-events-auto overflow-hidden overscroll-behavior-none">
          {/* Back to Dashboard Button */}
          <div className="absolute top-4 left-4 z-[10001]">
            <Link
              href="/kids/challenges"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-white font-semibold rounded-xl border border-slate-700/50 hover:text-orange-400 hover:border-orange-500/50 transition-all shadow-lg text-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Activities</span>
            </Link>
          </div>

          <div className="w-16 h-16 mb-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full flex items-center justify-center animate-bounce">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Maximize Screen to Play</h2>
          <p className="text-slate-400 max-w-sm text-xs sm:text-sm mb-6">
            For the best gameplay experience on mobile, please maximize the screen.
          </p>
          <button
            type="button"
            onClick={toggleMaximize}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-8 rounded-full transition-all shadow-lg text-sm sm:text-base cursor-pointer"
          >
            Maximize Game & Play
          </button>
        </div>
      )}
    </>
  );
}

// Preload ALL models for instant loading
useGLTF.preload('/models/bed.glb');
useGLTF.preload('/models/nightstand.glb');
useGLTF.preload('/models/wardrobe.glb');
useGLTF.preload('/models/lamp.glb');
useGLTF.preload('/models/curtain.glb');
useGLTF.preload('/models/socket.glb');
useGLTF.preload('/models/heater.glb');
useGLTF.preload('/models/boxes.glb');
