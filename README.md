# Nukewar Online

A real-time, browser-based multiplayer nuclear warfare strategy game. Battleship-style gameplay set on a 3D globe where up to 10 countries compete to destroy each other's command centers with nuclear missiles.

## Tech Stack

- **Server**: Node.js (>=18) with custom "katip-framework" (file-based module loader)
- **Networking**: Socket.IO 4.x (real-time WebSocket communication)
- **3D Rendering**: Three.js (Earth globe with atmosphere, rockets, explosions, lens flares)
- **Client Libraries**: jQuery, SweetAlert, Howler.js (audio), js-cookie
- **Build**: Custom JS concatenator (chokidar watch + UglifyJS 3 minification)
- **Containerization**: Docker

## Game Overview

- 10 countries (Turkey, USA, Russia, China, Canada, India, EU, Australia, Brazil, Africa), each with 5 real cities
- Each country has a **Command Center**, **Nuclear Launcher(s)**, and **Civilian Cities**
- Players launch nuclear missiles, build launchers, build air defenses, clear bombed areas, and transport buildings between cities
- **Win condition**: Be the last country with a surviving command center
- **Lose condition**: Your command center city gets bombed
- Supports bots to fill empty slots (auto-starts with 10 players or after 10s manual start)

## Prerequisites

- **Node.js 18+** (tested on Node.js 25)
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
2. Builds/minifies the client-side `game.js` from multiple source files (with chokidar file watching for hot-rebuild)
3. Starts an HTTP server on port **80** (or `$PORT` env variable)
4. Starts a Socket.IO server on the same port (attached to the HTTP server)

### 3. Open in browser

```
http://localhost:80
```

> **Note**: Port 80 may require root/admin privileges. Set a custom port via environment variable:
> ```bash
> PORT=8080 npm start
> ```

## Running with Docker

```bash
docker build -t nukewar .
docker run -p 80:80 nukewar
```

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
│   │   ├── Builder/JSBuilder.js  # JS concatenation & minification (chokidar watch)
│   │   └── Server/
│   │       ├── HTTP.js           # HTTP server & static file serving
│   │       ├── NukeGameServer.js # Game logic, Socket.IO events, lobby, matchmaking
│   │       └── WebConsole.js     # Debug console (Socket.IO /console namespace)
│   └── assets/
│       ├── JS/main/            # Client-side game code (Three.js scenes, controls, UI)
│       ├── JS/languages/       # i18n translations
│       └── WebServer/www/      # Static web files (HTML, CSS, images, sounds, textures)
├── docs/                       # Design documents (PDF, DOCX)
├── Dockerfile
└── package.json
```

## Architecture Notes

- **Single port**: Both HTTP and Socket.IO run on the same port. The game uses the default `/` namespace; the debug WebConsole uses the `/console` namespace.
- **katip-framework**: A custom module loader that uses `eval()` to load configs, functions, classes, and includes from the `src/` directory. It provides dependency ordering via `depends()` and `needs()` declarations.
- **Client JS build**: `game.js` is built automatically on server startup by concatenating and minifying source files. File changes are watched via chokidar for hot-rebuild during development.
- **Shared code**: Some classes (GPos, Countries, RocketController, NukewarStandarts) are shared between server (loaded via eval) and client (concatenated into game.js).

## License

ISC
