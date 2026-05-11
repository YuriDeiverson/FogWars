// app/(tabs)/index.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, Alert,
} from 'react-native';
import MapView, { Circle, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '@/hooks/useGameStore';
import { startTracking, stopTracking, getCurrentPosition } from '@/services/locationService';
import { TILE_SIZE } from '@/constants/achievements';
import type { LocationSubscription } from 'expo-location';

const VISION_RADIUS = 90;

const tileToPolygon = (tile: { lat: number; lng: number }) => [
  { latitude: tile.lat,            longitude: tile.lng },
  { latitude: tile.lat + TILE_SIZE, longitude: tile.lng },
  { latitude: tile.lat + TILE_SIZE, longitude: tile.lng + TILE_SIZE },
  { latitude: tile.lat,            longitude: tile.lng + TILE_SIZE },
];

export default function MapScreen() {
  const mapRef   = useRef<MapView>(null);
  const subRef   = useRef<LocationSubscription | null>(null);
  const [ready, setReady]   = useState(false);
  const [follow, setFollow] = useState(true);

  const {
    exploredTiles, currentLocation, isTracking, setTracking,
    totalXP, level, getTileCount, getKm2, getDistanceKm, getXPForNextLevel,
  } = useGameStore();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarAnim = useRef(new Animated.Value(0)).current;
  const hudAnim   = useRef(new Animated.Value(0)).current;
  const loopRef   = useRef<Animated.CompositeAnimation | null>(null);

  // HUD entrance
  useEffect(() => {
    Animated.spring(hudAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }).start();
  }, []);

  // Pulse & radar when tracking
  useEffect(() => {
    if (isTracking) {
      loopRef.current = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.7, duration: 1000, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1,   duration: 1000, useNativeDriver: true }),
          ]),
          Animated.timing(radarAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      pulseAnim.setValue(1);
      radarAnim.setValue(0);
    }
  }, [isTracking]);

  // Follow user on map
  useEffect(() => {
    if (follow && currentLocation && mapRef.current && ready) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      }, 800);
    }
  }, [currentLocation, follow, ready]);

  const begin = async () => {
    try {
      const pos = await getCurrentPosition();
      useGameStore.getState().updateLocation(pos.coords);

      mapRef.current?.animateToRegion({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      }, 1000);

      subRef.current = await startTracking();
      setTracking(true);
    } catch (e: any) {
      Alert.alert('Erro de GPS', e.message);
    }
  };

  const end = async () => {
    await stopTracking(subRef.current);
    subRef.current = null;
    setTracking(false);
  };

  // Auto-start on mount
  useEffect(() => {
    begin();
    return () => { stopTracking(subRef.current); };
  }, []);

  const tiles    = Array.from(exploredTiles.values());
  const tileCount = getTileCount();
  const km2       = getKm2();
  const distKm    = getDistanceKm();
  const xpForNext = getXPForNextLevel(level);
  const xpPct     = Math.min(((totalXP % xpForNext) / xpForNext) * 100, 100);
  const speed     = currentLocation?.speed != null && currentLocation.speed > 0
    ? (currentLocation.speed * 3.6).toFixed(1) : '0.0';

  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={s.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={darkStyle}
        initialRegion={{ latitude: -15.8, longitude: -47.9, latitudeDelta: 20, longitudeDelta: 20 }}
        onMapReady={() => setReady(true)}
        onPanDrag={() => setFollow(false)}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        rotateEnabled={false}
      >
        {ready && tiles.map((t) => (
          <Polygon
            key={t.key}
            coordinates={tileToPolygon(t)}
            fillColor="rgba(0,255,150,0.09)"
            strokeColor="rgba(0,255,150,0.14)"
            strokeWidth={0.5}
          />
        ))}

        {currentLocation && isTracking && (
          <>
            <Circle center={currentLocation} radius={VISION_RADIUS * 2.8} fillColor="rgba(0,255,150,0.03)" strokeColor="transparent" />
            <Circle center={currentLocation} radius={VISION_RADIUS}       fillColor="rgba(0,255,150,0.07)" strokeColor="rgba(0,255,150,0.28)" strokeWidth={1} />
            <Circle center={currentLocation} radius={5}                   fillColor="#00ff96"               strokeColor="#fff" strokeWidth={2} />
          </>
        )}
      </MapView>

      {/* ── TOP HUD ── */}
      <Animated.View
        style={[s.topHud, {
          opacity: hudAnim,
          transform: [{ translateY: hudAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }],
        }]}
        pointerEvents="none"
      >
        <LinearGradient colors={['rgba(5,5,8,0.96)', 'transparent']} style={s.topGrad}>
          <View style={s.levelRow}>
            <View style={s.lvlBadge}>
              <Text style={s.lvlLbl}>LVL</Text>
              <Text style={s.lvlNum}>{level}</Text>
            </View>
            <View style={s.xpCol}>
              <View style={s.xpTrack}>
                <View style={[s.xpFill, { width: `${xpPct}%` }]} />
              </View>
              <Text style={s.xpTxt}>{totalXP.toLocaleString()} XP</Text>
            </View>
            <View style={s.topRight}>
              <Text style={s.appName}>WORLD EXPLORER</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ── COORDS ── */}
      {currentLocation && (
        <View style={s.coords} pointerEvents="none">
          <View style={[s.gpsDot, isTracking && s.gpsDotOn]} />
          <Text style={s.coordsTxt}>
            {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
          </Text>
          <View style={s.speedChip}>
            <Text style={s.speedTxt}>{speed} km/h</Text>
          </View>
        </View>
      )}

      {/* ── STATS ── */}
      <View style={s.stats} pointerEvents="none">
        {([
          { v: tileCount.toLocaleString(), l: 'Tiles' },
          { v: km2,                         l: 'km²' },
          { v: `${distKm}km`,               l: 'Andados' },
        ] as { v: string; l: string }[]).map((item) => (
          <View key={item.l} style={s.statItem}>
            <Text style={s.statV}>{item.v}</Text>
            <Text style={s.statL}>{item.l}</Text>
          </View>
        ))}
      </View>

      {/* ── RADAR ── */}
      {isTracking && (
        <View style={s.radar} pointerEvents="none">
          <Animated.View
            style={[s.radarRing, {
              transform: [{ scale: radarAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
              opacity:   radarAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.7, 0.3, 0] }),
            }]}
          />
          <View style={s.radarDot} />
          <Text style={s.radarTxt}>AO VIVO</Text>
        </View>
      )}

      {/* ── CONTROLS ── */}
      <View style={s.controls}>
        <TouchableOpacity style={s.ctrlBtn} onPress={() => { setFollow(true); begin(); }}>
          <Ionicons name="navigate-outline" size={22} color={follow ? '#00ff96' : '#7a8b9a'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.mainBtn, !isTracking && s.mainBtnOff]}
          onPress={isTracking ? end : begin}
        >
          <Animated.View style={{ transform: [{ scale: isTracking ? pulseAnim : 1 }] }}>
            <Ionicons
              name={isTracking ? 'radio-button-on' : 'play'}
              size={30}
              color="#050508"
            />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity style={s.ctrlBtn} onPress={() => setFollow(!follow)}>
          <Ionicons name="compass-outline" size={22} color="#7a8b9a" />
        </TouchableOpacity>
      </View>

      {!isTracking && (
        <View style={s.pauseBanner} pointerEvents="none">
          <Text style={s.pauseTxt}>⏸  EXPLORAÇÃO PAUSADA — Toque ▶ para continuar</Text>
        </View>
      )}
    </View>
  );
}

// ── Dark map style ────────────────────────────────────────────────
const darkStyle = [
  { elementType: 'geometry',            stylers: [{ color: '#07090f' }] },
  { elementType: 'labels.text.stroke',  stylers: [{ color: '#07090f' }] },
  { elementType: 'labels.text.fill',    stylers: [{ color: '#3a4a5c' }] },
  { featureType: 'administrative',      elementType: 'geometry',           stylers: [{ color: '#0d1520' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#1a3a5a' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#2a5a8a' }] },
  { featureType: 'poi',                 elementType: 'labels',             stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park',            elementType: 'geometry',           stylers: [{ color: '#0a130a' }] },
  { featureType: 'road',                elementType: 'geometry',           stylers: [{ color: '#101820' }] },
  { featureType: 'road',                elementType: 'geometry.stroke',    stylers: [{ color: '#080d14' }] },
  { featureType: 'road',                elementType: 'labels.text.fill',   stylers: [{ color: '#253545' }] },
  { featureType: 'road.highway',        elementType: 'geometry',           stylers: [{ color: '#121e2e' }] },
  { featureType: 'road.highway',        elementType: 'labels.text.fill',   stylers: [{ color: '#1a3a5a' }] },
  { featureType: 'transit',             elementType: 'geometry',           stylers: [{ color: '#080c14' }] },
  { featureType: 'water',               elementType: 'geometry',           stylers: [{ color: '#020508' }] },
  { featureType: 'water',               elementType: 'labels.text.fill',   stylers: [{ color: '#0a1a2a' }] },
];

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050508' },
  map:       { flex: 1 },

  topHud:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topGrad: { paddingTop: Platform.OS === 'ios' ? 54 : 38, paddingBottom: 28, paddingHorizontal: 18 },
  levelRow:{ flexDirection: 'row', alignItems: 'center', gap: 12 },
  lvlBadge:{
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(0,255,150,0.1)', borderWidth: 2, borderColor: 'rgba(0,255,150,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  lvlLbl:  { fontSize: 8,  color: '#00cc78', letterSpacing: 1, fontWeight: '800' },
  lvlNum:  { fontSize: 20, fontWeight: '900', color: '#00ff96', lineHeight: 22 },
  xpCol:   { flex: 1, gap: 5 },
  xpTrack: { height: 5, backgroundColor: '#1a2233', borderRadius: 3, overflow: 'hidden' },
  xpFill:  { height: '100%', backgroundColor: '#00ff96', borderRadius: 3, shadowColor: '#00ff96', shadowOpacity: 0.8, shadowRadius: 4 },
  xpTxt:   { fontSize: 10, color: '#445566', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  topRight:{ alignItems: 'flex-end' },
  appName: { fontSize: 9, color: '#1a3a5a', letterSpacing: 2, fontWeight: '800' },

  coords: {
    position: 'absolute', top: Platform.OS === 'ios' ? 114 : 96,
    alignSelf: 'center', flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(5,5,8,0.88)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#1a2233', gap: 8, zIndex: 10,
  },
  gpsDot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2a3a4a' },
  gpsDotOn:{ backgroundColor: '#00ff96', shadowColor: '#00ff96', shadowOpacity: 0.9, shadowRadius: 6 },
  coordsTxt:{ fontSize: 10, color: '#445566', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  speedChip:{ backgroundColor: 'rgba(0,255,150,0.1)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  speedTxt: { fontSize: 10, color: '#00ff96', fontWeight: '700' },

  stats:    { position: 'absolute', bottom: 130, left: 18, gap: 8, zIndex: 10 },
  statItem: { backgroundColor: 'rgba(5,5,8,0.88)', borderWidth: 1, borderColor: '#1a2233', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, minWidth: 88 },
  statV:    { fontSize: 16, fontWeight: '800', color: '#00ff96' },
  statL:    { fontSize: 9,  color: '#2a3a4a', letterSpacing: 1 },

  radar:    { position: 'absolute', bottom: 138, right: 20, alignItems: 'center', gap: 5, zIndex: 10 },
  radarRing:{ position: 'absolute', width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#00ff96' },
  radarDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#00ff96', shadowColor: '#00ff96', shadowOpacity: 1, shadowRadius: 8 },
  radarTxt: { fontSize: 8, color: '#00cc78', letterSpacing: 2, fontWeight: '800' },

  controls: { position: 'absolute', bottom: 22, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22, zIndex: 10 },
  ctrlBtn:  { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(5,5,8,0.92)', borderWidth: 1, borderColor: '#1a2233', alignItems: 'center', justifyContent: 'center' },
  mainBtn:  { width: 72, height: 72, borderRadius: 36, backgroundColor: '#00ff96', alignItems: 'center', justifyContent: 'center', shadowColor: '#00ff96', shadowOpacity: 0.7, shadowRadius: 20, elevation: 12 },
  mainBtnOff:{ backgroundColor: '#1a2a3a', shadowColor: '#1a2a3a' },

  pauseBanner:{ position: 'absolute', bottom: 108, alignSelf: 'center', backgroundColor: 'rgba(255,90,40,0.15)', borderWidth: 1, borderColor: 'rgba(255,90,40,0.3)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, zIndex: 10 },
  pauseTxt:   { fontSize: 10, color: '#ff6432', letterSpacing: 1.5, fontWeight: '800' },
});