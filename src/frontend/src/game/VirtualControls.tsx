import { useCallback, useEffect, useRef } from "react";

interface VirtualControlsProps {
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
  aimJoystickRef: React.MutableRefObject<{ x: number; y: number }>;
  fireRef: React.MutableRefObject<boolean>;
}

interface JoystickState {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  pointerId: number;
}

export function VirtualControls({
  joystickRef,
  aimJoystickRef,
  fireRef,
}: VirtualControlsProps) {
  const moveJoyState = useRef<JoystickState>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    pointerId: -1,
  });
  const aimJoyState = useRef<JoystickState>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    pointerId: -1,
  });

  const moveJoyInnerRef = useRef<HTMLDivElement>(null);
  const aimJoyInnerRef = useRef<HTMLDivElement>(null);

  const MAX_RADIUS = 40;

  const updateJoystick = useCallback(
    (
      state: React.MutableRefObject<JoystickState>,
      outputRef: React.MutableRefObject<{ x: number; y: number }>,
      innerRef: React.MutableRefObject<HTMLDivElement | null>,
    ) => {
      if (!state.current.active) {
        outputRef.current = { x: 0, y: 0 };
        if (innerRef.current) {
          innerRef.current.style.transform = "translate(-50%, -50%)";
        }
        return;
      }
      const dx = state.current.currentX - state.current.startX;
      const dy = state.current.currentY - state.current.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clampedDist = Math.min(dist, MAX_RADIUS);
      const nx = dist > 0 ? (dx / dist) * clampedDist : 0;
      const ny = dist > 0 ? (dy / dist) * clampedDist : 0;
      outputRef.current = {
        x: nx / MAX_RADIUS,
        y: ny / MAX_RADIUS,
      };
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
      }
    },
    [],
  );

  // Move joystick handlers
  const onMoveDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      moveJoyState.current = {
        active: true,
        startX: cx,
        startY: cy,
        currentX: e.clientX,
        currentY: e.clientY,
        pointerId: e.pointerId,
      };
      updateJoystick(moveJoyState, joystickRef, moveJoyInnerRef);
    },
    [joystickRef, updateJoystick],
  );

  const onMoveMove = useCallback(
    (e: React.PointerEvent) => {
      if (
        !moveJoyState.current.active ||
        e.pointerId !== moveJoyState.current.pointerId
      )
        return;
      moveJoyState.current.currentX = e.clientX;
      moveJoyState.current.currentY = e.clientY;
      updateJoystick(moveJoyState, joystickRef, moveJoyInnerRef);
    },
    [joystickRef, updateJoystick],
  );

  const onMoveUp = useCallback(
    (_e: React.PointerEvent) => {
      moveJoyState.current.active = false;
      joystickRef.current = { x: 0, y: 0 };
      updateJoystick(moveJoyState, joystickRef, moveJoyInnerRef);
    },
    [joystickRef, updateJoystick],
  );

  // Aim joystick handlers
  const onAimDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      aimJoyState.current = {
        active: true,
        startX: cx,
        startY: cy,
        currentX: e.clientX,
        currentY: e.clientY,
        pointerId: e.pointerId,
      };
      updateJoystick(aimJoyState, aimJoystickRef, aimJoyInnerRef);
    },
    [aimJoystickRef, updateJoystick],
  );

  const onAimMove = useCallback(
    (e: React.PointerEvent) => {
      if (
        !aimJoyState.current.active ||
        e.pointerId !== aimJoyState.current.pointerId
      )
        return;
      aimJoyState.current.currentX = e.clientX;
      aimJoyState.current.currentY = e.clientY;
      updateJoystick(aimJoyState, aimJoystickRef, aimJoyInnerRef);
    },
    [aimJoystickRef, updateJoystick],
  );

  const onAimUp = useCallback(
    (_e: React.PointerEvent) => {
      aimJoyState.current.active = false;
      aimJoystickRef.current = { x: 0, y: 0 };
      updateJoystick(aimJoyState, aimJoystickRef, aimJoyInnerRef);
    },
    [aimJoystickRef, updateJoystick],
  );

  // Prevent context menu on long-press
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", prevent);
    return () => document.removeEventListener("contextmenu", prevent);
  }, []);

  return (
    <div className="pointer-events-none">
      {/* ── Move Joystick (bottom-left) ─── */}
      <div
        data-ocid="game.move_joystick"
        className="pointer-events-auto"
        onPointerDown={onMoveDown}
        onPointerMove={onMoveMove}
        onPointerUp={onMoveUp}
        onPointerCancel={onMoveUp}
        style={{
          position: "fixed",
          bottom: 40,
          left: 30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "oklch(0.65 0.15 120 / 0.12)",
          border: "2px solid oklch(0.65 0.15 120 / 0.4)",
          touchAction: "none",
          cursor: "none",
        }}
      >
        {/* Inner dot */}
        <div
          ref={moveJoyInnerRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "oklch(0.65 0.15 120 / 0.6)",
            border: "2px solid oklch(0.65 0.15 120 / 0.9)",
            transform: "translate(-50%, -50%)",
            transition: "background 0.1s",
            pointerEvents: "none",
          }}
        />
        {/* Directional hints */}
        <div
          style={{
            position: "absolute",
            top: 4,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            color: "oklch(0.65 0.15 120 / 0.5)",
          }}
        >
          ▲
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            color: "oklch(0.65 0.15 120 / 0.5)",
          }}
        >
          ▼
        </div>
        <div
          style={{
            position: "absolute",
            left: 4,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 10,
            color: "oklch(0.65 0.15 120 / 0.5)",
          }}
        >
          ◀
        </div>
        <div
          style={{
            position: "absolute",
            right: 4,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 10,
            color: "oklch(0.65 0.15 120 / 0.5)",
          }}
        >
          ▶
        </div>
      </div>

      {/* ── Fire Button (bottom-right) ─── */}
      <button
        data-ocid="game.fire_button"
        className="pointer-events-auto"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          fireRef.current = true;
        }}
        onPointerUp={() => {
          fireRef.current = false;
        }}
        onPointerCancel={() => {
          fireRef.current = false;
        }}
        style={{
          position: "fixed",
          bottom: 50,
          right: 30,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "oklch(0.55 0.22 25 / 0.85)",
          border: "3px solid oklch(0.65 0.25 25)",
          color: "oklch(0.95 0.02 25)",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.12em",
          cursor: "none",
          touchAction: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "0 0 20px oklch(0.55 0.22 25 / 0.4), inset 0 2px 4px oklch(0.8 0.1 25 / 0.2)",
          WebkitTapHighlightColor: "transparent",
          outline: "none",
        }}
        type="button"
      >
        FIRE
      </button>

      {/* ── Aim Joystick (bottom-right, above fire) ─── */}
      <div
        data-ocid="game.aim_joystick"
        className="pointer-events-auto"
        onPointerDown={onAimDown}
        onPointerMove={onAimMove}
        onPointerUp={onAimUp}
        onPointerCancel={onAimUp}
        style={{
          position: "fixed",
          bottom: 155,
          right: 30,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "oklch(0.45 0.12 200 / 0.12)",
          border: "2px solid oklch(0.45 0.12 200 / 0.35)",
          touchAction: "none",
          cursor: "none",
        }}
      >
        <div
          ref={aimJoyInnerRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "oklch(0.55 0.12 200 / 0.5)",
            border: "2px solid oklch(0.6 0.12 200 / 0.8)",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 2,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 9,
            color: "oklch(0.55 0.12 200 / 0.5)",
          }}
        >
          AIM
        </div>
      </div>
    </div>
  );
}
