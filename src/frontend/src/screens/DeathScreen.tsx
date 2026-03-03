import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useGameStore } from "../game/useGameStore";
import { useActor } from "../hooks/useActor";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface DeathScreenProps {
  survivalTime: number;
  onLeaderboard: () => void;
}

export function DeathScreen({ survivalTime, onLeaderboard }: DeathScreenProps) {
  const { kills, playerName, startGame, setGameState } = useGameStore();
  const { actor } = useActor();
  const submittedRef = useRef(false);

  // Submit score once
  useEffect(() => {
    if (!actor || submittedRef.current) return;
    submittedRef.current = true;
    actor
      .submitScore(playerName, BigInt(kills), BigInt(Math.floor(survivalTime)))
      .catch(console.error);
  }, [actor, playerName, kills, survivalTime]);

  const handlePlayAgain = () => {
    submittedRef.current = false;
    startGame();
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden tac-grid"
      style={{ background: "oklch(0.05 0.008 200)" }}
    >
      {/* Blood vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, oklch(0.3 0.12 25 / 0.4) 100%)",
          zIndex: 1,
        }}
      />

      <motion.div
        className="relative flex flex-col items-center gap-8 px-8 text-center"
        style={{ zIndex: 10 }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
      >
        {/* Kill notification style */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: 9,
            letterSpacing: "0.3em",
            color: "oklch(0.55 0.22 25)",
            border: "1px solid oklch(0.55 0.22 25 / 0.4)",
            padding: "3px 16px",
          }}
        >
          ✕ OPERATOR DOWN
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="font-cabinet"
          style={{
            fontSize: "clamp(48px, 15vw, 96px)",
            fontWeight: 900,
            color: "oklch(0.55 0.22 25)",
            letterSpacing: "0.06em",
            textShadow: "0 0 40px oklch(0.55 0.22 25 / 0.5)",
            lineHeight: 1,
          }}
        >
          YOU DIED
        </motion.h1>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-6"
          style={{
            padding: "16px 32px",
            background: "oklch(0.08 0.015 200 / 0.8)",
            border: "1px solid oklch(0.22 0.025 200)",
            borderRadius: 2,
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <span
              style={{
                fontSize: 9,
                letterSpacing: "0.15em",
                color: "oklch(0.45 0.06 120)",
              }}
            >
              CALLSIGN
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "oklch(0.85 0.1 120)",
              }}
            >
              {playerName}
            </span>
          </div>

          <div style={{ width: 1, background: "oklch(0.22 0.025 200)" }} />

          <div className="flex flex-col items-center gap-1">
            <span
              style={{
                fontSize: 9,
                letterSpacing: "0.15em",
                color: "oklch(0.45 0.06 120)",
              }}
            >
              ELIMINATIONS
            </span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 800,
                lineHeight: 1,
                color: "oklch(0.92 0.02 120)",
              }}
            >
              {kills}
            </span>
          </div>

          <div style={{ width: 1, background: "oklch(0.22 0.025 200)" }} />

          <div className="flex flex-col items-center gap-1">
            <span
              style={{
                fontSize: 9,
                letterSpacing: "0.15em",
                color: "oklch(0.45 0.06 120)",
              }}
            >
              SURVIVED
            </span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 800,
                lineHeight: 1,
                color: "oklch(0.92 0.02 120)",
              }}
            >
              {formatTime(survivalTime)}
            </span>
          </div>
        </motion.div>

        {/* Score submitted */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            color: "oklch(0.55 0.1 120)",
          }}
        >
          ✓ SCORE SUBMITTED TO LEADERBOARD
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <button
            data-ocid="death.primary_button"
            onClick={handlePlayAgain}
            type="button"
            style={{
              padding: "14px 0",
              background: "oklch(0.65 0.15 120)",
              border: "none",
              color: "oklch(0.08 0.01 200)",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.25em",
              borderRadius: 2,
              cursor: "pointer",
              fontFamily: "Sora, sans-serif",
              boxShadow: "0 0 20px oklch(0.65 0.15 120 / 0.3)",
            }}
          >
            ↺ REDEPLOY
          </button>
          <button
            data-ocid="death.secondary_button"
            onClick={() => {
              setGameState("leaderboard");
              onLeaderboard();
            }}
            type="button"
            style={{
              padding: "12px 0",
              background: "transparent",
              border: "1px solid oklch(0.35 0.04 120 / 0.6)",
              color: "oklch(0.65 0.08 120)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.2em",
              borderRadius: 2,
              cursor: "pointer",
              fontFamily: "Sora, sans-serif",
            }}
          >
            ◈ LEADERBOARD
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
