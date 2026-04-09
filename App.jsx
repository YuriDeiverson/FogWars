// App.jsx — Entry point do World Explorer
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { useGameStore } from './src/store/gameStore';
import AuthScreen from './src/screens/AuthScreen';
import MapScreen from './src/screens/MapScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BottomNav from './src/components/BottomNav';
import AchievementToast from './src/components/AchievementToast';

export default function App() {
  const { user, isAuthLoading, activeTab, init } = useGameStore();

  useEffect(() => {
    init();
  }, []);

  if (isAuthLoading) {
    return (
      <View style={styles.loader}>
        <StatusBar style="light" />
        <Text style={styles.loaderIcon}>🌍</Text>
        <Text style={styles.loaderTitle}>WORLD EXPLORER</Text>
        <ActivityIndicator color="#00ff96" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (!user) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <AuthScreen />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={styles.gameContainer}>
          {/* Screens */}
          <View style={[styles.screen, activeTab !== 'map' && styles.screenHidden]}>
            <MapScreen />
          </View>
          <View style={[styles.screen, activeTab !== 'achievements' && styles.screenHidden]}>
            <AchievementsScreen />
          </View>
          <View style={[styles.screen, activeTab !== 'profile' && styles.screenHidden]}>
            <ProfileScreen />
          </View>

          {/* Persistent UI */}
          <BottomNav />
          <AchievementToast />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#050508',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loaderIcon: { fontSize: 52 },
  loaderTitle: {
    fontSize: 24, fontWeight: '900', color: '#ffffff',
    letterSpacing: 5,
    textShadowColor: 'rgba(0,255,150,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#050508',
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  screenHidden: {
    zIndex: 0,
    opacity: 0,
    pointerEvents: 'none',
  },
});