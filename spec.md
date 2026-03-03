# StrikeZone - Mobile Battle Royale Game

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full 3D third-person shooter game inspired by PUBG, built with React Three Fiber and Three.js
- Mobile-optimized virtual joystick controls (left stick: movement, right stick: camera/aim)
- 3D open-world arena map with terrain, buildings, trees, rocks, cover objects
- Player character with third-person camera, smooth movement, strafing, and sprinting
- Shooting mechanics: tap fire button to shoot, bullet projectiles with visual trails
- Enemy AI bots: patrol, detect player, chase, and shoot back
- Health system: player HP bar, damage from enemy hits, death/respawn
- Kill counter and survival timer (score system)
- Shrinking safe zone mechanic (blue circle that damages players outside)
- Loot system: weapons and health packs scattered on the ground, tap to pick up
- Inventory HUD: current weapon, ammo count, health packs count
- Death screen with final stats (kills, survival time) and replay button
- High-quality visuals: PBR lighting, shadows, fog, post-processing (bloom, vignette)
- Animated grass and tree movement (wind shader)
- Particle effects: muzzle flash, bullet impacts, blood splatter, explosions
- Sound design placeholders (visual feedback substitutes)
- Mini-map in corner showing player position and zone boundary
- Start screen with PLAY button

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Set up React Three Fiber canvas with mobile-responsive full-screen layout
2. Build terrain: flat-to-hilly ground mesh with vertex displacement, grass texture
3. Create procedurally placed environment: buildings (box geometry), trees (cone+cylinder), rocks, cover objects
4. Implement player entity: capsule mesh, third-person camera with orbit, WASD + virtual joystick movement
5. Implement shooting: raycast or projectile-based, muzzle flash particles, bullet trail
6. Enemy AI system: spawn N bots, FSM (patrol/chase/attack), pathfinding via simple steering
7. Health and damage system: player HP, bot HP, hit detection
8. Safe zone: animated shrinking circle, out-of-zone damage over time
9. Loot spawning: weapons and medkits on ground, proximity pickup
10. HUD: HP bar, ammo, kills, timer, minimap, zone indicator
11. Game state machine: start -> playing -> dead -> results
12. Post-processing: bloom, vignette, color grading for cinematic look
13. Backend: leaderboard storing top scores (kills + survival time)
14. Wire frontend to backend for score submission and leaderboard display
