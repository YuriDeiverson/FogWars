import React from "react";
import { View, StyleSheet, Platform } from "react-native";

type Props = { size?: number };

/**
 * Seta de navegação (silhueta escura + contorno claro), apontando para o NORTE.
 * Só Views — evita react-native-svg / bugs de resolução no Metro.
 */
export function PlayerNavArrow({ size = 48 }: Props) {
  const w = size;
  const h = size * 1.05;
  const outerL = w * 0.46;
  const outerB = w * 0.78;
  const innerL = w * 0.3;
  const innerB = w * 0.54;
  const innerTop = w * 0.1;

  return (
    <View style={[styles.wrap, { width: w, height: h }]}>
      {/* Borda branca (triângulo maior) */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: outerL,
          borderRightWidth: outerL,
          borderBottomWidth: outerB,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: "#ffffff",
        }}
      />
      {/* Miolo preto */}
      <View
        style={{
          position: "absolute",
          top: innerTop,
          width: 0,
          height: 0,
          borderLeftWidth: innerL,
          borderRightWidth: innerL,
          borderBottomWidth: innerB,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: "#0a0a0a",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 3,
      },
      android: { elevation: 5 },
    }),
  },
});
