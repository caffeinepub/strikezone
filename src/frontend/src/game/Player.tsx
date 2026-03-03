import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { getHeight } from "./Terrain";
import { useGameStore } from "./useGameStore";

interface PlayerProps {
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  aimJoystickRef: React.MutableRefObject<{ x: number; y: number }>;
  onFire: () => void;
  fireRef: React.MutableRefObject<boolean>;
}

export function Player({
  joystickRef,
  aimJoystickRef,
  onFire,
  fireRef,
}: PlayerProps) {
  const meshRef = useRef<THREE.Group>(null);
  const cameraTargetRef = useRef(new THREE.Vector3(0, 6, -10));
  const rotationRef = useRef(0);
  const speedRef = useRef(0);
  const keysRef = useRef({
    w: false,
    s: false,
    a: false,
    d: false,
    shift: false,
    space: false,
  });
  const lastFireRef = useRef(false);

  const { camera } = useThree();

  const {
    gameState,
    setPlayerPosition,
    setPlayerRotation,
    enemies,
    lootItems,
    collectLoot,
    healPlayer,
    upgradeWeapon,
    triggerMuzzleFlash,
    addBulletTrail,
    shotDamage,
    damageEnemy,
  } = useGameStore();

  // Keyboard input
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") keysRef.current.w = true;
      if (k === "s" || k === "arrowdown") keysRef.current.s = true;
      if (k === "a" || k === "arrowleft") keysRef.current.a = true;
      if (k === "d" || k === "arrowright") keysRef.current.d = true;
      if (k === "shift") keysRef.current.shift = true;
      if (k === " " || k === "f") onFire();
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") keysRef.current.w = false;
      if (k === "s" || k === "arrowdown") keysRef.current.s = false;
      if (k === "a" || k === "arrowleft") keysRef.current.a = false;
      if (k === "d" || k === "arrowright") keysRef.current.d = false;
      if (k === "shift") keysRef.current.shift = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [onFire]);

  // Set initial position
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(0, 1, 0);
    }
  }, []);

  const shoot = useCallback(() => {
    if (!meshRef.current) return;

    triggerMuzzleFlash();

    // Raycast forward from player
    const dir = new THREE.Vector3(
      -Math.sin(rotationRef.current),
      0,
      -Math.cos(rotationRef.current),
    ).normalize();

    const from = meshRef.current.position.clone();
    from.y = 1.5;

    let hitPoint: THREE.Vector3 | null = null;
    let hitEnemyId: string | null = null;
    let minDist = 80;

    for (const enemy of enemies) {
      const toEnemy = enemy.position.clone().sub(from);
      const dist = toEnemy.length();
      if (dist > 80) continue;

      // Simple sphere check
      const dot = toEnemy.normalize().dot(dir);
      if (dot > 0.94 && dist < minDist) {
        minDist = dist;
        hitEnemyId = enemy.id;
        hitPoint = enemy.position.clone();
      }
    }

    const trailEnd = hitPoint ?? from.clone().addScaledVector(dir, 60);
    addBulletTrail(from, trailEnd);

    if (hitEnemyId) {
      damageEnemy(hitEnemyId, shotDamage);
    }
  }, [enemies, triggerMuzzleFlash, addBulletTrail, damageEnemy, shotDamage]);

  useFrame((_state, delta) => {
    if (gameState !== "playing" || !meshRef.current) return;

    const dt = Math.min(delta, 0.05);

    // Fire button (edge detect)
    const firePressing = fireRef.current;
    if (firePressing && !lastFireRef.current) {
      shoot();
    }
    lastFireRef.current = firePressing;

    // Movement
    const jx = joystickRef.current.x;
    const jy = joystickRef.current.y;
    const kw = keysRef.current.w;
    const ks = keysRef.current.s;
    const ka = keysRef.current.a;
    const kd = keysRef.current.d;
    const sprinting =
      keysRef.current.shift || Math.abs(jx) > 0.8 || Math.abs(jy) > 0.8;

    // Determine move direction
    let moveX = jx;
    let moveZ = -jy;
    if (kw) moveZ = -1;
    if (ks) moveZ = 1;
    if (ka) moveX = -1;
    if (kd) moveX = 1;

    const moveMag = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (moveMag > 1) {
      moveX /= moveMag;
      moveZ /= moveMag;
    }

    // Aim joystick rotates camera/player
    const aimX = aimJoystickRef.current.x;
    if (Math.abs(aimX) > 0.1) {
      rotationRef.current -= aimX * dt * 2.5;
    }

    // When moving, rotate to face movement direction (blended with camera forward)
    if (moveMag > 0.1) {
      const moveAngle = Math.atan2(moveX, moveZ);
      const worldAngle = rotationRef.current + moveAngle;
      // Rotate player to face world movement direction
      meshRef.current.rotation.y = worldAngle;
    }

    const baseSpeed = sprinting ? 10 : 6;
    speedRef.current = THREE.MathUtils.lerp(
      speedRef.current,
      moveMag * baseSpeed,
      8 * dt,
    );

    // Apply movement in world space (relative to camera rotation)
    const worldMoveX =
      Math.cos(rotationRef.current) * moveX +
      Math.sin(rotationRef.current) * moveZ;
    const worldMoveZ =
      -Math.sin(rotationRef.current) * moveX +
      Math.cos(rotationRef.current) * moveZ;

    const newX =
      meshRef.current.position.x + worldMoveX * speedRef.current * dt;
    const newZ =
      meshRef.current.position.z + worldMoveZ * speedRef.current * dt;

    // Clamp to map
    const clampedX = THREE.MathUtils.clamp(newX, -240, 240);
    const clampedZ = THREE.MathUtils.clamp(newZ, -240, 240);

    const groundY = getHeight(clampedX, clampedZ);
    meshRef.current.position.set(clampedX, groundY + 1, clampedZ);

    // Update store
    setPlayerPosition(meshRef.current.position.clone());
    setPlayerRotation(rotationRef.current);

    // Third-person camera
    const camOffset = new THREE.Vector3(
      Math.sin(rotationRef.current) * 10,
      6,
      Math.cos(rotationRef.current) * 10,
    );
    const desiredCamPos = meshRef.current.position.clone().add(camOffset);
    camera.position.lerp(desiredCamPos, 8 * dt);

    const lookTarget = meshRef.current.position.clone();
    lookTarget.y += 1;
    cameraTargetRef.current.lerp(lookTarget, 10 * dt);
    camera.lookAt(cameraTargetRef.current);

    // Loot pickup
    for (const loot of lootItems) {
      if (loot.collected) continue;
      const dist = meshRef.current.position.distanceTo(loot.position);
      if (dist < 3) {
        collectLoot(loot.id);
        if (loot.type === "medkit") {
          healPlayer(30);
        } else {
          upgradeWeapon();
        }
      }
    }

    // Zone check
    const {
      zoneRadius,
      zoneCenterX,
      zoneCenterZ,
      setPlayerInZone,
      setShowZoneWarning,
    } = useGameStore.getState();
    const distToCenter = Math.sqrt(
      (meshRef.current.position.x - zoneCenterX) ** 2 +
        (meshRef.current.position.z - zoneCenterZ) ** 2,
    );
    const inZone = distToCenter <= zoneRadius;
    setPlayerInZone(inZone);
    setShowZoneWarning(!inZone);

    // Zone damage handled in Game.tsx to avoid per-frame multiplication
  }, 1);

  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[0.35, 1, 8, 12]} />
        <meshLambertMaterial color="#4a6030" />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshLambertMaterial color="#c8a878" />
      </mesh>
      {/* Helmet */}
      <mesh castShadow position={[0, 1.22, 0]}>
        <sphereGeometry
          args={[0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.8]}
        />
        <meshLambertMaterial color="#3a4820" />
      </mesh>
      {/* Gun */}
      <mesh castShadow position={[0.45, 0.3, -0.6]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.12, 0.1, 0.7]} />
        <meshLambertMaterial color="#2a2a2a" />
      </mesh>
    </group>
  );
}
