import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { RARITY_CONFIG } from '@/constants/achievements';
import { useGameStore } from '@/hooks/useGameStore';

const { width } = Dimensions.get('window');

export default function AchievementToast() {
  const { pendingAchievements, dismissAchievement } = useGameStore();
  const achievement = pendingAchievements[0];

  const slideY = useRef(new Animated.Value(-160)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const glowLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!achievement) return;

    if (achievement.rarity === 'legendary') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (achievement.rarity === 'epic') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, tension: 65, friction: 8, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 65, friction: 8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    glowLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    glowLoop.current.start();

    const timer = setTimeout(dismiss, 5500);
    return () => clearTimeout(timer);
  }, [achievement?.id]);

  const dismiss = () => {
    glowLoop.current?.stop();
    Animated.parallel([
      Animated.timing(slideY, { toValue: -160, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      dismissAchievement();
      slideY.setValue(-160);
      opacity.setValue(0);
      scale.setValue(0.85);
      glow.setValue(0);
    });
  };

  if (!achievement) return null;

  const rarity = RARITY_CONFIG[achievement.rarity];

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideY }, { scale }], opacity }]}>
      <TouchableOpacity onPress={dismiss} activeOpacity={0.9}>
        <LinearGradient
          colors={['#0f1120', '#090b14']}
          style={[styles.card, { borderColor: rarity.color + '55' }]}
        >
          <Animated.View
            style={[
              styles.glowLine,
              {
                backgroundColor: rarity.color,
                opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
              },
            ]}
          />

          <View style={styles.row}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: rarity.color + '18', borderColor: rarity.color + '40' },
              ]}
            >
              <Text style={styles.iconEmoji}>{achievement.icon}</Text>
            </View>

            <View style={styles.body}>
              <View style={styles.topRow}>
                <Text style={styles.label}>CONQUISTA DESBLOQUEADA</Text>
                <View style={[styles.rarityBadge, { backgroundColor: rarity.color + '22' }]}>
                  <Text style={[styles.rarityText, { color: rarity.color }]}>
                    {rarity.label.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.title}>{achievement.title}</Text>
              <Text style={styles.desc} numberOfLines={1}>
                {achievement.description}
              </Text>
              {achievement.curiosity && (
                <Text style={styles.curiosity} numberOfLines={2}>
                  💡 {achievement.curiosity}
                </Text>
              )}
            </View>

            <View style={styles.xpBox}>
              <Text style={styles.xpNum}>+{achievement.xp}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 54,
    left: 14,
    right: 14,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 24,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  glowLine: { height: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 26 },
  body: { flex: 1, gap: 3 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 8, color: '#445566', letterSpacing: 1.5, fontWeight: '700' },
  rarityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  rarityText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  title: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  desc: { fontSize: 11, color: '#6a7a8a' },
  curiosity: { fontSize: 10, color: '#3a5a7a', fontStyle: 'italic', marginTop: 2, lineHeight: 14 },
  xpBox: { alignItems: 'center', minWidth: 44 },
  xpNum: { fontSize: 18, fontWeight: '900', color: '#fbbf24' },
  xpLabel: { fontSize: 8, color: '#7a6020', letterSpacing: 1, fontWeight: '700' },
});

