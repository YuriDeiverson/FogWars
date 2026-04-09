// hooks/useGameStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_ACHIEVEMENTS, Achievement, TILE_SIZE } from '@/constants/achievements';

// ── Types ────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Tile {
  key: string;
  lat: number;
  lng: number;
}

export interface RevealPoint {
  latitude: number;
  longitude: number;
}

interface GameState {
  // Auth
  user: User | null;
  isAuthLoading: boolean;

  // Map
  exploredTiles: Map<string, Tile>;
  revealedPoints: RevealPoint[];
  currentLocation: {
    latitude: number;
    longitude: number;
    speed?: number | null;
    heading?: number | null;
  } | null;
  lastLocation: { lat: number; lng: number } | null;
  isTracking: boolean;

  // Stats
  totalDistanceMeters: number;
  totalXP: number;
  level: number;

  // Achievements
  unlockedAchievements: Set<string>;
  pendingAchievements: Achievement[];

  // Actions
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setTracking: (val: boolean) => void;
  updateLocation: (coords: {
    latitude: number;
    longitude: number;
    speed?: number | null;
    heading?: number | null;
  }) => void;
  dismissAchievement: () => void;
  resetProgress: () => Promise<void>;

  // Internal helpers
  _checkAchievements: (lat: number, lng: number) => void;
  _persist: () => Promise<void>;

  // Computed
  getTileCount: () => number;
  getKm2: () => string;
  getDistanceKm: () => string;
  getXPForNextLevel: (level: number) => number;
}

// ── Helpers ──────────────────────────────────────────────────────
const KEYS = {
  TILES: '@we_tiles_v2',
  REVEAL: '@we_reveal_v1',
  USER: '@we_user_v2',
  ACHIEVEMENTS: '@we_achievements_v2',
  STATS: '@we_stats_v2',
};

const generateTilesAround = (lat: number, lng: number, radius = 2): Tile[] => {
  const tiles: Tile[] = [];
  const cx = Math.floor(lat / TILE_SIZE);
  const cy = Math.floor(lng / TILE_SIZE);
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (Math.sqrt(dx * dx + dy * dy) <= radius) {
        const tx = cx + dx;
        const ty = cy + dy;
        tiles.push({ key: `${tx}_${ty}`, lat: tx * TILE_SIZE, lng: ty * TILE_SIZE });
      }
    }
  }
  return tiles;
};

const haversine = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

let lastSaveTime = 0;

// ── Store ────────────────────────────────────────────────────────
export const useGameStore = create<GameState>((set, get) => ({
  user: null,
  isAuthLoading: true,
  exploredTiles: new Map(),
  revealedPoints: [],
  currentLocation: null,
  lastLocation: null,
  isTracking: false,
  totalDistanceMeters: 0,
  totalXP: 0,
  level: 1,
  unlockedAchievements: new Set(),
  pendingAchievements: [],

  // ── INIT ──────────────────────────────────────────────────────
  init: async () => {
    try {
      const [tilesRaw, revealRaw, userRaw, achRaw, statsRaw] = await Promise.all([
        AsyncStorage.getItem(KEYS.TILES),
        AsyncStorage.getItem(KEYS.REVEAL),
        AsyncStorage.getItem(KEYS.USER),
        AsyncStorage.getItem(KEYS.ACHIEVEMENTS),
        AsyncStorage.getItem(KEYS.STATS),
      ]);

      const tilesMap: Map<string, Tile> = tilesRaw
        ? new Map(JSON.parse(tilesRaw))
        : new Map();

      const unlockedSet: Set<string> = achRaw
        ? new Set(JSON.parse(achRaw))
        : new Set();

      const stats = statsRaw ? JSON.parse(statsRaw) : {};
      const user: User | null = userRaw ? JSON.parse(userRaw) : null;
      const revealedPoints: RevealPoint[] = revealRaw ? JSON.parse(revealRaw) : [];

      set({
        exploredTiles: tilesMap,
        revealedPoints,
        unlockedAchievements: unlockedSet,
        totalDistanceMeters: stats.totalDistanceMeters || 0,
        totalXP: stats.totalXP || 0,
        level: stats.level || 1,
        user,
        isAuthLoading: false,
      });
    } catch {
      set({ isAuthLoading: false });
    }
  },

  // ── AUTH ──────────────────────────────────────────────────────
  login: async (email: string, password: string) => {
    if (!email || !password) throw new Error('Preencha todos os campos');
    if (password.length < 6) throw new Error('Senha deve ter no mínimo 6 caracteres');
    // Troque aqui por Firebase ou Supabase em produção
    const user: User = {
      id: `user_${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    set({ user });
  },

  register: async (name: string, email: string, password: string) => {
    if (!name || !email || !password) throw new Error('Preencha todos os campos');
    if (password.length < 6) throw new Error('Senha deve ter no mínimo 6 caracteres');
    const user: User = {
      id: `user_${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    set({ user });
  },

  logout: async () => {
    await AsyncStorage.removeItem(KEYS.USER);
    set({ user: null });
  },

  // ── TRACKING ─────────────────────────────────────────────────
  setTracking: (val: boolean) => set({ isTracking: val }),

  updateLocation: (coords: {
    latitude: number;
    longitude: number;
    speed?: number | null;
    heading?: number | null;
  }) => {
    const state = get();
    const { lat: prevLat, lng: prevLng } = state.lastLocation || {};
    const newLat = coords.latitude;
    const newLng = coords.longitude;

    let addedDistance = 0;
    if (prevLat !== undefined && prevLng !== undefined) {
      const d = haversine(prevLat, prevLng, newLat, newLng);
      if (d < 500) addedDistance = d;
    }

    const newTiles = generateTilesAround(newLat, newLng, 2);
    const updated = new Map(state.exploredTiles);
    let changed = false;
    newTiles.forEach((t) => {
      if (!updated.has(t.key)) {
        updated.set(t.key, t);
        changed = true;
      }
    });

    const newTotal = state.totalDistanceMeters + addedDistance;

    // Save a sparse set of reveal points (avoid thousands of points)
    const prevReveal = state.revealedPoints;
    const last = prevReveal.length ? prevReveal[prevReveal.length - 1] : null;
    const revealStepMeters = 15;
    const shouldAddReveal =
      !last || haversine(last.latitude, last.longitude, newLat, newLng) >= revealStepMeters;
    const revealedPoints = shouldAddReveal
      ? [...prevReveal, { latitude: newLat, longitude: newLng }].slice(-2500)
      : prevReveal;

    set({
      currentLocation: {
        latitude: newLat,
        longitude: newLng,
        speed: coords.speed,
        heading: coords.heading,
      },
      lastLocation: { lat: newLat, lng: newLng },
      exploredTiles: changed ? updated : state.exploredTiles,
      revealedPoints,
      totalDistanceMeters: newTotal,
    });

    // Check achievements
    get()._checkAchievements(newLat, newLng);

    // Persist (max every 5s)
    const now = Date.now();
    if (now - lastSaveTime > 5000) {
      lastSaveTime = now;
      get()._persist();
    }
  },

  // ── ACHIEVEMENTS ─────────────────────────────────────────────
  _checkAchievements: (lat: number, lng: number) => {
    const { exploredTiles, unlockedAchievements, totalDistanceMeters } = get();
    const newUnlocked: Achievement[] = [];

    ALL_ACHIEVEMENTS.forEach((ach) => {
      if (unlockedAchievements.has(ach.id)) return;
      let unlocked = false;

      if (ach.type === 'coverage' && ach.threshold !== undefined) {
        unlocked = exploredTiles.size >= ach.threshold;
      } else if (ach.type === 'landmark' && ach.lat !== undefined && ach.lng !== undefined && ach.radius !== undefined) {
        unlocked = haversine(lat, lng, ach.lat, ach.lng) <= ach.radius;
      } else if (ach.type === 'distance' && ach.threshold !== undefined) {
        unlocked = totalDistanceMeters >= ach.threshold;
      }

      if (unlocked) newUnlocked.push(ach);
    });

    if (newUnlocked.length === 0) return;

    const addedXP = newUnlocked.reduce((sum, a) => sum + a.xp, 0);
    set((state) => {
      const newSet = new Set(state.unlockedAchievements);
      newUnlocked.forEach((a) => newSet.add(a.id));
      const newXP = state.totalXP + addedXP;
      const newLevel = Math.floor(1 + Math.sqrt(newXP / 1000));
      return {
        unlockedAchievements: newSet,
        totalXP: newXP,
        level: newLevel,
        pendingAchievements: [...state.pendingAchievements, ...newUnlocked],
      };
    });
    get()._persist();
  },

  dismissAchievement: () =>
    set((s) => ({ pendingAchievements: s.pendingAchievements.slice(1) })),

  // ── PERSIST ───────────────────────────────────────────────────
  _persist: async () => {
    const { exploredTiles, revealedPoints, unlockedAchievements, totalDistanceMeters, totalXP, level } = get();
    await Promise.all([
      AsyncStorage.setItem(KEYS.TILES, JSON.stringify(Array.from(exploredTiles.entries()))),
      AsyncStorage.setItem(KEYS.REVEAL, JSON.stringify(revealedPoints)),
      AsyncStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(Array.from(unlockedAchievements))),
      AsyncStorage.setItem(KEYS.STATS, JSON.stringify({ totalDistanceMeters, totalXP, level })),
    ]);
  },

  resetProgress: async () => {
    await Promise.all([
      AsyncStorage.removeItem(KEYS.TILES),
      AsyncStorage.removeItem(KEYS.REVEAL),
      AsyncStorage.removeItem(KEYS.ACHIEVEMENTS),
      AsyncStorage.removeItem(KEYS.STATS),
    ]);
    set({
      exploredTiles: new Map(),
      revealedPoints: [],
      unlockedAchievements: new Set(),
      totalDistanceMeters: 0,
      totalXP: 0,
      level: 1,
      pendingAchievements: [],
    });
  },

  // ── COMPUTED ──────────────────────────────────────────────────
  getTileCount: () => get().exploredTiles.size,
  getKm2: () => {
    const c = get().exploredTiles.size;
    return ((c * TILE_SIZE * TILE_SIZE * 111320 * 111320) / 1_000_000).toFixed(4);
  },
  getDistanceKm: () => (get().totalDistanceMeters / 1000).toFixed(2),
  getXPForNextLevel: (lvl: number) => lvl * lvl * 1000,
} as any));