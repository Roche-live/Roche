import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import About from "./components/About";
import MusicPlayer from "./components/MusicPlayer";
import SpaceJetGame from "./components/space-jet/SpaceJetGame";
import Socials from "./components/Socials";
import Contact from "./components/Contact";
import { tracks, socials, siteInfo } from "./data/siteData";

export default function App() {
  return (
    <div className="page-shell">
      <div className="site-frame device-shell">
        <Header
          artistName={siteInfo.artistName}
          tagline={siteInfo.tagline}
          logoSrc={siteInfo.logoSrc}
          logoAlt={siteInfo.logoAlt}
        />

        <div className="content-grid device-grid">
          <div className="sidebar-bg">
            <Sidebar
              artistName={siteInfo.artistName}
              status={siteInfo.status}
              donationMessage={siteInfo.donationMessage}
            />
          </div>

          <main className="main-panel console-main">
            <About
              text={siteInfo.aboutText}
              artistName={siteInfo.artistName}
              status={siteInfo.status}
            />
            <MusicPlayer
              tracks={tracks}
              donationMessage={siteInfo.donationMessage}
            />
            <SpaceJetGame />
            <Socials socials={socials} />
            <Contact />
          </main>
        </div>
      </div>
    </div>
  );
}
