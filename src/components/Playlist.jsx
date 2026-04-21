export default function Playlist({ tracks, currentIndex, onSelect }) {
  return (
    <div className="playlist-card">
      <div className="section-title gray">Playlist</div>

      <div className="section-body">
        <div className="playlist-list">
          {tracks.map((track, index) => (
            <button
              key={track.fileName}
              className={
                index === currentIndex
                  ? "playlist-item active"
                  : "playlist-item"
              }
              onClick={() => onSelect(index)}
            >
              <span className="playlist-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="playlist-text">
                {track.title} — {track.artist}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}