# rivulet

rivulet emulates a virtual HDHomeRun tuner for Plex, proxies IPTV M3U playlists with buffering and transcoding, and provides a web interface for configuration. Channels with backup qualities (FHD, HD, SD) are merged into a single channel without suffixes in their displayed names.

## Requirements

- Node.js and npm
- ffmpeg installed on the system
- Plex and a network environment where Plex can access this server

## Getting Started

1. `npm install`
2. `npm run build:ui`
3. `npm start`
4. Access the web UI at http://localhost:3000

Configure Plex by adding a network tuner with:
`http://<your-server-ip>:3000/hdhr/discover.json`
