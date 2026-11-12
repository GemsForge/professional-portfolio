# Aura Logbook portfolio walkthrough captures

## Capture provenance

- Captured: 2026-11-12 at 9:50 a.m. America/New_York (14:50 UTC).
- App URL: `http://localhost:58407`.
- Source checkout: Aura Logbook `fix/379-less-wordy-login-page` at `bc829a67`, including the user's local working changes. This is not Aura's latest merged commit `5913d26` (PR #382); the user explicitly chose a local capture while waiting on deployment.
- Viewports: mobile 390 × 844 and desktop 1440 × 900. Each published composite places the phone view in front of its corresponding desktop capture.
- Theme: dark mode for the main walkthrough. The appearance-selector capture is the genuine Light-mode UI with Light, Dark, and Use device setting choices visible.
- Data: fictional Alex Morgan profile and synthetic journal entries. Three generated sample photographs are reused across nine gallery attachments; the individual featured record has two photos. No real account data or uploaded user photos were used.
- Weather: current conditions fetched from Open-Meteo for New York City, NY (40.7128, -74.0060), timezone America/New_York. The capture fetched conditions observed at 9:45 a.m. local on November 12, 2026: 60.6°F, WMO 3 (overcast), displayed by the app as 61°F · Overcast. The home weather peel and individual-record snapshot use this same response. The featured record includes this current weather snapshot.
- API data: the Playwright capture supplied synthetic application responses, generated photo bytes, and the live weather response. The Spotify capture uses a fictional connected state, synthetic track “Between Pages” by “Sora Finch,” and generated abstract playlist artwork. No Spotify login, personal listening history, or provider API account data was used. The app UI was served locally; no Aura source was edited for these captures.

## Published images

Composites are in `public/assets/auralogbook-tour/`: `login-pair.png`, `public-home-pair.png`, `home-pair.png`, `check-in-pair.png`, `reflections-pair.png`, `individual-record-pair.png`, `gallery-pair.png`, `appearance-pair.png`, `insights-pair.png`, and `spotify-pair.png`. The home, check-in, history, record, gallery, insights, login, and public-home captures use Dark mode; appearance shows Light mode and its selector.

The paired images are visual evidence from the local UI and should not be described as screenshots of the latest Aura deployment. Refresh them after the current Aura deployment is available if the user requests deployment-matched captures.
