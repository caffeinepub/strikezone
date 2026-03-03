import { MiniMap } from "./MiniMap";
import { useGameStore } from "./useGameStore";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface HUDProps {
  survivalTime: number;
}

export function HUD({ survivalTime }: HUDProps) {
  const {
    playerHP,
    kills,
    enemies,
    zoneRadius,
    playerPosition,
    zoneCenterX,
    zoneCenterZ,
    showZoneWarning,
    weaponUpgraded,
    muzzleFlash,
    playerInZone,
  } = useGameStore();

  const hpPct = Math.max(0, playerHP);
  const isCritical = playerHP <= 25;

  const distToCenter = Math.sqrt(
    (playerPosition.x - zoneCenterX) ** 2 +
      (playerPosition.z - zoneCenterZ) ** 2,
  );
  const distToZoneEdge = Math.max(0, distToCenter - zoneRadius);
  const zoneShrinkPct = ((200 - zoneRadius) / (200 - 30)) * 100;

  return (
    <div className="hud-overlay font-sora">
      {/* Zone warning border */}
      {showZoneWarning && (
        <div
          data-ocid="game.zone_warning"
          className="zone-warning absolute inset-0 pointer-events-none"
          style={{ zIndex: 15 }}
        />
      )}

      {/* Muzzle flash overlay */}
      {muzzleFlash && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "oklch(0.98 0.1 85 / 0.08)",
            zIndex: 14,
          }}
        />
      )}

      {/* ── HP Bar (top-left) ────────────────────────── */}
      <div
        data-ocid="game.health_panel"
        className="absolute top-3 left-3 flex flex-col gap-1"
        style={{ minWidth: 160 }}
      >
        <div className="flex items-center gap-2 mb-0.5">
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "oklch(0.65 0.15 120)",
            }}
          >
            HEALTH
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: isCritical
                ? "oklch(0.65 0.25 25)"
                : "oklch(0.92 0.02 120)",
            }}
            className={isCritical ? "hp-critical" : ""}
          >
            {Math.ceil(playerHP)}/100
          </span>
        </div>
        <div
          className="relative overflow-hidden"
          style={{
            width: 160,
            height: 8,
            background: "oklch(0.15 0.02 200)",
            border: "1px solid oklch(0.25 0.03 200)",
            borderRadius: 2,
          }}
        >
          <div
            className="absolute inset-y-0 left-0 transition-all duration-150"
            style={{
              width: `${hpPct}%`,
              background:
                hpPct > 50
                  ? "oklch(0.55 0.22 142)"
                  : hpPct > 25
                    ? "oklch(0.7 0.18 85)"
                    : "oklch(0.55 0.22 25)",
              boxShadow:
                hpPct > 25 ? "none" : "0 0 8px oklch(0.55 0.22 25 / 0.6)",
            }}
          />
          {/* HP tick marks */}
          {[25, 50, 75].map((t) => (
            <div
              key={t}
              className="absolute inset-y-0"
              style={{
                left: `${t}%`,
                width: 1,
                background: "oklch(0.25 0.02 200)",
              }}
            />
          ))}
        </div>
        {/* Weapon status */}
        <div
          style={{
            fontSize: 9,
            color: weaponUpgraded
              ? "oklch(0.75 0.18 85)"
              : "oklch(0.55 0.03 120)",
            letterSpacing: "0.08em",
          }}
        >
          {weaponUpgraded ? "⚡ UPGRADED RIFLE" : "◆ ASSAULT RIFLE"} · ∞
        </div>
      </div>

      {/* ── Stats (top-right) ───────────────────────── */}
      <div
        data-ocid="game.stats_panel"
        className="absolute top-3 right-3 flex flex-col items-end gap-1"
      >
        <div
          className="flex items-center gap-3 px-2 py-1"
          style={{
            background: "oklch(0.08 0.015 200 / 0.8)",
            border: "1px solid oklch(0.22 0.025 200)",
            borderRadius: 2,
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="flex flex-col items-center">
            <span
              style={{
                fontSize: 9,
                color: "oklch(0.65 0.15 120)",
                letterSpacing: "0.1em",
              }}
            >
              KILLS
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "oklch(0.92 0.02 120)",
                lineHeight: 1,
              }}
            >
              {kills}
            </span>
          </div>
          <div
            style={{
              width: 1,
              height: 28,
              background: "oklch(0.22 0.025 200)",
            }}
          />
          <div className="flex flex-col items-center">
            <span
              style={{
                fontSize: 9,
                color: "oklch(0.65 0.15 120)",
                letterSpacing: "0.1em",
              }}
            >
              TIME
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "oklch(0.92 0.02 120)",
                lineHeight: 1,
              }}
            >
              {formatTime(survivalTime)}
            </span>
          </div>
          <div
            style={{
              width: 1,
              height: 28,
              background: "oklch(0.22 0.025 200)",
            }}
          />
          <div className="flex flex-col items-center">
            <span
              style={{
                fontSize: 9,
                color: "oklch(0.65 0.15 120)",
                letterSpacing: "0.1em",
              }}
            >
              ALIVE
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "oklch(0.92 0.02 120)",
                lineHeight: 1,
              }}
            >
              {enemies.length}
            </span>
          </div>
        </div>

        {/* Zone info */}
        <div
          className="flex items-center gap-1.5 px-2 py-0.5"
          style={{
            background: "oklch(0.08 0.015 200 / 0.75)",
            border: `1px solid ${playerInZone ? "oklch(0.35 0.12 240 / 0.5)" : "oklch(0.55 0.22 25 / 0.7)"}`,
            borderRadius: 2,
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: 6,
              height: 6,
              background: playerInZone
                ? "oklch(0.55 0.18 240)"
                : "oklch(0.55 0.22 25)",
              boxShadow: playerInZone
                ? "0 0 4px oklch(0.55 0.18 240)"
                : "0 0 4px oklch(0.55 0.22 25)",
            }}
          />
          <span
            style={{
              fontSize: 9,
              color: playerInZone
                ? "oklch(0.75 0.12 200)"
                : "oklch(0.75 0.18 25)",
              letterSpacing: "0.08em",
            }}
          >
            {playerInZone
              ? `ZONE ·${Math.round(zoneShrinkPct)}% CLOSED`
              : `OUT ${Math.round(distToZoneEdge)}m`}
          </span>
        </div>
      </div>

      {/* ── MiniMap ─────────────────────────────────── */}
      <div
        className="absolute top-3"
        style={{ left: "50%", transform: "translateX(-50%)" }}
      >
        <MiniMap />
      </div>

      {/* ── Out of zone warning text ─────────────────── */}
      {showZoneWarning && (
        <div className="absolute top-1/3 left-0 right-0 flex justify-center pointer-events-none">
          <div
            className="px-4 py-2"
            style={{
              background: "oklch(0.55 0.22 25 / 0.15)",
              border: "1px solid oklch(0.55 0.22 25 / 0.6)",
              color: "oklch(0.75 0.2 25)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              borderRadius: 2,
            }}
          >
            ⚠ OUTSIDE SAFE ZONE — -{Math.round(distToZoneEdge)}m
          </div>
        </div>
      )}
    </div>
  );
}
