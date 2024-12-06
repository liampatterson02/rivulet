# Rivulet

A virtual HDHomeRun tuner emulator for Plex, fetching and parsing IPTV M3U playlists, with optional transcoding.

## Instructions

1. `npm install`
2. `npm run build:ui`
3. `npm start`

Configure settings in the UI at `http://<serverHostname>:<serverPort>` or edit `backend/config/config.example.json` prior to first run. Plex can discover the tuner by adding `http://<serverHostname>:<serverPort>` as a network tuner.
