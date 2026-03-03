import { useGameStore } from "./useGameStore";

const MAP_SIZE = 100;
const MAP_WORLD = 500;
const SCALE = MAP_SIZE / MAP_WORLD;

function worldToMap(x: number, z: number) {
  return {
    mx: MAP_SIZE / 2 + x * SCALE,
    mz: MAP_SIZE / 2 + z * SCALE,
  };
}

export function MiniMap() {
  const {
    playerPosition,
    enemies,
    zoneRadius,
    zoneCenterX,
    zoneCenterZ,
    lootItems,
  } = useGameStore();

  const { mx: px, mz: pz } = worldToMap(playerPosition.x, playerPosition.z);

  const zoneScreenRadius = zoneRadius * SCALE;
  const { mx: zcx, mz: zcz } = worldToMap(zoneCenterX, zoneCenterZ);

  return (
    <div
      data-ocid="game.minimap"
      className="relative overflow-hidden rounded"
      style={{
        width: MAP_SIZE,
        height: MAP_SIZE,
        background: "oklch(0.08 0.015 200 / 0.85)",
        border: "1px solid oklch(0.65 0.15 120 / 0.5)",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* Terrain hint */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle, oklch(0.25 0.05 120 / 0.3) 0%, transparent 70%)",
        }}
      />

      {/* Zone circle */}
      <div
        className="absolute rounded-full"
        style={{
          width: zoneScreenRadius * 2,
          height: zoneScreenRadius * 2,
          left: zcx - zoneScreenRadius,
          top: zcz - zoneScreenRadius,
          border: "1.5px solid oklch(0.55 0.18 240 / 0.8)",
          background: "oklch(0.35 0.12 240 / 0.1)",
          pointerEvents: "none",
        }}
      />

      {/* Loot items */}
      {lootItems
        .filter((l) => !l.collected)
        .map((l) => {
          const { mx: lx, mz: lz } = worldToMap(l.position.x, l.position.z);
          return (
            <div
              key={l.id}
              className="absolute rounded-full"
              style={{
                width: 4,
                height: 4,
                left: lx - 2,
                top: lz - 2,
                background: l.type === "medkit" ? "#22cc44" : "#ffcc00",
                pointerEvents: "none",
              }}
            />
          );
        })}

      {/* Enemies */}
      {enemies.map((e) => {
        const { mx: ex, mz: ez } = worldToMap(e.position.x, e.position.z);
        return (
          <div
            key={e.id}
            className="absolute rounded-full"
            style={{
              width: 4,
              height: 4,
              left: ex - 2,
              top: ez - 2,
              background: "#cc3333",
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Player dot */}
      <div
        className="absolute rounded-full"
        style={{
          width: 6,
          height: 6,
          left: px - 3,
          top: pz - 3,
          background: "#ffffff",
          boxShadow: "0 0 4px #fff",
          pointerEvents: "none",
        }}
      />

      {/* Label */}
      <div
        className="absolute bottom-0.5 left-0 right-0 text-center"
        style={{
          fontSize: 8,
          color: "oklch(0.65 0.15 120 / 0.7)",
          letterSpacing: "0.05em",
        }}
      >
        TACTICAL MAP
      </div>
    </div>
  );
}
