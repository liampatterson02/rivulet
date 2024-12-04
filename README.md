# Rivulet

An HDHomeRun emulator that integrates HLS-Proxy streams with Plex Live TV & DVR. **Rivulet** allows Plex to recognize HLS-Proxy streams as if they were from an HDHomeRun tuner.

## Features

- Emulates an HDHomeRun tuner
- Parses M3U playlists from HLS-Proxy
- Serves a default EPG with channel names as epg listings
- Redirects stream requests to HLS-Proxy
- Dockerized for easy deployment
- Modular codebase for easy extension

## Prerequisites

- Python 3.7 or higher
- Docker (optional, for containerization)
- HLS-Proxy running and accessible

## Installation

### Option 1: Run Locally

#### Clone the Repository

```bash
git clone https://github.com/yourusername/rivulet.git
cd rivulet
