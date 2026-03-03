import { useRef } from "react";
import { Game } from "./Game";
import { useGameStore } from "./game/useGameStore";
import { DeathScreen } from "./screens/DeathScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { StartScreen } from "./screens/StartScreen";

export default function App() {
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);
  const survivalTimeRef = useRef(0);

  return (
    <div className="fixed inset-0 overflow-hidden font-sora">
      {/* Start screen */}
      {gameState === "start" && (
        <StartScreen onLeaderboard={() => setGameState("leaderboard")} />
      )}

      {/* Game */}
      {gameState === "playing" && <Game survivalTimeRef={survivalTimeRef} />}

      {/* Death screen */}
      {gameState === "dead" && (
        <DeathScreen
          survivalTime={survivalTimeRef.current}
          onLeaderboard={() => setGameState("leaderboard")}
        />
      )}

      {/* Leaderboard */}
      {gameState === "leaderboard" && (
        <LeaderboardScreen onBack={() => setGameState("start")} />
      )}
    </div>
  );
}
