<p align="center">
  <img src="assets/scrobblify-logo.png" width="180" alt="Scrobblify Logo">
</p>

<h1 align="center">Scrobblify</h1>

# Scrobblify for Spicetify

**One player. Two music histories.**

Scrobblify is a local-first Spicetify extension for Spotify desktop on Windows. It sends Spotify listening activity to Last.fm and ListenBrainz independently, with separate credentials, enable switches, and retry queues.

## Features

### Shared playback engine
- Detects Spotify track changes and playback state.
- Sends Now Playing updates to both services.
- Scrobbles after the configured threshold (default: the shorter of 50% of track duration or 4 minutes; tracks under 30 seconds are ignored).
- Independent per-service duplicate guards and offline retry queues.
- Spotify track URL and duration metadata included in ListenBrainz submissions.

### Last.fm
- Desktop token authorization flow.
- Now Playing and automatic scrobbling.
- Love and un-love current track.
- Recent listening history.
- Top tracks, artists, and albums across available Last.fm periods.

### ListenBrainz
- Personal user-token validation and connection.
- Now Playing and automatic listen submission.
- Love, un-love (clear feedback), and hate current track.
- Recent listening history.
- Top recordings, artists, and releases across ListenBrainz statistics ranges.

### Dashboard
- Modern dark dashboard with Overview, History, Charts, and Settings.
- Switch between Last.fm and ListenBrainz for history and charts.
- Separate connection and queue status.

## Requirements

- Spotify desktop for Windows
- Spicetify CLI installed and applied
- A Last.fm account and your own API key/shared secret (optional)
- A ListenBrainz account and user token (optional)

You can connect either service on its own, or both together.

## Install on Windows

1. Close Spotify.
2. Copy `scrobblify.js` into:

   `%appdata%\Spicetify\Extensions\`

3. Open PowerShell or Command Prompt and run:

   ```powershell
   spicetify config extensions scrobblify.js
   spicetify apply
   ```

4. Restart Spotify. Click the music-note button in the top bar to open Scrobblify.
5. Open **Settings** and connect whichever services you use.

If you were using the earlier `lastfm-companion.js` build, replace that extension entry with `scrobblify.js` rather than enabling both. Existing Last.fm API credentials and session data are retained using the original local storage keys.

## Connect Last.fm

1. Create or view your API credentials at https://www.last.fm/api/account.
2. In Scrobblify Settings, enter your API key, shared secret, and Last.fm username.
3. Click **Connect Last.fm** and approve the app in your browser.
4. Return to Spotify and click **I've approved — finish connection**.

## Connect ListenBrainz

1. Open https://listenbrainz.org/settings/ and copy your user token.
2. Paste it into the ListenBrainz token field in Scrobblify Settings.
3. Click **Validate & connect**. Scrobblify validates the token and reads the associated username.

## Privacy and security

- Last.fm credentials/session key, ListenBrainz token, preferences, duplicate guards, and retry queues are stored in Spicetify local storage for the current Windows user.
- Requests go directly from Spotify to `ws.audioscrobbler.com` and `api.listenbrainz.org`.
- No companion server, analytics endpoint, telemetry, or third-party proxy is used.
- Spicetify local storage is not a secure secret vault. Tokens and secrets are accessible to software running as your Windows user. Do not share your Spotify profile or extension storage with others.
- Disconnect clears the locally stored credentials; revoke app access separately in the respective service settings if needed.

## Important scope notes

Scrobblify implements the music-tracking and personal-listening features relevant to a Spotify scrobbler. It does **not** reproduce every feature of the full Last.fm or ListenBrainz websites/APIs (for example, social feeds, recommendations, playlist management, imports/exports, or account administration).

ListenBrainz requires a `recording_msid` or MusicBrainz recording ID for love/hate feedback. Scrobblify requests an MSID from the ListenBrainz Playing Now endpoint; feedback may be unavailable if the service does not return an identifier.

This extension has been syntax-checked, but it has not yet been exercised inside the user's Spotify installation or against their accounts. Spotify/Spicetify internal player metadata and browser request policies can change; inspect Spotify DevTools (`Ctrl` + `Shift` + `I`) if a live API request fails.

## Troubleshooting

- **Button missing:** confirm `scrobblify.js` is in `%appdata%\Spicetify\Extensions\`, check `spicetify config extensions`, then run `spicetify apply`.
- **Last.fm authorization/signature error:** confirm the API key and shared secret belong to the same API account and Windows date/time is correct.
- **ListenBrainz token error:** generate/copy the personal token from ListenBrainz Settings and validate it again.
- **Scrobbles not sending:** check the global Scrobbling switch and the ListenBrainz-specific switch, verify service connection status, and inspect Spotify DevTools for CORS/network/API errors.
- **No ListenBrainz love/hate action:** restart the current track so ListenBrainz can return a recording MSID, then try again.

## License

MIT. See `LICENSE`.
