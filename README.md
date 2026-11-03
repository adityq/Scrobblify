<div align="center">

  <img src="assets/scrobblify-logo.png" width="132" alt="Fmify logo">

  # Fmify

  **Keep every beat of your journey. 🧡**

  A local-first Spotify scrobbler for Spicetify.

  [Features](#-features) · [Installation](#-installation) · [Setup](#-connect-your-services) · [Privacy](#-privacy)

  ![Platform](https://img.shields.io/badge/platform-Windows-242424?style=flat-square)
  ![Spicetify](https://img.shields.io/badge/works%20with-Spicetify-1DB954?style=flat-square)
  ![License](https://img.shields.io/badge/license-MIT-orange?style=flat-square)
  ![Status](https://img.shields.io/badge/status-beta-FF6A00?style=flat-square)

</div>

---

## 🧪 Beta Notice

Fmify v1.1.1 is an early public beta. Bugs, unexpected behaviour, and compatibility issues may occur. Please report problems in [Issues](https://github.com/adityq/fmify/issues).

## 🎵 What is Fmify?

Fmify is a **Spicetify extension for Spotify desktop on Windows** that sends your listening activity to **Last.fm** and **ListenBrainz** independently.

Connect either service or both. Each has its own credentials, controls, connection status, and retry queue. Your listening data is sent directly from Spotify to the services, with no Fmify server in the middle.

## ✨ Features

| | Feature | What it does |
|:--:|---|---|
| ↗️ | **Dual scrobbling** | Send listening activity to Last.fm and ListenBrainz independently |
| 🎶 | **Now Playing** | Update both services when your track changes |
| 🕘 | **Listening history** | Browse recent listening activity |
| 📊 | **Charts & stats** | Explore top tracks, artists, albums, recordings, and releases |
| ❤️ | **Spotify like sync** | Liking a track in Spotify loves it on Last.fm, and unliking removes the love. On by default; can be turned off in Settings |
| 🔄 | **Offline retry** | Queue submissions for retry, with per-service duplicate protection |
| ⚙️ | **Independent controls** | Configure each service separately from the dashboard |

## 🖥️ Dashboard

- **🏠 Overview**: Playback and connection status.
- **📜 History**: Recent listening activity from either service.
- **📈 Charts**: Listening statistics and top items.
- **⚙️ Settings**: Credentials, service switches, and scrobbling preferences.

## 📸 Screenshots

<details>
  <summary><strong>👁️ Preview Screenshots</strong></summary>

  <h3>🏠 Main Interface</h3>
  <p align="center">
    <img src="assets/screenshots/Main_Interface.png" width="850" alt="Main Interface">
  </p>

  <h3>🎵 Overview Dashboard</h3>
  <p align="center">
    <img src="assets/screenshots/Interface_1.png" width="850" alt="Overview Dashboard">
  </p>

  <h3>📜 Listening History</h3>
  <p align="center">
    <img src="assets/screenshots/Interface_History.png" width="850" alt="Listening History">
  </p>

  <h3>📊 Charts & Statistics</h3>
  <p align="center">
    <img src="assets/screenshots/Interface_Chart.png" width="850" alt="Charts">
  </p>

  <h3>⚙️ Settings</h3>
  <p align="center">
    <img src="assets/screenshots/Interface_Settings.png" width="850" alt="Settings">
  </p>

  <h3>🌐 Last.fm Connection</h3>
  <p align="center">
    <img src="assets/screenshots/Lastfm.png" width="850" alt="Last.fm">
  </p>

  <h3>🎧 ListenBrainz Connection</h3>
  <p align="center">
    <img src="assets/screenshots/ListenBrainz.png" width="850" alt="ListenBrainz">
  </p>

</details>

## 📋 Requirements

- Spotify desktop for Windows
- [Spicetify CLI](https://spicetify.app/) installed and applied
- A [Last.fm](https://www.last.fm/) account and API credentials (optional)
- A [ListenBrainz](https://listenbrainz.org/) account and user token (optional)

## 🚀 Installation

1. Close Spotify.
2. If you installed an older version, remove it first:

   ```powershell
   spicetify config extensions scrobblify.js-
   ```

3. Copy `fmify.js` into `%appdata%\Spicetify\Extensions\`. Replace the old file if it's still there.
4. Run:

   ```powershell
   spicetify config extensions fmify.js
   spicetify apply
   ```

5. Restart Spotify and click the Fmify music-note
