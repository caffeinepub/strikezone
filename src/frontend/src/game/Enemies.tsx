import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { getHeight } from "./Terrain";
import { type Enemy, useGameStore } from "./useGameStore";

const CHASE_RANGE = 60;
const ATTACK_RANGE = 40;
const PATROL_SPEED = 2.5;
const CHASE_SPEED = 5;
const SHOOT_INTERVAL = 2.0;
const ENEMY_DAMAGE = 10;

interface EnemyMeshProps {
  enemy: Enemy;
}

function EnemyMesh({ enemy }: EnemyMeshProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    const dt = Math.min(delta, 0.05);
    const store = useGameStore.getState();
    if (store.gameState !== "playing") return;

    const playerPos = store.playerPosition;
    const myPos = enemy.position;
    const distToPlayer = myPos.distanceTo(playerPos);

    // State machine
    let newState = enemy.state;
    if (distToPlayer < ATTACK_RANGE) {
      newState = "attack";
    } else if (distToPlayer < CHASE_RANGE) {
      newState = "chase";
    } else {
      newState = "patrol";
    }

    if (newState !== enemy.state) {
      store.updateEnemyState(enemy.id, newState);
    }

    // Movement
    let targetPos: THREE.Vector3;
    let speed = 0;

    if (newState === "patrol") {
      targetPos = enemy.patrolTarget;
      speed = PATROL_SPEED;

      // If reached patrol target, pick new one
      const distToTarget = myPos.distanceTo(enemy.patrolTarget);
      if (distToTarget < 2) {
        const newTarget = new THREE.Vector3(
          myPos.x + (Math.random() - 0.5) * 40,
          1,
          myPos.z + (Math.random() - 0.5) * 40,
        );
        newTarget.x = THREE.MathUtils.clamp(newTarget.x, -220, 220);
        newTarget.z = THREE.MathUtils.clamp(newTarget.z, -220, 220);
        store.updateEnemyPatrolTarget(enemy.id, newTarget);
      }
    } else if (newState === "chase") {
      targetPos = playerPos.clone();
      speed = CHASE_SPEED;
    } else {
      // attack - stay in place and shoot
      targetPos = myPos.clone();
      speed = 0;

      // Shoot player
      const now = performance.now() / 1000;
      if (now - enemy.lastShootTime > SHOOT_INTERVAL) {
        store.updateEnemyLastShoot(enemy.id, now);
        store.damagePlayer(ENEMY_DAMAGE);
      }
    }

    // Move toward target
    if (speed > 0) {
      const dir = targetPos.clone().sub(myPos);
      dir.y = 0;
      const dist = dir.length();
      if (dist > 0.5) {
        dir.normalize();
        const newX = myPos.x + dir.x * speed * dt;
        const newZ = myPos.z + dir.z * speed * dt;
        const clampedX = THREE.MathUtils.clamp(newX, -220, 220);
        const clampedZ = THREE.MathUtils.clamp(newZ, -220, 220);
        const groundY = getHeight(clampedX, clampedZ);
        const newPos = new THREE.Vector3(clampedX, groundY + 1, clampedZ);
        store.updateEnemyPosition(enemy.id, newPos);

        // Face movement direction
        if (meshRef.current) {
          meshRef.current.rotation.y = Math.atan2(dir.x, dir.z);
        }
      }
    } else if (newState === "attack" && meshRef.current) {
      // Face player when attacking
      const dir = playerPos.clone().sub(myPos);
      dir.y = 0;
      if (dir.length() > 0.1) {
        meshRef.current.rotation.y = Math.atan2(dir.x, dir.z);
      }
    }

    // Sync mesh position
    if (meshRef.current) {
      meshRef.current.position.lerp(
        new THREE.Vector3(enemy.position.x, enemy.position.y, enemy.position.z),
        12 * dt,
      );
    }
  });

  const hpRatio = enemy.hp / 60;
  const bodyColor =
    enemy.state === "attack"
      ? "#cc2222"
      : enemy.state === "chase"
        ? "#dd4422"
        : "#8a2222";

  return (
    <group
      ref={meshRef}
      position={[enemy.position.x, enemy.position.y, enemy.position.z]}
    >
      {/* Body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.35, 1, 8, 12]} />
        <meshLambertMaterial color={bodyColor} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.3, 10, 10]} />
        <meshLambertMaterial color="#cc6633" />
      </mesh>
      {/* HP bar billboard */}
      <group position={[0, 2, 0]}>
        {/* bg */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1, 0.12]} />
          <meshBasicMaterial color="#330000" transparent opacity={0.8} />
        </mesh>
        {/* fill */}
        <mesh position={[(hpRatio - 1) * 0.5, 0, 0.01]} scale={[hpRatio, 1, 1]}>
          <planeGeometry args={[1, 0.12]} />
          <meshBasicMaterial color="#cc3333" />
        </mesh>
      </group>
    </group>
  );
}

export function Enemies() {
  const enemies = useGameStore((s) => s.enemies);

  return (
    <>
      {enemies.map((enemy) => (
        <EnemyMesh key={enemy.id} enemy={enemy} />
      ))}
    </>
  );
}
