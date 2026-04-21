import React from "react";

const BAR_COUNT = 18;
const SEGMENTS_PER_BAR = 10;

export default function Visualizer({ audioRef }) {
  const [levels, setLevels] = React.useState(
    Array.from({ length: BAR_COUNT }, () => 4)
  );

  React.useEffect(() => {
    let animationFrameId;
    let idleTick = 0;

    let audioContext = null;
    let analyser = null;
    let source = null;
    let dataArray = null;

    const getIdleLevels = () => {
      idleTick += 0.16;

      return Array.from({ length: BAR_COUNT }, (_, i) => {
        const wave =
          Math.sin(idleTick + i * 0.45) * 2.4 +
          Math.sin(idleTick * 0.7 + i * 0.22) * 1.8 +
          4.5;

        return Math.max(
          1,
          Math.min(SEGMENTS_PER_BAR, Math.round(wave + 2))
        );
      });
    };

    const mapAudioToLevels = () => {
      if (!analyser || !dataArray) return getIdleLevels();

      analyser.getByteFrequencyData(dataArray);

      const chunkSize = Math.floor(dataArray.length / BAR_COUNT);

      return Array.from({ length: BAR_COUNT }, (_, i) => {
        const start = i * chunkSize;
        const end = start + chunkSize;

        let sum = 0;
        for (let j = start; j < end; j++) {
          sum += dataArray[j];
        }

        const average = sum / chunkSize || 0;

        const normalized = average / 255;
        const level = Math.max(
          1,
          Math.min(SEGMENTS_PER_BAR, Math.round(normalized * SEGMENTS_PER_BAR))
        );

        return level;
      });
    };

    const setupAudio = async () => {
      const audio = audioRef?.current;
      if (!audio) return;

      if (!audioContext) {
        audioContext = new window.AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        dataArray = new Uint8Array(analyser.frequencyBinCount);

        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      }

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
    };

    const tick = () => {
      const audio = audioRef?.current;
      const isPlaying = audio && !audio.paused && !audio.ended;

      if (isPlaying && analyser) {
        setLevels(mapAudioToLevels());
      } else {
        setLevels(getIdleLevels());
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    const audio = audioRef?.current;

    const handlePlay = async () => {
      try {
        await setupAudio();
      } catch (error) {
        console.error("Audio visualizer setup failed:", error);
      }
    };

    if (audio) {
      audio.addEventListener("play", handlePlay);
    }

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      if (audio) {
        audio.removeEventListener("play", handlePlay);
      }

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

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
