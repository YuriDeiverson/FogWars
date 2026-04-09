// app/auth.tsx
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '@/hooks/useGameStore';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const [mode, setMode]       = useState<Mode>('login');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [showPass, setShow]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useGameStore();
  const shakeX = useRef(new Animated.Value(0)).current;
  const fadeV  = useRef(new Animated.Value(1)).current;

  const shake = () =>
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 7,   duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -7,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0,   duration: 50, useNativeDriver: true }),
    ]).start();

  const switchMode = (m: Mode) => {
    Animated.sequence([
      Animated.timing(fadeV, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeV, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    setMode(m);
    setError('');
  };

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message);
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.bg}>
      {/* Grid decorativo */}
      {Array.from({ length: 18 }).map((_, i) => (
        <View key={`h${i}`} style={[s.gridH, { top: `${(i / 18) * 100}%` }]} />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <View key={`v${i}`} style={[s.gridV, { left: `${(i / 10) * 100}%` }]} />
      ))}

      <View style={[s.glow, { top: -120, left: -120 }]} />
      <View style={[s.glow, { bottom: -80, right: -80, backgroundColor: '#4a9eff18' }]} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={s.logoWrap}>
            <View style={s.logoCircle}>
              <Text style={s.logoEmoji}>🌍</Text>
            </View>
            <Text style={s.logoTitle}>WORLD EXPLORER</Text>
            <Text style={s.logoSub}>DESCUBRA CADA CANTO DO PLANETA</Text>
          </View>

          {/* Card */}
          <Animated.View style={[s.card, { transform: [{ translateX: shakeX }], opacity: fadeV }]}>
            {/* Tabs */}
            <View style={s.tabs}>
              {(['login', 'register'] as Mode[]).map((t) => (
                <TouchableOpacity key={t} style={[s.tab, mode === t && s.tabOn]} onPress={() => switchMode(t)}>
                  <Text style={[s.tabTxt, mode === t && s.tabTxtOn]}>
                    {t === 'login' ? 'ENTRAR' : 'CADASTRAR'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.form}>
              {mode === 'register' && (
                <Field icon="person-outline" placeholder="Nome de explorador" value={name} onChange={setName} capitalize="words" />
              )}
              <Field icon="mail-outline" placeholder="E-mail" value={email} onChange={setEmail} keyboard="email-address" />
              <Field icon="lock-closed-outline" placeholder="Senha (mín. 6 caracteres)" value={password} onChange={setPass} secure={!showPass}>
                <TouchableOpacity onPress={() => setShow(!showPass)} style={s.eye}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={16} color="#445566" />
                </TouchableOpacity>
              </Field>

              {!!error && (
                <View style={s.errorBox}>
                  <Ionicons name="alert-circle-outline" size={14} color="#ff4466" />
                  <Text style={s.errorTxt}>{error}</Text>
                </View>
              )}

              <TouchableOpacity style={s.btn} onPress={submit} disabled={loading} activeOpacity={0.85}>
                <LinearGradient colors={['#00ff96', '#00cc78']} style={s.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {loading
                    ? <ActivityIndicator color="#050508" />
                    : <>
                        <Text style={s.btnTxt}>{mode === 'login' ? 'INICIAR JORNADA' : 'CRIAR CONTA'}</Text>
                        <Ionicons name="arrow-forward" size={18} color="#050508" />
                      </>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Teaser */}
          <View style={s.teaser}>
            {[{ v: '195', l: 'países' }, { v: '30+', l: 'conquistas' }, { v: '1', l: 'planeta' }].map((i) => (
              <View key={i.l} style={s.teaserItem}>
                <Text style={s.teaserV}>{i.v}</Text>
                <Text style={s.teaserL}>{i.l}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Componente auxiliar de input
function Field({
  icon, placeholder, value, onChange, keyboard, capitalize, secure, children,
}: {
  icon: any; placeholder: string; value: string;
  onChange: (v: string) => void; keyboard?: any;
  capitalize?: any; secure?: boolean; children?: React.ReactNode;
}) {
  return (
    <View style={s.field}>
      <Ionicons name={icon} size={16} color="#445566" style={s.fieldIcon} />
      <TextInput
        style={[s.input, { flex: 1 }]}
        placeholder={placeholder}
        placeholderTextColor="#2a3a4a"
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        autoCapitalize={capitalize ?? 'none'}
        autoCorrect={false}
        secureTextEntry={secure}
      />
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#050508' },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#ffffff05' },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#ffffff05' },
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#00ff9615' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 22, paddingTop: 70 },

  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logoCircle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(0,255,150,0.08)',
    borderWidth: 2, borderColor: 'rgba(0,255,150,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    shadowColor: '#00ff96', shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
  },
  logoEmoji: { fontSize: 38 },
  logoTitle: {
    fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 5,
    textShadowColor: 'rgba(0,255,150,0.45)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14,
  },
  logoSub: { fontSize: 10, color: '#2a3a4a', letterSpacing: 2.5, marginTop: 6 },

  card: { backgroundColor: '#0c0e18', borderRadius: 20, borderWidth: 1, borderColor: '#1a2233', overflow: 'hidden', marginBottom: 22 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1a2233' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  tabOn: { borderBottomWidth: 2, borderBottomColor: '#00ff96' },
  tabTxt: { fontSize: 12, fontWeight: '700', color: '#2a3a4a', letterSpacing: 1.5 },
  tabTxtOn: { color: '#00ff96' },

  form: { padding: 22, gap: 13 },
  field: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#080a12', borderRadius: 12,
    borderWidth: 1, borderColor: '#1a2233', paddingHorizontal: 13,
  },
  fieldIcon: { marginRight: 10 },
  input: { color: '#d0d8e8', fontSize: 15, paddingVertical: 14 },
  eye: { padding: 4 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,68,102,0.1)',
    borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(255,68,102,0.2)',
  },
  errorTxt: { color: '#ff4466', fontSize: 12, flex: 1 },

  btn: { borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
  btnTxt: { fontSize: 14, fontWeight: '900', color: '#050508', letterSpacing: 2 },

  teaser: { flexDirection: 'row', justifyContent: 'space-around' },
  teaserItem: { alignItems: 'center', gap: 4 },
  teaserV: { fontSize: 22, fontWeight: '800', color: '#00ff96' },
  teaserL: { fontSize: 11, color: '#2a3a4a', letterSpacing: 1 },
});