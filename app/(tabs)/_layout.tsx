// app/(tabs)/_layout.tsx
import AchievementToast from "@/components/AchievementToast";
import { useGameStore } from "@/hooks/useGameStore";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";

function TabIcon({
  name,
  focused,
  badge,
}: {
  name: any;
  focused: boolean;
  badge?: number;
}) {
  return (
    <View style={[ti.wrap, focused && ti.wrapOn]}>
      <Ionicons
        name={focused ? name : `${name}-outline`}
        size={22}
        color={focused ? "#050508" : "#445566"}
      />
      {!!badge && badge > 0 && (
        <View style={ti.badge}>
          <Text style={ti.badgeTxt}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

const ti = StyleSheet.create({
  wrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  wrapOn: {
    backgroundColor: "#00ff96",
    shadowColor: "#00ff96",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ff4466",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#080a12",
    paddingHorizontal: 3,
  },
  badgeTxt: { fontSize: 9, color: "#fff", fontWeight: "900" },
});

export default function TabsLayout() {
  const { pendingAchievements } = useGameStore();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "rgba(8,10,18,0.97)",
            borderTopColor: "#1a2233",
            borderTopWidth: 1,
            paddingBottom: Platform.OS === "ios" ? 24 : 10,
            paddingTop: 8,
            height: Platform.OS === "ios" ? 84 : 64,
          },
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 0.5,
            marginTop: -4,
          },
          tabBarActiveTintColor: "#00ff96",
          tabBarInactiveTintColor: "#334455",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Mapa",
            tabBarIcon: ({ focused }) => (
              <TabIcon name="map" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="achievements"
          options={{
            title: "Conquistas",
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name="trophy"
                focused={focused}
                badge={pendingAchievements.length}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ focused }) => (
              <TabIcon name="person" focused={focused} />
            ),
          }}
        />
      </Tabs>

      {/* Toast de conquistas flutua sobre tudo */}
      <AchievementToast />
    </>
  );
}
