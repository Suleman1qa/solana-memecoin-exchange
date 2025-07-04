import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarStyle: {
          backgroundColor: Colors.light.background,
        },
        headerStyle: {
          backgroundColor: Colors.light.primary,
        },
        headerTintColor: "#fff",
      }}
    >
      {/* Main visible tabs: Home, Market, Swap, Explore, Settings, Profile */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: "Market",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="swap"
        options={{
          title: "Swap",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="swap-horizontal" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
      {/* Hide all other screens from tab bar, but keep for navigation */}
      <Tabs.Screen name="wallet" options={{ title: "Wallet", href: null }} />
      <Tabs.Screen name="wallet-detail" options={{ title: "Wallet Detail", href: null }} />
      <Tabs.Screen name="assets" options={{ title: "Assets", href: null }} />
      <Tabs.Screen name="token/[id]" options={{ title: "Token Details", href: null }} />
      <Tabs.Screen name="deposit" options={{ title: "Deposit", href: null }} />
      <Tabs.Screen name="withdraw" options={{ title: "Withdraw", href: null }} />
      <Tabs.Screen name="send" options={{ title: "Send", href: null }} />
      <Tabs.Screen name="receive" options={{ title: "Receive", href: null }} />
      <Tabs.Screen name="help" options={{ title: "Help & Support", href: null }} />
      <Tabs.Screen name="order-history" options={{ title: "Order History", href: null }} />
      <Tabs.Screen name="transaction-history" options={{ title: "Transaction History", href: null }} />
      <Tabs.Screen name="staking" options={{ title: "Staking", href: null }} />
      <Tabs.Screen name="TradingScreen" options={{ title: "Trading", href: null }} />
      <Tabs.Screen name="trade" options={{ title: "Trade", href: null }} />
      <Tabs.Screen name="token-detail" options={{ title: "Token Detail", href: null }} />
      <Tabs.Screen name="transfer" options={{ title: "Transfer", href: null }} />
      <Tabs.Screen name="ClearStorageButton" options={{ title: "Clear Storage", href: null }} />
    </Tabs>
  );
}
