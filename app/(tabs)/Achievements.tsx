// app/(tabs)/achievements.tsx
import {
  ALL_ACHIEVEMENTS,
  RARITY_CONFIG,
  type Achievement,
} from "@/constants/achievements";
import { useGameStore } from "@/hooks/useGameStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Filter = "all" | "coverage" | "landmark" | "distance" | "unlocked";

const FILTERS: { id: Filter; label: string; icon: any }[] = [
  { id: "all", label: "Todas", icon: "grid-outline" },
  { id: "coverage", label: "Exploração", icon: "map-outline" },
  { id: "landmark", label: "Lugares", icon: "location-outline" },
  { id: "distance", label: "Distância", icon: "walk-outline" },
  { id: "unlocked", label: "Obtidas", icon: "trophy-outline" },
];

export default function AchievementsScreen() {
  const { unlockedAchievements, totalXP, level, getTileCount, getDistanceKm } =
    useGameStore();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = ALL_ACHIEVEMENTS.filter((a) => {
    if (filter === "unlocked") return unlockedAchievements.has(a.id);
    if (filter === "all") return true;
    return a.type === filter;
  });

  const unlocked = unlockedAchievements.size;
  const total = ALL_ACHIEVEMENTS.length;

  return (
    <View style={s.container}>
      {/* Header */}
      <LinearGradient colors={["#050508", "#080c14"]} style={s.header}>
        <View style={s.hTop}>
          <Text style={s.hTitle}>CONQUISTAS</Text>
          <View style={s.hBadge}>
            <Text style={s.hBadgeTxt}>
              {unlocked}/{total}
            </Text>
          </View>
        </View>

        <View style={s.progWrap}>
          <View style={s.progTrack}>
            <View
              style={[s.progFill, { width: `${(unlocked / total) * 100}%` }]}
            />
          </View>
          <Text style={s.progTxt}>
            {((unlocked / total) * 100).toFixed(1)}% completo
          </Text>
        </View>

        <View style={s.quickStats}>
          {[
            { v: `Nível ${level}`, l: "Rank", i: "⚔️" },
            { v: totalXP.toLocaleString(), l: "XP", i: "✨" },
            { v: getTileCount().toLocaleString(), l: "Tiles", i: "🗺️" },
            { v: `${getDistanceKm()}km`, l: "Andados", i: "🦶" },
          ].map((q) => (
            <View key={q.l} style={s.qs}>
              <Text style={s.qsIcon}>{q.i}</Text>
              <Text style={s.qsV}>{q.v}</Text>
              <Text style={s.qsL}>{q.l}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterBar}
        contentContainerStyle={s.filterContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[s.fBtn, filter === f.id && s.fBtnOn]}
            onPress={() => setFilter(f.id)}
          >
            <Ionicons
              name={f.icon}
              size={14}
              color={filter === f.id ? "#050508" : "#445566"}
            />
            <Text style={[s.fTxt, filter === f.id && s.fTxtOn]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <ScrollView
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((a) => (
          <AchCard
            key={a.id}
            ach={a}
            unlocked={unlockedAchievements.has(a.id)}
          />
        ))}
        {filtered.length === 0 && (
          <View style={s.empty}>
            <Text style={{ fontSize: 44 }}>🏆</Text>
            <Text style={s.emptyTxt}>Nenhuma conquista ainda</Text>
            <Text style={s.emptySub}>Continue explorando!</Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function AchCard({ ach, unlocked }: { ach: Achievement; unlocked: boolean }) {
  const rarity = RARITY_CONFIG[ach.rarity];
  return (
    <View style={[c.card, !unlocked && c.locked]}>
      {unlocked && (
        <View style={[c.accent, { backgroundColor: rarity.color }]} />
      )}
      <View style={c.row}>
        <View
          style={[
            c.iconBox,
            {
              backgroundColor: unlocked ? rarity.color + "18" : "#111520",
              borderColor: unlocked ? rarity.color + "40" : "#1a2233",
            },
          ]}
        >
          <Text style={[c.emoji, !unlocked && { opacity: 0.25 }]}>
            {unlocked ? ach.icon : "🔒"}
          </Text>
        </View>
        <View style={c.body}>
          <View style={c.titleRow}>
            <Text style={[c.title, !unlocked && { color: "#2a3a4a" }]}>
              {unlocked ? ach.title : "???"}
            </Text>
            <View
              style={[
                c.chip,
                { backgroundColor: unlocked ? rarity.color + "1a" : "#111520" },
              ]}
            >
              <Text
                style={[
                  c.chipTxt,
                  { color: unlocked ? rarity.color : "#2a3a4a" },
                ]}
              >
                {rarity.label}
              </Text>
            </View>
          </View>
          <Text
            style={[c.desc, !unlocked && { color: "#1e2a38" }]}
            numberOfLines={2}
          >
            {unlocked ? ach.description : "Continue explorando para descobrir"}
          </Text>
          {unlocked && ach.curiosity && (
            <Text style={c.curiosity} numberOfLines={2}>
              💡 {ach.curiosity}
            </Text>
          )}
        </View>
        <View style={c.xpBox}>
          <Text style={[c.xpNum, !unlocked && { color: "#2a3a4a" }]}>
            {unlocked ? `+${ach.xp}` : ach.xp}
          </Text>
          <Text style={c.xpLbl}>XP</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050508" },
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2233",
  },
  hTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  hTitle: { fontSize: 22, fontWeight: "900", color: "#fff", letterSpacing: 4 },
  hBadge: {
    backgroundColor: "rgba(0,255,150,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,255,150,0.25)",
  },
  hBadgeTxt: { color: "#00ff96", fontSize: 13, fontWeight: "700" },
  progWrap: { marginBottom: 14, gap: 5 },
  progTrack: {
    height: 4,
    backgroundColor: "#1a2233",
    borderRadius: 2,
    overflow: "hidden",
  },
  progFill: { height: "100%", backgroundColor: "#00ff96", borderRadius: 2 },
  progTxt: { fontSize: 10, color: "#445566", letterSpacing: 1 },
  quickStats: { flexDirection: "row", justifyContent: "space-between" },
  qs: { alignItems: "center", flex: 1, gap: 3 },
  qsIcon: { fontSize: 18 },
  qsV: { fontSize: 12, fontWeight: "800", color: "#d0d8e8" },
  qsL: { fontSize: 9, color: "#2a3a4a", letterSpacing: 0.5 },

  filterBar: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2233",
  },
  filterContent: {
    flexDirection: "row",
    paddingHorizontal: 14,
    gap: 8,
    alignItems: "center",
    paddingVertical: 9,
  },
  fBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#0c0e18",
    borderWidth: 1,
    borderColor: "#1a2233",
  },
  fBtnOn: { backgroundColor: "#00ff96", borderColor: "#00ff96" },
  fTxt: { fontSize: 12, color: "#445566", fontWeight: "600" },
  fTxtOn: { color: "#050508", fontWeight: "800" },

  list: { padding: 14, gap: 10 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTxt: { fontSize: 16, fontWeight: "700", color: "#2a3a4a" },
  emptySub: { fontSize: 12, color: "#141e28" },
});

const c = StyleSheet.create({
  card: {
    backgroundColor: "#0c0e18",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1a2233",
    overflow: "hidden",
  },
  locked: { opacity: 0.5 },
  accent: { height: 2 },
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 24 },
  body: { flex: 1, gap: 4 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  title: { fontSize: 15, fontWeight: "800", color: "#e0e8f0" },
  chip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  chipTxt: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  desc: { fontSize: 12, color: "#445566", lineHeight: 17 },
  curiosity: {
    fontSize: 10,
    color: "#2a4a6a",
    fontStyle: "italic",
    marginTop: 2,
    lineHeight: 14,
  },
  xpBox: { alignItems: "center", minWidth: 42 },
  xpNum: { fontSize: 16, fontWeight: "900", color: "#fbbf24" },
  xpLbl: { fontSize: 8, color: "#7a6020", letterSpacing: 1, fontWeight: "700" },
});
