// app/(tabs)/profile.tsx
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '@/hooks/useGameStore';
import { ALL_ACHIEVEMENTS, RARITY_CONFIG } from '@/constants/achievements';

const RANKS = [
  { min: 1,  max: 4,        name: 'Viajante',         icon: '🧳', color: '#94a3b8' },
  { min: 5,  max: 9,        name: 'Desbravador',       icon: '⛺', color: '#4ade80' },
  { min: 10, max: 19,       name: 'Cartógrafo',        icon: '🗺️', color: '#60a5fa' },
  { min: 20, max: 39,       name: 'Aventureiro',       icon: '⚔️', color: '#c084fc' },
  { min: 40, max: 99,       name: 'Explorador Épico',  icon: '🌍', color: '#fbbf24' },
  { min: 100, max: Infinity, name: 'Lenda',            icon: '🏆', color: '#ff6432' },
];

const getRank = (lvl: number) => RANKS.find((r) => lvl >= r.min && lvl <= r.max) ?? RANKS[0];

export default function ProfileScreen() {
  const {
    user, logout, resetProgress,
    totalXP, level, getTileCount, getKm2, getDistanceKm,
    unlockedAchievements, getXPForNextLevel,
  } = useGameStore();

  const rank       = getRank(level);
  const xpForNext  = getXPForNextLevel(level);
  const xpPct      = Math.min(((totalXP % xpForNext) / xpForNext) * 100, 100);

  const rarityCounts: Record<string, number> = {};
  unlockedAchievements.forEach((id) => {
    const a = ALL_ACHIEVEMENTS.find((x) => x.id === id);
    if (a) rarityCounts[a.rarity] = (rarityCounts[a.rarity] || 0) + 1;
  });

  const onLogout = () =>
    Alert.alert('Sair', 'Seu progresso está salvo. Deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await logout(); router.replace('/auth'); } },
    ]);

  const onReset = () =>
    Alert.alert('⚠️ Resetar Tudo', 'Isso apagará TODO seu progresso permanentemente. Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Resetar TUDO', style: 'destructive', onPress: resetProgress },
    ]);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['#0c0e18', '#050508']} style={s.hero}>
          <View style={s.avatarWrap}>
            <View style={[s.avatarRing, { borderColor: rank.color + '70' }]}>
              <View style={s.avatarBg}>
                <Text style={s.avatarIcon}>{rank.icon}</Text>
              </View>
            </View>
            <View style={[s.rankBadge, { backgroundColor: rank.color + '20', borderColor: rank.color + '40' }]}>
              <Text style={[s.rankTxt, { color: rank.color }]}>{rank.name.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={s.name}>{user?.name?.toUpperCase() ?? 'EXPLORADOR'}</Text>
          <Text style={s.email}>{user?.email}</Text>

          <View style={s.lvlCard}>
            <View style={{ flex: 1, gap: 7 }}>
              <Text style={s.lvlTitle}>NÍVEL {level}</Text>
              <View style={s.xpTrack}>
                <View style={[s.xpFill, { width: `${xpPct}%`, backgroundColor: rank.color }]} />
              </View>
              <Text style={s.xpCaption}>
                {(totalXP % xpForNext).toLocaleString()} / {xpForNext.toLocaleString()} XP para nível {level + 1}
              </Text>
            </View>
            <View style={s.totalXp}>
              <Text style={s.totalXpNum}>{totalXP.toLocaleString()}</Text>
              <Text style={s.totalXpLbl}>XP Total</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats */}
        <Section title="ESTATÍSTICAS">
          <View style={s.grid}>
            {[
              { v: getTileCount().toLocaleString(), l: 'Tiles\nExplorados', i: '🗺️' },
              { v: `${getKm2()} km²`,               l: 'Área\nDescoberta',  i: '📐' },
              { v: `${getDistanceKm()} km`,          l: 'Distância\nPercorrida', i: '🦶' },
              { v: String(unlockedAchievements.size), l: 'Conquistas\nObtidas', i: '🏆' },
            ].map((q) => (
              <View key={q.l} style={s.gridItem}>
                <Text style={s.gridIcon}>{q.i}</Text>
                <Text style={s.gridV}>{q.v}</Text>
                <Text style={s.gridL}>{q.l}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Raridade */}
        <Section title="CONQUISTAS POR RARIDADE">
          <View style={s.rarityList}>
            {(Object.entries(RARITY_CONFIG) as [string, { label: string; color: string }][]).reverse().map(([key, cfg]) => {
              const count = rarityCounts[key] ?? 0;
              const tot   = ALL_ACHIEVEMENTS.filter((a) => a.rarity === key).length;
              return (
                <View key={key} style={s.rarityRow}>
                  <View style={[s.rarityDot, { backgroundColor: cfg.color }]} />
                  <Text style={[s.rarityName, { color: cfg.color }]}>{cfg.label}</Text>
                  <View style={s.rarityBarWrap}>
                    <View style={s.rarityTrack}>
                      <View style={[s.rarityFill, { width: tot > 0 ? `${(count / tot) * 100}%` : '0%', backgroundColor: cfg.color }]} />
                    </View>
                  </View>
                  <Text style={s.rCount}>{count}/{tot}</Text>
                </View>
              );
            })}
          </View>
        </Section>

        {/* Conta */}
        <Section title="CONTA">
          <View style={s.menu}>
            <MenuItem icon="cloud-upload-outline" label="Sincronizar Dados" />
            <MenuItem icon="share-outline"        label="Compartilhar Mapa" />
            <MenuItem icon="trash-outline"        label="Resetar Progresso" danger onPress={onReset} />
            <MenuItem icon="log-out-outline"      label="Sair da Conta"     danger onPress={onLogout} last />
          </View>
        </Section>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function MenuItem({ icon, label, danger, onPress, last }: {
  icon: any; label: string; danger?: boolean; onPress?: () => void; last?: boolean;
}) {
  return (
    <TouchableOpacity style={[s.menuItem, !last && s.menuBorder]} onPress={onPress}>
      <Ionicons name={icon} size={18} color={danger ? '#ff4466' : '#445566'} />
      <Text style={[s.menuTxt, danger && { color: '#ff4466' }]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={14} color="#2a3a4a" />}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050508' },
  hero:      { paddingTop: Platform.OS === 'ios' ? 58 : 42, paddingHorizontal: 18, paddingBottom: 22, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1a2233' },
  avatarWrap:{ alignItems: 'center', marginBottom: 14, gap: 8 },
  avatarRing:{ width: 88, height: 88, borderRadius: 44, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  avatarBg:  { width: 76, height: 76, borderRadius: 38, backgroundColor: '#0c0e18', alignItems: 'center', justifyContent: 'center' },
  avatarIcon:{ fontSize: 34 },
  rankBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  rankTxt:   { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  name:      { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 3, marginBottom: 4 },
  email:     { fontSize: 12, color: '#2a3a4a', marginBottom: 18 },
  lvlCard:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0c0e18', borderRadius: 16, borderWidth: 1, borderColor: '#1a2233', padding: 15, gap: 14, width: '100%' },
  lvlTitle:  { fontSize: 13, fontWeight: '800', color: '#d0d8e8', letterSpacing: 2 },
  xpTrack:   { height: 6, backgroundColor: '#1a2233', borderRadius: 3, overflow: 'hidden' },
  xpFill:    { height: '100%', borderRadius: 3 },
  xpCaption: { fontSize: 10, color: '#2a3a4a' },
  totalXp:   { alignItems: 'center' },
  totalXpNum:{ fontSize: 22, fontWeight: '900', color: '#fbbf24' },
  totalXpLbl:{ fontSize: 9, color: '#7a6020', letterSpacing: 1 },

  section:     { padding: 18, paddingBottom: 4 },
  sectionTitle:{ fontSize: 10, color: '#2a3a4a', letterSpacing: 2, fontWeight: '800', marginBottom: 12 },

  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { flex: 1, minWidth: '45%', backgroundColor: '#0c0e18', borderRadius: 14, borderWidth: 1, borderColor: '#1a2233', padding: 14, gap: 4 },
  gridIcon: { fontSize: 20, marginBottom: 2 },
  gridV:    { fontSize: 17, fontWeight: '800', color: '#00ff96' },
  gridL:    { fontSize: 10, color: '#2a3a4a', lineHeight: 14 },

  rarityList: { gap: 10 },
  rarityRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rarityDot:  { width: 8, height: 8, borderRadius: 4 },
  rarityName: { width: 62, fontSize: 12, fontWeight: '700' },
  rarityBarWrap:{ flex: 1 },
  rarityTrack:{ height: 5, backgroundColor: '#1a2233', borderRadius: 3, overflow: 'hidden' },
  rarityFill: { height: '100%', borderRadius: 3 },
  rCount:     { fontSize: 11, color: '#2a3a4a', width: 32, textAlign: 'right' },

  menu:      { backgroundColor: '#0c0e18', borderRadius: 16, borderWidth: 1, borderColor: '#1a2233', overflow: 'hidden' },
  menuItem:  { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  menuBorder:{ borderBottomWidth: 1, borderBottomColor: '#1a2233' },
  menuTxt:   { flex: 1, color: '#6a7a8a', fontSize: 14, fontWeight: '500' },
});