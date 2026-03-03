import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useGameStore } from "../game/useGameStore";

interface StartScreenProps {
  onLeaderboard: () => void;
}

export function StartScreen({ onLeaderboard }: StartScreenProps) {
  const { playerName, setPlayerName, startGame } = useGameStore();
  const [inputVal, setInputVal] = useState(playerName || "");
  const [scanLine, setScanLine] = useState(0);

  // Animated scan line effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine((v) => (v + 1) % 100);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handlePlay = () => {
    const name = inputVal.trim() || "Ghost";
    setPlayerName(name);
    startGame();
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden scanlines tac-grid"
      style={{ background: "oklch(0.06 0.012 200)" }}
    >
      {/* Animated scan line */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: `${scanLine}%`,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, oklch(0.65 0.15 120 / 0.15), transparent)",
          zIndex: 2,
        }}
      />

      {/* Background atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.15 0.03 120 / 0.4) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 20% 80%, oklch(0.12 0.03 200 / 0.3) 0%, transparent 60%)
          `,
          zIndex: 1,
        }}
      />

      {/* Corner decorations */}
      <div
        className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
        style={{ zIndex: 3 }}
      >
        <div
          style={{
            width: 60,
            height: 2,
            background: "oklch(0.65 0.15 120 / 0.6)",
            position: "absolute",
            top: 20,
            left: 20,
          }}
        />
        <div
          style={{
            width: 2,
            height: 60,
            background: "oklch(0.65 0.15 120 / 0.6)",
            position: "absolute",
            top: 20,
            left: 20,
          }}
        />
      </div>
      <div
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{ zIndex: 3 }}
      >
        <div
          style={{
            width: 60,
            height: 2,
            background: "oklch(0.65 0.15 120 / 0.6)",
            position: "absolute",
            top: 20,
            right: 20,
          }}
        />
        <div
          style={{
            width: 2,
            height: 60,
            background: "oklch(0.65 0.15 120 / 0.6)",
            position: "absolute",
            top: 20,
            right: 20,
          }}
        />
      </div>
      <div
        className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none"
        style={{ zIndex: 3 }}
      >
        <div
          style={{
            width: 60,
            height: 2,
            background: "oklch(0.65 0.15 120 / 0.6)",
            position: "absolute",
            bottom: 20,
            left: 20,
          }}
        />
        <div
          style={{
            width: 2,
            height: 60,
            background: "oklch(0.65 0.15 120 / 0.6)",
            position: "absolute",
            bottom: 20,
            left: 20,
          }}
        />
      </div>
      <div
        className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none"
        style={{ zIndex: 3 }}
      >
        <div
          style={{
            width: 60,
            height: 2,
            background: "oklch(0.65 0.15 120 / 0.6)",
            position: "absolute",
            bottom: 20,
            right: 20,
          }}
        />
        <div
          style={{
            width: 2,
            height: 60,
            background: "oklch(0.65 0.15 120 / 0.6)",
            position: "absolute",
            bottom: 20,
            right: 20,
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative flex flex-col items-center gap-6 px-8"
        style={{ zIndex: 10 }}
      >
        {/* Mission classification badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: 9,
            letterSpacing: "0.25em",
            color: "oklch(0.55 0.22 25)",
            border: "1px solid oklch(0.55 0.22 25 / 0.4)",
            padding: "3px 12px",
            borderRadius: 1,
          }}
        >
          ◆ CLASSIFIED · OPERATION STRIKEZONEÂ
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          className="text-center"
        >
          <h1
            className="glitch-title font-cabinet"
            style={{
              fontSize: "clamp(52px, 14vw, 96px)",
              fontWeight: 900,
              letterSpacing: "0.08em",
              lineHeight: 1,
              color: "oklch(0.92 0.02 120)",
              textShadow: `
                0 0 40px oklch(0.65 0.15 120 / 0.4),
                0 0 80px oklch(0.65 0.15 120 / 0.2),
                2px 2px 0 oklch(0.25 0.05 120)
              `,
            }}
          >
            STRIKE
            <span style={{ color: "oklch(0.65 0.15 120)" }}>ZONE</span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              fontSize: 13,
              letterSpacing: "0.3em",
              color: "oklch(0.55 0.08 120)",
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            LAST ONE STANDING WINS
          </motion.p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.9 }}
          className="flex items-center gap-6"
          style={{
            borderTop: "1px solid oklch(0.22 0.025 200)",
            borderBottom: "1px solid oklch(0.22 0.025 200)",
            padding: "8px 16px",
          }}
        >
          {[
            { label: "PLAYERS", value: "100" },
            { label: "MAP", value: "500×500" },
            { label: "ZONE", value: "3 MIN" },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  color: "oklch(0.45 0.06 120)",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "oklch(0.75 0.12 120)",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Name input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col gap-2 w-full max-w-xs"
        >
          <label
            htmlFor="callsign-input"
            style={{
              fontSize: 9,
              letterSpacing: "0.2em",
              color: "oklch(0.55 0.08 120)",
              fontWeight: 600,
            }}
          >
            OPERATOR CALLSIGN
          </label>
          <input
            id="callsign-input"
            data-ocid="start.name_input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePlay();
            }}
            maxLength={20}
            placeholder="Enter callsign..."
            style={{
              background: "oklch(0.1 0.015 200)",
              border: "1px solid oklch(0.3 0.04 120 / 0.6)",
              color: "oklch(0.92 0.02 120)",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.08em",
              padding: "10px 14px",
              borderRadius: 2,
              outline: "none",
              fontFamily: "Sora, sans-serif",
              width: "100%",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "oklch(0.65 0.15 120 / 0.8)";
              e.target.style.boxShadow =
                "0 0 0 2px oklch(0.65 0.15 120 / 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "oklch(0.3 0.04 120 / 0.6)";
              e.target.style.boxShadow = "none";
            }}
          />
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <button
            data-ocid="start.primary_button"
            onClick={handlePlay}
            type="button"
            style={{
              width: "100%",
              padding: "14px 0",
              background: "oklch(0.65 0.15 120)",
              border: "none",
              color: "oklch(0.08 0.01 200)",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.25em",
              borderRadius: 2,
              cursor: "pointer",
              fontFamily: "Sora, sans-serif",
              boxShadow:
                "0 0 20px oklch(0.65 0.15 120 / 0.35), inset 0 1px 0 oklch(0.8 0.1 120 / 0.3)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background =
                "oklch(0.72 0.16 120)";
              (e.target as HTMLButtonElement).style.boxShadow =
                "0 0 30px oklch(0.65 0.15 120 / 0.5)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background =
                "oklch(0.65 0.15 120)";
              (e.target as HTMLButtonElement).style.boxShadow =
                "0 0 20px oklch(0.65 0.15 120 / 0.35)";
            }}
          >
            ▶ DEPLOY
          </button>
          <button
            data-ocid="start.secondary_button"
            onClick={onLeaderboard}
            type="button"
            style={{
              width: "100%",
              padding: "12px 0",
              background: "transparent",
              border: "1px solid oklch(0.35 0.04 120 / 0.6)",
              color: "oklch(0.65 0.08 120)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.2em",
              borderRadius: 2,
              cursor: "pointer",
              fontFamily: "Sora, sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.borderColor =
                "oklch(0.65 0.15 120 / 0.8)";
              (e.target as HTMLButtonElement).style.color =
                "oklch(0.85 0.12 120)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.borderColor =
                "oklch(0.35 0.04 120 / 0.6)";
              (e.target as HTMLButtonElement).style.color =
                "oklch(0.65 0.08 120)";
            }}
          >
            ◈ LEADERBOARD
          </button>
        </motion.div>

        {/* Version */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          style={{
            fontSize: 9,
            letterSpacing: "0.15em",
            color: "oklch(0.35 0.03 120)",
          }}
        >
          v1.0.0 · BATTLE ROYALE · 15 ENEMY BOTS
        </motion.div>
      </div>

      {/* Bottom attribution */}
      <div
        className="absolute bottom-4 left-0 right-0 text-center"
        style={{
          fontSize: 9,
          color: "oklch(0.3 0.02 200)",
          letterSpacing: "0.1em",
          zIndex: 10,
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
