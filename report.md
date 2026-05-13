# Nukewar Mechanic Issues Report

## Fixed

### 1. Transport (Swap) Move Never Executes
**File:** `src/includes/Server/NukeGameServer.js:383`

The transport move was missing `type: "swap"` field. The server-side update loop checks `Move.type == "swap"` but the field was `undefined`, so swaps silently did nothing. Players spent busy time but no swap occurred. Also fixed the reversed notification message.

---

## Open Issues

### ~~2. Human Nuke Launch Does Not Set Country Busy~~ ✓ Fixed
**File:** `src/includes/Server/NukeGameServer.js:265`

Uncommented `Country.busy = Date.now() + cost;` so human players now get the same cooldown as bots after launching a nuke.

### 3. Air Defense `usable` Field Is Never Checked
**Files:** `NukeGameManager.js:578-599` (human), `NukeGameManager.js:376-384` (bot)

When air defense is built, a `usable` timestamp is calculated based on incoming rockets (line 155-168). But neither `hasAirDefense()` nor the bot air defense check ever validates `usable < Date.now()`. Air defense activates immediately after construction, making the cooldown calculation dead code.

### 4. Air Defense Protects All Cities in the Country
**File:** `NukeGameManager.js:578-599`

`hasAirDefense(cityname)` iterates all cities of the country that owns the target city. If ANY city has air defense, it intercepts. A single air defense unit in Istanbul protects Ankara, Izmir, Konya, and Antalya too. This may be intentional but is undocumented and potentially overpowered.

### 5. `hasAirDefense()` Destroys Air Defense as Side Effect
**File:** `NukeGameManager.js:594`

The function name implies a read-only check, but it mutates state:
```js
this.Game.Countries[c].cities[df].build = false; // destroys air defense
Game.SendGlobalData(); // broadcasts change
```
The air defense is removed during the check itself, before any interception logic runs.

### 6. Bot Zombie State Is Irreversible
**File:** `NukeGameManager.js:419, 453`

When a bot loses its nuke and has no empty cities, `zombie = true` is set permanently. Bots cannot clear bombed cities, so they can never recover. Zombie bots are not `lose = true`, so they count toward `remain` in `checkGame()`, blocking the win condition. The last human player must manually destroy each zombie bot's command center.

### 7. Win Condition Edge Case
**File:** `NukeGameManager.js:254-258`

Win requires `remainPlayer == 1 && remain == 1`. If 1 human + N zombie bots survive, `remain > 1` and the game continues indefinitely with bots doing nothing. The human must hunt down all zombie command centers.

### 8. Multiple Nukes Can Target the Same City
**File:** `NukeGameServer.js:252`

`target.bombed` is only checked at launch time. Two players can launch at the same city before the first arrives. The second nuke is wasted — it arrives at an already-bombed city with no build left, so no command center kill. No way to know at launch time that another nuke is inbound.

### 9. Clear/Build/AirDefense Moves Only Sent to Initiator
**Files:** `NukeGameServer.js:351, 432, 469`

These moves use `socket.emit()` (single player) while nuke launches use `socket.ToRoom()` (broadcast). Other players don't see build/clear progress, only the final result via `SendGlobalData()`. Inconsistent with nuke broadcast behavior.
