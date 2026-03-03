import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";

const ZONE_SHRINK_DURATION = 180; // 3 minutes
const ZONE_START_RADIUS = 200;
const ZONE_END_RADIUS = 30;

export function SafeZone() {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef<number | null>(null);

  const { gameState, zoneRadius, setZoneRadius } = useGameStore();

  useFrame(() => {
    if (gameState !== "playing") {
      startTimeRef.current = null;
      return;
    }

    const now = performance.now() / 1000;

    if (startTimeRef.current === null) {
      startTimeRef.current = now;
    }

    const elapsed = now - startTimeRef.current;
    const t = Math.min(elapsed / ZONE_SHRINK_DURATION, 1);
    const newRadius = THREE.MathUtils.lerp(
      ZONE_START_RADIUS,
      ZONE_END_RADIUS,
      t,
    );

    if (Math.abs(newRadius - zoneRadius) > 0.1) {
      setZoneRadius(newRadius);
    }

    // Update mesh
    if (meshRef.current) {
      meshRef.current.scale.set(newRadius / 100, 1, newRadius / 100);
    }
  });

  return (
    <group>
      {/* Zone boundary ring on ground */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.15, 0]}
      >
        <ringGeometry args={[95, 100, 64]} />
        <meshBasicMaterial
          color="#3388ff"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Zone fill (very transparent) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <circleGeometry args={[100, 64]} />
        <meshBasicMaterial
          color="#1155dd"
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
