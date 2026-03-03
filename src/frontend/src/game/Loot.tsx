import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { type LootItem, useGameStore } from "./useGameStore";

interface LootMeshProps {
  item: LootItem;
}

function LootMesh({ item }: LootMeshProps) {
  const ref = useRef<THREE.Mesh>(null);
  const timeRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_state, delta) => {
    if (!ref.current || item.collected) return;
    timeRef.current += delta * 1.5;
    ref.current.position.y = item.position.y + Math.sin(timeRef.current) * 0.2;
    ref.current.rotation.y += delta * 1.5;
  });

  if (item.collected) return null;

  const color = item.type === "medkit" ? "#22cc44" : "#ffcc00";
  const emissive = item.type === "medkit" ? "#006622" : "#664400";

  return (
    <mesh
      ref={ref}
      position={[item.position.x, item.position.y, item.position.z]}
      castShadow
    >
      <boxGeometry args={[0.7, 0.7, 0.7]} />
      <meshLambertMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.3}
      />
      {/* Cross symbol for medkit */}
      {item.type === "medkit" && (
        <>
          <mesh position={[0, 0, 0.36]}>
            <planeGeometry args={[0.5, 0.15]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.36]}>
            <planeGeometry args={[0.15, 0.5]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </>
      )}
    </mesh>
  );
}

// Point light for loot glow
function LootGlow({ item }: LootMeshProps) {
  if (item.collected) return null;
  const color = item.type === "medkit" ? "#22cc44" : "#ffcc00";

  return (
    <pointLight
      position={[item.position.x, item.position.y + 1, item.position.z]}
      color={color}
      intensity={1.5}
      distance={6}
    />
  );
}

export function Loot() {
  const lootItems = useGameStore((s) => s.lootItems);

  return (
    <>
      {lootItems.map((item) => (
        <group key={item.id}>
          <LootMesh item={item} />
          <LootGlow item={item} />
        </group>
      ))}
    </>
  );
}
