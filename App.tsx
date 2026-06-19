/*
 ╔══════════════════════════════════════════════════════════════╗
 ║  DIVYA — Spiritual Temple App (Single File)                  ║
 ║                                                              ║
 ║  SETUP:                                                      ║
 ║  1. npx create-expo-app divya --template blank-typescript    ║
 ║  2. cd divya                                                 ║
 ║  3. npm install @react-navigation/native @react-navigation/  ║
 ║     bottom-tabs @react-navigation/native-stack               ║
 ║     react-native-screens react-native-safe-area-context      ║
 ║     zustand expo-font                                        ║
 ║  4. npx expo install react-native-gesture-handler            ║
 ║  5. Replace App.tsx with this file                           ║
 ║  6. npx expo start                                           ║
 ╚══════════════════════════════════════════════════════════════╝
*/

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Animated,
  StatusBar,
  StyleSheet,
} from "react-native";
import {
  NavigationContainer,
  useNavigation,
  useRoute,
  DefaultTheme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { create } from "zustand";
import * as Font from "expo-font";

// ──────────────────────────── THEME ────────────────────────────
const T = {
  saffron: "#FF8C42",
  saffronLight: "#FFB380",
  gold: "#D4A017",
  goldLight: "#F0D060",
  maroon: "#7A1F1F",
  maroonLight: "#A03030",
  warmWhite: "#FFF8F0",
  warmGray: "#F5EDE0",
  charcoal: "#2C2C2C",
  softGreen: "#4CAF50",
  white: "#FFFFFF",
};

// ──────────────────────────── DATA ─────────────────────────────
const DEITIES = [
  { id: "shiva", name: "Lord Shiva", icon: "planet" as const, color: "#3B5998" },
  { id: "krishna", name: "Lord Krishna", icon: "musical-notes" as const, color: "#6B4FA0" },
  { id: "ram", name: "Lord Ram", icon: "crown" as const, color: "#D4772C" },
  { id: "hanuman", name: "Hanuman Ji", icon: "hand-right" as const, color: "#C0392B" },
  { id: "durga", name: "Maa Durga", icon: "shield" as const, color: "#8E2525" },
  { id: "kali", name: "Maa Kali", icon: "flame" as const, color: "#4A1A1A" },
  { id: "vishnu", name: "Lord Vishnu", icon: "refresh" as const, color: "#B8860B" },
  { id: "ganesha", name: "Lord Ganesha", icon: "leaf" as const, color: "#CC7722" },
  { id: "lakshmi", name: "Maa Lakshmi", icon: "sparkles" as const, color: "#C06080" },
  { id: "saraswati", name: "Maa Saraswati", icon: "book" as const, color: "#5B8FA8" },
];

const TEMPLES = [
  { id: 1, name: "Kashi Vishwanath", location: "Varanasi, Uttar Pradesh", deity: "Shiva", timings: "3:00 AM – 11:00 PM", img: "kashi-vishwanath-temple", live: true, desc: "One of the twelve Jyotirlingas, Kashi Vishwanath is the holiest of Shiva temples, nestled on the western bank of the Ganges in the ancient city of Varanasi.", history: "The temple has been destroyed and rebuilt multiple times throughout history. The current structure was commissioned by Maharani Ahilyabai Holkar of Indore in 1780, with the golden spire donated by Maharaja Ranjit Singh in 1839.", mythology: "According to legend, Lord Shiva himself established this temple. It is believed that a simple glimpse of the Jyotirlinga here liberates a soul from the cycle of birth and death.", significance: "Kashi is considered the spiritual capital of India. Death in Kashi is said to bring moksha — liberation from the endless cycle of reincarnation." },
  { id: 2, name: "Tirupati Balaji", location: "Tirumala, Andhra Pradesh", deity: "Vishnu", timings: "3:00 AM – 12:00 AM", img: "tirupati-hill-temple", live: true, desc: "The Venkateswara Temple at Tirumala is the most visited holy place in the world, drawing over 50 million pilgrims annually.", history: "The temple dates back to at least the 6th century, with contributions from multiple dynasties including the Pallavas, Cholas, and Vijayanagara emperors.", mythology: "Lord Venkateswara is believed to have appeared here to save humanity from the trials of Kali Yuga. The idol is said to be self-manifested.", significance: "It is the richest temple in the world by donations. The presiding deity is worshipped as Kaliyuga Vaikuntha." },
  { id: 3, name: "Vaishno Devi", location: "Katra, Jammu & Kashmir", deity: "Durga", timings: "Open 24 hours", img: "vaishno-devi-mountain", live: false, desc: "Located in the Trikuta Mountains at 5,200 feet, the holy cave shrine of Vaishno Devi is one of the most revered Shakti Peethas.", history: "The cave has been a pilgrimage site for centuries. Formal facilities were developed in the mid-20th century.", mythology: "The Goddess merged her three forms — Mahakali, Mahalakshmi, and Mahasaraswati — into a single rock formation.", significance: "One of the 108 Shakti Peethas where the Mother Goddess fulfills sincere wishes of devotees." },
  { id: 4, name: "Somnath Temple", location: "Prabhas Patan, Gujarat", deity: "Shiva", timings: "6:00 AM – 9:00 PM", img: "somnath-coast-temple", live: true, desc: "The first among the twelve Jyotirlinga shrines, Somnath stands on the western coast facing the Arabian Sea.", history: "Destroyed and rebuilt seventeen times, last rebuilt in 1951 under Sardar Patel.", mythology: "Originally built by the Moon God Soma in gold, rebuilt in silver by Ravana, wood by Krishna, stone by Bhimdev.", significance: "Represents the eternal nature of faith — rising again each time, like a phoenix from ashes." },
  { id: 5, name: "Meenakshi Temple", location: "Madurai, Tamil Nadu", deity: "Parvati", timings: "4:00 AM – 10:00 PM", img: "meenakshi-gopuram-tower", live: false, desc: "A masterpiece of Dravidian architecture spanning 14 acres with 14 towering gopurams.", history: "Built between 1623–1655 by Tirumala Nayaka. Sacred center for over 2,500 years.", mythology: "Dedicated to Meenakshi (Parvati) and Sundareshwarar (Shiva). Their divine marriage is celebrated annually.", significance: "One of the largest temple complexes in India — a zenith of South Indian civilization." },
  { id: 6, name: "Siddhivinayak", location: "Mumbai, Maharashtra", deity: "Ganesha", timings: "5:30 AM – 10:00 PM", img: "siddhivinayak-mumbai", live: false, desc: "One of the most prominent Ganesha temples, visited by politicians, celebrities, and devotees alike.", history: "Built in 1801 by Laxman Vithu and Deubai Patil.", mythology: "The idol is chaturbhuj — four-armed — trunk turned right, considered especially auspicious.", significance: "Siddhi means accomplishment. Devotees believe every wish is fulfilled here. Especially crowded on Tuesdays." },
  { id: 7, name: "Kedarnath", location: "Kedarnath, Uttarakhand", deity: "Shiva", timings: "4:00 AM – 9:00 PM", img: "kedarnath-himalaya", live: false, desc: "Perched at 3,583m in the Garhwal Himalayas, one of the twelve Jyotirlingas and a Char Dham site.", history: "Believed built by the Pandavas, revived by Adi Shankaracharya in the 8th century. Survived the 2013 floods.", mythology: "After Kurukshetra, Pandavas sought Shiva. He hid as a bull; his hump remained at Kedarnath.", significance: "The northernmost Jyotirlinga. The trek itself is considered tapasya — spiritual austerity." },
  { id: 8, name: "Jagannath Temple", location: "Puri, Odisha", deity: "Vishnu", timings: "5:00 AM – 11:00 PM", img: "jagannath-puri-rath", live: true, desc: "Famous for the annual Rath Yatra, one of the four sacred Char Dham pilgrimage sites.", history: "Built in the 12th century by King Anantavarman Chodaganga Deva.", mythology: "Dedicated to Jagannath (Krishna). The unfinished deity appearance links to King Indradyumna's story.", significance: "Rath Yatra attracts millions. The temple kitchen is the largest in the world." },
];

const BHAJANS = [
  { id: 1, title: "Om Namah Shivaya", artist: "Traditional", duration: "8:42", cat: "Mantra", img: "shiva-bhajan-blue" },
  { id: 2, title: "Hare Krishna Hare Rama", artist: "ISKCON", duration: "12:15", cat: "Kirtan", img: "krishna-flute-bhajan" },
  { id: 3, title: "Hanuman Chalisa", artist: "Gulshan Kumar", duration: "10:30", cat: "Chalisa", img: "hanuman-sunrise" },
  { id: 4, title: "Jai Shri Ram", artist: "Traditional", duration: "6:18", cat: "Aarti", img: "ram-bow-arrow" },
  { id: 5, title: "Maa Durga Stuti", artist: "Anuradha Paudwal", duration: "9:55", cat: "Stuti", img: "durga-red-gold" },
  { id: 6, title: "Vishnu Sahasranama", artist: "M.S. Subbulakshmi", duration: "28:00", cat: "Mantra", img: "vishnu-conch-blue" },
  { id: 7, title: "Ganesh Aarti", artist: "Traditional", duration: "5:45", cat: "Aarti", img: "ganesha-orange" },
  { id: 8, title: "Saraswati Vandana", artist: "Lata Mangeshkar", duration: "7:20", cat: "Stuti", img: "saraswati-white-lotus" },
  { id: 9, title: "Shiv Tandav Stotram", artist: "Traditional", duration: "11:08", cat: "Stotram", img: "shiva-tandav-dark" },
  { id: 10, title: "Kanha Kanha Re", artist: "Jagjit Singh", duration: "6:50", cat: "Bhajan", img: "krishna-peacock" },
];

const FESTIVALS = [
  { name: "Maha Shivaratri", date: "Feb 26, 2025", desc: "Night of Lord Shiva", img: "shivaratri-om-night" },
  { name: "Holi", date: "Mar 14, 2025", desc: "Festival of Colors", img: "holi-colors-festival" },
  { name: "Ram Navami", date: "Apr 6, 2025", desc: "Birth of Lord Ram", img: "ram-navami-bow" },
  { name: "Hanuman Jayanti", date: "Apr 12, 2025", desc: "Birth of Hanuman Ji", img: "hanuman-jayanti-sun" },
];

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
  { name: "Mantra", icon: "planet" as const, color: "#5B8FA8" },
  { name: "Kirtan", icon: "musical-notes" as const, color: "#6B4FA0" },
  { name: "Stuti", icon: "hand-left" as const, color: "#4CAF50" },
];

const AI_RESPONSES: Record<string, string> = {
  "tell me about kedarnath temple": "Kedarnath is one of the twelve Jyotirlingas of Lord Shiva, situated at 3,583 meters in the Garhwal Himalayas. It is part of the sacred Char Dham Yatra.\n\nAfter the Kurukshetra war, the Pandavas sought Lord Shiva's forgiveness. He took the form of a bull and tried to escape, but his hump remained at Kedarnath. The temple was revived by Adi Shankaracharya in the 8th century. The trek to Kedarnath is considered a profound spiritual journey.",
  "why is mahadev worshipped": "Lord Shiva, known as Mahadev (the Great God), is the Supreme Being in Shaivism. He is the destroyer and transformer within the Trimurti.\n\nShiva represents both asceticism and cosmic dance (Tandava). He is the lord of meditation, arts, and yoga. The lingam represents the formless infinite. Devotees worship him for moksha, wisdom, and dissolution of ego.",
  "explain hanuman chalisa": "The Hanuman Chalisa is a 40-verse hymn composed by Goswami Tulsidas in the 16th century in Awadhi language.\n\nEach verse describes Hanuman's qualities — strength, devotion to Lord Ram, wisdom, and his role as obstacle remover. Reciting it brings courage, protection, peace, and divine grace. Traditionally recited on Tuesdays and Saturdays.",
  "best temples to visit nearby": "I'd love to help! Could you share your current city or region?\n\nMust-visit categories:\n• Jyotirlingas — 12 sacred Shiva temples\n• Char Dham — four holiest sites\n• Shakti Peethas — 51 Goddess temples\n• Divya Desams — 108 Vishnu temples\n\nEach region has extraordinary temples — from Dravidian marvels of the South to Nagara style of the North.",
};

function getAIResponse(text: string): string {
  const l = text.toLowerCase().trim();
  if (AI_RESPONSES[l]) return AI_RESPONSES[l];
  if (l.includes("shiva") || l.includes("mahadev")) return "Lord Shiva, the Supreme ascetic and transformer, is one of the principal deities. He is the destroyer of ignorance and lord of meditation. His abode is Mount Kailash, depicted with Ganges flowing from his matted hair, a crescent moon, and a third eye representing wisdom.";
  if (l.includes("krishna")) return "Lord Krishna is the eighth avatar of Vishnu and central figure of the Bhagavad Gita. From playful childhood in Vrindavan to Arjuna's charioteer in Kurukshetra, Krishna's life teaches dharma, devotion, and divine love.";
  if (l.includes("ram")) return "Lord Ram, seventh avatar of Vishnu, embodies dharma. His life in the Ramayana guides ideal conduct. Known as Maryada Purushottam — the perfect man. Ram Janmabhoomi in Ayodhya is a significant pilgrimage site.";
  if (l.includes("hanuman")) return "Lord Hanuman embodies devotion, strength, and selfless service. Greatest devotee of Lord Ram, he represents unwavering bhakti. Believed immortal (Chiranjeevi), worshipped for protection, courage, and removing obstacles.";
  if (l.includes("durga") || l.includes("kali")) return "Maa Durga is the warrior goddess of shakti — divine feminine power. Created by combined energies of all gods to defeat Mahishasura. Maa Kali is her fierce form, representing time's destructive aspect and ultimate reality beyond form.";
  if (l.includes("temple") || l.includes("mandir")) return "Temples are sacred energy centers designed per vastu shastra. The sanctum (garbhagriha) houses the deity's idol, energized through prana pratishtha. Each temple has unique significance. Want to know about a specific temple?";
  if (l.includes("ganesha") || l.includes("ganesh")) return "Lord Ganesha, remover of obstacles, is worshipped first in any ritual. Created by Parvati from turmeric paste, given an elephant head by Shiva. Represents wisdom, new beginnings, and prosperity.";
  return "Thank you for your question. I can help with temples, deities, scriptures, festivals, and spiritual practices. Could you be more specific about what you'd like to explore?";
}

// ──────────────────────────── HELPERS ──────────────────────────
const img = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;
const city = (loc: string) => loc.split(",")[0].trim();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

// ──────────────────────────── STORES ───────────────────────────
interface AppStore {
  onboarded: boolean;
  selectedDeities: string[];
  savedTemples: number[];
  toast: string | null;
  completeOnboarding: (d: string[]) => void;
  toggleDeity: (id: string) => void;
  saveTemple: (id: number) => void;
  showToast: (m: string) => void;
  clearToast: () => void;
}

const useApp = create<AppStore>((set) => ({
  onboarded: false,
  selectedDeities: [],
  savedTemples: [],
  toast: null,
  completeOnboarding: (d) => set({ onboarded: true, selectedDeities: d }),
  toggleDeity: (id) =>
    set((s) => ({
      selectedDeities: s.selectedDeities.includes(id)
        ? s.selectedDeities.filter((x) => x !== id)
        : [...s.selectedDeities, id],
    })),
  saveTemple: (id) =>
    set((s) => ({
      savedTemples: s.savedTemples.includes(id) ? s.savedTemples : [...s.savedTemples, id],
    })),
  showToast: (m) => {
    set({ toast: m });
    setTimeout(() => set({ toast: null }), 2500);
  },
  clearToast: () => set({ toast: null }),
}));

interface PlayerStore {
  current: typeof BHAJANS[0] | null;
  playing: boolean;
  progress: number;
  play: (b: typeof BHAJANS[0]) => void;
  toggle: () => void;
  close: () => void;
  setProgress: (v: number) => void;
}

const usePlayer = create<PlayerStore>((set) => ({
  current: null,
  playing: false,
  progress: 0,
  play: (b) => set({ current: b, playing: true, progress: 0 }),
  toggle: () => set((s) => ({ playing: !s.playing })),
  close: () => set({ current: null, playing: false, progress: 0 }),
  setProgress: (v) => set({ progress: v }),
}));

// ──────────────────────────── STYLES ───────────────────────────
const S = StyleSheet.create({
  warmWhite: { backgroundColor: T.warmWhite },
  scroll: { flex: 1, backgroundColor: T.warmWhite },
  noScroll: { flex: 1, backgroundColor: T.warmWhite },
  card: {
    backgroundColor: T.white,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "rgba(122,31,31,0.07)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 3,
  },
  cardLg: {
    backgroundColor: T.white,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "rgba(122,31,31,0.12)",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 32,
    shadowOpacity: 1,
    elevation: 6,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 21, fontWeight: "700", color: T.charcoal },
  sectionAction: { fontSize: 13, fontWeight: "700", color: T.saffron },
  hScroll: {
    paddingHorizontal: 20,
    gap: 14,
    paddingBottom: 8,
  },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: T.white,
    borderWidth: 1.5,
    borderColor: T.warmGray,
  },
  chipActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: T.saffron,
    borderWidth: 1.5,
    borderColor: T.saffron,
  },
  chipText: { fontSize: 13, fontWeight: "600", color: "#888" },
  chipTextActive: { fontSize: 13, fontWeight: "600", color: T.white },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e53935",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: T.white },
  liveText: { fontSize: 9, fontWeight: "800", color: T.white },
  searchWrap: { marginHorizontal: 20, position: "relative" as const },
  searchInput: {
    width: "100%",
    paddingVertical: 14,
    paddingLeft: 44,
    paddingRight: 16,
    backgroundColor: T.white,
    borderWidth: 1.5,
    borderColor: T.warmGray,
    borderRadius: 14,
    fontSize: 14,
    color: T.charcoal,
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: T.saffron,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: T.warmGray,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnText: { fontSize: 13, fontWeight: "700", color: T.white },
  btnTextDark: { fontSize: 13, fontWeight: "700", color: T.charcoal },
  overlayGrad: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "transparent",
  },
});

// ──────────────────── SMALL REUSABLE COMPONENTS ────────────────
function Toast() {
  const toast = useApp((s) => s.toast);
  const opacity = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: toast ? 1 : 0, duration: 250, useNativeDriver: true }),
      Animated.timing(ty, { toValue: toast ? 0 : 20, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [toast, opacity, ty]);

  if (!toast) return null;
  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 100,
        left: "50%",
        marginLeft: -120,
        width: 240,
        backgroundColor: T.charcoal,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        zIndex: 200,
        opacity,
        transform: [{ translateY: ty }],
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "600", color: T.white, textAlign: "center" }}>{toast}</Text>
    </Animated.View>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={S.sectionHead}>
      <Text style={[S.sectionTitle, { fontFamily: "serif" }]}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction}><Text style={S.sectionAction}>{action}</Text></Pressable>
      ) : null}
    </View>
  );
}

function LiveBadge() {
  return (
    <View style={S.liveBadge}>
      <View style={S.liveDot} />
      <Text style={S.liveText}>LIVE</Text>
    </View>
  );
}

function MiniPlayer() {
  const { current, playing, progress, toggle, close, setProgress } = usePlayer();
  const slideY = useRef(new Animated.Value(100)).current;
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Animated.timing(slideY, { toValue: current ? 0 : 100, duration: 300, useNativeDriver: true }).start();
  }, [current, slideY]);

  useEffect(() => {
    if (playing) {
      interval.current = setInterval(() => setProgress((progress + 0.5) % 100), 300);
    }
    return () => { if (interval.current) clearInterval(interval.current); };
  }, [playing, progress, setProgress]);

  if (!current) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 72,
        left: 12,
        right: 12,
        zIndex: 50,
        backgroundColor: T.charcoal,
        borderRadius: 16,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        transform: [{ translateY: slideY }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 30,
        shadowOpacity: 0.3,
        elevation: 10,
      }}
    >
      <View style={{ position: "absolute", top: 0, left: 14, right: 14, height: 2.5, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden" }}>
        <View style={{ height: "100%", backgroundColor: T.saffron, width: `${progress}%`, borderRadius: 2 }} />
      </View>
      <Image source={{ uri: img(`${current.img}-mp`, 100, 100) }} style={{ width: 42, height: 42, borderRadius: 10 }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: T.white }}>{current.title}</Text>
        <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{current.artist}</Text>
      </View>
      <Pressable onPress={toggle} style={{ padding: 4 }}>
        <Ionicons name={playing ? "pause" : "play"} size={18} color={T.white} />
      </Pressable>
      <Pressable onPress={close} style={{ padding: 4 }}>
        <Ionicons name="close" size={16} color={T.white} />
      </Pressable>
    </Animated.View>
  );
}

function AIFab() {
  const floatY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([Animated.timing(floatY, { toValue: -6, duration: 1500, useNativeDriver: true }), Animated.timing(floatY, { toValue: 0, duration: 1500, useNativeDriver: true })])).start();
  }, [floatY]);
  return (
    <Animated.View style={{ position: "absolute", bottom: 80, right: 20, zIndex: 50, transform: [{ translateY: floatY }] }}>
      <Pressable
        onPress={() => navRef.navigate("AIChat" as never)}
        style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: T.maroon, alignItems: "center", justifyContent: "center", shadowColor: "rgba(122,31,31,0.35)", shadowOffset: { width: 0, height: 4 }, shadowRadius: 20, shadowOpacity: 1, elevation: 8 }}
      >
        <Ionicons name="planet" size={22} color={T.white} />
      </Pressable>
    </Animated.View>
  );
}

// ────────────────────── HOME SCREEN COMPONENTS ─────────────────
function DailyBlessing() {
  return (
    <View style={[S.cardLg, { marginHorizontal: 20, height: 200, position: "relative" as const }]}>
      <Image source={{ uri: img("sunrise-temple-glow", 800, 400) }} style={{ width: "100%", height: "100%", position: "absolute" as const }} />
      <View style={{ position: "absolute" as const, inset: 0, backgroundColor: "rgba(122,31,31,0.7)", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 10, fontWeight: "700", color: T.goldLight, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Daily Blessing</Text>
        <Text style={{ fontSize: 20, color: T.white, lineHeight: 30, fontStyle: "italic", fontFamily: "serif" }}>&ldquo;Where there is devotion, there is peace. Where there is peace, there is the divine.&rdquo;</Text>
        <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>Today is an auspicious day for prayer and reflection</Text>
      </View>
    </View>
  );
}

function LiveCarousel({ onNav }: { onNav: () => void }) {
  const { navigate } = useNavigation();
  const live = TEMPLES.filter((t) => t.live);
  return (
    <View style={{ marginTop: 20 }}>
      <SectionHeader title="Live Darshan" action="See All" onAction={onNav} />
      <FlatList
        data={live} horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={S.hScroll}
        keyExtractor={(i) => `lc-${i.id}`}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigate("TempleDetail" as never, { id: String(item.id) })} style={[S.card, { width: 140 }]}>
            <Image source={{ uri: img(item.img, 300, 400) }} style={{ width: 140, height: 190 }} />
            <View style={{ position: "absolute", top: 8, left: 8 }}><LiveBadge /></View>
            <View style={{ padding: 8, paddingHorizontal: 10 }}>
              <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: "700", color: T.charcoal }}>{item.name}</Text>
              <Text style={{ fontSize: 10, color: "#999" }}>{city(item.location)}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

function TrendingCarousel({ onNav }: { onNav: () => void }) {
  const { navigate } = useNavigation();
  return (
    <View style={{ marginTop: 20 }}>
      <SectionHeader title="Trending Temples" action="See All" onAction={onNav} />
      <FlatList
        data={TEMPLES.slice(0, 5)} horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={S.hScroll}
        keyExtractor={(i) => `tc-${i.id}`}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigate("TempleDetail" as never, { id: String(item.id) })} style={[S.card, { width: 260 }]}>
            <Image source={{ uri: img(`${item.img}-trend`, 520, 340) }} style={{ width: 260, height: 170 }} />
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingBottom: 14, paddingLeft: 14, paddingRight: 14, backgroundColor: "transparent" }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: T.white, textShadowColor: "rgba(0,0,0,0.5)", textShadowRadius: 4 }}>{item.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                <Ionicons name="location" size={11} color="rgba(255,255,255,0.7)" />
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{city(item.location)}</Text>
              </View>
            </View>
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, backgroundColor: "rgba(0,0,0,0.5)" }} />
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, backgroundColor: "rgba(0,0,0,0.5)" }} />
          </Pressable>
        )}
      />
    </View>
  );
}

function BhajanCarousel({ onNav }: { onNav: () => void }) {
  const play = usePlayer((s) => s.play);
  const showToast = useApp((s) => s.showToast);
  return (
    <View style={{ marginTop: 20 }}>
      <SectionHeader title="Bhajans For You" action="See All" onAction={onNav} />
      <FlatList
        data={BHAJANS.slice(0, 5)} horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={S.hScroll}
        keyExtractor={(i) => `bc-${i.id}`}
        renderItem={({ item }) => (
          <Pressable onPress={() => { play(item); showToast(`Now playing: ${item.title}`); }} style={[S.card, { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, width: 220 }]}>
            <Image source={{ uri: img(item.img, 100, 100) }} style={{ width: 50, height: 50, borderRadius: 12 }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: T.charcoal }}>{item.title}</Text>
              <Text style={{ fontSize: 11, color: "#999" }}>{item.artist}</Text>
            </View>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: T.saffron, alignItems: "center", justifyContent: "center", marginLeft: "auto" }}>
              <Ionicons name="play" size={12} color={T.white} style={{ marginLeft: 2 }} />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

function FestivalList() {
  return (
    <View style={{ marginTop: 20, paddingBottom: 100 }}>
      <SectionHeader title="Upcoming Festivals" />
      {FESTIVALS.map((f) => (
        <View key={f.name} style={[S.card, { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, marginHorizontal: 20, marginBottom: 10 }]}>
          <Image source={{ uri: img(f.img, 120, 120) }} style={{ width: 56, height: 56, borderRadius: 14 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: T.charcoal }}>{f.name}</Text>
            <Text style={{ fontSize: 12, color: T.saffron, fontWeight: "600" }}>{f.date}</Text>
            <Text style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{f.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color="#ccc" />
        </View>
      ))}
    </View>
  );
}

// ────────────────────── SCREENS ────────────────────────────────
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const scale = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;
  const textOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.2, duration: 600, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    Animated.timing(op, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.timing(textOp, { toValue: 1, duration: 500, delay: 800, useNativeDriver: true }).start();
    const t = setTimeout(onFinish, 2200);
    return () => clearTimeout(t);
  }, [scale, op, textOp, onFinish]);

  return (
    <View style={{ flex: 1, backgroundColor: "#1a0800", alignItems: "center", justifyContent: "center" }}>
      <View style={{ position: "absolute", top: -60, width: 400, height: 400, borderRadius: 200, backgroundColor: "rgba(212,160,23,0.08)" }} />
      <Animated.View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, borderColor: "rgba(212,160,23,0.4)", backgroundColor: "rgba(212,160,23,0.08)", alignItems: "center", justifyContent: "center", transform: [{ scale }], opacity: op }}>
        <Text style={{ fontSize: 36, color: T.gold }}>ॐ</Text>
      </Animated.View>
      <Animated.View style={{ marginTop: 24, alignItems: "center", opacity: textOp }}>
        <Text style={{ fontSize: 32, fontWeight: "700", color: T.warmWhite, letterSpacing: 0.5, fontFamily: "serif" }}>Divya</Text>
        <Text style={{ fontSize: 14, color: "rgba(255,248,240,0.5)", marginTop: 8 }}>Your Spiritual Companion</Text>
      </Animated.View>
    </View>
  );
}

function OnboardingScreen({ onFinish }: { onFinish: () => void }) {
  const { selectedDeities, toggleDeity, completeOnboarding } = useApp();
  const canContinue = selectedDeities.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#1a0800" }}>
      <View style={{ alignItems: "center", paddingTop: 50, paddingBottom: 10, paddingHorizontal: 24 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 1.5, borderColor: "rgba(212,160,23,0.4)", backgroundColor: "rgba(212,160,23,0.08)", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 28, color: T.gold }}>ॐ</Text>
        </View>
        <Text style={{ fontSize: 30, fontWeight: "600", color: T.warmWhite, marginTop: 20, textAlign: "center", fontFamily: "serif" }}>Begin Your Spiritual Journey</Text>
        <Text style={{ fontSize: 14, color: "rgba(255,248,240,0.6)", marginTop: 8, textAlign: "center", lineHeight: 22 }}>Select your favorite deities to personalize your experience</Text>
      </View>
      <FlatList
        data={DEITIES} numColumns={2} showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingVertical: 20, gap: 12, flex: 1 }}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const sel = selectedDeities.includes(item.id);
          return (
            <Pressable
              onPress={() => toggleDeity(item.id)}
              style={{
                flex: 1, paddingVertical: 20, paddingHorizontal: 12, borderRadius: 18, alignItems: "center",
                backgroundColor: sel ? "rgba(212,160,23,0.12)" : "rgba(255,255,255,0.06)",
                borderWidth: 1.5, borderColor: sel ? T.gold : "rgba(255,255,255,0.08)",
              }}
            >
              {sel && <View style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: T.gold, alignItems: "center", justifyContent: "center" }}><Ionicons name="check" size={10} color={T.white} /></View>}
              <View style={{ width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 10, backgroundColor: `${item.color}22` }}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "rgba(255,248,240,0.85)" }}>{item.name}</Text>
            </Pressable>
          );
        }}
      />
      <View style={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 16 }}>
        <Pressable
          onPress={() => { completeOnboarding(selectedDeities); onFinish(); }}
          disabled={!canContinue}
          style={{ width: "100%", paddingVertical: 16, borderRadius: 16, alignItems: "center", backgroundColor: canContinue ? T.saffron : "rgba(255,255,255,0.2)", shadowColor: canContinue ? "rgba(255,140,66,0.3)" : "transparent", shadowOffset: { width: 0, height: 4 }, shadowRadius: 20, shadowOpacity: 1, elevation: canContinue ? 6 : 0 }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: canContinue ? T.white : "rgba(255,255,255,0.4)" }}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HomeScreen() {
  const { navigate } = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  return (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }} tintColor={T.saffron} />} contentContainerStyle={{ paddingBottom: 20 }} style={S.scroll}>
      <View style={{ paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Text style={{ color: T.saffron, fontWeight: "700", fontSize: 13, marginBottom: 2 }}>{greeting()}, Devotee</Text>
        <Text style={{ fontFamily: "serif", fontSize: 28, fontWeight: "700", color: T.charcoal }}>Divya</Text>
      </View>
      <DailyBlessing />
      <LiveCarousel onNav={() => navigate("Live" as never)} />
      <TrendingCarousel onNav={() => navigate("Discover" as never)} />
      <BhajanCarousel onNav={() => navigate("Bhajans" as never)} />
      <FestivalList />
    </ScrollView>
  );
}

function DiscoverScreen() {
  const { navigate } = useNavigation();
  const [q, setQ] = useState("");
  const [chip, setChip] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const chips = ["All", ...new Set(TEMPLES.map((t) => t.deity))];
  const filtered = TEMPLES.filter((t) => {
    const mq = !q || t.name.toLowerCase().includes(q.toLowerCase()) || t.location.toLowerCase().includes(q.toLowerCase()) || t.deity.toLowerCase().includes(q.toLowerCase());
    return mq && (chip === "All" || t.deity === chip);
  });
  return (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }} tintColor={T.saffron} />} contentContainerStyle={{ paddingBottom: 100 }} style={S.scroll}>
      <View style={{ paddingTop: 56, paddingBottom: 0, paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: "serif", fontSize: 28, fontWeight: "700", color: T.charcoal }}>Discover Temples</Text>
        <Text style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Find your next sacred destination</Text>
      </View>
      <View style={{ height: 14 }} />
      <View style={S.searchWrap}>
        <Ionicons name="search" size={15} color="#bbb" style={{ position: "absolute", left: 16, top: 16, zIndex: 1 }} />
        <TextInput style={S.searchInput} value={q} onChangeText={setQ} placeholder="Search temples, cities, deities..." placeholderTextColor="#bbb" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 14 }}>
        {chips.map((c) => (
          <Pressable key={c} onPress={() => setChip(c)} style={chip === c ? S.chipActive : S.chip}>
            <Text style={chip === c ? S.chipTextActive : S.chipText}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <SectionHeader title="Popular Temples" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 20, paddingBottom: 20 }}>
        {filtered.map((t) => (
          <Pressable key={t.id} onPress={() => navigate("TempleDetail" as never, { id: String(t.id) })} style={[S.card, { width: "47%", marginBottom: 4 }]}>
            <Image source={{ uri: img(`${t.img}-disc`, 400, 260) }} style={{ width: "100%", height: 130 }} />
            <View style={{ padding: 10, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: T.charcoal }}>{t.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
                <Ionicons name="location" size={9} color="#999" />
                <Text style={{ fontSize: 11, color: "#999" }}>{city(t.location)}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
      {filtered.length === 0 && <View style={{ alignItems: "center", paddingVertical: 40 }}><Text style={{ color: "#999", fontSize: 14 }}>No temples found</Text></View>}
    </ScrollView>
  );
}

function LiveScreen() {
  const { navigate } = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const featured = TEMPLES.find((t) => t.live)!;
  const live = TEMPLES.filter((t) => t.live);
  return (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }} tintColor={T.saffron} />} contentContainerStyle={{ paddingBottom: 20 }} style={S.scroll}>
      <View style={{ paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: "serif", fontSize: 28, fontWeight: "700", color: T.charcoal }}>Live Darshan</Text>
        <Text style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Watch aarti and darshan from sacred temples</Text>
      </View>
      {/* Featured */}
      <Pressable onPress={() => navigate("TempleDetail" as never, { id: String(featured.id) })} style={[S.cardLg, { marginHorizontal: 20, height: 220, position: "relative" as const }]}>
        <Image source={{ uri: img(`${featured.img}-live`, 800, 440) }} style={{ width: "100%", height: "100%", position: "absolute" as const }} />
        <View style={{ position: "absolute" as const, inset: 0, justifyContent: "flex-end", padding: 18 }}>
          <View style={{ position: "absolute" as const, inset: 0, backgroundColor: "rgba(0,0,0,0.45)" }} />
          <View style={{ zIndex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <LiveBadge />
              <View style={{ backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="eye" size={9} color={T.white} />
                <Text style={{ fontSize: 10, color: T.white }}>{Math.floor(Math.random() * 5000 + 2000)} watching</Text>
              </View>
            </View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: T.white }}>{featured.name}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
              <Ionicons name="location" size={11} color="rgba(255,255,255,0.7)" />
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{featured.location}</Text>
            </View>
          </View>
        </View>
      </Pressable>
      {/* Popular Live */}
      <View style={{ marginTop: 20 }}>
        <SectionHeader title="Popular Live Temples" />
        <FlatList data={live} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.hScroll} keyExtractor={(i) => `lp-${i.id}`} renderItem={({ item }) => (
          <Pressable onPress={() => navigate("TempleDetail" as never, { id: String(item.id) })} style={[S.card, { width: 140 }]}>
            <Image source={{ uri: img(`${item.img}-livecard`, 300, 400) }} style={{ width: 140, height: 190 }} />
            <View style={{ position: "absolute", top: 8, left: 8 }}><LiveBadge /></View>
            <View style={{ padding: 8, paddingHorizontal: 10 }}>
              <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: "700", color: T.charcoal }}>{item.name}</Text>
              <Text style={{ fontSize: 10, color: "#999" }}>{city(item.location)}</Text>
            </View>
          </Pressable>
        )} />
      </View>
      {/* Aarti */}
      <View style={{ marginTop: 20, paddingBottom: 100 }}>
        <SectionHeader title="Upcoming Aarti" />
        {AARTI_SCHEDULE.map((a, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, marginHorizontal: 20, borderBottomWidth: i < AARTI_SCHEDULE.length - 1 ? 1 : 0, borderBottomColor: T.warmGray }}>
            <View style={{ alignItems: "center", minWidth: 54 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: T.saffron }}>{a.time}</Text>
              <Text style={{ fontSize: 10, color: "#999", textTransform: "uppercase", fontWeight: "600" }}>{a.period}</Text>
            </View>
            <View style={{ width: 3, height: 40, borderRadius: 2, backgroundColor: `${T.gold}66` }} />
            <View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: T.charcoal }}>{a.name}</Text>
              <Text style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{a.temple}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function BhajansScreen() {
  const play = usePlayer((s) => s.play);
  const showToast = useApp((s) => s.showToast);
  const [refreshing, setRefreshing] = useState(false);
  return (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }} tintColor={T.saffron} />} contentContainerStyle={{ paddingBottom: 140 }} style={S.scroll}>
      <View style={{ paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: "serif", fontSize: 28, fontWeight: "700", color: T.charcoal }}>Bhajans</Text>
        <Text style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Immerse in devotional music</Text>
      </View>
      {/* Categories */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20, paddingBottom: 20 }}>
        {BHAJAN_CATS.map((c) => (
          <Pressable key={c.name} onPress={() => showToast(`Browsing ${c.name} bhajans`)} style={[S.card, { width: "30%", paddingVertical: 16, alignItems: "center", borderWidth: 1.5, borderColor: T.warmGray }]}>
            <Ionicons name={c.icon} size={22} color={c.color} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: T.charcoal, marginTop: 6 }}>{c.name}</Text>
          </Pressable>
        ))}
      </View>
      {/* Recommended */}
      <View style={{ marginTop: 4 }}>
        <SectionHeader title="Recommended" />
        <FlatList data={BHAJANS.slice(0, 6)} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.hScroll} keyExtractor={(i) => `br-${i.id}`} renderItem={({ item }) => (
          <Pressable onPress={() => { play(item); showToast(`Now playing: ${item.title}`); }} style={[S.card, { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, width: 220 }]}>
            <Image source={{ uri: img(`${item.img}-rec`, 100, 100) }} style={{ width: 50, height: 50, borderRadius: 12 }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: T.charcoal }}>{item.title}</Text>
              <Text style={{ fontSize: 11, color: "#999" }}>{item.artist}</Text>
            </View>
            <View style={S.playBtn}><Ionicons name="play" size={12} color={T.white} style={{ marginLeft: 2 }} /></View>
          </Pressable>
        )} />
      </View>
      {/* Recently Played */}
      <View style={{ marginTop: 4 }}>
        <SectionHeader title="Recently Played" />
        <View style={{ paddingHorizontal: 20 }}>
          {BHAJANS.slice(5).map((b) => (
            <Pressable key={b.id} onPress={() => { play(b); showToast(`Now playing: ${b.title}`); }} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.warmGray }}>
              <Image source={{ uri: img(`${b.img}-list`, 100, 100) }} style={{ width: 50, height: 50, borderRadius: 12 }} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: T.charcoal }}>{b.title}</Text>
                <Text style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{b.artist} · {b.cat}</Text>
              </View>
              <Text style={{ fontSize: 12, color: "#bbb", fontWeight: "600" }}>{b.duration}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function ProfileScreen() {
  const { selectedDeities, savedTemples, showToast } = useApp();
  const menuItems = [
    { icon: "bookmark-outline" as const, label: "Saved Temples" },
    { icon: "eye-outline" as const, label: "Watched Darshans" },
    { icon: "heart-outline" as const, label: "Saved Bhajans" },
    { icon: "color-palette-outline" as const, label: "Theme" },
    { icon: "language-outline" as const, label: "Language" },
    { icon: "notifications-outline" as const, label: "Notifications" },
    { icon: "information-circle-outline" as const, label: "About Divya" },
    { icon: "log-out-outline" as const, label: "Sign Out" },
  ];
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} style={S.scroll}>
      <View style={{ alignItems: "center", paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: T.saffron, alignItems: "center", justifyContent: "center", shadowColor: "rgba(255,140,66,0.3)", shadowOffset: { width: 0, height: 4 }, shadowRadius: 20, shadowOpacity: 1, elevation: 6 }}>
          <Text style={{ fontSize: 32, color: T.white }}>ॐ</Text>
        </View>
        <Text style={{ fontFamily: "serif", fontSize: 24, fontWeight: "700", color: T.charcoal, marginTop: 12 }}>Devotee</Text>
        <Text style={{ fontSize: 13, color: "#999", marginTop: 2 }}>On a spiritual journey</Text>
      </View>
      <View style={[S.card, { flexDirection: "row", justifyContent: "space-around", paddingVertical: 16, marginHorizontal: 20, marginBottom: 20 }]}>
        {[
          { n: savedTemples.length, l: "Temples Saved" },
          { n: savedTemples.length, l: "Darshans" },
          { n: 0, l: "Bhajans" },
        ].map((s) => (
          <View key={s.l} style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: T.saffron }}>{s.n}</Text>
            <Text style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{s.l}</Text>
          </View>
        ))}
      </View>
      <SectionHeader title="Favorite Deities" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20, marginBottom: 20 }}>
        {selectedDeities.length > 0 ? selectedDeities.map((id) => {
          const d = DEITIES.find((x) => x.id === id);
          if (!d) return null;
          return (
            <View key={id} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: "rgba(255,140,66,0.1)", borderWidth: 1, borderColor: "rgba(255,140,66,0.2)" }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: T.maroon }}>{d.name}</Text>
            </View>
          );
        }) : <Text style={{ fontSize: 13, color: "#999" }}>Select deities in onboarding</Text>}
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        {menuItems.map((m) => (
          <Pressable key={m.label} onPress={() => { if (m.label === "Sign Out") showToast("Signed out"); else if (m.label === "About Divya") showToast("Divya v1.0 — Your spiritual companion"); else showToast(`${m.label} — coming soon`); }} style={[S.card, { flexDirection: "row", alignItems: "center", gap: 14, padding: 15, paddingHorizontal: 16, marginBottom: 8 }]}>
            <Ionicons name={m.icon} size={18} color={T.saffron} />
            <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: T.charcoal }}>{m.label}</Text>
            <Ionicons name="chevron-forward" size={12} color="#ccc" />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function TempleDetailScreen() {
  const { goBack, navigate } = useNavigation();
  const route = useRoute();
  const id = Number((route.params as any)?.id);
  const { saveTemple, showToast } = useApp();
  const [tab, setTab] = useState<"history" | "mythology" | "significance">("history");
  const t = TEMPLES.find((x) => x.id === id);
  useEffect(() => { if (t) saveTemple(t.id); }, [t, saveTemple]);
  if (!t) return <View style={S.noScroll} />;

  return (
    <View style={S.noScroll}>
      <View style={{ position: "relative" as const, height: 260 }}>
        <Image source={{ uri: img(`${t.img}-detail`, 800, 520) }} style={{ width: "100%", height: "100%" }} />
        <Pressable onPress={goBack} style={{ position: "absolute" as const, top: 48, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={18} color={T.white} />
        </Pressable>
        <View style={{ position: "absolute" as const, top: 48, right: 16, flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => showToast("Temple saved!")} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="bookmark-outline" size={15} color={T.white} />
          </Pressable>
          <Pressable onPress={() => showToast("Share link copied!")} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="share-social-outline" size={15} color={T.white} />
          </Pressable>
        </View>
        <View style={{ position: "absolute" as const, bottom: 0, left: 0, right: 0, height: 80, backgroundColor: "transparent" }}>
          <View style={{ position: "absolute" as const, bottom: 0, left: 0, right: 0, height: 80, backgroundColor: "rgba(0,0,0,0.3)" }} />
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} style={{ marginTop: -8 }}>
        <Text style={{ fontFamily: "serif", fontSize: 26, fontWeight: "700", color: T.charcoal }}>{t.name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
          <Ionicons name="location" size={13} color={T.saffron} />
          <Text style={{ fontSize: 13, color: "#888" }}>{t.location}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
          <Ionicons name="time-outline" size={13} color={T.saffron} />
          <Text style={{ fontSize: 13, color: T.saffron, fontWeight: "600" }}>{t.timings}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          <Pressable onPress={() => showToast("Opening in maps...")} style={S.btnPrimary}>
            <Ionicons name="map-outline" size={16} color={T.white} />
            <Text style={S.btnText}>Open Map</Text>
          </Pressable>
          {t.live && (
            <Pressable onPress={() => showToast("Connecting to live stream...")} style={S.btnSecondary}>
              <Ionicons name="radio-outline" size={16} color={T.charcoal} />
              <Text style={S.btnTextDark}>Watch Live</Text>
            </Pressable>
          )}
        </View>
        <Text style={{ fontSize: 14, color: "#666", lineHeight: 25, marginTop: 18 }}>{t.desc}</Text>
        {/* Tabs */}
        <View style={{ flexDirection: "row", borderBottomWidth: 2, borderBottomColor: T.warmGray, marginTop: 22, marginHorizontal: -20, paddingHorizontal: 20 }}>
          {(["history", "mythology", "significance"] as const).map((k) => (
            <Pressable key={k} onPress={() => setTab(k)} style={{ flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2, borderBottomColor: tab === k ? T.saffron : "transparent", marginBottom: -2 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: tab === k ? T.saffron : "#999", textTransform: "capitalize" }}>{k}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ fontSize: 14, color: "#666", lineHeight: 25, marginTop: 16 }}>{t[tab]}</Text>
      </ScrollView>
    </View>
  );
}

function AIChatScreen() {
  const { goBack } = useNavigation();
  const [msgs, setMsgs] = useState<{ id: string; role: "user" | "ai"; text: string }[]>([
    { id: uid(), role: "ai", text: "Namaste! I am your Spiritual Guide. Ask me about temples, deities, scriptures, festivals, or anything related to Sanatan Dharma. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [showSug, setShowSug] = useState(true);
  const listRef = useRef<FlatList>(null);

  useEffect(() => { setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100); }, [msgs]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setShowSug(false);
    const user = { id: uid(), role: "user" as const, text: text.trim() };
    setMsgs((p) => [...p, user]);
    setInput("");
    setTimeout(() => { setMsgs((p) => [...p, { id: uid(), role: "ai", text: getAIResponse(text) }]); }, 800);
  };

  return (
    <KeyboardAvoidingView style={S.noScroll} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: T.warmGray }}>
        <Pressable onPress={goBack} style={{ padding: 4 }}><Ionicons name="arrow-back" size={20} color={T.charcoal} /></Pressable>
        <View>
          <Text style={{ fontFamily: "serif", fontSize: 20, fontWeight: "700", color: T.charcoal }}>Spiritual Guide</Text>
          <Text style={{ fontSize: 11, color: T.softGreen, fontWeight: "600" }}>Online</Text>
        </View>
      </View>
      <FlatList
        ref={listRef} data={msgs} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 14, justifyContent: item.role === "user" ? "flex-end" : "flex-start" }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: item.role === "ai" ? T.saffron : T.warmGray }}>
              <Ionicons name={item.role === "ai" ? "om" : "person"} size={14} color={item.role === "ai" ? T.white : T.charcoal} />
            </View>
            <View style={{ maxWidth: "78%", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18, backgroundColor: item.role === "ai" ? T.white : T.saffron, borderBottomLeftRadius: item.role === "ai" ? 4 : 18, borderBottomRightRadius: item.role === "user" ? 4 : 18, shadowColor: "rgba(122,31,31,0.07)", shadowOffset: { width: 0, height: 2 }, shadowRadius: 20, shadowOpacity: 1, elevation: 2 }}>
              <Text style={{ fontSize: 13.5, lineHeight: 21, color: item.role === "ai" ? T.charcoal : T.white }}>{item.text}</Text>
            </View>
          </View>
        )}
      />
      {showSug && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 8 }}>
          {["Tell me about Kedarnath Temple", "Why is Mahadev worshipped?", "Explain Hanuman Chalisa", "Best temples to visit nearby"].map((s) => (
            <Pressable key={s} onPress={() => send(s)} style={S.chip}><Text style={S.chipText}>{s}</Text></Pressable>
          ))}
        </ScrollView>
      )}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 28, borderTopWidth: 1, borderTopColor: T.warmGray }}>
        <TextInput style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: T.white, borderWidth: 1.5, borderColor: T.warmGray, borderRadius: 24, fontSize: 14, color: T.charcoal }} value={input} onChangeText={setInput} placeholder="Ask about temples, deities..." placeholderTextColor="#bbb" onSubmitEditing={() => send(input)} />
        <Pressable onPress={() => send(input)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: T.saffron, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="paper-plane" size={17} color={T.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ────────────────────────── NAVIGATION ────────────────────────
let navRef: any;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: T.warmWhite, position: "relative" as const }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
          tabBarStyle: { backgroundColor: "rgba(255,248,240,0.95)", borderTopColor: "rgba(0,0,0,0.05)", paddingTop: 6, paddingBottom: 18, height: 72 },
          tabBarActiveTintColor: T.saffron,
          tabBarInactiveTintColor: "#bbb",
        }}
      >
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

function AppNavigator() {
  const onboarded = useApp((s) => s.onboarded);
  const [screen, setScreen] = useState<"splash" | "onboarding" | "app">("splash");

  if (screen === "splash") return <SplashScreen onFinish={() => setScreen(onboarded ? "app" : "onboarding")} />;
  if (screen === "onboarding") return <OnboardingScreen onFinish={() => setScreen("app")} />;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ animation: "fade" }} />
      <Stack.Screen name="TempleDetail" component={TempleDetailScreen} options={{ animation: "slide_from_bottom", presentation: "modal" }} />
      <Stack.Screen name="AIChat" component={AIChatScreen} options={{ animation: "slide_from_bottom", presentation: "modal" }} />
    </Stack.Navigator>
  );
}

// ──────────────────────── APP ENTRY ────────────────────────────
export default function App() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    Font.loadAsync({ serif: { uri: "https://github.com/google/fonts/raw/main/ofl/cormorantgaramond/CormorantGaramond-SemiBold.ttf" } }).catch(() => { }).finally(() => setLoaded(true));
  }, []);
  if (!loaded) return <View style={{ flex: 1, backgroundColor: "#1a0800" }} />;

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={(r) => { navRef = r; }} theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: T.warmWhite, card: T.white, text: T.charcoal, border: T.warmGray, primary: T.saffron, notification: T.maroon } }}>
        <StatusBar barStyle="dark-content" backgroundColor={T.warmWhite} />
        <View style={{ flex: 1 }}>
          <AppNavigator />
          <Toast />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}