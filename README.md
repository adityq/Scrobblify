 <div align="center">

  <img src="assets/scrobblify-logo.png" width="132" alt="Scrobblify logo">

  # Scrobblify

  **Keep every beat of your journey.**

  A local-first Spotify scrobbler for Spicetify.

  [Features](#features) · [Installation](#installation) · [Setup](#connect-your-services) · [Privacy](#privacy)

  ![Platform](https://img.shields.io/badge/platform-Windows-242424?style=flat-square)
  ![Spicetify](https://img.shields.io/badge/works%20with-Spicetify-1DB954?style=flat-square)
  ![License](https://img.shields.io/badge/license-MIT-orange?style=flat-square)

</div>

---

## What is Scrobblify?

Scrobblify is a **Spicetify extension for Spotify desktop on Windows** that sends your listening activity to **Last.fm** and **ListenBrainz** independently.

Connect either service or both. Each has its own credentials, controls, connection status, and retry queue. Your listening data is sent directly from Spotify to the services — no Scrobblify server in the middle.

## Features

| | Feature | What it does |
|:--:|---|---|
| ↗ | **Dual scrobbling** | Send listening activity to Last.fm and ListenBrainz independently |
| ♪ | **Now Playing** | Update both services when your track changes |
| ◷ | **Listening history** | Browse recent listening activity |
| ▥ | **Charts & stats** | Explore top tracks, artists, albums, recordings, and releases |
| ♥ | **Track feedback** | Love tracks on Last.fm; send love/hate feedback on ListenBrainz when supported |
| ⇄ | **Offline retry** | Queue submissions for retry, with per-service duplicate protection |
| ⚙ | **Independent controls** | Configure each service separately from the dashboard |

## Dashboard

- **Overview** — playback and connection status.
- **History** — recent listening activity from either service.
- **Charts** — listening statistics and top items.
- **Settings** — credentials, service switches, and scrobbling preferences.

## Requirements

- Spotify desktop for Windows
- [Spicetify CLI](https://spicetify.app/) installed and applied
- A [Last.fm](https://www.last.fm/) account and API credentials (optional)
- A [ListenBrainz](https://listenbrainz.org/) account and user token (optional)

## Installation

1. Close Spotify.
2. Copy `scrobblify.js` into `%appdata%\Spicetify\Extensions\`.
3. Run:

   ```powershell
   spicetify config extensions scrobblify.js
   spicetify apply
   ```

4. Restart Spotify and click the Scrobblify music-note button.
5. Open **Settings** and connect your preferred service.

## Connect your services

<details>
<summary><strong>Last.fm</strong></summary>

1. Create API credentials at https://www.last.fm/api/account.
2. Enter your API key, shared secret, and username in Scrobblify Settings.
3. Click **Connect Last.fm** and approve the app.
4. Return to Spotify and click **I've approved — finish connection**.

</details>

<details>
<summary><strong>ListenBrainz</strong></summary>

1. Open https://listenbrainz.org/settings/ and copy your user token.
2. Paste it into Scrobblify Settings.
3. Click **Validate & connect**.

</details>

## Privacy

- Credentials, preferences, duplicate guards, and retry queues are stored in Spicetify local storage for the current Windows user.
- Requests go directly from Spotify to Last.fm and ListenBrainz.
- No companion server, analytics endpoint, telemetry, or third-party proxy is used.
- Spicetify local storage is not a secure secret vault. Tokens and secrets are accessible to software running as your Windows user.
- Disconnect clears locally stored credentials. Revoke app access separately in each service's settings if needed.

## Notes & limitations

Scrobblify focuses on music tracking and personal listening features. It does not reproduce every feature of the Last.fm or ListenBrainz websites/APIs.

ListenBrainz requires a `recording_msid` or MusicBrainz recording ID for love/hate feedback. Feedback may be unavailable if the service does not return an identifier.

The extension has been syntax-checked, but has not yet been fully exercised across all Spotify installations or account configurations.

<details>
<summary><strong>Troubleshooting</strong></summary>

- **Button missing:** confirm the extension is installed and run `spicetify apply`.
- **Last.fm authorization error:** verify your API key and shared secret.
- **ListenBrainz token error:** generate a new token in ListenBrainz Settings.
- **Scrobbles not sending:** check the scrobbling switches and connection status. Inspect Spotify DevTools (`Ctrl` + `Shift` + `I`) for errors.

</details>


## License

[MIT](LICENSE)

---

<table align="center" border="0">
  <tr>
    <td align="center" style="border: none;">
      <strong><big>A little about Scrobblify 🤖</big></strong>
    </td>
  </tr>
</table>

<p align="center">
  Scrobblify is a <strong>vibe-coded project</strong>, built with human ideas,
  AI assistance, experimentation, debugging, and plenty of trial and error.
</p>

<p align="center">
  An independent project driven by curiosity and a love for music.
</p>

<br>

---

<p align="center">
  <strong>Made by a fellow Indian, for music lovers everywhere. 🇮🇳🎧</strong>
</p>
