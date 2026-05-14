# Nukewar Mechanic Issues Report

## Fixed

### 1. Transport (Swap) Move Never Executes

**File:** `src/includes/Server/NukeGameServer.js:383`

The transport move was missing `type: "swap"` field. The server-side update loop checks `Move.type == "swap"` but the field was `undefined`, so swaps silently did nothing. Players spent busy time but no swap occurred. Also fixed the reversed notification message.

### ~~2. Human Nuke Launch Does Not Set Country Busy~~ ✓ Fixed

**File:** `src/includes/Server/NukeGameServer.js:265`

Uncommented `Country.busy = Date.now() + cost;` so human players now get the same cooldown as bots after launching a nuke.

---

## Open Issues

### 5. ~~`hasAirDefense()` Destroys Air Defense as Side Effect~~ ✓ Obsolete

**File:** `src/classes/NukeServer/NukeGameManager.js`

`hasAirDefense()` no longer exists as a standalone function in the current server logic.
Air defense consumption is now handled inline in the rocket interception block:

```js
if(city.build && city.build.type == "airdefense"){
    ADcity = ct;
    city.build = false;
    break;
}
```

This issue is obsolete as originally described because the old side-effecting checker function is gone.

### 10. ~~AD Did Not Prioritize Command-Center-Bound Missiles~~ ✓ Fixed

**File:** `src/classes/NukeServer/NukeGameManager.js`

The AD intercept loop iterated `Moves` in insertion order, so a scarce air defense
could be spent on a low-value incoming missile while a missile heading for the
command center was left untouched. Fixed by pre-sorting in-flight rockets so
those targeting a `center` city are processed first.

### 6. ~~Bot Zombie State Is Irreversible~~ (Fixed)

**File:** `NukeGameManager.js` — `updateBots()` rewritten

`Country.zombie` flag and all related checks removed. Bots now always stay active: on each tick they independently attempt to fire any ready launcher (attack step) and, when not busy, pick a weighted-random action — build launcher, build air defense, swap, or clear a bombed city. Bots can no longer get stuck as zombies, which also resolves the win-condition deadlock described in issue 7.

### 7. Win Condition Edge Case

**File:** `NukeGameManager.js:254-258`

Win requires `remainPlayer == 1 && remain == 1`. If 1 human + N zombie bots survive, `remain > 1` and the game continues indefinitely with bots doing nothing. The human must hunt down all zombie command centers.

### 8. Multiple Nukes Can Target the Same City

**File:** `NukeGameServer.js:252`

`target.bombed` is only checked at launch time. Two players can launch at the same city before the first arrives. The second nuke is wasted — it arrives at an already-bombed city with no build left, so no command center kill. No way to know at launch time that another nuke is inbound.

### 9. Clear/Build/AirDefense Moves Only Sent to Initiator

**Files:** `NukeGameServer.js:351, 432, 469`

These moves use `socket.emit()` (single player) while nuke launches use `socket.ToRoom()` (broadcast). Other players don't see build/clear progress, only the final result via `SendGlobalData()`. Inconsistent with nuke broadcast behavior.