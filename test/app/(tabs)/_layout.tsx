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
      <Tabs.Screen
        name="index"
        options={{
          title: "Market",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-line"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{
          title: "Assets",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trade"
        options={{
          title: "Trade",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="swap-horizontal"
              size={size}
              color={color}
            />
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

      {/* Hidden screens - accessible via navigation but not shown in tabs */}
      <Tabs.Screen
        name="token/[id]"
        options={{
          title: "Token Details",
          href: null,
        }}
      />
      <Tabs.Screen
        name="deposit"
        options={{
          title: "Deposit",
          href: null,
        }}
      />
      <Tabs.Screen
        name="withdraw"
        options={{
          title: "Withdraw",
          href: null,
        }}
      />
      <Tabs.Screen
        name="send"
        options={{
          title: "Send",
          href: null,
        }}
      />
      <Tabs.Screen
        name="receive"
        options={{
          title: "Receive",
          href: null,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: "Help & Support",
          href: null,
        }}
      />
      <Tabs.Screen
        name="order-history"
        options={{
          title: "Order History",
          href: null,
        }}
      />
      <Tabs.Screen
        name="transaction-history"
        options={{
          title: "Transaction History",
          href: null,
        }}
      />
      <Tabs.Screen
        name="staking"
        options={{
          title: "Staking",
          href: null,
        }}
      />
    </Tabs>
  );
}
