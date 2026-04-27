import Sidebar from "./components/Sidebar";
import MusicPlayer from "./components/MusicPlayer";
import { tracks, siteInfo } from "./data/siteData";
import { useAudioDeck } from "./hooks/useAudioDeck";

export default function App() {
  const audioDeck = useAudioDeck(tracks);

  return (
    <div className="page-shell">
      <div className="site-frame device-shell">
        <div className="control-panel" aria-label="Universal control panel">
          <div className="system-name">{siteInfo.artistName} System</div>
          <div className="control-buttons" aria-label="Inactive device controls">
            <button type="button" className="control-button" aria-label="Control slot one" disabled>
              I
            </button>
            <button type="button" className="control-button" aria-label="Control slot two" disabled>
              II
            </button>
            <button type="button" className="control-button" aria-label="Control slot three" disabled>
              III
            </button>
          </div>
        </div>

        <div className="content-grid device-grid">
          <div className="sidebar-bg">
            <Sidebar audioDeck={audioDeck} />
          </div>

          <main className="main-panel console-main">
            <MusicPlayer
              tracks={tracks}
              donationMessage={siteInfo.donationMessage}
              audioDeck={audioDeck}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
