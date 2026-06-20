/*
 ╔═══════════════════════════════════════════════════════════════════╗
 ║  DIVYA — Premium Spiritual Temple App (Single File — Enhanced)   ║
 ║                                                                   ║
 ║  SETUP:                                                           ║
 ║  1. npx create-expo-app divya --template blank-typescript        ║
 ║  2. cd divya                                                      ║
 ║  3. npm install @react-navigation/native                         ║
 ║     @react-navigation/bottom-tabs @react-navigation/native-stack  ║
 ║     react-native-screens react-native-safe-area-context           ║
 ║     zustand expo-av expo-font                                    ║
 ║  4. npx expo install react-native-gesture-handler                ║
 ║     react-native-reanimated                                      ║
 ║  5. Replace App.tsx with this file                               ║
 ║  6. In app.json set: "newArchEnabled": false                     ║
 ║  7. npx expo start -c                                             ║
 ╚═══════════════════════════════════════════════════════════════════╝
*/

import React, {
  useState, useEffect, useRef, useCallback, memo,
} from "react";
import {
  View, Text, Image, ScrollView, FlatList, Pressable,
  TextInput, KeyboardAvoidingView, Platform, RefreshControl,
  Animated, StatusBar, StyleSheet, Dimensions, ActivityIndicator,
  Modal, Switch,
} from "react-native";
import { NavigationContainer, useNavigation, useRoute, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { create } from "zustand";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as Font from "expo-font";
import An, {
  useSharedValue, useAnimatedStyle, withRepeat,
  withTiming, withDelay, withSequence, interpolate,
  Extrapolation,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

// ───────────────────── THEME ─────────────────────
const C = {
  saffron: "#FF8C42", saffronLight: "#FFB380", gold: "#D4A017",
  goldLight: "#F0D060", maroon: "#7A1F1F", maroonLight: "#A03030",
  warmWhite: "#FFF8F0", warmGray: "#F5EDE0", charcoal: "#2C2C2C",
  softGreen: "#4CAF50", white: "#FFFFFF",
};

// ───────────────────── DATA ─────────────────────
const DEITIES = [
  { id: "shiva", name: "Lord Shiva", icon: "bonfire" as const, color: "#3B5998" },
  { id: "krishna", name: "Lord Krishna", icon: "musical-notes" as const, color: "#6B4FA0" },
  { id: "ram", name: "Lord Ram", icon: "sunny" as const, color: "#D4772C" },
  { id: "hanuman", name: "Hanuman Ji", icon: "hand-right" as const, color: "#C0392B" },
  { id: "durga", name: "Maa Durga", icon: "shield" as const, color: "#8E2525" },
  { id: "kali", name: "Maa Kali", icon: "flame" as const, color: "#4A1A1A" },
  { id: "vishnu", name: "Lord Vishnu", icon: "infinite" as const, color: "#B8860B" },
  { id: "ganesha", name: "Lord Ganesha", icon: "flower" as const, color: "#CC7722" },
  { id: "lakshmi", name: "Maa Lakshmi", icon: "sparkles" as const, color: "#C06080" },
  { id: "saraswati", name: "Maa Saraswati", icon: "book" as const, color: "#5B8FA8" },
];

import { api, User, Temple, Festival, Bhajan } from "./utils/api";
import { TEMPLES_INITIAL, BHAJANS_INITIAL, FESTIVALS_INITIAL } from "./data/initialData";


const AARTI_SCHEDULE = [
  { time: "5:30", period: "AM", name: "Mangala Aarti", temple: "Kashi Vishwanath" },
  { time: "6:00", period: "AM", name: "Suprabhatam", temple: "Tirupati Balaji" },
  { time: "12:00", period: "PM", name: "Midday Aarti", temple: "Somnath Temple" },
  { time: "7:00", period: "PM", name: "Sandhya Aarti", temple: "Jagannath Puri" },
  { time: "9:00", period: "PM", name: "Shayan Aarti", temple: "Kashi Vishwanath" },
];

const BHAJAN_CATS = [
  { name: "Morning", icon: "sunny" as const, color: "#D4A017" },
  { name: "Aarti", icon: "flame" as const, color: "#FF8C42" },
  { name: "Chalisa", icon: "book" as const, color: "#7A1F1F" },
  { name: "Mantra", icon: "sparkles" as const, color: "#5B8FA8" },
  { name: "Kirtan", icon: "musical-notes" as const, color: "#6B4FA0" },
  { name: "Stuti", icon: "hand-left" as const, color: "#4CAF50" },
];

const QUICK_ACTIONS = [
  { icon: "radio" as const, label: "Live Darshan", color: "#e53935" },
  { icon: "musical-notes" as const, label: "Bhajans", color: "#1DB954" },
  { icon: "business" as const, label: "Temples", color: C.gold },
  { icon: "calendar" as const, label: "Festivals", color: C.maroon },
  { icon: "om" as const, label: "Spiritual Guide", color: "#6B4FA0" },
  { icon: "navigate" as const, label: "Nearby", color: C.saffron },
];

const BADGES = [
  { icon: "trophy", label: "Shiva Bhakt", earned: false, desc: "Visit 3 Shiva temples" },
  { icon: "star", label: "Temple Explorer", earned: false, desc: "Visit 10 temples" },
  { icon: "headphones", label: "Bhajan Listener", earned: false, desc: "Listen to 50 bhajans" },
  { icon: "flame", label: "7-Day Streak", earned: false, desc: "Open app 7 days" },
  { icon: "eye", label: "Darshan Sevak", earned: false, desc: "Watch 5 live darshans" },
  { icon: "lotus", label: "Ram Bhakt", earned: false, desc: "Visit 3 Ram temples" },
];

const PANCHANG = {
  tithi: "Shukla Dashami",
  nakshatra: "Pushya",
  yoga: "Shubha",
  karana: "Taitila",
  sunrise: "6:12 AM",
  sunset: "6:48 PM",
  moonrise: "8:30 PM",
  paksha: "Shukla Paksha",
  rahu: "7:30 AM - 9:00 AM",
};

const AI_MAP: Record<string, string> = {
  "tell me about kedarnath temple": "Kedarnath is one of twelve Jyotirlingas at 3,583m in Garhwal Himalayas. After Kurukshetra, Pandavas sought Shiva who hid as a bull; his hump remained at Kedarnath. Revived by Adi Shankaracharya in 8th century. The trek is considered tapasya.",
  "why is mahadev worshipped": "Lord Shiva is the Supreme Being in Shaivism — destroyer of ignorance, lord of meditation, arts, yoga. The lingam represents formless infinite. Worshipped for moksha, wisdom, dissolution of ego.",
  "explain hanuman chalisa": "40-verse hymn by Goswami Tulsidas in 16th century Awadhi. Describes Hanuman's strength, devotion to Ram, wisdom. Brings courage, protection, peace. Recited on Tuesdays and Saturdays.",
  "best temples to visit nearby": "Share your city for specific recommendations.\n\nMust-visit categories:\n• Jyotirlingas — 12 Shiva temples\n• Char Dham — four holiest sites\n• Shakti Peethas — 51 Goddess temples\n• Divya Desams — 108 Vishnu temples",
};

function aiReply(t: string): string {
  const l = t.toLowerCase().trim();
  if (AI_MAP[l]) return AI_MAP[l];
  if (l.includes("shiva") || l.includes("mahadev")) return "Lord Shiva — Supreme ascetic, destroyer of ignorance, lord of meditation. Abode: Mount Kailash. Depicted with Ganges from matted hair, crescent moon, third eye of wisdom.";
  if (l.includes("krishna")) return "Eighth avatar of Vishnu, central figure of Bhagavad Gita. From Vrindavan's playful child to Arjuna's charioteer — teaches dharma, devotion, divine love.";
  if (l.includes("ram")) return "Seventh avatar of Vishnu, embodiment of dharma. Life in Ramayana guides ideal conduct. Maryada Purushottam — the perfect man.";
  if (l.includes("hanuman")) return "Embodiment of devotion, strength, selfless service. Greatest devotee of Ram. Immortal (Chiranjeevi). Worshipped for protection and removing obstacles.";
  if (l.includes("durga") || l.includes("kali")) return "Maa Durga — warrior goddess of shakti. Created by all gods to defeat Mahishasura. Kali is her fierce form representing time's destructive aspect.";
  if (l.includes("temple") || l.includes("mandir")) return "Temples are sacred energy centers per vastu shastra. Sanctum houses deity energized through prana pratishtha. Each has unique significance. Ask about a specific temple!";
  if (l.includes("ganesha") || l.includes("ganesh")) return "Remover of obstacles, worshipped first in any ritual. Created by Parvati, given elephant head by Shiva. Represents wisdom, new beginnings, prosperity.";
  return "Thank you for your question. I can help with temples, deities, scriptures, festivals, and spiritual practices. Could you be more specific?";
}

// ───────────────────── HELPERS ─────────────────────
const im = (s: string, w: number, h: number) => `https://picsum.photos/seed/${s}/${w}/${h}`;
const ct = (l: string) => l.split(",")[0].trim();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const grt = () => { const h = new Date().getHours(); return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening"; };

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr); const n = new Date();
  d.setHours(0, 0, 0, 0); n.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((d.getTime() - n.getTime()) / 86400000));
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

// ───────────────────── STORES ─────────────────────
interface AppS {
  onboarded: boolean; selDeities: string[]; saved: number[];
  badges: string[]; darshanCount: number; bhajanCount: number; streak: number;
  toast: string | null;
  currentUser: User | null;
  authToken: string | null;
  temples: Temple[];
  festivals: Festival[];
  bhajans: Bhajan[];
  login: (user: User, token: string) => void;
  logout: () => void;
  setTemples: (ts: Temple[]) => void;
  setFestivals: (fs: Festival[]) => void;
  setBhajans: (bs: Bhajan[]) => void;
  fetchData: () => Promise<void>;
  finishOnb: (d: string[]) => void; togDeity: (id: string) => void;
  saveTmp: (id: number) => void; earnBadge: (id: string) => void;
  bumpDarshan: () => void; bumpBhajan: () => void; setStreak: (n: number) => void;
  showToast: (m: string) => void;
}
const useApp = create<AppS>((set, get) => ({
  onboarded: false, selDeities: [], saved: [], badges: [], darshanCount: 0, bhajanCount: 0, streak: 1,
  toast: null,
  currentUser: null,
  authToken: null,
  temples: TEMPLES_INITIAL,
  festivals: FESTIVALS_INITIAL,
  bhajans: BHAJANS_INITIAL,
  login: (user, token) => set({ currentUser: user, authToken: token }),
  logout: () => set({ currentUser: null, authToken: null }),
  setTemples: (ts) => set({ temples: ts }),
  setFestivals: (fs) => set({ festivals: fs }),
  setBhajans: (bs) => set({ bhajans: bs }),
  fetchData: async () => {
    try {
      const ts = await api.getTemples();
      const fs = await api.getFestivals();
      const bs = await api.getBhajans();
      set({ temples: ts, festivals: fs, bhajans: bs });
    } catch (e) {
      console.log("Fetch initial data error", e);
    }
  },
  finishOnb: (d) => set({ onboarded: true, selDeities: d }),
  togDeity: (id) => set((st) => ({ selDeities: st.selDeities.includes(id) ? st.selDeities.filter((x) => x !== id) : [...st.selDeities, id] })),
  saveTmp: (id) => set((st) => ({ saved: st.saved.includes(id) ? st.saved : [...st.saved, id] })),
  earnBadge: (id) => set((st) => ({ badges: st.badges.includes(id) ? st.badges : [...st.badges, id] })),
  bumpDarshan: () => set((st) => { const c = st.darshanCount + 1; return { darshanCount: c, badges: c >= 5 && !st.badges.includes("darshan") ? [...st.badges, "darshan"] : st.badges }; }),
  bumpBhajan: () => set((st) => { const c = st.bhajanCount + 1; return { bhajanCount: c, badges: c >= 5 && !st.badges.includes("bhajan") ? [...st.badges, "bhajan"] : st.badges }; }),
  setStreak: (n) => set({ streak: n }),
  showToast: (m) => { set({ toast: m }); setTimeout(() => set({ toast: null }), 2500); },
}));

interface PlayerS {
  cur: Bhajan | null; playing: boolean; pos: number; dur: number;
  shuffle: boolean; repeat: "off" | "all" | "one"; queue: Bhajan[];
  play: (b: Bhajan) => void; toggle: () => void; seek: (p: number) => void;
  next: () => void; prev: () => void; togShuffle: () => void; togRepeat: () => void;
  close: () => void; setPos: (p: number) => void; setDur: (d: number) => void;
}
const usePlayer = create<PlayerS>((set, get) => ({
  cur: null, playing: false, pos: 0, dur: 0, shuffle: false, repeat: "off", queue: BHAJANS_INITIAL,
  play: (b) => set({ cur: b, playing: true, pos: 0, dur: b.dur, queue: get().queue }),
  toggle: () => set((st) => ({ playing: !st.playing })),
  seek: (p) => set({ pos: p }),
  next: () => {
    const st = get();
    if (!st.cur) return;
    const q = st.shuffle ? [...st.queue].sort(() => Math.random() - 0.5) : st.queue;
    const i = q.findIndex((x) => x.id === st.cur!.id);
    const nx = st.repeat === "one" ? st.cur : q[(i + 1) % q.length];
    set({ cur: nx, playing: true, pos: 0, dur: nx.dur });
  },
  prev: () => {
    const st = get();
    if (!st.cur || st.pos > 3) return set({ pos: 0 });
    const q = st.queue;
    const i = q.findIndex((x) => x.id === st.cur!.id);
    const pv = q[(i - 1 + q.length) % q.length];
    set({ cur: pv, playing: true, pos: 0, dur: pv.dur });
  },
  togShuffle: () => set((st) => ({ shuffle: !st.shuffle })),
  togRepeat: () => set((st) => ({ repeat: st.repeat === "off" ? "all" : st.repeat === "all" ? "one" : "off" })),
  close: () => set({ cur: null, playing: false, pos: 0 }),
  setPos: (p) => set({ pos: p }),
  setDur: (d) => set({ dur: d }),
}));

// ───────────────────── AUDIO ENGINE ─────────────────────
let soundRef: Audio.Sound | null = null;
let posInterval: ReturnType<typeof setInterval> | null = null;

async function loadAndPlay(url: string, onStatus: (s: any) => void) {
  try {
    if (soundRef) { await soundRef.unloadAsync(); soundRef = null; }
    if (posInterval) { clearInterval(posInterval); posInterval = null; }
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
    const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true }, onStatus);
    soundRef = sound;
  } catch (e) {
    console.log("Audio error:", e);
  }
}

async function audioToggle(playing: boolean) {
  if (!soundRef) return;
  try { playing ? await soundRef.playAsync() : await soundRef.pauseAsync(); } catch (e) { console.log(e); }
}

async function audioSeek(pos: number, dur: number) {
  if (!soundRef) return;
  try { await soundRef.setPositionAsync((pos / 100) * (dur * 1000)); } catch (e) { console.log(e); }
}

function startPosTracking(onPos: (p: number) => void) {
  if (posInterval) clearInterval(posInterval);
  posInterval = setInterval(async () => {
    if (!soundRef) return;
    try {
      const s = await soundRef.getStatusAsync();
      if (s.isLoaded && s.positionMillis !== undefined && s.durationMillis !== undefined && s.durationMillis > 0) {
        onPos((s.positionMillis / s.durationMillis) * 100);
      }
    } catch (e) { /* ignore */ }
  }, 250);
}

function stopPosTracking() {
  if (posInterval) { clearInterval(posInterval); posInterval = null; }
}

// ───────────────────── STYLES ─────────────────────
const SS = StyleSheet.create({
  warm: { backgroundColor: C.warmWhite },
  card: { backgroundColor: C.white, borderRadius: 18, overflow: "hidden", shadowColor: "rgba(122,31,31,0.07)", shadowOffset: { width: 0, height: 2 }, shadowRadius: 20, shadowOpacity: 1, elevation: 3 },
  cardLg: { backgroundColor: C.white, borderRadius: 22, overflow: "hidden", shadowColor: "rgba(122,31,31,0.12)", shadowOffset: { width: 0, height: 8 }, shadowRadius: 32, shadowOpacity: 1, elevation: 6 },
  sHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 14 },
  sTitle: { fontSize: 21, fontWeight: "700", color: C.charcoal },
  sAct: { fontSize: 13, fontWeight: "700", color: C.saffron },
  hScroll: { paddingHorizontal: 20, gap: 14, paddingBottom: 8 },
  liveB: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#e53935", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  liveD: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.white },
  liveT: { fontSize: 9, fontWeight: "800", color: C.white },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.warmGray },
  chipA: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.saffron, borderWidth: 1.5, borderColor: C.saffron },
  chipT: { fontSize: 13, fontWeight: "600", color: "#888" },
  chipTA: { fontSize: 13, fontWeight: "600", color: C.white },
  searchW: { marginHorizontal: 20, position: "relative" as const },
  searchI: { width: "100%", paddingVertical: 14, paddingLeft: 44, paddingRight: 16, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.warmGray, borderRadius: 14, fontSize: 14, color: C.charcoal },
});

// ───────────────────── SHARED COMPONENTS ─────────────────────
function Toast() {
  const toast = useApp((s) => s.toast);
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(20)).current;
  useEffect(() => { Animated.parallel([Animated.timing(op, { toValue: toast ? 1 : 0, duration: 250, useNativeDriver: true }), Animated.timing(ty, { toValue: toast ? 0 : 20, duration: 250, useNativeDriver: true })]).start(); }, [toast, op, ty]);
  if (!toast) return null;
  return (
    <Animated.View style={{ position: "absolute", bottom: 100, left: "50%", marginLeft: -120, width: 240, backgroundColor: C.charcoal, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, zIndex: 200, opacity: op, transform: [{ translateY: ty }] }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: C.white, textAlign: "center" }}>{toast}</Text>
    </Animated.View>
  );
}

function SecHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={SS.sHead}>
      <Text style={[SS.sTitle, { fontFamily: "serif" }]}>{title}</Text>
      {action && onAction ? <Pressable onPress={onAction}><Text style={SS.sAct}>{action}</Text></Pressable> : null}
    </View>
  );
}

function LiveBadge() {
  const pulse = useSharedValue(1);
  useEffect(() => { pulse.value = withRepeat(withTiming(0.3, { duration: 800 }), -1, true); }, [pulse]);
  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <View style={SS.liveB}>
      <An.View style={[SS.liveD, dotStyle]} />
      <Text style={SS.liveT}>LIVE</Text>
    </View>
  );
}

// ───────────────────── GLOWING PARTICLES ─────────────────────
function Particles({ count = 8 }: { count?: number }) {
  return (
    <View style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 22, pointerEvents: "none" }} >
      {Array.from({ length: count }).map((_, i) => {
        const left = 10 + Math.random() * 80;
        const top = 10 + Math.random() * 80;
        const size = 2 + Math.random() * 3;
        const del = i * 400;
        return <Particle key={i} left={left} top={top} size={size} delay={del} />;
      })}
    </View>
  );
}

function Particle({ left, top, size, delay }: { left: number; top: number; size: number; delay: number }) {
  const op = useSharedValue(0);
  const y = useSharedValue(0);
  useEffect(() => {
    op.value = withDelay(delay, withRepeat(withSequence(withTiming(0.7, { duration: 2000 }), withTiming(0, { duration: 1500 })), -1));
    y.value = withDelay(delay, withRepeat(withSequence(withTiming(-20, { duration: 2000 }), withTiming(0, { duration: 1500 })), -1));
  }, [op, y, delay]);
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateY: y.value }], position: "absolute", left: `${left}%`, top: `${top}%`, width: size, height: size, borderRadius: size / 2, backgroundColor: C.goldLight }));
  return <An.View style={style} />;
}

// ───────────────────── GLOWING BORDER ─────────────────────
function GlowBorder({ children, style }: { children: React.ReactNode; style?: any }) {
  const glow = useSharedValue(0);
  useEffect(() => { glow.value = withRepeat(withSequence(withTiming(1, { duration: 2000 }), withTiming(0.3, { duration: 2000 })), -1); }, [glow]);
  const borderStyle = useAnimatedStyle(() => ({
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: interpolate(glow.value, [0.3, 1], [8, 25]),
    shadowOpacity: interpolate(glow.value, [0.3, 1], [0.15, 0.4]),
    borderRadius: 22,
  }));
  return <An.View style={[borderStyle, style]}>{children}</An.View>;
}

// ───────────────────── MINI PLAYER ─────────────────────
function MiniPlayer() {
  const { cur, playing, pos, dur, toggle, next, close, setPos } = usePlayer();
  const slideY = useSharedValue(100);
  useEffect(() => {
    slideY.value = withTiming(cur ? 0 : 100, { duration: 300 });
  }, [cur]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));
  if (!cur) return null;
  return (
    <An.View style={[{ position: "absolute", bottom: 72, left: 12, right: 12, zIndex: 50, backgroundColor: C.charcoal, borderRadius: 16, padding: 10, flexDirection: "row", alignItems: "center", gap: 10 }, animatedStyle]}>
      <View style={{ position: "absolute", top: 0, left: 14, right: 14, height: 2.5, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 2 }}>
        <View style={{ height: "100%", backgroundColor: C.saffron, width: `${pos}%`, borderRadius: 2 }} />
      </View>
      <Pressable onPress={() => navRef?.navigate("FullPlayer" as never)} style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
        <Image source={{ uri: im(`${cur.img}-mp`, 100, 100) }} style={{ width: 42, height: 42, borderRadius: 10 }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: C.white }}>{cur.title}</Text>
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{cur.artist}</Text>
        </View>
      </Pressable>
      <Pressable onPress={() => { audioToggle(playing); toggle(); }} style={{ padding: 4 }}><Ionicons name={playing ? "pause" : "play"} size={20} color={C.white} /></Pressable>
      <Pressable onPress={() => { next(); const st = usePlayer.getState(); if (st.cur) loadAndPlay(st.cur.audio, () => {}); startPosTracking(usePlayer.getState().setPos); }} style={{ padding: 4 }}><Ionicons name="play-forward" size={16} color={C.white} /></Pressable>
      <Pressable onPress={() => { stopPosTracking(); close(); }} style={{ padding: 4 }}><Ionicons name="close" size={16} color={C.white} /></Pressable>
    </An.View>
  );
}

// ───────────────────── AI FAB ─────────────────────
function AIFab() {
  const floatY = useSharedValue(0);
  const glowR = useSharedValue(15);
  useEffect(() => {
    floatY.value = withRepeat(withSequence(withTiming(-6, { duration: 1500 }), withTiming(0, { duration: 1500 })), -1);
    glowR.value = withRepeat(withSequence(withTiming(30, { duration: 2000 }), withTiming(15, { duration: 2000 })), -1);
  }, [floatY, glowR]);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
    shadowColor: C.gold, shadowOffset: { width: 0, height: 0 },
    shadowRadius: glowR.value, shadowOpacity: 0.5, borderRadius: 28,
  }));
  return (
    <An.View style={{ position: "absolute", bottom: 80, right: 20, zIndex: 50 }}>
      <An.View style={fabStyle}>
        <Pressable onPress={() => navRef?.navigate("AIChat" as never)} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "linear-gradient(135deg, #D4A017, #FF8C42)", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="sparkles" size={24} color={C.white} />
        </Pressable>
      </An.View>
    </An.View>
  );
}

// ───────────────────── SKELETON ─────────────────────
function Skeleton({ w, h, r = 12, style }: { w: number; h: number; r?: number; style?: any }) {
  const op = useSharedValue(0.3);
  useEffect(() => { op.value = withRepeat(withSequence(withTiming(0.6, { duration: 800 }), withTiming(0.3, { duration: 800 })), -1); }, [op]);
  const s = useAnimatedStyle(() => ({ opacity: op.value, width: w, height: h, borderRadius: r, backgroundColor: C.warmGray }));
  return <An.View style={[s, style]} />;
}

function Splash({ onDone }: { onDone: () => void }) {
  const sc = useSharedValue(0); const op = useSharedValue(0); const txt = useSharedValue(0);
  useEffect(() => {
    sc.value = withSequence(withTiming(1.2, { duration: 600 }), withTiming(1, { duration: 300 }));
    op.value = withTiming(1, { duration: 600 });
    txt.value = withDelay(800, withTiming(1, { duration: 500 }));
    const t = setTimeout(onDone, 2200); return () => clearTimeout(t);
  }, []);
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sc.value }],
    opacity: op.value,
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: txt.value,
  }));
  return (
    <View style={{ flex: 1, backgroundColor: "#1a0800", alignItems: "center", justifyContent: "center" }}>
      <An.View style={[{ width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, borderColor: "rgba(212,160,23,0.4)", backgroundColor: "rgba(212,160,23,0.08)", alignItems: "center", justifyContent: "center" }, ringStyle]}>
        <Text style={{ fontSize: 36, color: C.gold }}>ॐ</Text>
      </An.View>
      <An.View style={[{ marginTop: 24, alignItems: "center" }, textStyle]}>
        <Text style={{ fontSize: 32, fontWeight: "700", color: C.warmWhite, fontFamily: "serif" }}>Sanatan</Text>
        <Text style={{ fontSize: 14, color: "rgba(255,248,240,0.5)", marginTop: 8 }}>Your Spiritual Companion</Text>
      </An.View>
    </View>
  );
}

// ───────────────────── ONBOARDING ─────────────────────
function Onboarding({ onDone }: { onDone: () => void }) {
  const { selDeities, togDeity, finishOnb } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: "#1a0800" }}>
      <View style={{ alignItems: "center", paddingTop: 50, paddingBottom: 10, paddingHorizontal: 24 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 1.5, borderColor: "rgba(212,160,23,0.4)", backgroundColor: "rgba(212,160,23,0.08)", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 28, color: C.gold }}>ॐ</Text>
        </View>
        <Text style={{ fontSize: 30, fontWeight: "600", color: C.warmWhite, marginTop: 20, textAlign: "center", fontFamily: "serif" }}>Begin Your Spiritual Journey</Text>
        <Text style={{ fontSize: 14, color: "rgba(255,248,240,0.6)", marginTop: 8, textAlign: "center", lineHeight: 22 }}>Select your favorite deities to personalize your experience</Text>
      </View>
      <FlatList data={DEITIES} numColumns={2} showsVerticalScrollIndicator={false} columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }} contentContainerStyle={{ paddingVertical: 20, gap: 12, flex: 1 }} keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const sel = selDeities.includes(item.id);
          return (
            <Pressable onPress={() => togDeity(item.id)} style={{ flex: 1, paddingVertical: 20, paddingHorizontal: 12, borderRadius: 18, alignItems: "center", backgroundColor: sel ? "rgba(212,160,23,0.12)" : "rgba(255,255,255,0.06)", borderWidth: 1.5, borderColor: sel ? C.gold : "rgba(255,255,255,0.08)" }}>
              {sel && <View style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: C.gold, alignItems: "center", justifyContent: "center" }}><Ionicons name="checkmark" size={10} color={C.white} /></View>}
              <View style={{ width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 10, backgroundColor: `${item.color}22` }}><Ionicons name={item.icon} size={22} color={item.color} /></View>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "rgba(255,248,240,0.85)" }}>{item.name}</Text>
            </Pressable>
          );
        }} />
      <View style={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 16 }}>
        <Pressable onPress={() => { finishOnb(selDeities); onDone(); }} disabled={selDeities.length === 0} style={{ width: "100%", paddingVertical: 16, borderRadius: 16, alignItems: "center", backgroundColor: selDeities.length > 0 ? C.saffron : "rgba(255,255,255,0.2)" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: selDeities.length > 0 ? C.white : "rgba(255,255,255,0.4)" }}>Continue</Text>
        </Pressable>
        <Text style={{ textAlign: "center", color: "rgba(255,248,240,0.3)", fontSize: 11, marginTop: 10 }}>You can update preferences in Settings</Text>
      </View>
    </View>
  );
}

function getTempleCategory(name: string): string[] {
  const cats: string[] = [];
  const jyotirlingas = ["Somnath Temple", "Mallikarjuna Temple", "Mahakaleshwar Temple", "Omkareshwar Temple", "Kedarnath Temple", "Bhimashankar Temple", "Kashi Vishwanath Temple", "Trimbakeshwar Temple", "Vaidyanath Temple", "Nageshwar Jyotirlinga", "Ramanathaswamy Temple", "Grishneshwar Temple"];
  const chardham = ["Badrinath Temple", "Dwarkadhish Temple", "Jagannath Temple", "Ramanathaswamy Temple"];
  const shaktipeeths = ["Vaishno Devi Temple", "Kamakhya Temple", "Kalighat Kali Temple", "Jwala Ji Temple", "Naina Devi Temple", "Chintpurni Temple"];
  const mostvisited = ["Tirumala Venkateswara Temple", "Siddhivinayak Temple", "Shirdi Sai Baba Temple", "Golden Temple", "Meenakshi Amman Temple", "Padmanabhaswamy Temple"];
  const krishna = ["Banke Bihari Temple", "Prem Mandir", "ISKCON Temple Vrindavan", "Dwarkadhish Temple"];
  const ram = ["Ram Mandir Ayodhya", "Kanak Bhawan"];
  const hanuman = ["Hanuman Garhi", "Sankat Mochan Hanuman Temple", "Salasar Balaji Temple", "Mehandipur Balaji Temple"];
  const south = ["Brihadeeswara Temple", "Virupaksha Temple", "Murudeshwar Temple", "Tirumala Venkateswara Temple", "Ramanathaswamy Temple", "Padmanabhaswamy Temple", "Meenakshi Amman Temple"];

  if (jyotirlingas.includes(name)) cats.push("Jyotirlingas");
  if (chardham.includes(name)) cats.push("Char Dham");
  if (shaktipeeths.includes(name)) cats.push("Shakti Peeths");
  if (mostvisited.includes(name)) cats.push("Most Visited");
  if (krishna.includes(name)) cats.push("Krishna");
  if (ram.includes(name)) cats.push("Ram");
  if (hanuman.includes(name)) cats.push("Hanuman");
  if (south.includes(name)) cats.push("South Indian");
  return cats;
}

// ───────────────────── HOME SCREEN ─────────────────────
function HomeScreen() {
  const temples = useApp((s) => s.temples);
  const bhajans = useApp((s) => s.bhajans);
  const festivals = useApp((s) => s.festivals);
  const fetchData = useApp((s) => s.fetchData);

  const { navigate } = useNavigation() as any;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popCat, setPopCat] = useState("All");
  
  const popCats = ["All", "Jyotirlingas", "Char Dham", "Shakti Peeths", "Most Visited", "Krishna", "Ram", "Hanuman", "South Indian"];
  
  const featured = temples[0] || TEMPLES_INITIAL[0];
  const upcomingFest = festivals.find((f) => daysUntil(f.date) > 0) || festivals[0] || FESTIVALS_INITIAL[0];
  const countdown = daysUntil(upcomingFest.date);

  const filteredPopular = temples.filter((t) => {
    if (popCat === "All") return true;
    return getTempleCategory(t.name).includes(popCat);
  });

  useEffect(() => {
    fetchData().then(() => setLoading(false));
  }, []);

  const handlePlayBhajan = useCallback((b: Bhajan) => {
    const st = usePlayer.getState();
    usePlayer.getState().play(b);
    useApp.getState().bumpBhajan();
    useApp.getState().showToast(`Now playing: ${b.title}`);
    loadAndPlay(b.audio, (status) => {
      if (status.isLoaded && status.durationMillis) {
        usePlayer.getState().setDur(status.durationMillis / 1000);
      }
      if (status.didJustFinish) {
        usePlayer.getState().next();
        const nx = usePlayer.getState().cur;
        if (nx) loadAndPlay(nx.audio, () => {});
      }
    });
    startPosTracking(usePlayer.getState().setPos);
  }, []);

  if (loading) {
    return (
      <ScrollView style={SS.warm} contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20 }}>
        <Skeleton w={120} h={16} /><Skeleton w={200} h={30} r={8} style={{ marginTop: 4 }} />
        <Skeleton w={W - 40} h={H * 0.35} r={22} style={{ marginTop: 16 }} />
        <View style={{ flexDirection: "row", gap: 16, marginTop: 20 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} w={56} h={72} r={28} />)}
        </View>
        <Skeleton w={180} h={22} r={8} style={{ marginTop: 20 }} />
        <View style={{ flexDirection: "row", gap: 14, marginTop: 14 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} w={140} h={200} r={18} />)}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchData(); setRefreshing(false); }} tintColor={C.saffron} />} contentContainerStyle={{ paddingBottom: 20 }} style={SS.warm}>
      {/* Header */}
      <View style={{ paddingTop: 56, paddingBottom: 12, paddingHorizontal: 20 }}>
        <Text style={{ color: C.saffron, fontWeight: "700", fontSize: 13 }}>{grt()}, Devotee</Text>
        <Text style={{ fontFamily: "serif", fontSize: 28, fontWeight: "700", color: C.charcoal }}>Divya</Text>
      </View>

      {/* Daily Darshan Hero */}
      <GlowBorder style={{ marginHorizontal: 20 }}>
        <View style={{ borderRadius: 22, overflow: "hidden", height: H * 0.37, position: "relative" }}>
          <Image source={{ uri: im(`${featured.img}-hero`, 800, 500) }} style={{ width: "100%", height: "100%", position: "absolute" }} />
          <Particles count={10} />
          <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(26,8,0,0.55)" }} />
          <View style={{ position: "absolute", inset: 0, justifyContent: "flex-end", padding: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <LiveBadge />
              <Text style={{ fontSize: 10, color: C.goldLight, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5 }}>Daily Darshan</Text>
            </View>
            <Text style={{ fontFamily: "serif", fontSize: 26, fontWeight: "700", color: C.white, textShadowColor: "rgba(0,0,0,0.5)", textShadowRadius: 4 }}>{featured.name}</Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{featured.location}</Text>
            <Text style={{ fontFamily: "serif", fontSize: 15, color: "rgba(255,255,255,0.85)", fontStyle: "italic", marginTop: 8, lineHeight: 22 }}>&ldquo;Where there is devotion, there is peace.&rdquo;</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 }}>
              <Pressable onPress={() => { useApp.getState().bumpDarshan(); navigate("TempleDetail" as never, { id: String(featured.id) }); }} style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.saffron, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}>
                <Ionicons name="radio" size={14} color={C.white} />
                <Text style={{ fontSize: 13, fontWeight: "700", color: C.white }}>Watch Live</Text>
              </Pressable>
              {upcomingFest && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
                  <Ionicons name="calendar" size={12} color={C.goldLight} />
                  <Text style={{ fontSize: 11, color: C.goldLight, fontWeight: "600" }}>{upcomingFest.name} in {countdown}d</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </GlowBorder>

      {/* Quick Actions */}
      <View style={{ marginTop: 22, paddingHorizontal: 20 }}>
        <FlatList data={QUICK_ACTIONS} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }} keyExtractor={(i) => i.label} renderItem={({ item }) => (
          <Pressable onPress={() => { if (item.label === "Bhajans") navigate("Bhajans" as never); else if (item.label === "Temples") navigate("Discover" as never); else if (item.label === "Live Darshan") navigate("Live" as never); else if (item.label === "Spiritual Guide") navRef?.navigate("AIChat" as never); else if (item.label === "Festivals") navigate("Home" as never); else useApp.getState().showToast("Coming soon"); }} style={{ alignItems: "center", gap: 6 }}>
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(212,160,23,0.12)", borderWidth: 1.5, borderColor: "rgba(212,160,23,0.25)", alignItems: "center", justifyContent: "center", shadowColor: "rgba(212,160,23,0.15)", shadowOffset: { width: 0, height: 2 }, shadowRadius: 10, shadowOpacity: 1, elevation: 3 }}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={{ fontSize: 10, fontWeight: "600", color: C.charcoal, textAlign: "center", width: 64 }} numberOfLines={2}>{item.label}</Text>
          </Pressable>
        )} />
      </View>

      {/* Daily Panchang */}
      <View style={{ marginHorizontal: 20, marginTop: 20, backgroundColor: "linear-gradient(135deg, rgba(122,31,31,0.06), rgba(212,160,23,0.06))", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(212,160,23,0.15)" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontFamily: "serif", fontSize: 16, fontWeight: "700", color: C.charcoal }}>Today's Panchang</Text>
          <Text style={{ fontSize: 11, color: C.saffron, fontWeight: "600" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}</Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {[
            { l: "Tithi", v: PANCHANG.tithi }, { l: "Nakshatra", v: PANCHANG.nakshatra },
            { l: "Sunrise", v: PANCHANG.sunrise }, { l: "Sunset", v: PANCHANG.sunset },
            { l: "Paksha", v: PANCHANG.paksha }, { l: "Yoga", v: PANCHANG.yoga },
          ].map((p) => (
            <View key={p.l} style={{ backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, flexDirection: "row", gap: 4 }}>
              <Text style={{ fontSize: 10, color: "#999", fontWeight: "600" }}>{p.l}:</Text>
              <Text style={{ fontSize: 10, color: C.charcoal, fontWeight: "700" }}>{p.v}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Temple Passport */}
      <View style={{ marginTop: 22 }}>
        <SecHead title="Temple Passport" action="View All" onAction={() => useApp.getState().showToast("All badges")} />
        <FlatList data={BADGES} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={SS.hScroll} keyExtractor={(i) => i.label} renderItem={({ item }) => {
          const earned = useApp.getState().badges.includes(item.label.toLowerCase().replace(" ", ""));
          return (
            <View style={{ ...SS.card, width: 110, backgroundColor: earned ? "rgba(212,160,23,0.1)" : C.white, borderRadius: 16, padding: 14, alignItems: "center", borderWidth: 1, borderColor: earned ? "rgba(212,160,23,0.3)" : C.warmGray }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: earned ? "linear-gradient(135deg, #D4A017, #FF8C42)" : C.warmGray, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={item.icon as any} size={20} color={earned ? C.white : "#ccc"} />
              </View>
              <Text style={{ fontSize: 10, fontWeight: "700", color: C.charcoal, marginTop: 8, textAlign: "center" }}>{item.label}</Text>
              <Text style={{ fontSize: 8, color: "#999", marginTop: 2, textAlign: "center" }}>{item.desc}</Text>
            </View>
          );
        }} />
      </View>

      {/* Live Darshan */}
      <View style={{ marginTop: 22 }}>
        <SecHead title="Live Darshan" action="See All" onAction={() => navigate("Live" as never)} />
        <FlatList data={temples.filter((t) => t.live)} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={SS.hScroll} keyExtractor={(i) => `lc-${i.id}`} renderItem={({ item }) => (
          <Pressable onPress={() => { useApp.getState().bumpDarshan(); navigate("TempleDetail" as never, { id: String(item.id) }); }} style={[SS.card, { width: 140 }]}>
            <Image source={{ uri: im(item.img, 300, 400) }} style={{ width: 140, height: 190 }} />
            <View style={{ position: "absolute", top: 8, left: 8 }}><LiveBadge /></View>
            <View style={{ position: "absolute", bottom: 40, right: 8, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Ionicons name="eye" size={8} color={C.white} /><Text style={{ fontSize: 9, color: C.white }}>{Math.floor(Math.random() * 5000 + 2000)}</Text>
            </View>
            <View style={{ padding: 8, paddingHorizontal: 10 }}>
              <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: "700", color: C.charcoal }}>{item.name}</Text>
              <Text style={{ fontSize: 10, color: "#999" }}>{ct(item.location)}</Text>
            </View>
          </Pressable>
        )} />
      </View>

      {/* Popular Temples */}
      <View style={{ marginTop: 22 }}>
        <SecHead title="Popular Temples" action="See All" onAction={() => navigate("Discover" as never)} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}>
          {popCats.map((c) => (
            <Pressable key={c} onPress={() => setPopCat(c)} style={popCat === c ? SS.chipA : SS.chip}>
              <Text style={popCat === c ? SS.chipTA : SS.chipT}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
        {filteredPopular.length > 0 ? (
          <FlatList data={filteredPopular.slice(0, 8)} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={SS.hScroll} keyExtractor={(i) => `pt-${i.id}`} renderItem={({ item }) => (
            <Pressable onPress={() => navigate("TempleDetail" as never, { id: String(item.id) })} style={[SS.card, { width: 200 }]}>
              <Image source={{ uri: im(`${item.img}-pop`, 400, 260) }} style={{ width: 200, height: 130 }} />
              <View style={{ padding: 10 }}>
                <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: C.charcoal }}>{item.name}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
                  <Ionicons name="location" size={9} color="#999" /><Text style={{ fontSize: 10, color: "#999", flex: 1 }} numberOfLines={1}>{ct(item.location)}</Text>
                  <Ionicons name="star" size={10} color={C.gold} /><Text style={{ fontSize: 10, color: C.gold, fontWeight: "700" }}>{item.rating}</Text>
                </View>
              </View>
            </Pressable>
          )} />
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 20 }}><Text style={{ color: "#999", fontSize: 12 }}>No temples in this category</Text></View>
        )}
      </View>

      {/* Bhajans For You */}
      <View style={{ marginTop: 22 }}>
        <SecHead title="Bhajans For You" action="See All" onAction={() => navigate("Bhajans" as never)} />
        <FlatList data={bhajans.slice(0, 6)} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={SS.hScroll} keyExtractor={(i) => `bh-${i.id}`} renderItem={({ item }) => (
          <Pressable onPress={() => handlePlayBhajan(item)} style={[SS.card, { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, width: 220 }]}>
            <Image source={{ uri: im(item.img, 100, 100) }} style={{ width: 50, height: 50, borderRadius: 12 }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: C.charcoal }}>{item.title}</Text>
              <Text style={{ fontSize: 11, color: "#999" }}>{item.artist} · {item.duration}</Text>
            </View>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.saffron, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="play" size={12} color={C.white} style={{ marginLeft: 2 }} />
            </View>
          </Pressable>
        )} />
      </View>

      {/* Festivals */}
      <View style={{ marginTop: 22 }}>
        <SecHead title="Upcoming Festivals" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={SS.hScroll}>
          {festivals.map((f) => {
            const cd = daysUntil(f.date);
            return (
              <View key={f.name} style={[SS.card, { width: 180 }]}>
                <Image source={{ uri: im(f.img, 360, 240) }} style={{ width: 180, height: 110 }} />
                <View style={{ padding: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: C.charcoal }}>{f.name}</Text>
                  <Text style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{fmtDate(f.date)}</Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <View style={{ backgroundColor: cd === 0 ? "rgba(76,175,80,0.1)" : "rgba(255,140,66,0.1)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: cd === 0 ? C.softGreen : C.saffron }}>{cd === 0 ? "Today" : `${cd} days`}</Text>
                    </View>
                    <Pressable onPress={() => useApp.getState().showToast(`${f.name} — ${f.desc}`)}><Text style={{ fontSize: 11, fontWeight: "700", color: C.saffron }}>Learn More</Text></Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Nearby Temples */}
      <View style={{ marginTop: 22, paddingBottom: 100 }}>
        <SecHead title="Nearby Temples" action="See Map" onAction={() => useApp.getState().showToast("Opening map...")} />
        <FlatList data={temples.slice(0, 4)} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={SS.hScroll} keyExtractor={(i) => `nr-${i.id}`} renderItem={({ item }) => (
          <Pressable onPress={() => navigate("TempleDetail" as never, { id: String(item.id) })} style={[SS.card, { width: 200 }]}>
            <Image source={{ uri: im(`${item.img}-near`, 400, 260) }} style={{ width: 200, height: 120 }} />
            <View style={{ padding: 10 }}>
              <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: C.charcoal }}>{item.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="navigate" size={10} color={C.saffron} /><Text style={{ fontSize: 10, color: C.saffron, fontWeight: "600" }}>{item.dist}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.open ? C.softGreen : "#e53935" }} />
                  <Text style={{ fontSize: 10, color: item.open ? C.softGreen : "#e53935", fontWeight: "600" }}>{item.open ? "Open" : "Closed"}</Text>
                </View>
              </View>
              <Pressable onPress={() => useApp.getState().showToast("Opening directions...")} style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 4, justifyContent: "center", backgroundColor: C.warmGray, paddingVertical: 6, borderRadius: 8 }}>
                <Ionicons name="compass" size={12} color={C.saffron} /><Text style={{ fontSize: 11, fontWeight: "600", color: C.saffron }}>Directions</Text>
              </Pressable>
            </View>
          </Pressable>
        )} />
      </View>
    </ScrollView>
  );
}

// ───────────────────── DISCOVER ─────────────────────
function DiscoverScreen() {
  const temples = useApp((s) => s.temples);
  const fetchData = useApp((s) => s.fetchData);
  const { navigate } = useNavigation() as any;
  const [q, setQ] = useState(""); const [chip, setChip] = useState("All"); const [refreshing, setRefreshing] = useState(false);
  const chips = ["All", ...new Set(temples.map((t) => t.deity))];
  const filtered = temples.filter((t) => { const mq = !q || t.name.toLowerCase().includes(q.toLowerCase()) || t.location.toLowerCase().includes(q.toLowerCase()) || t.deity.toLowerCase().includes(q.toLowerCase()); return mq && (chip === "All" || t.deity === chip); });
  return (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchData(); setRefreshing(false); }} tintColor={C.saffron} />} contentContainerStyle={{ paddingBottom: 100 }} style={SS.warm}>
      <View style={{ paddingTop: 56, paddingBottom: 0, paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: "serif", fontSize: 28, fontWeight: "700", color: C.charcoal }}>Discover Temples</Text>
        <Text style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Find your next sacred destination</Text>
      </View>
      <View style={{ height: 14 }} />
      <View style={SS.searchW}><Ionicons name="search" size={15} color="#bbb" style={{ position: "absolute", left: 16, top: 16, zIndex: 1 }} /><TextInput style={SS.searchI} value={q} onChangeText={setQ} placeholder="Search temples, cities, deities..." placeholderTextColor="#bbb" /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 14 }}>
        {chips.map((c) => <Pressable key={c} onPress={() => setChip(c)} style={chip === c ? SS.chipA : SS.chip}><Text style={chip === c ? SS.chipTA : SS.chipT}>{c}</Text></Pressable>)}
      </ScrollView>
      <SecHead title="Popular Temples" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 20, paddingBottom: 20 }}>
        {filtered.map((t) => (
          <Pressable key={t.id} onPress={() => navigate("TempleDetail" as never, { id: String(t.id) })} style={[SS.card, { width: "47%", marginBottom: 4 }]}>
            <Image source={{ uri: im(`${t.img}-disc`, 400, 260) }} style={{ width: "100%", height: 130 }} />
            <View style={{ padding: 10, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: C.charcoal }}>{t.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
                <Ionicons name="location" size={9} color="#999" /><Text style={{ fontSize: 11, color: "#999" }}>{ct(t.location)}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 }}>
                <Ionicons name="star" size={10} color={C.gold} /><Text style={{ fontSize: 10, color: C.gold, fontWeight: "700" }}>{t.rating}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
      {filtered.length === 0 && <View style={{ alignItems: "center", paddingVertical: 40 }}><Text style={{ color: "#999" }}>No temples found</Text></View>}
    </ScrollView>
  );
}

// ───────────────────── LIVE ─────────────────────
function LiveScreen() {
  const temples = useApp((s) => s.temples);
  const fetchData = useApp((s) => s.fetchData);
  const { navigate } = useNavigation() as any;
  const [refreshing, setRefreshing] = useState(false);
  const featured = temples.find((t) => t.live) || temples[0] || TEMPLES_INITIAL[0];
  const live = temples.filter((t) => t.live);
  return (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchData(); setRefreshing(false); }} tintColor={C.saffron} />} contentContainerStyle={{ paddingBottom: 20 }} style={SS.warm}>
      <View style={{ paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: "serif", fontSize: 28, fontWeight: "700", color: C.charcoal }}>Live Darshan</Text>
        <Text style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Watch aarti and darshan from sacred temples</Text>
      </View>
      <GlowBorder style={{ marginHorizontal: 20 }}>
        <Pressable onPress={() => { useApp.getState().bumpDarshan(); navigate("TempleDetail" as never, { id: String(featured.id) }); }} style={{ borderRadius: 22, overflow: "hidden", height: 220, position: "relative" }}>
          <Image source={{ uri: im(`${featured.img}-live`, 800, 440) }} style={{ width: "100%", height: "100%", position: "absolute" }} />
          <Particles count={6} />
          <View style={{ position: "absolute", inset: 0, justifyContent: "flex-end", padding: 18 }}>
            <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)" }} />
            <View style={{ zIndex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}><LiveBadge /><View style={{ backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, flexDirection: "row", alignItems: "center", gap: 4 }}><Ionicons name="eye" size={9} color={C.white} /><Text style={{ fontSize: 10, color: C.white }}>{Math.floor(Math.random() * 5000 + 2000)} watching</Text></View></View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: C.white }}>{featured.name}</Text>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{featured.location}</Text>
            </View>
          </View>
        </Pressable>
      </GlowBorder>
      <View style={{ marginTop: 20 }}><SecHead title="Popular Live" /><FlatList data={live} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={SS.hScroll} keyExtractor={(i) => `lp-${i.id}`} renderItem={({ item }) => (
        <Pressable onPress={() => { useApp.getState().bumpDarshan(); navigate("TempleDetail" as never, { id: String(item.id) }); }} style={[SS.card, { width: 140 }]}>
          <Image source={{ uri: im(`${item.img}-lc`, 300, 400) }} style={{ width: 140, height: 190 }} />
          <View style={{ position: "absolute", top: 8, left: 8 }}><LiveBadge /></View>
          <View style={{ padding: 8, paddingHorizontal: 10 }}><Text numberOfLines={1} style={{ fontSize: 12, fontWeight: "700", color: C.charcoal }}>{item.name}</Text><Text style={{ fontSize: 10, color: "#999" }}>{ct(item.location)}</Text></View>
        </Pressable>
      )} /></View>
      <View style={{ marginTop: 20, paddingBottom: 100 }}><SecHead title="Upcoming Aarti" />{AARTI_SCHEDULE.map((a, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, marginHorizontal: 20, borderBottomWidth: i < AARTI_SCHEDULE.length - 1 ? 1 : 0, borderBottomColor: C.warmGray }}>
          <View style={{ alignItems: "center", minWidth: 54 }}><Text style={{ fontSize: 16, fontWeight: "800", color: C.saffron }}>{a.time}</Text><Text style={{ fontSize: 10, color: "#999", textTransform: "uppercase", fontWeight: "600" }}>{a.period}</Text></View>
          <View style={{ width: 3, height: 40, borderRadius: 2, backgroundColor: `${C.gold}66` }} />
          <View><Text style={{ fontSize: 14, fontWeight: "700", color: C.charcoal }}>{a.name}</Text><Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{a.temple}</Text></View>
        </View>
      ))}</View>
    </ScrollView>
  );
}

// ───────────────────── BHAJANS ─────────────────────
function BhajansScreen() {
  const bhajans = useApp((s) => s.bhajans);
  const fetchData = useApp((s) => s.fetchData);
  const handlePlay = useCallback((b: Bhajan) => {
    usePlayer.getState().play(b);
    useApp.getState().bumpBhajan();
    useApp.getState().showToast(`Now playing: ${b.title}`);
    loadAndPlay(b.audio, (status) => {
      if (status.isLoaded && status.durationMillis) usePlayer.getState().setDur(status.durationMillis / 1000);
      if (status.didJustFinish) { usePlayer.getState().next(); const nx = usePlayer.getState().cur; if (nx) loadAndPlay(nx.audio, () => {}); }
    });
    startPosTracking(usePlayer.getState().setPos);
  }, []);
  const [refreshing, setRefreshing] = useState(false);
  return (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchData(); setRefreshing(false); }} tintColor={C.saffron} />} contentContainerStyle={{ paddingBottom: 140 }} style={SS.warm}>
      <View style={{ paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: "serif", fontSize: 28, fontWeight: "700", color: C.charcoal }}>Bhajans</Text>
        <Text style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Immerse in devotional music</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20, paddingBottom: 20 }}>
        {BHAJAN_CATS.map((c) => <Pressable key={c.name} onPress={() => useApp.getState().showToast(`Browsing ${c.name}`)} style={[SS.card, { width: "30%", paddingVertical: 16, alignItems: "center", borderWidth: 1.5, borderColor: C.warmGray }]}><Ionicons name={c.icon} size={22} color={c.color} /><Text style={{ fontSize: 12, fontWeight: "700", color: C.charcoal, marginTop: 6 }}>{c.name}</Text></Pressable>)}
      </View>
      <View style={{ marginTop: 4 }}><SecHead title="Recommended" /><FlatList data={bhajans.slice(0, 6)} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={SS.hScroll} keyExtractor={(i) => `br-${i.id}`} renderItem={({ item }) => (
        <Pressable onPress={() => handlePlay(item)} style={[SS.card, { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, width: 220 }]}>
          <Image source={{ uri: im(`${item.img}-rec`, 100, 100) }} style={{ width: 50, height: 50, borderRadius: 12 }} />
          <View style={{ flex: 1, minWidth: 0 }}><Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: C.charcoal }}>{item.title}</Text><Text style={{ fontSize: 11, color: "#999" }}>{item.artist} · {item.duration}</Text></View>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.saffron, alignItems: "center", justifyContent: "center" }}><Ionicons name="play" size={12} color={C.white} style={{ marginLeft: 2 }} /></View>
        </Pressable>
      )} /></View>
      <View style={{ marginTop: 4 }}><SecHead title="All Bhajans" /><View style={{ paddingHorizontal: 20 }}>{bhajans.map((b) => (
        <Pressable key={b.id} onPress={() => handlePlay(b)} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.warmGray }}>
          <Image source={{ uri: im(`${b.img}-list`, 100, 100) }} style={{ width: 50, height: 50, borderRadius: 12 }} />
          <View style={{ flex: 1, minWidth: 0 }}><Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: C.charcoal }}>{b.title}</Text><Text style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{b.artist} · {b.cat}</Text></View>
          <Text style={{ fontSize: 12, color: "#bbb", fontWeight: "600" }}>{b.duration}</Text>
        </Pressable>
      ))}</View></View>
    </ScrollView>
  );
}

// ───────────────────── PROFILE ─────────────────────
function ProfileScreen() {
  const { navigate } = useNavigation() as any;
  const { selDeities, saved, darshanCount, bhajanCount, badges, streak, showToast } = useApp();
  const menu = [
    { icon: "bookmark-outline" as const, label: "Saved Temples" },
    { icon: "eye-outline" as const, label: "Watched Darshans" },
    { icon: "heart-outline" as const, label: "Saved Bhajans" },
    { icon: "color-palette-outline" as const, label: "Theme" },
    { icon: "language-outline" as const, label: "Language" },
    { icon: "notifications-outline" as const, label: "Notifications" },
    { icon: "information-circle-outline" as const, label: "About Divya" },
    { icon: "lock-closed-outline" as const, label: "Staff Portal" },
    { icon: "log-out-outline" as const, label: "Sign Out" },
  ];
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} style={SS.warm}>
      <View style={{ alignItems: "center", paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: C.saffron, alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 32, color: C.white }}>ॐ</Text></View>
        <Text style={{ fontFamily: "serif", fontSize: 24, fontWeight: "700", color: C.charcoal, marginTop: 12 }}>Devotee</Text>
        <Text style={{ fontSize: 13, color: "#999", marginTop: 2 }}>On a spiritual journey · {streak} day streak</Text>
      </View>
      <View style={[SS.card, { flexDirection: "row", justifyContent: "space-around", paddingVertical: 16, marginHorizontal: 20, marginBottom: 20 }]}>
        {[{ n: saved.length, l: "Saved" }, { n: darshanCount, l: "Darshans" }, { n: bhajanCount, l: "Bhajans" }, { n: badges.length, l: "Badges" }].map((s) => (
          <View key={s.l} style={{ alignItems: "center" }}><Text style={{ fontSize: 22, fontWeight: "800", color: C.saffron }}>{s.n}</Text><Text style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{s.l}</Text></View>
        ))}
      </View>
      <SecHead title="Favorite Deities" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20, marginBottom: 20 }}>
        {selDeities.length > 0 ? selDeities.map((id) => { const d = DEITIES.find((x) => x.id === id); return d ? <View key={id} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: "rgba(255,140,66,0.1)", borderWidth: 1, borderColor: "rgba(255,140,66,0.2)" }}><Text style={{ fontSize: 12, fontWeight: "600", color: C.maroon }}>{d.name}</Text></View> : null; }) : <Text style={{ fontSize: 13, color: "#999" }}>Select in onboarding</Text>}
      </View>
      <View style={{ paddingHorizontal: 20 }}>{menu.map((m) => (
        <Pressable key={m.label} onPress={() => { if (m.label === "Sign Out") showToast("Signed out"); else if (m.label === "About Divya") showToast("Divya v2.0 — Premium"); else if (m.label === "Staff Portal") navigate("StaffAuth" as never); else showToast(`${m.label} — coming soon`); }} style={[SS.card, { flexDirection: "row", alignItems: "center", gap: 14, padding: 15, paddingHorizontal: 16, marginBottom: 8 }]}>
          <Ionicons name={m.icon} size={18} color={C.saffron} /><Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: C.charcoal }}>{m.label}</Text><Ionicons name="chevron-forward" size={12} color="#ccc" />
        </Pressable>
      ))}</View>
    </ScrollView>
  );
}

// ───────────────────── TEMPLE DETAIL ─────────────────────
function TempleDetailScreen() {
  const { goBack } = useNavigation(); const route = useRoute(); const id = Number((route.params as any)?.id);
  const { saveTmp, showToast, bumpDarshan } = useApp();
  const temples = useApp((s) => s.temples);
  const [tab, setTab] = useState<"history" | "mythology" | "significance">("history");
  const t = temples.find((x) => x.id === id);
  useEffect(() => { if (t) { saveTmp(t.id); bumpDarshan(); } }, [t]);
  if (!t) return <View style={SS.warm} />;
  return (
    <View style={SS.warm}>
      <View style={{ position: "relative", height: 280 }}>
        <Image source={{ uri: im(`${t.img}-detail`, 800, 560) }} style={{ width: "100%", height: "100%" }} />
        <Pressable onPress={goBack} style={{ position: "absolute", top: 48, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}><Ionicons name="arrow-back" size={18} color={C.white} /></Pressable>
        <View style={{ position: "absolute", top: 48, right: 16, flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => showToast("Saved!")} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}><Ionicons name="bookmark-outline" size={15} color={C.white} /></Pressable>
          <Pressable onPress={() => showToast("Share copied!")} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}><Ionicons name="share-social-outline" size={15} color={C.white} /></Pressable>
        </View>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, backgroundColor: "rgba(0,0,0,0.4)" }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} style={{ marginTop: -12 }}>
        <Text style={{ fontFamily: "serif", fontSize: 26, fontWeight: "700", color: C.charcoal }}>{t.name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}><Ionicons name="location" size={13} color={C.saffron} /><Text style={{ fontSize: 13, color: "#888" }}>{t.location}</Text></View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}><Ionicons name="time-outline" size={13} color={C.saffron} /><Text style={{ fontSize: 13, color: C.saffron, fontWeight: "600" }}>{t.timings}</Text></View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}><Ionicons name="star" size={13} color={C.gold} /><Text style={{ fontSize: 13, color: C.gold, fontWeight: "600" }}>{t.rating} rating</Text></View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          <Pressable onPress={() => showToast("Opening maps...")} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: C.saffron, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}><Ionicons name="map-outline" size={16} color={C.white} /><Text style={{ fontSize: 13, fontWeight: "700", color: C.white }}>Open Map</Text></Pressable>
          {t.live && <Pressable onPress={() => showToast("Connecting...")} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: C.warmGray, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}><Ionicons name="radio-outline" size={16} color={C.charcoal} /><Text style={{ fontSize: 13, fontWeight: "700", color: C.charcoal }}>Watch Live</Text></Pressable>}
        </View>
        <Text style={{ fontSize: 14, color: "#666", lineHeight: 25, marginTop: 18 }}>{t.desc}</Text>
        <View style={{ flexDirection: "row", borderBottomWidth: 2, borderBottomColor: C.warmGray, marginTop: 22, marginHorizontal: -20, paddingHorizontal: 20 }}>
          {(["history", "mythology", "significance"] as const).map((k) => (
            <Pressable key={k} onPress={() => setTab(k)} style={{ flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2, borderBottomColor: tab === k ? C.saffron : "transparent", marginBottom: -2 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: tab === k ? C.saffron : "#999", textTransform: "capitalize" }}>{k}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ fontSize: 14, color: "#666", lineHeight: 25, marginTop: 16 }}>{t[tab]}</Text>
      </ScrollView>
    </View>
  );
}

// ───────────────────── FULL SCREEN PLAYER ─────────────────────
function FullPlayerScreen() {
  const { goBack } = useNavigation();
  const { cur, playing, pos, dur, shuffle, repeat, toggle, next, prev, togShuffle, togRepeat, seek, setPos } = usePlayer();
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (playing) rotate.value = withRepeat(withTiming(360, { duration: 8000 }), -1);
    else rotate.value = rotate.value;
  }, [playing, rotate]);

  useEffect(() => {
    scale.value = withRepeat(withSequence(withTiming(1.03, { duration: 2000 }), withTiming(1, { duration: 2000 })), -1);
  }, [scale]);

  const discStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }, { scale: scale.value }],
  }));

  if (!cur) return <View style={SS.warm} />;

  const fmtTime = (s: number) => { const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return `${m}:${sec < 10 ? "0" : ""}${sec}`; };
  const curSec = (pos / 100) * dur;

  return (
    <View style={{ flex: 1, backgroundColor: "#1a0800" }}>
      <View style={{ position: "absolute", top: -100, left: "50%", marginLeft: -200, width: 400, height: 400, borderRadius: 200, backgroundColor: "rgba(212,160,23,0.08)" }} />
      <View style={{ position: "absolute", top: 200, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(255,140,66,0.05)" }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 }}>
        <Pressable onPress={goBack}><Ionicons name="chevron-down" size={28} color={C.white} /></Pressable>
        <Text style={{ fontSize: 12, fontWeight: "600", color: C.goldLight, textTransform: "uppercase", letterSpacing: 2 }}>Now Playing</Text>
        <Pressable onPress={() => useApp.getState().showToast("Queue")}><Ionicons name="list" size={22} color={C.white} /></Pressable>
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
        <View style={{ width: W * 0.65, height: W * 0.65, borderRadius: (W * 0.65) / 2, backgroundColor: "rgba(212,160,23,0.08)", borderWidth: 2, borderColor: "rgba(212,160,23,0.2)", alignItems: "center", justifyContent: "center", shadowColor: C.gold, shadowOffset: { width: 0, height: 0 }, shadowRadius: 30, shadowOpacity: 0.2 }}>
          <An.View style={discStyle}>
            <Image source={{ uri: im(`${cur.img}-fp`, 400, 400) }} style={{ width: W * 0.55, height: W * 0.55, borderRadius: (W * 0.55) / 2, borderWidth: 3, borderColor: "rgba(212,160,23,0.3)" }} />
          </An.View>
          <View style={{ position: "absolute", width: 20, height: 20, borderRadius: 10, backgroundColor: "#1a0800", borderWidth: 2, borderColor: "rgba(212,160,23,0.3)" }} />
        </View>
        <Text style={{ fontSize: 22, fontWeight: "700", color: C.white, marginTop: 40, textAlign: "center" }}>{cur.title}</Text>
        <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{cur.artist} · {cur.cat}</Text>
        {/* Progress */}
        <View style={{ width: "100%", marginTop: 30 }}>
          <View style={{ height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
            <View style={{ height: "100%", backgroundColor: C.saffron, width: `${pos}%`, borderRadius: 2 }} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{fmtTime(curSec)}</Text>
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{fmtTime(dur)}</Text>
          </View>
        </View>
        {/* Controls */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 20 }}>
          <Pressable onPress={togShuffle}><Ionicons name="shuffle" size={20} color={shuffle ? C.saffron : "rgba(255,255,255,0.4)"} /></Pressable>
          <Pressable onPress={() => { prev(); const st = usePlayer.getState(); if (st.cur) { loadAndPlay(st.cur.audio, (s) => { if (s.isLoaded && s.durationMillis) usePlayer.getState().setDur(s.durationMillis / 1000); if (s.didJustFinish) { usePlayer.getState().next(); const nx = usePlayer.getState().cur; if (nx) loadAndPlay(nx.audio, () => {}); } }); startPosTracking(usePlayer.getState().setPos); } }}><Ionicons name="play-skip-back" size={32} color={C.white} /></Pressable>
          <Pressable onPress={() => { audioToggle(playing); toggle(); }} style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.saffron, alignItems: "center", justifyContent: "center", shadowColor: C.saffron, shadowOffset: { width: 0, height: 4 }, shadowRadius: 20, shadowOpacity: 0.4 }}>
            <Ionicons name={playing ? "pause" : "play"} size={30} color={C.white} style={playing ? {} : { marginLeft: 4 }} />
          </Pressable>
          <Pressable onPress={() => { next(); const st = usePlayer.getState(); if (st.cur) { loadAndPlay(st.cur.audio, (s) => { if (s.isLoaded && s.durationMillis) usePlayer.getState().setDur(s.durationMillis / 1000); if (s.didJustFinish) { usePlayer.getState().next(); const nx = usePlayer.getState().cur; if (nx) loadAndPlay(nx.audio, () => {}); } }); startPosTracking(usePlayer.getState().setPos); } }}><Ionicons name="play-skip-forward" size={32} color={C.white} /></Pressable>
          <Pressable onPress={togRepeat}><Ionicons name={repeat === "one" ? "repeat" : "repeat-outline"} size={20} color={repeat !== "off" ? C.saffron : "rgba(255,255,255,0.4)"} /></Pressable>
        </View>
        {repeat === "one" && <Text style={{ fontSize: 10, color: C.saffron, marginTop: 4 }}>Repeat One</Text>}
      </View>
    </View>
  );
}

// ───────────────────── AI CHAT ─────────────────────
function AIChatScreen() {
  const { goBack } = useNavigation();
  const [msgs, setMsgs] = useState<{ id: string; role: "user" | "ai"; text: string }[]>([{ id: uid(), role: "ai", text: "Namaste! I am your Spiritual Guide. Ask me about temples, deities, scriptures, festivals, or spiritual practices." }]);
  const [input, setInput] = useState(""); const [showSug, setShowSug] = useState(true);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);
  useEffect(() => { setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100); }, [msgs]);
  const send = async (text: string) => {
    if (!text.trim() || loading) return; setShowSug(false);
    const userText = text.trim();
    setMsgs((p) => [...p, { id: uid(), role: "user", text: userText }]); setInput("");
    const tempAiId = uid();
    setMsgs((p) => [...p, { id: tempAiId, role: "ai", text: "Thinking..." }]);
    setLoading(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("No API Key configured");
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are a knowledgeable spiritual assistant representing Sanatan Dharma. Answer the user's question with wisdom, clarity, and references to sacred texts where applicable. Keep the response concise but profound. Question: ${userText}` }] }]
        })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiResponse) {
        setMsgs((p) => p.map((m) => m.id === tempAiId ? { ...m, text: aiResponse } : m));
      } else {
        throw new Error("No text response");
      }
    } catch (err) {
      console.log("Gemini API error, falling back:", err);
      const fallbackText = aiReply(userText);
      setMsgs((p) => p.map((m) => m.id === tempAiId ? { ...m, text: fallbackText } : m));
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView style={SS.warm} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.warmGray }}>
        <Pressable onPress={goBack} style={{ padding: 4 }}><Ionicons name="arrow-back" size={20} color={C.charcoal} /></Pressable>
        <View><Text style={{ fontFamily: "serif", fontSize: 20, fontWeight: "700", color: C.charcoal }}>Spiritual Guide</Text><Text style={{ fontSize: 11, color: C.softGreen, fontWeight: "600" }}>Online</Text></View>
      </View>
      <FlatList ref={listRef} data={msgs} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 8 }} keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 14, justifyContent: item.role === "user" ? "flex-end" : "flex-start" }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: item.role === "ai" ? C.saffron : C.warmGray }}><Ionicons name={item.role === "ai" ? "sparkles" : "person"} size={14} color={item.role === "ai" ? C.white : C.charcoal} /></View>
            <View style={{ ...SS.card, maxWidth: "78%", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18, backgroundColor: item.role === "ai" ? C.white : C.saffron, borderBottomLeftRadius: item.role === "ai" ? 4 : 18, borderBottomRightRadius: item.role === "user" ? 4 : 18 }}>
              <Text style={{ fontSize: 13.5, lineHeight: 21, color: item.role === "ai" ? C.charcoal : C.white }}>{item.text}</Text>
            </View>
          </View>
        )} />
      {showSug && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 8 }}>
        {["Tell me about Kedarnath Temple", "Why is Mahadev worshipped?", "Explain Hanuman Chalisa", "Best temples to visit nearby"].map((s) => <Pressable key={s} onPress={() => send(s)} style={SS.chip}><Text style={SS.chipT}>{s}</Text></Pressable>)}
      </ScrollView>}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 28, borderTopWidth: 1, borderTopColor: C.warmGray }}>
        <TextInput style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.warmGray, borderRadius: 24, fontSize: 14, color: C.charcoal }} value={input} onChangeText={setInput} placeholder="Ask about temples, deities..." placeholderTextColor="#bbb" onSubmitEditing={() => send(input)} />
        <Pressable onPress={() => send(input)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.saffron, alignItems: "center", justifyContent: "center" }}><Ionicons name="paper-plane" size={17} color={C.white} /></Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ───────────────────── STAFF AUTH ─────────────────────
function StaffAuthScreen() {
  const { navigate, goBack } = useNavigation() as any;
  const [role, setRole] = useState<"manager" | "admin">("manager");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useApp((s) => s.login);
  const showToast = useApp((s) => s.showToast);
  const fetchData = useApp((s) => s.fetchData);

  const handleLogin = async () => {
    if (!key.trim()) {
      showToast("Please enter security key");
      return;
    }
    setLoading(true);
    try {
      if (role === "admin") {
        if (key === "1008") {
          const res = await api.login("admin@divya.com", "admin123");
          login(res.user, res.token);
          await fetchData();
          showToast("Admin access granted");
          setKey("");
          navigate("AdminDashboard");
        } else {
          showToast("Invalid Admin Security Key");
        }
      } else {
        if (key === "108") {
          const res = await api.login("manager@divya.com", "manager123");
          login(res.user, res.token);
          await fetchData();
          showToast("Manager access granted");
          setKey("");
          navigate("ManagerDashboard");
        } else {
          showToast("Invalid Manager Security Key");
        }
      }
    } catch (e: any) {
      showToast(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#1a0800" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 }}>
        <Pressable onPress={goBack} style={{ padding: 4 }}><Ionicons name="arrow-back" size={22} color={C.warmWhite} /></Pressable>
        <Text style={{ fontFamily: "serif", fontSize: 20, fontWeight: "700", color: C.warmWhite, marginLeft: 14 }}>Staff Portal</Text>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingBottom: 40 }}>
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, borderColor: "rgba(212,160,23,0.4)", backgroundColor: "rgba(212,160,23,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 36, color: C.gold }}>ॐ</Text>
          </View>
          <Text style={{ fontFamily: "serif", fontSize: 26, fontWeight: "700", color: C.warmWhite }}>Secure Staff Login</Text>
          <Text style={{ fontSize: 13, color: "rgba(255,248,240,0.5)", marginTop: 6 }}>Authentication required for system access</Text>
        </View>

        <View style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 20 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: C.gold, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>Select Portal Role</Text>
          <View style={{ flexDirection: "row", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 4, marginBottom: 20 }}>
            <Pressable onPress={() => setRole("manager")} style={{ flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10, backgroundColor: role === "manager" ? C.gold : "transparent" }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: role === "manager" ? "#1a0800" : "rgba(255,248,240,0.6)" }}>Manager</Text>
            </Pressable>
            <Pressable onPress={() => setRole("admin")} style={{ flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10, backgroundColor: role === "admin" ? C.gold : "transparent" }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: role === "admin" ? "#1a0800" : "rgba(255,248,240,0.6)" }}>Admin</Text>
            </Pressable>
          </View>

          <Text style={{ fontSize: 12, fontWeight: "700", color: "rgba(255,248,240,0.7)", marginBottom: 8 }}>Staff Security Key</Text>
          <TextInput
            style={{ width: "100%", paddingVertical: 14, paddingHorizontal: 16, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: "rgba(212,160,23,0.3)", borderRadius: 14, fontSize: 16, color: C.white, textAlign: "center", marginBottom: 24 }}
            placeholder="••••••"
            placeholderTextColor="rgba(255,248,240,0.2)"
            secureTextEntry
            keyboardType="number-pad"
            value={key}
            onChangeText={setKey}
          />

          <Pressable onPress={handleLogin} disabled={loading} style={{ width: "100%", paddingVertical: 16, borderRadius: 14, alignItems: "center", backgroundColor: C.saffron, shadowColor: C.saffron, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, shadowOpacity: 0.3, elevation: 4 }}>
            {loading ? <ActivityIndicator color={C.white} /> : <Text style={{ fontSize: 15, fontWeight: "700", color: C.white }}>Authenticate & Enter</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ───────────────────── ADMIN DASHBOARD ─────────────────────
function AdminDashboardScreen() {
  const { navigate } = useNavigation() as any;
  const token = useApp((s) => s.authToken);
  const logout = useApp((s) => s.logout);
  const showToast = useApp((s) => s.showToast);
  const temples = useApp((s) => s.temples);
  const festivals = useApp((s) => s.festivals);
  const bhajans = useApp((s) => s.bhajans);
  const setFestivals = useApp((s) => s.setFestivals);
  const setBhajans = useApp((s) => s.setBhajans);
  const fetchData = useApp((s) => s.fetchData);

  const [tab, setTab] = useState<"analytics" | "content" | "managers" | "settings">("analytics");
  const [contentSubTab, setContentSubTab] = useState<"temples" | "bhajans" | "festivals">("temples");
  const [searchQuery, setSearchQuery] = useState("");

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analLoading, setAnalLoading] = useState(false);

  // Managers State
  const [managers, setManagers] = useState<User[]>([]);
  const [mgrLoading, setMgrLoading] = useState(false);
  const [showAddMgrModal, setShowAddMgrModal] = useState(false);
  const [newMgrName, setNewMgrName] = useState("");
  const [newMgrEmail, setNewMgrEmail] = useState("");
  const [newMgrPass, setNewMgrPass] = useState("");

  // Settings State
  const [maintMode, setMaintMode] = useState(false);
  const [rateLimit, setRateLimit] = useState(60);
  const [debugLevel, setDebugLevel] = useState<"debug" | "info" | "error">("info");

  // Content Modals
  const [showTempleModal, setShowTempleModal] = useState(false);
  const [showBhajanModal, setShowBhajanModal] = useState(false);
  const [showFestModal, setShowFestModal] = useState(false);

  // Edit target state
  const [editingTempleId, setEditingTempleId] = useState<number | null>(null);
  const [editingFestName, setEditingFestName] = useState<string | null>(null);

  // Temple Form fields
  const [tName, setTName] = useState("");
  const [tLocation, setTLocation] = useState("");
  const [tDeity, setTDeity] = useState("");
  const [tTimings, setTTimings] = useState("");
  const [tImg, setTImg] = useState("");
  const [tLive, setTLive] = useState(false);
  const [tDesc, setTDesc] = useState("");
  const [tHistory, setTHistory] = useState("");
  const [tMythology, setTMythology] = useState("");
  const [tSignificance, setTSignificance] = useState("");
  const [tVideoUrl, setTVideoUrl] = useState("");

  // Bhajan Form fields
  const [bTitle, setBTitle] = useState("");
  const [bArtist, setBArtist] = useState("");
  const [bDuration, setBDuration] = useState("5:00");
  const [bCat, setBCat] = useState("Mantra");
  const [bImg, setBImg] = useState("");
  const [bAudio, setBAudio] = useState("");

  // Festival Form fields
  const [fName, setFName] = useState("");
  const [fDate, setFDate] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fImg, setFImg] = useState("");

  // Fetch Analytics & Managers
  const loadAnalytics = useCallback(async () => {
    if (!token) return;
    setAnalLoading(true);
    try {
      const data = await api.getAnalytics(token);
      setAnalyticsData(data);
    } catch (e: any) {
      showToast(e.message || "Failed to load analytics");
    } finally {
      setAnalLoading(false);
    }
  }, [token]);

  const loadManagers = useCallback(async () => {
    if (!token) return;
    setMgrLoading(true);
    try {
      const allUsers = await api.getUsers(token);
      setManagers(allUsers.filter((u) => u.role === "manager"));
    } catch (e: any) {
      showToast(e.message || "Failed to load managers");
    } finally {
      setMgrLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (tab === "analytics") loadAnalytics();
    if (tab === "managers") loadManagers();
  }, [tab, loadAnalytics, loadManagers]);

  // Handle Logout
  const handleLogout = () => {
    logout();
    showToast("Logged out successfully");
    navigate("Tabs");
  };

  // Create Manager
  const handleCreateManager = async () => {
    if (!token) return;
    if (!newMgrName || !newMgrEmail || !newMgrPass) {
      showToast("Please fill all manager details");
      return;
    }
    try {
      await api.createManager(token, newMgrName, newMgrEmail, newMgrPass);
      showToast("Manager created successfully");
      setNewMgrName("");
      setNewMgrEmail("");
      setNewMgrPass("");
      setShowAddMgrModal(false);
      loadManagers();
    } catch (e: any) {
      showToast(e.message || "Failed to create manager");
    }
  };

  // Remove Manager
  const handleRemoveManager = async (id: string) => {
    if (!token) return;
    try {
      await api.removeManager(token, id);
      showToast("Manager removed successfully");
      loadManagers();
    } catch (e: any) {
      showToast(e.message || "Failed to remove manager");
    }
  };

  // Ban/Unban User
  const handleToggleBan = async (id: string, isBanned: boolean) => {
    if (!token) return;
    try {
      await api.banUser(token, id, !isBanned);
      showToast(!isBanned ? "Manager banned" : "Manager unbanned");
      loadManagers();
    } catch (e: any) {
      showToast(e.message || "Failed to update ban status");
    }
  };

  // Content Operations: Temples
  const openTempleAdd = () => {
    setEditingTempleId(null);
    setTName(""); setTLocation(""); setTDeity(""); setTTimings("");
    setTImg(""); setTLive(false); setTDesc(""); setTHistory("");
    setTMythology(""); setTSignificance(""); setTVideoUrl("");
    setShowTempleModal(true);
  };

  const openTempleEdit = (temp: Temple) => {
    setEditingTempleId(temp.id);
    setTName(temp.name);
    setTLocation(temp.location);
    setTDeity(temp.deity);
    setTTimings(temp.timings);
    setTImg(temp.img);
    setTLive(temp.live);
    setTDesc(temp.desc);
    setTHistory(temp.history);
    setTMythology(temp.mythology);
    setTSignificance(temp.significance);
    setTVideoUrl(temp.videoUrl || "");
    setShowTempleModal(true);
  };

  const saveTemple = async () => {
    if (!token) return;
    if (!tName || !tLocation || !tDeity || !tTimings) {
      showToast("Please fill name, location, deity, timings");
      return;
    }
    try {
      const payload = {
        name: tName, location: tLocation, deity: tDeity, timings: tTimings,
        img: tImg || "temple_default", live: tLive, desc: tDesc,
        history: tHistory, mythology: tMythology, significance: tSignificance,
        videoUrl: tVideoUrl || undefined
      };
      if (editingTempleId !== null) {
        await api.editTemple(token, editingTempleId, payload);
        showToast("Temple updated successfully");
      } else {
        await api.addTemple(token, payload);
        showToast("Temple added successfully");
      }
      setShowTempleModal(false);
      await fetchData();
    } catch (e: any) {
      showToast(e.message || "Failed to save temple");
    }
  };

  const deleteTemple = async (id: number) => {
    if (!token) return;
    try {
      await api.deleteTemple(token, id);
      showToast("Temple deleted successfully");
      await fetchData();
    } catch (e: any) {
      showToast(e.message || "Failed to delete temple");
    }
  };

  // Content Operations: Bhajans
  const openBhajanAdd = () => {
    setBTitle(""); setBArtist(""); setBDuration("5:00"); setBCat("Mantra");
    setBImg(""); setBAudio("");
    setShowBhajanModal(true);
  };

  const saveBhajan = async () => {
    if (!token) return;
    if (!bTitle || !bArtist || !bAudio) {
      showToast("Please fill title, artist, audio URL");
      return;
    }
    try {
      const payload = {
        title: bTitle, artist: bArtist, duration: bDuration, cat: bCat,
        img: bImg || "bhajan_default", audio: bAudio
      };
      await api.addBhajan(token, payload);
      showToast("Bhajan added successfully");
      setShowBhajanModal(false);
      await fetchData();
    } catch (e: any) {
      showToast(e.message || "Failed to add bhajan");
    }
  };

  // Content Operations: Festivals
  const openFestAdd = () => {
    setEditingFestName(null);
    setFName(""); setFDate(new Date().toISOString().split("T")[0]); setFDesc(""); setFImg("");
    setShowFestModal(true);
  };

  const openFestEdit = (fest: Festival) => {
    setEditingFestName(fest.name);
    setFName(fest.name);
    setFDate(fest.date);
    setFDesc(fest.desc);
    setFImg(fest.img);
    setShowFestModal(true);
  };

  const saveFest = async () => {
    if (!token) return;
    if (!fName || !fDate) {
      showToast("Please fill name and date");
      return;
    }
    try {
      const payload = { name: fName, date: fDate, desc: fDesc, img: fImg || "fest_default" };
      if (editingFestName !== null) {
        await api.editFestival(token, editingFestName, payload);
        showToast("Festival updated successfully");
      } else {
        await api.addFestival(token, payload);
        showToast("Festival added successfully");
      }
      setShowFestModal(false);
      await fetchData();
    } catch (e: any) {
      showToast(e.message || "Failed to save festival");
    }
  };

  // Filters
  const filteredTemples = temples.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.location.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredBhajans = bhajans.filter((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.artist.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFestivals = festivals.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: C.warmWhite }}>
      {/* Top Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.warmGray, backgroundColor: C.white }}>
        <View>
          <Text style={{ fontFamily: "serif", fontSize: 20, fontWeight: "700", color: C.charcoal }}>Admin Control Panel</Text>
          <Text style={{ fontSize: 11, color: C.saffron, fontWeight: "600", marginTop: 2 }}>Logged in as Administrator</Text>
        </View>
        <Pressable onPress={handleLogout} style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,140,66,0.1)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
          <Ionicons name="log-out" size={15} color={C.saffron} />
          <Text style={{ fontSize: 12, fontWeight: "700", color: C.saffron }}>Logout</Text>
        </Pressable>
      </View>

      {/* Main Tab bar */}
      <View style={{ flexDirection: "row", backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.warmGray }}>
        {(["analytics", "content", "managers", "settings"] as const).map((t) => {
          const active = tab === t;
          return (
            <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: 2, borderBottomColor: active ? C.saffron : "transparent" }}>
              <Ionicons name={t === "analytics" ? "analytics" : t === "content" ? "folder-open" : t === "managers" ? "people" : "settings"} size={18} color={active ? C.saffron : "#888"} />
              <Text style={{ fontSize: 11, fontWeight: "700", color: active ? C.saffron : "#888", marginTop: 4, textTransform: "capitalize" }}>{t}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tab Body */}
      {tab === "analytics" && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} refreshControl={<RefreshControl refreshing={analLoading} onRefresh={loadAnalytics} tintColor={C.saffron} />}>
          {analyticsData ? (
            <View>
              <Text style={{ fontFamily: "serif", fontSize: 18, fontWeight: "700", color: C.charcoal, marginBottom: 14 }}>System Overview</Text>
              
              {/* Analytics Grid */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
                <View style={[SS.card, { width: "48%", padding: 14, alignItems: "center" }]}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,140,66,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 8 }}><Ionicons name="people" size={18} color={C.saffron} /></View>
                  <Text style={{ fontSize: 11, color: "#888", fontWeight: "600" }}>Total Users</Text>
                  <Text style={{ fontSize: 20, fontWeight: "800", color: C.charcoal, marginTop: 4 }}>{analyticsData.totalUsers}</Text>
                </View>
                <View style={[SS.card, { width: "48%", padding: 14, alignItems: "center" }]}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(212,160,23,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 8 }}><Ionicons name="business" size={18} color={C.gold} /></View>
                  <Text style={{ fontSize: 11, color: "#888", fontWeight: "600" }}>Temples</Text>
                  <Text style={{ fontSize: 20, fontWeight: "800", color: C.charcoal, marginTop: 4 }}>{analyticsData.totalTemples}</Text>
                </View>
                <View style={[SS.card, { width: "48%", padding: 14, alignItems: "center" }]}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(76,175,80,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 8 }}><Ionicons name="radio" size={18} color={C.softGreen} /></View>
                  <Text style={{ fontSize: 11, color: "#888", fontWeight: "600" }}>Live Streams</Text>
                  <Text style={{ fontSize: 20, fontWeight: "800", color: C.charcoal, marginTop: 4 }}>{analyticsData.activeStreams}</Text>
                </View>
                <View style={[SS.card, { width: "48%", padding: 14, alignItems: "center" }]}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(122,31,31,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 8 }}><Ionicons name="sparkles" size={18} color={C.maroon} /></View>
                  <Text style={{ fontSize: 11, color: "#888", fontWeight: "600" }}>Daily Devotees</Text>
                  <Text style={{ fontSize: 20, fontWeight: "800", color: C.charcoal, marginTop: 4 }}>{analyticsData.dailyUsers}</Text>
                </View>
              </View>

              {/* Popular Temples Bar Chart */}
              <Text style={{ fontFamily: "serif", fontSize: 18, fontWeight: "700", color: C.charcoal, marginBottom: 14 }}>Temple Visit Volume</Text>
              <View style={[SS.card, { padding: 16, marginBottom: 20 }]}>
                {analyticsData.popularTemples.map((item: any, idx: number) => {
                  const maxVisits = Math.max(...analyticsData.popularTemples.map((x: any) => x.visits));
                  const percent = maxVisits > 0 ? (item.visits / maxVisits) * 100 : 0;
                  return (
                    <View key={item.name} style={{ marginBottom: 14 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: C.charcoal, flex: 1 }} numberOfLines={1}>{item.name}</Text>
                        <Text style={{ fontSize: 11, color: "#888", fontWeight: "600" }}>{item.visits} visits</Text>
                      </View>
                      <View style={{ height: 10, width: "100%", backgroundColor: C.warmGray, borderRadius: 5, overflow: "hidden" }}>
                        <View style={{ height: "100%", width: `${percent}%`, backgroundColor: C.saffron, borderRadius: 5 }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <ActivityIndicator size="large" color={C.saffron} style={{ marginTop: 40 }} />
          )}
        </ScrollView>
      )}

      {tab === "content" && (
        <View style={{ flex: 1 }}>
          {/* Sub-tab selection bar */}
          <View style={{ flexDirection: "row", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: C.white, gap: 10 }}>
            {(["temples", "bhajans", "festivals"] as const).map((sub) => {
              const active = contentSubTab === sub;
              return (
                <Pressable key={sub} onPress={() => setContentSubTab(sub)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: active ? C.saffron : C.warmGray }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: active ? C.white : C.charcoal, textTransform: "capitalize" }}>{sub}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Quick search input */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 12, paddingHorizontal: 12 }}>
              <Ionicons name="search" size={14} color="#bbb" />
              <TextInput style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 13, color: C.charcoal }} placeholder={`Search ${contentSubTab}...`} value={searchQuery} onChangeText={setSearchQuery} />
              {searchQuery ? <Pressable onPress={() => setSearchQuery("")}><Ionicons name="close-circle" size={14} color="#bbb" /></Pressable> : null}
            </View>
          </View>

          {/* List layout & Action button */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Manage List</Text>
            <Pressable onPress={() => { if (contentSubTab === "temples") openTempleAdd(); else if (contentSubTab === "bhajans") openBhajanAdd(); else openFestAdd(); }} style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.saffron, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
              <Ionicons name="add" size={14} color={C.white} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: C.white }}>Add New</Text>
            </Pressable>
          </View>

          {contentSubTab === "temples" && (
            <FlatList data={filteredTemples} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} keyExtractor={(item) => `man-t-${item.id}`} renderItem={({ item }) => (
              <View style={[SS.card, { padding: 12, marginBottom: 10, flexDirection: "row", gap: 12, alignItems: "center" }]}>
                <Image source={{ uri: im(item.img, 100, 100) }} style={{ width: 50, height: 50, borderRadius: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: C.charcoal }}>{item.name}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{item.location} · {item.deity}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable onPress={() => openTempleEdit(item)} style={{ padding: 6, borderRadius: 8, backgroundColor: C.warmGray }}><Ionicons name="create-outline" size={16} color={C.charcoal} /></Pressable>
                  <Pressable onPress={() => deleteTemple(item.id)} style={{ padding: 6, borderRadius: 8, backgroundColor: "rgba(229,57,53,0.1)" }}><Ionicons name="trash-outline" size={16} color="#e53935" /></Pressable>
                </View>
              </View>
            )} />
          )}

          {contentSubTab === "bhajans" && (
            <FlatList data={filteredBhajans} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} keyExtractor={(item) => `man-b-${item.id}`} renderItem={({ item }) => (
              <View style={[SS.card, { padding: 12, marginBottom: 10, flexDirection: "row", gap: 12, alignItems: "center" }]}>
                <Image source={{ uri: im(item.img, 100, 100) }} style={{ width: 50, height: 50, borderRadius: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: C.charcoal }}>{item.title}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{item.artist} · {item.cat}</Text>
                </View>
                <Pressable onPress={() => { setBhajans(bhajans.filter((x) => x.id !== item.id)); showToast("Bhajan removed locally"); }} style={{ padding: 6, borderRadius: 8, backgroundColor: "rgba(229,57,53,0.1)" }}><Ionicons name="trash-outline" size={16} color="#e53935" /></Pressable>
              </View>
            )} />
          )}

          {contentSubTab === "festivals" && (
            <FlatList data={filteredFestivals} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} keyExtractor={(item) => `man-f-${item.name}`} renderItem={({ item }) => (
              <View style={[SS.card, { padding: 12, marginBottom: 10, flexDirection: "row", gap: 12, alignItems: "center" }]}>
                <Image source={{ uri: im(item.img, 100, 100) }} style={{ width: 50, height: 50, borderRadius: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: C.charcoal }}>{item.name}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{fmtDate(item.date)}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable onPress={() => openFestEdit(item)} style={{ padding: 6, borderRadius: 8, backgroundColor: C.warmGray }}><Ionicons name="create-outline" size={16} color={C.charcoal} /></Pressable>
                  <Pressable onPress={() => { setFestivals(festivals.filter((x) => x.name !== item.name)); showToast("Festival removed locally"); }} style={{ padding: 6, borderRadius: 8, backgroundColor: "rgba(229,57,53,0.1)" }}><Ionicons name="trash-outline" size={16} color="#e53935" /></Pressable>
                </View>
              </View>
            )} />
          )}
        </View>
      )}

      {tab === "managers" && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} refreshControl={<RefreshControl refreshing={mgrLoading} onRefresh={loadManagers} tintColor={C.saffron} />}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Text style={{ fontFamily: "serif", fontSize: 18, fontWeight: "700", color: C.charcoal }}>Manager Accounts</Text>
            <Pressable onPress={() => setShowAddMgrModal(true)} style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.saffron, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
              <Ionicons name="person-add" size={14} color={C.white} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: C.white }}>Create Manager</Text>
            </Pressable>
          </View>

          {managers.map((mgr) => (
            <View key={mgr.id} style={[SS.card, { padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12 }]}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: mgr.banned ? "#f44336" : C.saffron, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: C.white }}>{mgr.name[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: C.charcoal }}>{mgr.name}</Text>
                <Text style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{mgr.email} {mgr.banned && "· (Banned)"}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Switch trackColor={{ false: "#ccc", true: "#f44336" }} thumbColor={C.white} value={mgr.banned || false} onValueChange={() => handleToggleBan(mgr.id, mgr.banned || false)} />
                <Pressable onPress={() => handleRemoveManager(mgr.id)} style={{ padding: 6, borderRadius: 8, backgroundColor: "rgba(229,57,53,0.1)" }}><Ionicons name="trash" size={15} color="#e53935" /></Pressable>
              </View>
            </View>
          ))}

          {managers.length === 0 && !mgrLoading && <View style={{ alignItems: "center", paddingVertical: 40 }}><Text style={{ color: "#999" }}>No managers registered</Text></View>}
        </ScrollView>
      )}

      {tab === "settings" && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontFamily: "serif", fontSize: 18, fontWeight: "700", color: C.charcoal, marginBottom: 14 }}>System Control Settings</Text>

          {/* Maintenance Mode */}
          <View style={[SS.card, { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }]}>
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: C.charcoal }}>System Maintenance Mode</Text>
              <Text style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Blocks public access to app endpoints</Text>
            </View>
            <Switch trackColor={{ false: "#ccc", true: C.saffron }} thumbColor={C.white} value={maintMode} onValueChange={setMaintMode} />
          </View>

          {/* Rate Limits */}
          <View style={[SS.card, { padding: 16, marginBottom: 12 }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "700", color: C.charcoal }}>API Rate Limit</Text>
                <Text style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Max allowed API requests per minute</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: "800", color: C.saffron }}>{rateLimit} req/min</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14, justifyContent: "center", marginTop: 6 }}>
              <Pressable onPress={() => setRateLimit(Math.max(10, rateLimit - 10))} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.warmGray, alignItems: "center", justifyContent: "center" }}><Ionicons name="remove" size={18} color={C.charcoal} /></Pressable>
              <View style={{ height: 4, flex: 1, backgroundColor: C.warmGray, borderRadius: 2 }}>
                <View style={{ height: "100%", width: `${(rateLimit / 120) * 100}%`, backgroundColor: C.saffron, borderRadius: 2 }} />
              </View>
              <Pressable onPress={() => setRateLimit(Math.min(120, rateLimit + 10))} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.warmGray, alignItems: "center", justifyContent: "center" }}><Ionicons name="add" size={18} color={C.charcoal} /></Pressable>
            </View>
          </View>

          {/* Log levels */}
          <View style={[SS.card, { padding: 16, marginBottom: 20 }]}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: C.charcoal, marginBottom: 4 }}>System Debug Log Level</Text>
            <Text style={{ fontSize: 11, color: "#888", marginBottom: 12 }}>Controls level of logs sent to simulated database</Text>
            <View style={{ flexDirection: "row", backgroundColor: C.warmGray, borderRadius: 12, padding: 4 }}>
              {(["debug", "info", "error"] as const).map((lvl) => {
                const act = debugLevel === lvl;
                return (
                  <Pressable key={lvl} onPress={() => setDebugLevel(lvl)} style={{ flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10, backgroundColor: act ? C.saffron : "transparent" }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: act ? C.white : C.charcoal, textTransform: "capitalize" }}>{lvl}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}

      {/* CREATE MANAGER MODAL */}
      <Modal visible={showAddMgrModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: C.white, borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowRadius: 10, shadowOpacity: 0.1, elevation: 5 }}>
            <Text style={{ fontFamily: "serif", fontSize: 18, fontWeight: "700", color: C.charcoal, marginBottom: 16 }}>Create New Manager</Text>
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Manager Name" value={newMgrName} onChangeText={setNewMgrName} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Email" keyboardType="email-address" value={newMgrEmail} onChangeText={setNewMgrEmail} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 20 }} placeholder="Password" secureTextEntry value={newMgrPass} onChangeText={setNewMgrPass} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable onPress={() => setShowAddMgrModal(false)} style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: C.warmGray, alignItems: "center" }}><Text style={{ fontSize: 14, fontWeight: "700", color: C.charcoal }}>Cancel</Text></Pressable>
              <Pressable onPress={handleCreateManager} style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: C.saffron, alignItems: "center" }}><Text style={{ fontSize: 14, fontWeight: "700", color: C.white }}>Create</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* TEMPLE EDIT/ADD MODAL */}
      <Modal visible={showTempleModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: C.warmWhite }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.warmGray, backgroundColor: C.white }}>
            <Pressable onPress={() => setShowTempleModal(false)} style={{ padding: 4 }}><Ionicons name="close" size={22} color={C.charcoal} /></Pressable>
            <Text style={{ fontFamily: "serif", fontSize: 20, fontWeight: "700", color: C.charcoal }}>{editingTempleId ? "Edit Temple" : "Add Temple"}</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Temple Name *" value={tName} onChangeText={setTName} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Location *" value={tLocation} onChangeText={setTLocation} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Main Deity *" value={tDeity} onChangeText={setTDeity} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Timings (e.g. 6 AM - 9 PM) *" value={tTimings} onChangeText={setTTimings} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Image URL (optional)" value={tImg} onChangeText={setTImg} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Livestream Video URL (optional)" value={tVideoUrl} onChangeText={setTVideoUrl} />
            
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.white, padding: 12, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: C.charcoal }}>Is Stream Currently Live?</Text>
              <Switch value={tLive} onValueChange={setTLive} />
            </View>

            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, height: 80, textAlignVertical: "top", marginBottom: 12 }} placeholder="Brief Description" multiline value={tDesc} onChangeText={setTDesc} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, height: 80, textAlignVertical: "top", marginBottom: 12 }} placeholder="History Section" multiline value={tHistory} onChangeText={setTHistory} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, height: 80, textAlignVertical: "top", marginBottom: 12 }} placeholder="Mythology Section" multiline value={tMythology} onChangeText={setTMythology} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, height: 80, textAlignVertical: "top", marginBottom: 20 }} placeholder="Significance Section" multiline value={tSignificance} onChangeText={setTSignificance} />

            <Pressable onPress={saveTemple} style={{ width: "100%", paddingVertical: 14, borderRadius: 10, backgroundColor: C.saffron, alignItems: "center" }}><Text style={{ fontSize: 14, fontWeight: "700", color: C.white }}>Save Temple</Text></Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* BHAJAN ADD MODAL */}
      <Modal visible={showBhajanModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: C.warmWhite }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.warmGray, backgroundColor: C.white }}>
            <Pressable onPress={() => setShowBhajanModal(false)} style={{ padding: 4 }}><Ionicons name="close" size={22} color={C.charcoal} /></Pressable>
            <Text style={{ fontFamily: "serif", fontSize: 20, fontWeight: "700", color: C.charcoal }}>Add Bhajan</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Bhajan Title *" value={bTitle} onChangeText={setBTitle} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Artist *" value={bArtist} onChangeText={setBArtist} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Duration (e.g. 5:24) *" value={bDuration} onChangeText={setBDuration} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Image URL (optional)" value={bImg} onChangeText={setBImg} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 20 }} placeholder="Audio URL *" value={bAudio} onChangeText={setBAudio} />
            
            <Text style={{ fontSize: 12, fontWeight: "700", color: C.charcoal, marginBottom: 8 }}>Bhajan Category</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {["Morning", "Aarti", "Chalisa", "Mantra", "Kirtan", "Stuti"].map((cat) => {
                const act = bCat === cat;
                return (
                  <Pressable key={cat} onPress={() => setBCat(cat)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: act ? C.saffron : C.white, borderWidth: 1, borderColor: act ? C.saffron : C.warmGray }}><Text style={{ fontSize: 12, fontWeight: "700", color: act ? C.white : C.charcoal }}>{cat}</Text></Pressable>
                );
              })}
            </View>

            <Pressable onPress={saveBhajan} style={{ width: "100%", paddingVertical: 14, borderRadius: 10, backgroundColor: C.saffron, alignItems: "center" }}><Text style={{ fontSize: 14, fontWeight: "700", color: C.white }}>Save Bhajan</Text></Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* FESTIVAL ADD/EDIT MODAL */}
      <Modal visible={showFestModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: C.warmWhite }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.warmGray, backgroundColor: C.white }}>
            <Pressable onPress={() => setShowFestModal(false)} style={{ padding: 4 }}><Ionicons name="close" size={22} color={C.charcoal} /></Pressable>
            <Text style={{ fontFamily: "serif", fontSize: 20, fontWeight: "700", color: C.charcoal }}>{editingFestName ? "Edit Festival" : "Add Festival"}</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Festival Name *" value={fName} onChangeText={setFName} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Date (YYYY-MM-DD) *" value={fDate} onChangeText={setFDate} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Image URL (optional)" value={fImg} onChangeText={setFImg} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, height: 100, textAlignVertical: "top", marginBottom: 20 }} placeholder="Festival Description" multiline value={fDesc} onChangeText={setFDesc} />

            <Pressable onPress={saveFest} style={{ width: "100%", paddingVertical: 14, borderRadius: 10, backgroundColor: C.saffron, alignItems: "center" }}><Text style={{ fontSize: 14, fontWeight: "700", color: C.white }}>Save Festival</Text></Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ───────────────────── MANAGER DASHBOARD ─────────────────────
function ManagerDashboardScreen() {
  const { navigate } = useNavigation() as any;
  const token = useApp((s) => s.authToken);
  const logout = useApp((s) => s.logout);
  const showToast = useApp((s) => s.showToast);
  const temples = useApp((s) => s.temples);
  const festivals = useApp((s) => s.festivals);
  const bhajans = useApp((s) => s.bhajans);
  const fetchData = useApp((s) => s.fetchData);

  const [tab, setTab] = useState<"content" | "livestreams" | "settings">("content");
  const [contentSubTab, setContentSubTab] = useState<"temples" | "bhajans" | "festivals">("temples");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showTempleModal, setShowTempleModal] = useState(false);
  const [showBhajanModal, setShowBhajanModal] = useState(false);
  const [showFestModal, setShowFestModal] = useState(false);

  // Edit states
  const [editingTempleId, setEditingTempleId] = useState<number | null>(null);
  const [editingFestName, setEditingFestName] = useState<string | null>(null);

  // Temple Form fields
  const [tName, setTName] = useState("");
  const [tLocation, setTLocation] = useState("");
  const [tDeity, setTDeity] = useState("");
  const [tTimings, setTTimings] = useState("");
  const [tImg, setTImg] = useState("");
  const [tLive, setTLive] = useState(false);
  const [tDesc, setTDesc] = useState("");
  const [tHistory, setTHistory] = useState("");
  const [tMythology, setTMythology] = useState("");
  const [tSignificance, setTSignificance] = useState("");
  const [tVideoUrl, setTVideoUrl] = useState("");

  // Bhajan Form fields
  const [bTitle, setBTitle] = useState("");
  const [bArtist, setBArtist] = useState("");
  const [bDuration, setBDuration] = useState("5:00");
  const [bCat, setBCat] = useState("Mantra");
  const [bImg, setBImg] = useState("");
  const [bAudio, setBAudio] = useState("");

  // Festival Form fields
  const [fName, setFName] = useState("");
  const [fDate, setFDate] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fImg, setFImg] = useState("");

  // Livestreams edits
  const [activeLivestreamId, setActiveLivestreamId] = useState<number | null>(null);
  const [liveUrlVal, setLiveUrlVal] = useState("");
  const [liveStatusVal, setLiveStatusVal] = useState(false);
  const [timingVal, setTimingVal] = useState("");

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully");
    navigate("Tabs");
  };

  // Content Actions (no Delete for Manager)
  const openTempleAdd = () => {
    setEditingTempleId(null);
    setTName(""); setTLocation(""); setTDeity(""); setTTimings("");
    setTImg(""); setTLive(false); setTDesc(""); setTHistory("");
    setTMythology(""); setTSignificance(""); setTVideoUrl("");
    setShowTempleModal(true);
  };

  const openTempleEdit = (temp: Temple) => {
    setEditingTempleId(temp.id);
    setTName(temp.name);
    setTLocation(temp.location);
    setTDeity(temp.deity);
    setTTimings(temp.timings);
    setTImg(temp.img);
    setTLive(temp.live);
    setTDesc(temp.desc);
    setTHistory(temp.history);
    setTMythology(temp.mythology);
    setTSignificance(temp.significance);
    setTVideoUrl(temp.videoUrl || "");
    setShowTempleModal(true);
  };

  const saveTemple = async () => {
    if (!token) return;
    if (!tName || !tLocation || !tDeity || !tTimings) {
      showToast("Please fill name, location, deity, timings");
      return;
    }
    try {
      const payload = {
        name: tName, location: tLocation, deity: tDeity, timings: tTimings,
        img: tImg || "temple_default", live: tLive, desc: tDesc,
        history: tHistory, mythology: tMythology, significance: tSignificance,
        videoUrl: tVideoUrl || undefined
      };
      if (editingTempleId !== null) {
        await api.editTemple(token, editingTempleId, payload);
        showToast("Temple updated successfully");
      } else {
        await api.addTemple(token, payload);
        showToast("Temple added successfully");
      }
      setShowTempleModal(false);
      await fetchData();
    } catch (e: any) {
      showToast(e.message || "Failed to save temple");
    }
  };

  const openBhajanAdd = () => {
    setBTitle(""); setBArtist(""); setBDuration("5:00"); setBCat("Mantra");
    setBImg(""); setBAudio("");
    setShowBhajanModal(true);
  };

  const saveBhajan = async () => {
    if (!token) return;
    if (!bTitle || !bArtist || !bAudio) {
      showToast("Please fill title, artist, audio URL");
      return;
    }
    try {
      const payload = {
        title: bTitle, artist: bArtist, duration: bDuration, cat: bCat,
        img: bImg || "bhajan_default", audio: bAudio
      };
      await api.addBhajan(token, payload);
      showToast("Bhajan added successfully");
      setShowBhajanModal(false);
      await fetchData();
    } catch (e: any) {
      showToast(e.message || "Failed to add bhajan");
    }
  };

  const openFestAdd = () => {
    setEditingFestName(null);
    setFName(""); setFDate(new Date().toISOString().split("T")[0]); setFDesc(""); setFImg("");
    setShowFestModal(true);
  };

  const openFestEdit = (fest: Festival) => {
    setEditingFestName(fest.name);
    setFName(fest.name);
    setFDate(fest.date);
    setFDesc(fest.desc);
    setFImg(fest.img);
    setShowFestModal(true);
  };

  const saveFest = async () => {
    if (!token) return;
    if (!fName || !fDate) {
      showToast("Please fill name and date");
      return;
    }
    try {
      const payload = { name: fName, date: fDate, desc: fDesc, img: fImg || "fest_default" };
      if (editingFestName !== null) {
        await api.editFestival(token, editingFestName, payload);
        showToast("Festival updated successfully");
      } else {
        await api.addFestival(token, payload);
        showToast("Festival added successfully");
      }
      setShowFestModal(false);
      await fetchData();
    } catch (e: any) {
      showToast(e.message || "Failed to save festival");
    }
  };

  const openLivestreamEdit = (temp: Temple) => {
    setActiveLivestreamId(temp.id);
    setLiveUrlVal(temp.videoUrl || "");
    setLiveStatusVal(temp.live);
    setTimingVal(temp.timings);
  };

  const handleUpdateLivestream = async () => {
    if (!token || activeLivestreamId === null) return;
    try {
      await api.editTemple(token, activeLivestreamId, { timings: timingVal });
      await api.editLivestream(token, activeLivestreamId, liveStatusVal, liveUrlVal || undefined);
      showToast("Livestream details updated");
      setActiveLivestreamId(null);
      await fetchData();
    } catch (e: any) {
      showToast(e.message || "Failed to update livestream details");
    }
  };

  const filteredTemples = temples.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.location.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredBhajans = bhajans.filter((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.artist.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFestivals = festivals.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: C.warmWhite }}>
      {/* Top Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.warmGray, backgroundColor: C.white }}>
        <View>
          <Text style={{ fontFamily: "serif", fontSize: 20, fontWeight: "700", color: C.charcoal }}>Manager Control Panel</Text>
          <Text style={{ fontSize: 11, color: C.gold, fontWeight: "600", marginTop: 2 }}>Logged in as Manager</Text>
        </View>
        <Pressable onPress={handleLogout} style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,140,66,0.1)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
          <Ionicons name="log-out" size={15} color={C.saffron} />
          <Text style={{ fontSize: 12, fontWeight: "700", color: C.saffron }}>Logout</Text>
        </Pressable>
      </View>

      {/* Tab Selector */}
      <View style={{ flexDirection: "row", backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.warmGray }}>
        {(["content", "livestreams", "settings"] as const).map((t) => {
          const active = tab === t;
          return (
            <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: 2, borderBottomColor: active ? C.saffron : "transparent" }}>
              <Ionicons name={t === "content" ? "folder-open" : t === "livestreams" ? "radio" : "settings"} size={18} color={active ? C.saffron : "#888"} />
              <Text style={{ fontSize: 11, fontWeight: "700", color: active ? C.saffron : "#888", marginTop: 4, textTransform: "capitalize" }}>{t}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tab Body */}
      {tab === "content" && (
        <View style={{ flex: 1 }}>
          {/* Sub-tab selection bar */}
          <View style={{ flexDirection: "row", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: C.white, gap: 10 }}>
            {(["temples", "bhajans", "festivals"] as const).map((sub) => {
              const active = contentSubTab === sub;
              return (
                <Pressable key={sub} onPress={() => setContentSubTab(sub)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: active ? C.saffron : C.warmGray }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: active ? C.white : C.charcoal, textTransform: "capitalize" }}>{sub}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Quick search input */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 12, paddingHorizontal: 12 }}>
              <Ionicons name="search" size={14} color="#bbb" />
              <TextInput style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 13, color: C.charcoal }} placeholder={`Search ${contentSubTab}...`} value={searchQuery} onChangeText={setSearchQuery} />
              {searchQuery ? <Pressable onPress={() => setSearchQuery("")}><Ionicons name="close-circle" size={14} color="#bbb" /></Pressable> : null}
            </View>
          </View>

          {/* List layout & Action button */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Manage List</Text>
            <Pressable onPress={() => { if (contentSubTab === "temples") openTempleAdd(); else if (contentSubTab === "bhajans") openBhajanAdd(); else openFestAdd(); }} style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.saffron, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
              <Ionicons name="add" size={14} color={C.white} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: C.white }}>Add New</Text>
            </Pressable>
          </View>

          {contentSubTab === "temples" && (
            <FlatList data={filteredTemples} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} keyExtractor={(item) => `man-t-${item.id}`} renderItem={({ item }) => (
              <View style={[SS.card, { padding: 12, marginBottom: 10, flexDirection: "row", gap: 12, alignItems: "center" }]}>
                <Image source={{ uri: im(item.img, 100, 100) }} style={{ width: 50, height: 50, borderRadius: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: C.charcoal }}>{item.name}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{item.location} · {item.deity}</Text>
                </View>
                <Pressable onPress={() => openTempleEdit(item)} style={{ padding: 10, borderRadius: 8, backgroundColor: C.warmGray }}><Ionicons name="create-outline" size={16} color={C.charcoal} /></Pressable>
              </View>
            )} />
          )}

          {contentSubTab === "bhajans" && (
            <FlatList data={filteredBhajans} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} keyExtractor={(item) => `man-b-${item.id}`} renderItem={({ item }) => (
              <View style={[SS.card, { padding: 12, marginBottom: 10, flexDirection: "row", gap: 12, alignItems: "center" }]}>
                <Image source={{ uri: im(item.img, 100, 100) }} style={{ width: 50, height: 50, borderRadius: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: C.charcoal }}>{item.title}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{item.artist} · {item.cat}</Text>
                </View>
              </View>
            )} />
          )}

          {contentSubTab === "festivals" && (
            <FlatList data={filteredFestivals} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} keyExtractor={(item) => `man-f-${item.name}`} renderItem={({ item }) => (
              <View style={[SS.card, { padding: 12, marginBottom: 10, flexDirection: "row", gap: 12, alignItems: "center" }]}>
                <Image source={{ uri: im(item.img, 100, 100) }} style={{ width: 50, height: 50, borderRadius: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: C.charcoal }}>{item.name}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{fmtDate(item.date)}</Text>
                </View>
                <Pressable onPress={() => openFestEdit(item)} style={{ padding: 10, borderRadius: 8, backgroundColor: C.warmGray }}><Ionicons name="create-outline" size={16} color={C.charcoal} /></Pressable>
              </View>
            )} />
          )}
        </View>
      )}

      {tab === "livestreams" && (
        <FlatList data={temples} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyExtractor={(item) => `ls-t-${item.id}`} renderItem={({ item }) => {
          const isSelected = activeLivestreamId === item.id;
          return (
            <View style={[SS.card, { padding: 14, marginBottom: 12 }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: C.charcoal }}>{item.name}</Text>
                  <Text style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Current Timings: {item.timings}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.live ? C.softGreen : "#e53935" }} />
                  <Text style={{ fontSize: 12, fontWeight: "700", color: item.live ? C.softGreen : "#e53935" }}>{item.live ? "Live" : "Offline"}</Text>
                </View>
              </View>
              {isSelected ? (
                <View style={{ borderTopWidth: 1, borderTopColor: C.warmGray, paddingTop: 12, marginTop: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#888", marginBottom: 6 }}>Edit timings</Text>
                  <TextInput style={{ width: "100%", padding: 10, backgroundColor: C.warmWhite, borderWidth: 1, borderColor: C.warmGray, borderRadius: 8, fontSize: 13, color: C.charcoal, marginBottom: 10 }} value={timingVal} onChangeText={setTimingVal} />
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#888", marginBottom: 6 }}>Livestream URL</Text>
                  <TextInput style={{ width: "100%", padding: 10, backgroundColor: C.warmWhite, borderWidth: 1, borderColor: C.warmGray, borderRadius: 8, fontSize: 13, color: C.charcoal, marginBottom: 10 }} value={liveUrlVal} onChangeText={setLiveUrlVal} placeholder="https://youtube.com/..." />
                  
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: C.charcoal }}>Toggle Stream Live Status</Text>
                    <Switch value={liveStatusVal} onValueChange={setLiveStatusVal} />
                  </View>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <Pressable onPress={() => setActiveLivestreamId(null)} style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: C.warmGray, alignItems: "center" }}><Text style={{ fontSize: 12, fontWeight: "700", color: C.charcoal }}>Cancel</Text></Pressable>
                    <Pressable onPress={handleUpdateLivestream} style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: C.saffron, alignItems: "center" }}><Text style={{ fontSize: 12, fontWeight: "700", color: C.white }}>Save</Text></Pressable>
                  </View>
                </View>
              ) : (
                <Pressable onPress={() => openLivestreamEdit(item)} style={{ marginTop: 6, flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center", backgroundColor: C.warmGray, paddingVertical: 10, borderRadius: 8 }}>
                  <Ionicons name="radio" size={14} color={C.saffron} />
                  <Text style={{ fontSize: 12, fontWeight: "700", color: C.saffron }}>Configure Live Feed</Text>
                </Pressable>
              )}
            </View>
          );
        }} />
      )}

      {tab === "settings" && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontFamily: "serif", fontSize: 18, fontWeight: "700", color: C.charcoal, marginBottom: 14 }}>Manager Portal Settings</Text>
          <View style={[SS.card, { padding: 16, marginBottom: 20 }]}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: C.charcoal }}>Access Scope</Text>
            <Text style={{ fontSize: 12, color: "#888", marginTop: 6, lineHeight: 18 }}>• Update existing temple details and timings.{"\n"}• Set live streams online/offline and set video feeds.{"\n"}• Add new temples, bhajans and festivals.{"\n"}• Deletion of items and manager management is restricted to administrators.</Text>
          </View>
        </ScrollView>
      )}

      {/* TEMPLE EDIT/ADD MODAL */}
      <Modal visible={showTempleModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: C.warmWhite }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.warmGray, backgroundColor: C.white }}>
            <Pressable onPress={() => setShowTempleModal(false)} style={{ padding: 4 }}><Ionicons name="close" size={22} color={C.charcoal} /></Pressable>
            <Text style={{ fontFamily: "serif", fontSize: 20, fontWeight: "700", color: C.charcoal }}>{editingTempleId ? "Edit Temple" : "Add Temple"}</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Temple Name *" value={tName} onChangeText={setTName} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Location *" value={tLocation} onChangeText={setTLocation} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Main Deity *" value={tDeity} onChangeText={setTDeity} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Timings (e.g. 6 AM - 9 PM) *" value={tTimings} onChangeText={setTTimings} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Image URL (optional)" value={tImg} onChangeText={setTImg} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Livestream Video URL (optional)" value={tVideoUrl} onChangeText={setTVideoUrl} />
            
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.white, padding: 12, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: C.charcoal }}>Is Stream Currently Live?</Text>
              <Switch value={tLive} onValueChange={setTLive} />
            </View>

            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, height: 80, textAlignVertical: "top", marginBottom: 12 }} placeholder="Brief Description" multiline value={tDesc} onChangeText={setTDesc} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, height: 80, textAlignVertical: "top", marginBottom: 12 }} placeholder="History Section" multiline value={tHistory} onChangeText={setTHistory} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, height: 80, textAlignVertical: "top", marginBottom: 12 }} placeholder="Mythology Section" multiline value={tMythology} onChangeText={setTMythology} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, height: 80, textAlignVertical: "top", marginBottom: 20 }} placeholder="Significance Section" multiline value={tSignificance} onChangeText={setTSignificance} />

            <Pressable onPress={saveTemple} style={{ width: "100%", paddingVertical: 14, borderRadius: 10, backgroundColor: C.saffron, alignItems: "center" }}><Text style={{ fontSize: 14, fontWeight: "700", color: C.white }}>Save Temple</Text></Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* BHAJAN ADD MODAL */}
      <Modal visible={showBhajanModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: C.warmWhite }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.warmGray, backgroundColor: C.white }}>
            <Pressable onPress={() => setShowBhajanModal(false)} style={{ padding: 4 }}><Ionicons name="close" size={22} color={C.charcoal} /></Pressable>
            <Text style={{ fontFamily: "serif", fontSize: 20, fontWeight: "700", color: C.charcoal }}>Add Bhajan</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Bhajan Title *" value={bTitle} onChangeText={setBTitle} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Artist *" value={bArtist} onChangeText={setBArtist} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Duration (e.g. 5:24) *" value={bDuration} onChangeText={setBDuration} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Image URL (optional)" value={bImg} onChangeText={setBImg} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 20 }} placeholder="Audio URL *" value={bAudio} onChangeText={setBAudio} />
            
            <Text style={{ fontSize: 12, fontWeight: "700", color: C.charcoal, marginBottom: 8 }}>Bhajan Category</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {["Morning", "Aarti", "Chalisa", "Mantra", "Kirtan", "Stuti"].map((cat) => {
                const act = bCat === cat;
                return (
                  <Pressable key={cat} onPress={() => setBCat(cat)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: act ? C.saffron : C.white, borderWidth: 1, borderColor: act ? C.saffron : C.warmGray }}><Text style={{ fontSize: 12, fontWeight: "700", color: act ? C.white : C.charcoal }}>{cat}</Text></Pressable>
                );
              })}
            </View>

            <Pressable onPress={saveBhajan} style={{ width: "100%", paddingVertical: 14, borderRadius: 10, backgroundColor: C.saffron, alignItems: "center" }}><Text style={{ fontSize: 14, fontWeight: "700", color: C.white }}>Save Bhajan</Text></Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* FESTIVAL ADD/EDIT MODAL */}
      <Modal visible={showFestModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: C.warmWhite }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.warmGray, backgroundColor: C.white }}>
            <Pressable onPress={() => setShowFestModal(false)} style={{ padding: 4 }}><Ionicons name="close" size={22} color={C.charcoal} /></Pressable>
            <Text style={{ fontFamily: "serif", fontSize: 20, fontWeight: "700", color: C.charcoal }}>{editingFestName ? "Edit Festival" : "Add Festival"}</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Festival Name *" value={fName} onChangeText={setFName} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Date (YYYY-MM-DD) *" value={fDate} onChangeText={setFDate} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, marginBottom: 12 }} placeholder="Image URL (optional)" value={fImg} onChangeText={setFImg} />
            <TextInput style={{ width: "100%", padding: 12, backgroundColor: C.white, borderWidth: 1, borderColor: C.warmGray, borderRadius: 10, fontSize: 14, color: C.charcoal, height: 100, textAlignVertical: "top", marginBottom: 20 }} placeholder="Festival Description" multiline value={fDesc} onChangeText={setFDesc} />

            <Pressable onPress={saveFest} style={{ width: "100%", paddingVertical: 14, borderRadius: 10, backgroundColor: C.saffron, alignItems: "center" }}><Text style={{ fontSize: 14, fontWeight: "700", color: C.white }}>Save Festival</Text></Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ───────────────────── NAVIGATION ─────────────────────
let navRef: any;
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNav() {
  return (
    <View style={{ flex: 1, backgroundColor: C.warmWhite, position: "relative" }}>
      <Tab.Navigator screenOptions={{ headerShown: false, tabBarShowLabel: true, tabBarLabelStyle: { fontSize: 10, fontWeight: "700" }, tabBarStyle: { backgroundColor: "rgba(255,248,240,0.95)", borderTopColor: "rgba(0,0,0,0.05)", paddingTop: 6, paddingBottom: 18, height: 72 }, tabBarActiveTintColor: C.saffron, tabBarInactiveTintColor: "#bbb" }}>
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} /> }} />
        <Tab.Screen name="Discover" component={DiscoverScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="compass" size={22} color={color} /> }} />
        <Tab.Screen name="Live" component={LiveScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="radio" size={22} color={color} /> }} />
        <Tab.Screen name="Bhajans" component={BhajansScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="musical-notes" size={22} color={color} /> }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} /> }} />
      </Tab.Navigator>
      <MiniPlayer />
      <AIFab />
    </View>
  );
}

function AppNav() {
  const onboarded = useApp((s) => s.onboarded);
  const [screen, setScreen] = useState<"splash" | "onb" | "app">("splash");
  if (screen === "splash") return <Splash onDone={() => setScreen(onboarded ? "app" : "onb")} />;
  if (screen === "onb") return <Onboarding onDone={() => setScreen("app")} />;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="Tabs" component={TabNav} options={{ animation: "fade" }} />
      <Stack.Screen name="TempleDetail" component={TempleDetailScreen} options={{ animation: "slide_from_bottom", presentation: "modal" }} />
      <Stack.Screen name="FullPlayer" component={FullPlayerScreen} options={{ animation: "slide_from_bottom", presentation: "modal" }} />
      <Stack.Screen name="AIChat" component={AIChatScreen} options={{ animation: "slide_from_bottom", presentation: "modal" }} />
      <Stack.Screen name="StaffAuth" component={StaffAuthScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
    </Stack.Navigator>
  );
}

// ───────────────────── ENTRY ─────────────────────
export default function App() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    Font.loadAsync({ serif: { uri: "https://github.com/google/fonts/raw/main/ofl/cormorantgaramond/CormorantGaramond-SemiBold.ttf" } }).catch(() => {}).finally(() => {
      useApp.getState().fetchData();
      setLoaded(true);
    });
  }, []);
  if (!loaded) return <View style={{ flex: 1, backgroundColor: "#1a0800" }} />;
  console.log("DEBUG: DefaultTheme is", DefaultTheme);
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={(r) => { navRef = r; }} theme={{ ...DefaultTheme, dark: false, colors: { ...DefaultTheme.colors, background: C.warmWhite, card: C.white, text: C.charcoal, border: C.warmGray, primary: C.saffron, notification: C.maroon } }}>
        <StatusBar barStyle="dark-content" backgroundColor={C.warmWhite} />
        <View style={{ flex: 1 }}><AppNav /><Toast /></View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}