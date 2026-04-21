import React from "react";
import {
  SpaceJetGameEngine,
  SPACE_JET_DIMENSIONS,
} from "./spaceJetGameEngine";
import "./spaceJetGame.css";

export default function SpaceJetGame() {
  const canvasRef = React.useRef(null);
  const shellRef = React.useRef(null);
  const engineRef = React.useRef(null);

  const [, setScore] = React.useState(0);
  const [, setFuelMs] = React.useState(15000);
  const [, setIsRunning] = React.useState(false);
  const [, setIsGameOver] = React.useState(false);
  const [pressedDirection, setPressedDirection] = React.useState(null);
  const [isRopePressed, setIsRopePressed] = React.useState(false);
  const [, setHasFinalRope] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const engine = new SpaceJetGameEngine({
      canvas,
      onScoreChange: setScore,
      onFuelChange: setFuelMs,
      onFinalRopeChange: setHasFinalRope,
      onGameOver: setIsGameOver,
      onRunningChange: setIsRunning,
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const setDirection = React.useCallback((direction) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (!engine.running || engine.gameOver) return;

    engine.setDirection(direction);
    setPressedDirection(direction);
    shellRef.current?.focus();
  }, []);

  const releaseDirection = React.useCallback(() => {
    engineRef.current?.setDirection(null);
    setPressedDirection(null);
  }, []);

  const handleUpPress = React.useCallback((event) => {
    event.preventDefault();
    setDirection("up");
  }, [setDirection]);

  const handleDownPress = React.useCallback((event) => {
    event.preventDefault();
    setDirection("down");
  }, [setDirection]);

  const handleInfo = React.useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.reset();
    setIsRopePressed(false);
    setPressedDirection(null);
    shellRef.current?.focus();
  }, []);

  const triggerRope = React.useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (!engine.running || engine.gameOver) return;

    engine.triggerRope();
    shellRef.current?.focus();
  }, []);

  const handleRopePress = React.useCallback((event) => {
    event.preventDefault();
    setIsRopePressed(true);
    triggerRope();
  }, [triggerRope]);

  const handleRopeRelease = React.useCallback(() => {
    setIsRopePressed(false);
  }, []);

  const handleStart = React.useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (engine.gameOver) {
      engine.reset();
    }

    engine.start();
    shellRef.current?.focus();
  }, []);

  const handleKeyDown = React.useCallback(
    (event) => {
      if (event.repeat) return;

      if (event.code === "ArrowUp") {
        event.preventDefault();
        setDirection("up");
      }

      if (event.code === "ArrowDown") {
        event.preventDefault();
        setDirection("down");
      }

      if (event.code === "KeyF") {
        event.preventDefault();
        triggerRope();
      }

      if (event.code === "KeyS") {
        event.preventDefault();
        handleStart();
      }
    },
    [handleStart, setDirection, triggerRope]
  );

  const handleKeyUp = React.useCallback((event) => {
    if (event.code === "ArrowUp" || event.code === "ArrowDown") {
      event.preventDefault();
      releaseDirection();
    }
  }, [releaseDirection]);

  return (
    <section id="game" className="section-wrap">
      <div className="section-card mini-game-card">
        <div className="section-title teal">Mini Game</div>

        <div className="section-body mini-game-layout">
          <div
            ref={shellRef}
            className="mini-device"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
          >
            <div className="mini-device-topline">
              <span>ROCHE-01</span>
              <span>SPACE JET SYSTEM</span>
            </div>

            <div className="mini-device-screen-frame">
              <div className="mini-device-screen-label">Arcade Screen</div>
              <canvas
                ref={canvasRef}
                className="mini-game-canvas"
                width={SPACE_JET_DIMENSIONS.width}
                height={SPACE_JET_DIMENSIONS.height}
              />
            </div>

            <div className="mini-device-controls">
              <button
                type="button"
                className={`device-direction-button${pressedDirection === "up" ? " is-pressed" : ""}`}
                aria-label="Move jet up"
                onPointerDown={handleUpPress}
                onPointerUp={releaseDirection}
                onPointerLeave={releaseDirection}
                onPointerCancel={releaseDirection}
              >
                <span>UP</span>
              </button>

              <button
                type="button"
                className="device-action-button"
                onClick={handleStart}
              >
                Start
              </button>

              <button
                type="button"
                className="device-action-button"
                onClick={handleInfo}
              >
                Info
              </button>

              <button
                type="button"
                className={`device-action-button device-rope-button${isRopePressed ? " is-pressed" : ""}`}
                onClick={triggerRope}
                onPointerDown={handleRopePress}
                onPointerUp={handleRopeRelease}
                onPointerLeave={handleRopeRelease}
                onPointerCancel={handleRopeRelease}
              >
                Rope
              </button>

              <button
                type="button"
                className={`device-direction-button${pressedDirection === "down" ? " is-pressed" : ""}`}
                aria-label="Move jet down"
                onPointerDown={handleDownPress}
                onPointerUp={releaseDirection}
                onPointerLeave={releaseDirection}
                onPointerCancel={releaseDirection}
              >
                <span>DOWN</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
