import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useRef } from "react";
import { BulletTrails } from "./game/BulletTrails";
import { Enemies } from "./game/Enemies";
import { HUD } from "./game/HUD";
import { Loot } from "./game/Loot";
import { Player } from "./game/Player";
import { SafeZone } from "./game/SafeZone";
import { Terrain } from "./game/Terrain";
import { VirtualControls } from "./game/VirtualControls";
import { useGameStore } from "./game/useGameStore";

// Zone damage accumulator
const ZONE_DAMAGE_INTERVAL = 1.0; // damage per second

function GameScene({
  joystickRef,
  aimJoystickRef,
  fireRef,
  onFire,
}: {
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  aimJoystickRef: React.MutableRefObject<{ x: number; y: number }>;
  fireRef: React.MutableRefObject<boolean>;
  onFire: () => void;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} color="#8a9a6a" />
      <directionalLight
        position={[80, 120, 60]}
        intensity={1.2}
        color="#e8d8a0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={300}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />
      <hemisphereLight args={["#4a6a30", "#1a2010", 0.5]} />

      {/* Fog */}
      <fog attach="fog" args={["#1a2010", 80, 300]} />

      {/* Terrain & environment */}
      <Terrain />

      {/* Safe zone */}
      <SafeZone />

      {/* Loot */}
      <Loot />

      {/* Enemies */}
      <Enemies />

      {/* Bullet trails */}
      <BulletTrails />

      {/* Player */}
      <Player
        joystickRef={joystickRef}
        aimJoystickRef={aimJoystickRef}
        onFire={onFire}
        fireRef={fireRef}
      />
    </>
  );
}

interface GameProps {
  survivalTimeRef: React.MutableRefObject<number>;
}

export function Game({ survivalTimeRef }: GameProps) {
  const joystickRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const aimJoystickRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const fireRef = useRef(false);
  const zoneDamageAccRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const survivalTimerRef = useRef(0);

  const { gameState, playerHP } = useGameStore();

  const onFire = useCallback(() => {
    // Handled in Player.tsx via fireRef edge detection
    fireRef.current = true;
    setTimeout(() => {
      fireRef.current = false;
    }, 80);
  }, []);

  // Game loop for zone damage + survival time
  useEffect(() => {
    if (gameState !== "playing") {
      lastTimeRef.current = null;
      return;
    }

    const loop = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      // Survival time
      survivalTimerRef.current += dt;
      survivalTimeRef.current = survivalTimerRef.current;
      useGameStore
        .getState()
        .setSurvivalTime(Math.floor(survivalTimerRef.current));

      // Zone damage
      const store = useGameStore.getState();
      if (!store.playerInZone) {
        zoneDamageAccRef.current += dt;
        if (zoneDamageAccRef.current >= ZONE_DAMAGE_INTERVAL) {
          store.damagePlayer(2);
          zoneDamageAccRef.current -= ZONE_DAMAGE_INTERVAL;
        }
      } else {
        zoneDamageAccRef.current = 0;
      }

      if (store.gameState === "playing") {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    survivalTimerRef.current = 0;
    lastTimeRef.current = null;
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [gameState, survivalTimeRef]);

  // Stop when player dies
  useEffect(() => {
    if (playerHP <= 0 && rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
  }, [playerHP]);

  return (
    <div className="game-canvas-wrapper">
      <Canvas
        shadows
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
        camera={{
          fov: 60,
          near: 0.1,
          far: 500,
          position: [0, 6, 10],
        }}
        style={{ background: "#1a2010" }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <GameScene
            joystickRef={joystickRef}
            aimJoystickRef={aimJoystickRef}
            fireRef={fireRef}
            onFire={onFire}
          />
        </Suspense>
      </Canvas>

      {/* HUD overlay */}
      <HUD survivalTime={Math.floor(survivalTimerRef.current)} />

      {/* Virtual controls */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 20 }}>
        <VirtualControls
          joystickRef={joystickRef}
          aimJoystickRef={aimJoystickRef}
          fireRef={fireRef}
        />
      </div>
    </div>
  );
}
