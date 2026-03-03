import * as THREE from "three";
import { create } from "zustand";

export type GameState = "start" | "playing" | "dead" | "leaderboard";

export interface Enemy {
  id: string;
  position: THREE.Vector3;
  hp: number;
  state: "patrol" | "chase" | "attack";
  patrolTarget: THREE.Vector3;
  lastShootTime: number;
}

export interface LootItem {
  id: string;
  type: "medkit" | "weapon";
  position: THREE.Vector3;
  collected: boolean;
}

export interface BulletTrail {
  id: string;
  from: THREE.Vector3;
  to: THREE.Vector3;
  createdAt: number;
}

export interface GameStoreState {
  // Screen
  gameState: GameState;
  playerName: string;

  // Player
  playerHP: number;
  playerPosition: THREE.Vector3;
  playerRotation: number; // Y angle
  kills: number;
  survivalTime: number; // seconds
  weaponUpgraded: boolean;
  shotDamage: number;

  // Enemies
  enemies: Enemy[];

  // Loot
  lootItems: LootItem[];

  // Safe zone
  zoneRadius: number;
  zoneCenterX: number;
  zoneCenterZ: number;
  playerInZone: boolean;

  // FX
  muzzleFlash: boolean;
  bulletTrails: BulletTrail[];
  showZoneWarning: boolean;

  // Actions
  setGameState: (state: GameState) => void;
  setPlayerName: (name: string) => void;
  startGame: () => void;
  resetGame: () => void;
  damagePlayer: (amount: number) => void;
  healPlayer: (amount: number) => void;
  setPlayerPosition: (pos: THREE.Vector3) => void;
  setPlayerRotation: (rot: number) => void;
  incrementKills: () => void;
  setSurvivalTime: (t: number) => void;
  damageEnemy: (id: string, amount: number) => void;
  updateEnemyState: (id: string, state: Enemy["state"]) => void;
  updateEnemyPosition: (id: string, pos: THREE.Vector3) => void;
  updateEnemyPatrolTarget: (id: string, target: THREE.Vector3) => void;
  updateEnemyLastShoot: (id: string, time: number) => void;
  collectLoot: (id: string) => void;
  setZoneRadius: (r: number) => void;
  setPlayerInZone: (inZone: boolean) => void;
  setShowZoneWarning: (show: boolean) => void;
  triggerMuzzleFlash: () => void;
  addBulletTrail: (from: THREE.Vector3, to: THREE.Vector3) => void;
  clearOldTrails: (now: number) => void;
  upgradeWeapon: () => void;
}

function generateEnemies(): Enemy[] {
  const enemies: Enemy[] = [];
  for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * Math.PI * 2;
    const dist = 40 + Math.random() * 80;
    const x = Math.cos(angle) * dist + (Math.random() - 0.5) * 20;
    const z = Math.sin(angle) * dist + (Math.random() - 0.5) * 20;
    enemies.push({
      id: `enemy-${i}`,
      position: new THREE.Vector3(x, 1, z),
      hp: 60,
      state: "patrol",
      patrolTarget: new THREE.Vector3(
        x + (Math.random() - 0.5) * 30,
        1,
        z + (Math.random() - 0.5) * 30,
      ),
      lastShootTime: 0,
    });
  }
  return enemies;
}

function generateLoot(): LootItem[] {
  const items: LootItem[] = [];
  // 10 medkits
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 100;
    items.push({
      id: `medkit-${i}`,
      type: "medkit",
      position: new THREE.Vector3(
        Math.cos(angle) * dist,
        0.5,
        Math.sin(angle) * dist,
      ),
      collected: false,
    });
  }
  // 5 weapon upgrades
  for (let i = 0; i < 5; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 80;
    items.push({
      id: `weapon-${i}`,
      type: "weapon",
      position: new THREE.Vector3(
        Math.cos(angle) * dist,
        0.5,
        Math.sin(angle) * dist,
      ),
      collected: false,
    });
  }
  return items;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameState: "start",
  playerName: "Ghost",

  playerHP: 100,
  playerPosition: new THREE.Vector3(0, 1, 0),
  playerRotation: 0,
  kills: 0,
  survivalTime: 0,
  weaponUpgraded: false,
  shotDamage: 25,

  enemies: [],
  lootItems: [],

  zoneRadius: 200,
  zoneCenterX: 0,
  zoneCenterZ: 0,
  playerInZone: true,

  muzzleFlash: false,
  bulletTrails: [],
  showZoneWarning: false,

  setGameState: (state) => set({ gameState: state }),
  setPlayerName: (name) => set({ playerName: name }),

  startGame: () => {
    set({
      gameState: "playing",
      playerHP: 100,
      playerPosition: new THREE.Vector3(0, 1, 0),
      playerRotation: 0,
      kills: 0,
      survivalTime: 0,
      weaponUpgraded: false,
      shotDamage: 25,
      enemies: generateEnemies(),
      lootItems: generateLoot(),
      zoneRadius: 200,
      zoneCenterX: 0,
      zoneCenterZ: 0,
      playerInZone: true,
      muzzleFlash: false,
      bulletTrails: [],
      showZoneWarning: false,
    });
  },

  resetGame: () => {
    set({ gameState: "start" });
  },

  damagePlayer: (amount) => {
    const { playerHP } = get();
    const newHP = Math.max(0, playerHP - amount);
    set({ playerHP: newHP });
    if (newHP <= 0) {
      set({ gameState: "dead" });
    }
  },

  healPlayer: (amount) => {
    const { playerHP } = get();
    set({ playerHP: Math.min(100, playerHP + amount) });
  },

  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  setPlayerRotation: (rot) => set({ playerRotation: rot }),
  incrementKills: () => set((s) => ({ kills: s.kills + 1 })),
  setSurvivalTime: (t) => set({ survivalTime: t }),

  damageEnemy: (id, amount) => {
    const { enemies, incrementKills } = get();
    const enemy = enemies.find((e) => e.id === id);
    if (!enemy) return;
    const newHP = enemy.hp - amount;
    if (newHP <= 0) {
      set({ enemies: enemies.filter((e) => e.id !== id) });
      incrementKills();
    } else {
      set({
        enemies: enemies.map((e) => (e.id === id ? { ...e, hp: newHP } : e)),
      });
    }
  },

  updateEnemyState: (id, state) => {
    set((s) => ({
      enemies: s.enemies.map((e) => (e.id === id ? { ...e, state } : e)),
    }));
  },

  updateEnemyPosition: (id, pos) => {
    set((s) => ({
      enemies: s.enemies.map((e) =>
        e.id === id ? { ...e, position: pos.clone() } : e,
      ),
    }));
  },

  updateEnemyPatrolTarget: (id, target) => {
    set((s) => ({
      enemies: s.enemies.map((e) =>
        e.id === id ? { ...e, patrolTarget: target.clone() } : e,
      ),
    }));
  },

  updateEnemyLastShoot: (id, time) => {
    set((s) => ({
      enemies: s.enemies.map((e) =>
        e.id === id ? { ...e, lastShootTime: time } : e,
      ),
    }));
  },

  collectLoot: (id) => {
    set((s) => ({
      lootItems: s.lootItems.map((l) =>
        l.id === id ? { ...l, collected: true } : l,
      ),
    }));
  },

  setZoneRadius: (r) => set({ zoneRadius: r }),

  setPlayerInZone: (inZone) => set({ playerInZone: inZone }),

  setShowZoneWarning: (show) => set({ showZoneWarning: show }),

  triggerMuzzleFlash: () => {
    set({ muzzleFlash: true });
    setTimeout(() => set({ muzzleFlash: false }), 120);
  },

  addBulletTrail: (from, to) => {
    const trail: BulletTrail = {
      id: `trail-${Date.now()}-${Math.random()}`,
      from: from.clone(),
      to: to.clone(),
      createdAt: Date.now(),
    };
    set((s) => ({ bulletTrails: [...s.bulletTrails.slice(-5), trail] }));
    setTimeout(() => {
      set((s) => ({
        bulletTrails: s.bulletTrails.filter((t) => t.id !== trail.id),
      }));
    }, 350);
  },

  clearOldTrails: (now) => {
    set((s) => ({
      bulletTrails: s.bulletTrails.filter((t) => now - t.createdAt < 350),
    }));
  },

  upgradeWeapon: () => {
    set({ weaponUpgraded: true, shotDamage: 40 });
  },
}));
