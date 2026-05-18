# Nukewar Online

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-ISC-blue?logo=opensourceinitiative&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-supported-2496ED?logo=docker&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socket.io&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-3D%20Globe-black?logo=three.js&logoColor=white)
![jQuery](https://img.shields.io/badge/jQuery-UI-0769AD?logo=jquery&logoColor=white)
![npm](https://img.shields.io/badge/npm-required-CB3837?logo=npm&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Browser-4285F4?logo=googlechrome&logoColor=white)
![Multiplayer](https://img.shields.io/badge/Multiplayer-up%20to%2010%20players-FF6600)
![Realtime](https://img.shields.io/badge/Real--time-WebSocket-00C7B7?logo=websocket&logoColor=white)
![Game](https://img.shields.io/badge/Genre-Strategy%20%7C%20Nuclear%20Warfare-8B0000)
![Players](https://img.shields.io/badge/Bots-AI%20opponents-6A0DAD)
![Port](https://img.shields.io/badge/Default%20Port-80-lightgrey)

A real-time, browser-based multiplayer nuclear warfare strategy game. Battleship-style gameplay set on a 3D globe where up to 10 countries compete to destroy each other's command centers with nuclear missiles.

## Tech Stack

- **Server**: Node.js (>=18) with custom "katip-framework" (file-based module loader)
- **Networking**: Socket.IO 4.x (real-time WebSocket communication)
- **3D Rendering**: Three.js (Earth globe with atmosphere, rockets, explosions, lens flares)
- **Client Libraries**: jQuery, SweetAlert, Howler.js (audio), js-cookie
- **Build**: Custom JS concatenator (UglifyJS 3 minification, optional chokidar watch in dev mode)
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

### 2. Build the client bundle

```bash
npm run build
```

This runs `node app.js --build`, which concatenates and minifies the client-side `game.js` from multiple source files, then exits. The bundle (`src/assets/WebServer/www/game.js`) must exist before the server can serve the client.

### 3. Run the server

```bash
npm start
```

This runs `node app.js`, which:
1. Boots the katip-framework (loads configs, functions, classes, includes from `src/`)
2. Starts an HTTP server on port **80** (or `$PORT` env variable)
3. Starts a Socket.IO server on the same port (attached to the HTTP server)

For development with auto-rebuild on source changes, use `npm run dev` instead. It runs `node app.js --dev`, which builds once and then watches the client source files via chokidar, rebuilding `game.js` on every change while the server is running.

### 4. Open in browser

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
- **Client JS build**: `game.js` is built explicitly via `npm run build` (one-shot) or `npm run dev` (build + chokidar watch for hot-rebuild). The default `npm start` does not trigger any build.
- **Shared code**: Some classes (GPos, Countries, RocketController, NukewarStandarts) are shared between server (loaded via eval) and client (concatenated into game.js).

## License

ISC
