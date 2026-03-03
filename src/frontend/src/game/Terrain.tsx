import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const GROUND_SIZE = 500;
const GRID = 60;

function getHeight(x: number, z: number): number {
  return (
    Math.sin(x * 0.08) * Math.cos(z * 0.08) * 3 +
    Math.sin(x * 0.03 + 1.2) * Math.sin(z * 0.03) * 5 +
    Math.cos(x * 0.15) * Math.sin(z * 0.12) * 1.5
  );
}

// ─── Ground ────────────────────────────────────────────────────────────────
function Ground() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, GRID, GRID);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i); // plane is in XY before rotation
      pos.setZ(i, getHeight(x, z));
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geometry} receiveShadow>
      <meshLambertMaterial color="#3d4a2a" />
    </mesh>
  );
}

// ─── Trees (instanced) ────────────────────────────────────────────────────
function Trees() {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const topRef = useRef<THREE.InstancedMesh>(null);
  const COUNT = 30;

  const transforms = useMemo(() => {
    const data: { x: number; z: number; h: number; scale: number }[] = [];
    for (let i = 0; i < COUNT; i++) {
      const angle = (i / COUNT) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 15 + Math.random() * 180;
      const x = Math.cos(angle) * dist + (Math.random() - 0.5) * 20;
      const z = Math.sin(angle) * dist + (Math.random() - 0.5) * 20;
      const h = getHeight(x, z);
      const scale = 0.8 + Math.random() * 0.6;
      data.push({ x, z, h, scale });
    }
    return data;
  }, []);

  useMemo(() => {
    const dummy = new THREE.Object3D();
    transforms.forEach((t, i) => {
      dummy.position.set(t.x, t.h + 1.5 * t.scale, t.z);
      dummy.scale.set(t.scale, t.scale, t.scale);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(t.x, t.h + 4.5 * t.scale, t.z);
      dummy.updateMatrix();
      topRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (topRef.current) topRef.current.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  // Apply matrix after mount
  useFrame(() => {
    if (trunkRef.current && topRef.current) {
      const dummy = new THREE.Object3D();
      transforms.forEach((t, i) => {
        dummy.position.set(t.x, t.h + 1.5 * t.scale, t.z);
        dummy.scale.set(t.scale, t.scale, t.scale);
        dummy.updateMatrix();
        trunkRef.current!.setMatrixAt(i, dummy.matrix);
        dummy.position.set(t.x, t.h + 4.5 * t.scale, t.z);
        dummy.scale.set(t.scale * 2.5, t.scale * 2.5, t.scale * 2.5);
        dummy.updateMatrix();
        topRef.current!.setMatrixAt(i, dummy.matrix);
      });
      trunkRef.current.instanceMatrix.needsUpdate = true;
      topRef.current.instanceMatrix.needsUpdate = true;
    }
  }, -1); // run once

  return (
    <>
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, COUNT]}
        castShadow
      >
        <cylinderGeometry args={[0.3, 0.4, 3, 6]} />
        <meshLambertMaterial color="#5c3d1e" />
      </instancedMesh>
      <instancedMesh
        ref={topRef}
        args={[undefined, undefined, COUNT]}
        castShadow
      >
        <coneGeometry args={[1, 3.5, 7]} />
        <meshLambertMaterial color="#2d5a1b" />
      </instancedMesh>
    </>
  );
}

// ─── Buildings ────────────────────────────────────────────────────────────
function Buildings() {
  const buildings = useMemo(() => {
    const data: {
      x: number;
      z: number;
      h: number;
      w: number;
      d: number;
      bh: number;
    }[] = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + 0.2;
      const dist = 25 + Math.random() * 100;
      const x = Math.cos(angle) * dist + (Math.random() - 0.5) * 15;
      const z = Math.sin(angle) * dist + (Math.random() - 0.5) * 15;
      const h = getHeight(x, z);
      const w = 4 + Math.random() * 6;
      const d = 4 + Math.random() * 6;
      const bh = 3 + Math.random() * 6;
      data.push({ x, z, h, w, d, bh });
    }
    return data;
  }, []);

  return (
    <>
      {buildings.map((b, i) => (
        <mesh
          // biome-ignore lint/suspicious/noArrayIndexKey: static procedural buildings
          key={i}
          position={[b.x, b.h + b.bh / 2, b.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[b.w, b.bh, b.d]} />
          <meshLambertMaterial
            color={
              i % 3 === 0 ? "#4a4a3a" : i % 3 === 1 ? "#5a4a38" : "#3a3a2a"
            }
          />
        </mesh>
      ))}
    </>
  );
}

// ─── Rocks (instanced) ────────────────────────────────────────────────────
function Rocks() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const COUNT = 25;

  const transforms = useMemo(() => {
    const data: {
      x: number;
      z: number;
      h: number;
      s: number;
      rx: number;
      ry: number;
    }[] = [];
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 170;
      const x = Math.cos(angle) * dist + (Math.random() - 0.5) * 10;
      const z = Math.sin(angle) * dist + (Math.random() - 0.5) * 10;
      const h = getHeight(x, z);
      const s = 0.5 + Math.random() * 1.5;
      data.push({
        x,
        z,
        h,
        s,
        rx: Math.random(),
        ry: Math.random() * Math.PI * 2,
      });
    }
    return data;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    transforms.forEach((t, i) => {
      dummy.position.set(t.x, t.h + t.s * 0.4, t.z);
      dummy.rotation.set(t.rx, t.ry, 0);
      dummy.scale.set(t.s, t.s * 0.7, t.s);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, -1);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} castShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshLambertMaterial color="#3a3a35" />
    </instancedMesh>
  );
}

// ─── Main Terrain Component ────────────────────────────────────────────────
export function Terrain() {
  return (
    <group>
      <Ground />
      <Trees />
      <Buildings />
      <Rocks />
    </group>
  );
}

export { getHeight };
