// ───────────────────────────────────────────────────────────────────
// utils/api.ts — Secure Simulated Backend API Client
// ───────────────────────────────────────────────────────────────────

import { TEMPLES_INITIAL, BHAJANS_INITIAL, FESTIVALS_INITIAL } from '../data/initialData';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
  banned?: boolean;
}

export interface Temple {
  id: number;
  name: string;
  location: string;
  deity: string;
  timings: string;
  img: string;
  live: boolean;
  rating: number;
  dist: string;
  open: boolean;
  desc: string;
  history: string;
  mythology: string;
  significance: string;
  videoUrl?: string;
}

export interface Festival {
  name: string;
  date: string;
  desc: string;
  img: string;
}

export interface Bhajan {
  id: string;
  title: string;
  artist: string;
  duration: string;
  dur: number;
  cat: string;
  img: string;
  audio: string;
}

// Simulated Server Database State
let dbUsers: User[] = [
  { id: 'u1', name: 'Admin Devotee', email: 'admin@divya.com', role: 'admin' },
  { id: 'u2', name: 'Manager Devotee', email: 'manager@divya.com', role: 'manager' },
  { id: 'u3', name: 'Normal Devotee', email: 'user@divya.com', role: 'user' },
  { id: 'u4', name: 'Rahul Kumar', email: 'rahul@gmail.com', role: 'user' },
  { id: 'u5', name: 'Priya Sharma', email: 'priya@gmail.com', role: 'user' },
  { id: 'u6', name: 'Amit Patel', email: 'amit@gmail.com', role: 'user', banned: true },
];

let dbTemples: Temple[] = [...TEMPLES_INITIAL];
let dbFestivals: Festival[] = [...FESTIVALS_INITIAL];
let dbBhajans: Bhajan[] = [...BHAJANS_INITIAL];

// Simulated passwords map
const userPasswords: Record<string, string> = {
  'admin@divya.com': 'admin123',
  'manager@divya.com': 'manager123',
  'user@divya.com': 'user123',
  'rahul@gmail.com': 'user123',
  'priya@gmail.com': 'user123',
  'amit@gmail.com': 'user123',
};

// Global session tokens (simulation)
const sessionTokens: Record<string, string> = {}; // token -> userId

// Latency Simulation Helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Role Authorization Helper
function checkAuth(token?: string): User {
  if (!token || !sessionTokens[token]) {
    const error: any = new Error('401 Unauthorized: Session invalid or expired');
    error.status = 401;
    throw error;
  }
  const user = dbUsers.find((u) => u.id === sessionTokens[token]);
  if (!user) {
    const error: any = new Error('401 Unauthorized: User not found');
    error.status = 401;
    throw error;
  }
  if (user.banned) {
    const error: any = new Error('403 Forbidden: Your account is banned');
    error.status = 403;
    throw error;
  }
  return user;
}

function verifyRole(user: User, allowedRoles: ('user' | 'manager' | 'admin')[]) {
  if (!allowedRoles.includes(user.role)) {
    const error: any = new Error(`403 Forbidden: Role '${user.role}' lacks permission`);
    error.status = 403;
    throw error;
  }
}

export const api = {
  // ───────────────────── AUTH ENDPOINTS ─────────────────────
  async login(email: string, pass: string): Promise<{ user: User; token: string }> {
    await delay(600);
    const user = dbUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || userPasswords[email.toLowerCase()] !== pass) {
      const error: any = new Error('401 Unauthorized: Invalid email or password');
      error.status = 401;
      throw error;
    }
    if (user.banned) {
      const error: any = new Error('403 Forbidden: This account has been banned');
      error.status = 403;
      throw error;
    }
    const token = `tok_${Math.random().toString(36).substring(2)}_${user.id}`;
    sessionTokens[token] = user.id;
    return { user, token };
  },

  async register(name: string, email: string, pass: string): Promise<{ user: User; token: string }> {
    await delay(600);
    if (dbUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      const error: any = new Error('409 Conflict: Email already registered');
      error.status = 409;
      throw error;
    }
    const newUser: User = {
      id: `u_${Math.random().toString(36).substring(2)}`,
      name,
      email,
      role: 'user',
    };
    dbUsers.push(newUser);
    userPasswords[email.toLowerCase()] = pass;
    const token = `tok_${Math.random().toString(36).substring(2)}_${newUser.id}`;
    sessionTokens[token] = newUser.id;
    return { user: newUser, token };
  },

  // ───────────────────── TEMPLES ENDPOINTS ─────────────────────
  async getTemples(): Promise<Temple[]> {
    await delay(300);
    return [...dbTemples];
  },

  async addTemple(token: string, temple: Omit<Temple, 'id' | 'rating' | 'dist' | 'open'>): Promise<Temple> {
    await delay(500);
    const user = checkAuth(token);
    verifyRole(user, ['manager', 'admin']);

    const newTemple: Temple = {
      ...temple,
      id: dbTemples.length > 0 ? Math.max(...dbTemples.map((t) => t.id)) + 1 : 1,
      rating: 4.5,
      dist: `${(Math.random() * 10 + 1).toFixed(1)} km`,
      open: true,
    };
    dbTemples.unshift(newTemple); // Add to the top of list
    return newTemple;
  },

  async editTemple(token: string, id: number, updates: Partial<Temple>): Promise<Temple> {
    await delay(500);
    const user = checkAuth(token);
    verifyRole(user, ['manager', 'admin']);

    const idx = dbTemples.findIndex((t) => t.id === id);
    if (idx === -1) {
      const error: any = new Error('404 Not Found: Temple does not exist');
      error.status = 404;
      throw error;
    }
    dbTemples[idx] = { ...dbTemples[idx], ...updates };
    return dbTemples[idx];
  },

  async deleteTemple(token: string, id: number): Promise<{ success: boolean }> {
    await delay(500);
    const user = checkAuth(token);
    verifyRole(user, ['admin']); // ONLY ADMIN CAN DELETE TEMPLES

    const idx = dbTemples.findIndex((t) => t.id === id);
    if (idx === -1) {
      const error: any = new Error('404 Not Found: Temple does not exist');
      error.status = 404;
      throw error;
    }
    dbTemples.splice(idx, 1);
    return { success: true };
  },

  // ───────────────────── FESTIVALS ENDPOINTS ─────────────────────
  async getFestivals(): Promise<Festival[]> {
    await delay(200);
    return [...dbFestivals];
  },

  async addFestival(token: string, festival: Festival): Promise<Festival> {
    await delay(400);
    const user = checkAuth(token);
    verifyRole(user, ['manager', 'admin']);

    dbFestivals.push(festival);
    return festival;
  },

  async editFestival(token: string, originalName: string, updates: Partial<Festival>): Promise<Festival> {
    await delay(400);
    const user = checkAuth(token);
    verifyRole(user, ['manager', 'admin']);

    const idx = dbFestivals.findIndex((f) => f.name === originalName);
    if (idx === -1) {
      const error: any = new Error('404 Not Found: Festival not found');
      error.status = 404;
      throw error;
    }
    dbFestivals[idx] = { ...dbFestivals[idx], ...updates };
    return dbFestivals[idx];
  },

  // ───────────────────── BHAJANS ENDPOINTS ─────────────────────
  async getBhajans(): Promise<Bhajan[]> {
    await delay(200);
    return [...dbBhajans];
  },

  async addBhajan(token: string, bhajan: Omit<Bhajan, 'id' | 'dur'>): Promise<Bhajan> {
    await delay(400);
    const user = checkAuth(token);
    verifyRole(user, ['manager', 'admin']);

    // Parse duration "10:30" to seconds
    const parts = bhajan.duration.split(':');
    const durSec = parts.length === 2 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : 300;

    const newBhajan: Bhajan = {
      ...bhajan,
      id: String(dbBhajans.length + 1),
      dur: durSec,
    };
    dbBhajans.push(newBhajan);
    return newBhajan;
  },

  // ───────────────────── LIVESTREAMS ENDPOINTS ─────────────────────
  async editLivestream(token: string, id: number, live: boolean, videoUrl?: string): Promise<Temple> {
    await delay(400);
    const user = checkAuth(token);
    verifyRole(user, ['manager', 'admin']);

    const idx = dbTemples.findIndex((t) => t.id === id);
    if (idx === -1) {
      const error: any = new Error('404 Not Found: Temple not found');
      error.status = 404;
      throw error;
    }
    dbTemples[idx] = { ...dbTemples[idx], live, videoUrl };
    return dbTemples[idx];
  },

  // ───────────────────── USER MANAGEMENT ENDPOINTS ─────────────────────
  async getUsers(token: string): Promise<User[]> {
    await delay(400);
    const user = checkAuth(token);
    verifyRole(user, ['admin']); // ONLY ADMIN

    return [...dbUsers];
  },

  async banUser(token: string, userId: string, banned: boolean): Promise<User> {
    await delay(400);
    const user = checkAuth(token);
    verifyRole(user, ['admin']); // ONLY ADMIN

    const target = dbUsers.find((u) => u.id === userId);
    if (!target) {
      const error: any = new Error('404 Not Found: User not found');
      error.status = 404;
      throw error;
    }
    if (target.id === user.id) {
      const error: any = new Error('400 Bad Request: Cannot ban yourself');
      error.status = 400;
      throw error;
    }
    target.banned = banned;
    return target;
  },

  async updateUserRole(token: string, userId: string, role: 'user' | 'manager' | 'admin'): Promise<User> {
    await delay(400);
    const user = checkAuth(token);
    verifyRole(user, ['admin']); // ONLY ADMIN

    const target = dbUsers.find((u) => u.id === userId);
    if (!target) {
      const error: any = new Error('404 Not Found: User not found');
      error.status = 404;
      throw error;
    }
    if (target.id === user.id) {
      const error: any = new Error('400 Bad Request: Cannot change your own role');
      error.status = 400;
      throw error;
    }
    target.role = role;
    return target;
  },

  // ───────────────────── MANAGER MANAGEMENT ENDPOINTS ─────────────────────
  async createManager(token: string, name: string, email: string, pass: string): Promise<User> {
    await delay(400);
    const user = checkAuth(token);
    verifyRole(user, ['admin']); // ONLY ADMIN

    if (dbUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      const error: any = new Error('409 Conflict: Email already registered');
      error.status = 409;
      throw error;
    }

    const newManager: User = {
      id: `u_${Math.random().toString(36).substring(2)}`,
      name,
      email,
      role: 'manager',
    };
    dbUsers.push(newManager);
    userPasswords[email.toLowerCase()] = pass;
    return newManager;
  },

  async editManager(token: string, userId: string, updates: Partial<User>): Promise<User> {
    await delay(400);
    const user = checkAuth(token);
    verifyRole(user, ['admin']); // ONLY ADMIN

    const target = dbUsers.find((u) => u.id === userId);
    if (!target || target.role !== 'manager') {
      const error: any = new Error('404 Not Found: Manager not found');
      error.status = 404;
      throw error;
    }
    if (updates.name) target.name = updates.name;
    if (updates.email) target.email = updates.email;
    return target;
  },

  async removeManager(token: string, userId: string): Promise<{ success: boolean }> {
    await delay(400);
    const user = checkAuth(token);
    verifyRole(user, ['admin']); // ONLY ADMIN

    const idx = dbUsers.findIndex((u) => u.id === userId && u.role === 'manager');
    if (idx === -1) {
      const error: any = new Error('404 Not Found: Manager not found');
      error.status = 404;
      throw error;
    }
    dbUsers.splice(idx, 1);
    return { success: true };
  },

  // ───────────────────── ANALYTICS ENDPOINT ─────────────────────
  async getAnalytics(token: string) {
    await delay(400);
    const user = checkAuth(token);
    verifyRole(user, ['admin']); // ONLY ADMIN

    const activeStreamsCount = dbTemples.filter((t) => t.live).length;
    const popular = [...dbTemples]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map((t) => ({ name: t.name, rating: t.rating, visits: Math.floor(Math.random() * 2000 + 500) }));

    return {
      totalUsers: dbUsers.length,
      totalTemples: dbTemples.length,
      activeStreams: activeStreamsCount,
      popularTemples: popular,
      dailyUsers: Math.floor(Math.random() * 150 + 200), // simulated daily users
    };
  },
};
