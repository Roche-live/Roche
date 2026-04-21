import React from "react";

const BAR_COUNT = 12;
const SEGMENTS_PER_BAR = 8;
const IDLE_LEVELS = [2, 3, 3, 4, 5, 5, 4, 3, 3, 2, 2, 1];
const PLAYING_TICK_MS = 90;

export default function Visualizer({ audioRef }) {
  const [levels, setLevels] = React.useState(IDLE_LEVELS);

  React.useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return undefined;

    let intervalId = null;
    let audioContext = null;
    let analyser = null;
    let source = null;
    let dataArray = null;

    const stopLoop = () => {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const updateLevels = () => {
      if (!analyser || !dataArray) return;

      analyser.getByteFrequencyData(dataArray);
      const chunkSize = Math.max(1, Math.floor(dataArray.length / BAR_COUNT));

      setLevels((previous) => {
        const next = Array.from({ length: BAR_COUNT }, (_, i) => {
          const start = i * chunkSize;
          const end = Math.min(dataArray.length, start + chunkSize);

          let sum = 0;
          for (let j = start; j < end; j += 1) {
            sum += dataArray[j];
          }

          const average = end > start ? sum / (end - start) : 0;
          const normalized = average / 255;
          return Math.max(
            1,
            Math.min(SEGMENTS_PER_BAR, Math.round(normalized * SEGMENTS_PER_BAR))
          );
        });

        const changed = next.some((level, index) => level !== previous[index]);
        return changed ? next : previous;
      });
    };

    const startLoop = async () => {
      try {
        if (!audioContext) {
          audioContext = new window.AudioContext();
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 128;
          dataArray = new Uint8Array(analyser.frequencyBinCount);
          source = audioContext.createMediaElementSource(audio);
          source.connect(analyser);
          analyser.connect(audioContext.destination);
        }

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        stopLoop();
        updateLevels();
        intervalId = window.setInterval(updateLevels, PLAYING_TICK_MS);
      } catch (error) {
        console.error("Audio visualizer setup failed:", error);
      }
    };

    const handlePlay = () => {
      startLoop();
    };

    const handleStop = () => {
      stopLoop();
      setLevels(IDLE_LEVELS);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handleStop);
    audio.addEventListener("ended", handleStop);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handleStop);
      audio.removeEventListener("ended", handleStop);
      stopLoop();

      if (source) source.disconnect();
      if (analyser) analyser.disconnect();
    };
  }, [audioRef]);

  return (
    <div className="visualizer-shell">
      <div className="visualizer-label">Live Visual</div>

      <div className="visualizer-screen">
        <div className="visualizer-bars analog-bars">
          {levels.map((level, barIndex) => (
            <div key={barIndex} className="analog-bar">
              {Array.from({ length: SEGMENTS_PER_BAR }, (_, segmentIndex) => {
                const segmentNumberFromBottom = SEGMENTS_PER_BAR - segmentIndex;
                const isOn = level >= segmentNumberFromBottom;

                return (
                  <span
                    key={segmentIndex}
                    className={isOn ? "analog-segment on" : "analog-segment"}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
