# Nukewar Online

A real-time, browser-based multiplayer nuclear warfare strategy game. Battleship-style gameplay set on a 3D globe where up to 10 countries compete to destroy each other's command centers with nuclear missiles.

## Tech Stack

- **Server**: Node.js with custom "katip-framework" (file-based module loader using `eval`)
- **Networking**: Socket.IO 1.x (real-time WebSocket communication)
- **3D Rendering**: Three.js (Earth globe with atmosphere, rockets, explosions, lens flares)
- **Client Libraries**: jQuery, SweetAlert, Howler.js (audio), js-cookie
- **Build**: Custom JS concatenator + UglifyJS minification
- **Containerization**: Docker

## Game Overview

- 10 countries (Turkey, USA, Russia, China, Canada, India, EU, Australia, Brazil, Africa), each with 5 real cities
- Each country has a **Command Center**, **Nuclear Launcher(s)**, and **Civilian Cities**
- Players launch nuclear missiles, build launchers, build air defenses, clear bombed areas, and transport buildings between cities
- **Win condition**: Be the last country with a surviving command center
- **Lose condition**: Your command center city gets bombed
- Supports bots to fill empty slots (auto-starts with 10 players or after 10s manual start)

## Prerequisites

> **Important**: This project was built around 2016 and targets **Node.js 6.x** (Boron LTS). It uses outdated dependencies (Socket.IO 1.x, `request` module). You may need an older Node.js version to run it without issues.

- **Node.js 6.x** (recommended) or attempt with a newer version (may require fixes)
  - Use [nvm](https://github.com/nvm-sh/nvm) to install: `nvm install 6 && nvm use 6`
- **npm** (comes with Node.js)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the server

```bash
npm start
```

This runs `node app.js`, which:
1. Boots the katip-framework (loads configs, functions, classes, includes from `src/`)
2. Builds/minifies the client-side `game.js` from multiple source files
3. Starts an HTTP server on port **80** (or `$PORT` env variable)
4. Starts a Socket.IO server on port **3000**

### 3. Open in browser

```
http://localhost:80
```

> **Note**: Port 80 may require root/admin privileges. Set a custom port via environment variable:
> ```bash
> PORT=8080 npm start
> ```
> The Socket.IO port (3000) is hardcoded in `src/includes/Server/NukeGameServer.js`.

## Running with Docker

```bash
docker build -t nukewar .
docker run -p 80:80 -p 3000:3000 nukewar
```

> The Dockerfile uses `node:boron` (Node.js 6.x). For modern Docker, you may need to update the base image.

## Project Structure

```
.
├── app.js                      # Entry point - boots katip-framework
├── katip-framework/            # Custom module loader framework
│   ├── loader.js               # Main loader (configs, functions, classes, includes)
│   ├── watcher.js              # File watcher for hot-reload
│   └── ...
├── src/
│   ├── const.js                # Project settings (ports, directories)
│   ├── classes/
│   │   ├── GPS/GPos.js         # Geographic position utilities (lat/lon to 3D)
│   │   ├── Nuke/Countries.js   # Country & city data (coordinates, population)
│   │   ├── Nuke/NukewarStandarts.js  # Game timing constants
│   │   ├── Nuke/RocketController.js  # Rocket trajectory calculations
│   │   └── Vector/             # Vector2, Vector3 math
│   ├── configs/
│   │   ├── Builder/JSBuilder.js  # Client JS build configuration
│   │   └── Server/HTTP.js        # HTTP server config
│   ├── functions/              # Utility functions (logging, security)
│   ├── includes/
│   │   ├── Builder/JSBuilder.js  # JS concatenation & minification
│   │   └── Server/
│   │       ├── HTTP.js           # HTTP server & static file serving
│   │       └── NukeGameServer.js # Game logic, Socket.IO events, lobby, matchmaking
│   └── assets/
│       ├── JS/main/            # Client-side game code (Three.js scenes, controls, UI)
│       ├── JS/languages/       # i18n translations
│       └── WebServer/www/      # Static web files (HTML, CSS, images, sounds, textures)
├── docs/                       # Design documents (PDF, DOCX)
├── Dockerfile
└── package.json
```

## Ports

| Service    | Port | Configurable          |
|------------|------|-----------------------|
| HTTP       | 80   | Yes (`$PORT` env var) |
| Socket.IO  | 3000 | No (hardcoded)        |

## Known Issues / Modernization Notes

- **Node.js 6.x only**: The `node:boron` Docker image and dependency versions target Node 6. Newer Node versions may break things.
- **`eval()` everywhere**: The katip-framework loads all modules via `eval(readFile(...))`. This is a security concern and prevents proper module resolution.
- **Socket.IO 1.x**: Very old version. Modern clients won't connect without matching the protocol.
- **`request` module**: Deprecated. Used only for bug report notifications to an external service (now defunct).
- **Hardcoded Socket.IO port**: Client connects to port 3000 separately from the HTTP server.
- **No HTTPS**: Everything runs over plain HTTP.
- **Client JS build**: `game.js` is built by concatenating and uglifying source files on server startup. There's no separate build command.

## License

ISC
