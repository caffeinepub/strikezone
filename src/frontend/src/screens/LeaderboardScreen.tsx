import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import type { ScoreEntry } from "../backend.d";
import { useActor } from "../hooks/useActor";

function formatTime(seconds: bigint): string {
  const s = Number(seconds);
  const m = Math.floor(s / 60);
  const rem = Math.floor(s % 60);
  return `${m.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
}

function formatDate(timestamp: bigint): string {
  // timestamp is in nanoseconds (ICP standard)
  const ms = Number(timestamp / BigInt(1_000_000));
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface LeaderboardScreenProps {
  onBack: () => void;
}

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const { actor, isFetching } = useActor();

  const { data: scores, isLoading } = useQuery<ScoreEntry[]>({
    queryKey: ["top-scores"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopScores();
    },
    enabled: !!actor && !isFetching,
  });

  const topScores = scores?.slice(0, 20) ?? [];

  const rankColors: Record<number, string> = {
    0: "oklch(0.75 0.18 85)",
    1: "oklch(0.75 0.05 200)",
    2: "oklch(0.65 0.12 60)",
  };

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden tac-grid"
      style={{ background: "oklch(0.06 0.012 200)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{
          borderBottom: "1px solid oklch(0.22 0.025 200)",
          background: "oklch(0.08 0.015 200 / 0.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <button
          data-ocid="leaderboard.back_button"
          onClick={onBack}
          type="button"
          style={{
            background: "transparent",
            border: "1px solid oklch(0.3 0.04 120 / 0.5)",
            color: "oklch(0.65 0.08 120)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.2em",
            padding: "6px 16px",
            borderRadius: 2,
            cursor: "pointer",
            fontFamily: "Sora, sans-serif",
          }}
        >
          ← BACK
        </button>

        <div className="text-center">
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.25em",
              color: "oklch(0.55 0.22 25)",
              marginBottom: 2,
            }}
          >
            ◆ GLOBAL RANKINGS
          </div>
          <div
            className="font-cabinet"
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "oklch(0.92 0.02 120)",
            }}
          >
            LEADERBOARD
          </div>
        </div>

        <div style={{ width: 80 }} />
      </div>

      {/* Column headers */}
      <div
        className="flex items-center px-6 py-2"
        style={{
          fontSize: 9,
          letterSpacing: "0.15em",
          color: "oklch(0.4 0.05 120)",
          borderBottom: "1px solid oklch(0.18 0.02 200)",
          fontWeight: 600,
        }}
      >
        <span style={{ width: 48 }}>RANK</span>
        <span style={{ flex: 1 }}>OPERATOR</span>
        <span style={{ width: 80, textAlign: "center" }}>KILLS</span>
        <span style={{ width: 80, textAlign: "center" }}>SURVIVED</span>
        <span style={{ width: 60, textAlign: "right" }}>DATE</span>
      </div>

      {/* Scores list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div
            data-ocid="leaderboard.loading_state"
            className="flex items-center justify-center h-40 gap-3"
          >
            <div
              className="rounded-full"
              style={{
                width: 8,
                height: 8,
                background: "oklch(0.65 0.15 120)",
                animation: "pulse-red 0.8s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.15em",
                color: "oklch(0.5 0.06 120)",
              }}
            >
              RETRIEVING DATA...
            </span>
          </div>
        )}

        {!isLoading && topScores.length === 0 && (
          <div className="flex items-center justify-center h-40">
            <span
              style={{
                fontSize: 12,
                letterSpacing: "0.12em",
                color: "oklch(0.35 0.03 120)",
              }}
            >
              NO RECORDS YET — BE THE FIRST
            </span>
          </div>
        )}

        {topScores.map((entry, i) => {
          const ocidIndex = i + 1;
          const rankColor = rankColors[i] ?? "oklch(0.92 0.02 120)";
          const isTop3 = i < 3;

          return (
            <motion.div
              key={`${entry.playerName}-${entry.timestamp}`}
              data-ocid={`leaderboard.item.${ocidIndex}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center px-6 py-3"
              style={{
                borderBottom: "1px solid oklch(0.14 0.018 200)",
                background: isTop3
                  ? `oklch(0.11 0.02 120 / ${0.15 - i * 0.04})`
                  : "transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background =
                  "oklch(0.12 0.02 120 / 0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = isTop3
                  ? `oklch(0.11 0.02 120 / ${0.15 - i * 0.04})`
                  : "transparent";
              }}
            >
              {/* Rank */}
              <span
                style={{
                  width: 48,
                  fontSize: isTop3 ? 16 : 13,
                  fontWeight: 800,
                  color: rankColor,
                  letterSpacing: "0.05em",
                }}
              >
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </span>

              {/* Name */}
              <span
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: isTop3 ? 700 : 500,
                  color: isTop3
                    ? "oklch(0.92 0.02 120)"
                    : "oklch(0.72 0.04 120)",
                  letterSpacing: "0.04em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.playerName}
              </span>

              {/* Kills */}
              <span
                style={{
                  width: 80,
                  textAlign: "center",
                  fontSize: 15,
                  fontWeight: 700,
                  color:
                    Number(entry.kills) > 0
                      ? "oklch(0.65 0.15 120)"
                      : "oklch(0.45 0.03 120)",
                }}
              >
                {entry.kills.toString()}
              </span>

              {/* Survival time */}
              <span
                style={{
                  width: 80,
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "oklch(0.65 0.08 200)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatTime(entry.survivalTime)}
              </span>

              {/* Date */}
              <span
                style={{
                  width: 60,
                  textAlign: "right",
                  fontSize: 10,
                  color: "oklch(0.4 0.03 120)",
                }}
              >
                {formatDate(entry.timestamp)}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="py-3 text-center"
        style={{
          borderTop: "1px solid oklch(0.18 0.02 200)",
          fontSize: 9,
          color: "oklch(0.3 0.02 200)",
          letterSpacing: "0.1em",
        }}
      >
        © {new Date().getFullYear()} · Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "oklch(0.5 0.08 120)", textDecoration: "none" }}
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
