// app/_layout.tsx
import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useGameStore } from '@/hooks/useGameStore';

export default function RootLayout() {
  const { init, isAuthLoading, user } = useGameStore();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.replace('/auth');
    } else {
      router.replace('/(tabs)');
    }
  }, [isAuthLoading, user]);

  if (isAuthLoading) {
    return (
      <View style={styles.splash}>
        <StatusBar style="light" />
        <Text style={styles.splashIcon}>🌍</Text>
        <Text style={styles.splashTitle}>WORLD EXPLORER</Text>
        <ActivityIndicator color="#00ff96" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1, backgroundColor: '#050508',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  splashIcon: { fontSize: 56 },
  splashTitle: {
    fontSize: 26, fontWeight: '900', color: '#fff',
    letterSpacing: 6,
    textShadowColor: 'rgba(0,255,150,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
});