import React, { useEffect, useCallback, useState } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { Text, Card, Title, Divider, Button, Avatar, ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { fetchWallets } from "../../store/slices/walletSlice";
import { fetchUserOrders } from "../../store/slices/marketSlice";
import ClearStorageButton from "./ClearStorageButton";

function getInitials(name: string) {
  if (!name) return "U";
  return name.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const { wallets, isLoading: walletsLoading, error: walletsError } = useSelector((state: any) => state.wallet);
  const { userOrders, isLoading: ordersLoading, error: ordersError } = useSelector((state: any) => state.market);
  const [refreshing, setRefreshing] = useState(false);

  const getActiveOrdersCount = () => userOrders?.filter((o: any) => ["OPEN", "PARTIALLY_FILLED"].includes(o.status)).length || 0;
  const getCompletedOrdersCount = () => userOrders?.filter((o: any) => o.status === "FILLED").length || 0;
  const getPortfolioValue = () => {
    let total = 0;
    if (wallets) {
      wallets.forEach((w: any) => {
        w.balances?.forEach((b: any) => {
          total += (parseFloat(String(b.amount)) || 0) * (parseFloat(String(b.token?.priceUSD)) || 0);
        });
      });
    }
    return total.toFixed(2);
  };

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        (dispatch as AppDispatch)(fetchWallets()),
        (dispatch as AppDispatch)(fetchUserOrders()),
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to refresh profile data");
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const profileMenuItems = [
    {
      title: "Wallet Management",
      subtitle: `${wallets?.length || 0} wallet${wallets?.length !== 1 ? "s" : ""}`,
      icon: "wallet" as const,
      onPress: () => router.push("../wallet"),
    },
    {
      title: "Transaction History",
      subtitle: "View all transactions",
      icon: "history" as const,
      onPress: () => router.push("../transaction-history"),
    },
    {
      title: "Order History",
      subtitle: `${getActiveOrdersCount()} active, ${getCompletedOrdersCount()} completed`,
      icon: "clipboard-list" as const,
      onPress: () => router.push("../order-history"),
    },
    {
      title: "Settings",
      subtitle: "Account and app settings",
      icon: "cog" as const,
      onPress: () => router.push("../settings"),
    },
    {
      title: "Help & Support",
      subtitle: "Get help and contact support",
      icon: "help-circle" as const,
      onPress: () => router.push("../help"),
    },
  ];

  if (!user || walletsLoading || ordersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        {/* Debug info for loading state */}
        <Text style={{ marginTop: 16, color: Colors.light.text, fontSize: 12 }}>
          user: {user ? 'yes' : 'no'} | walletsLoading: {String(walletsLoading)} | ordersLoading: {String(ordersLoading)}
        </Text>
        <ClearStorageButton />
      </View>
    );
  }

  if (walletsError || ordersError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: Colors.light.error, marginBottom: 16 }}>Failed to load profile data.</Text>
        <Button mode="contained" onPress={loadData}>Retry</Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={loadData}
          colors={[Colors.light.primary]}
          tintColor={Colors.light.primary}
        />
      }
    >
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <View style={styles.avatarSection}>
              {user.profilePicture ? (
                <Avatar.Image size={80} source={{ uri: user.profilePicture }} />
              ) : (
                <Avatar.Text size={80} label={getInitials(user.fullName || user.username)} style={styles.avatar} />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Title style={styles.userName}>{user.fullName || user.username || "User"}</Title>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.memberSince}>
                Member since {user.createdAt ? new Date(user.createdAt).toLocaleString("default", { month: "short", year: "numeric" }) : "N/A"}
              </Text>
              {user.isVerified && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check-decagram" size={16} color={Colors.light.success || "#4caf50"} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Portfolio Overview */}
      <Card style={styles.portfolioCard}>
        <Card.Content>
          <View style={styles.portfolioHeader}>
            <Title style={styles.portfolioTitle}>Portfolio Value</Title>
            <TouchableOpacity onPress={() => router.push("../wallet")}> 
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.portfolioValue}>${getPortfolioValue()}</Text>
          <View style={styles.portfolioStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{wallets?.length || 0}</Text>
              <Text style={styles.statLabel}>Wallets</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getActiveOrdersCount()}</Text>
              <Text style={styles.statLabel}>Active Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getCompletedOrdersCount()}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("../market")}> 
              <MaterialCommunityIcons name="chart-line" size={24} color={Colors.light.primary} />
              <Text style={styles.quickActionText}>Trade</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("../swap")}> 
              <MaterialCommunityIcons name="swap-horizontal" size={24} color={Colors.light.primary} />
              <Text style={styles.quickActionText}>Swap</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => {}}> 
              <MaterialCommunityIcons name="arrow-down" size={24} color={Colors.light.primary} />
              <Text style={styles.quickActionText}>Deposit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => {}}> 
              <MaterialCommunityIcons name="arrow-up" size={24} color={Colors.light.primary} />
              <Text style={styles.quickActionText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Menu Items */}
      <Card style={styles.menuCard}>
        <Card.Content style={styles.menuContent}>
          {profileMenuItems.map((item, index) => (
            <View key={item.title}>
              <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <MaterialCommunityIcons name={item.icon} size={24} color={Colors.light.primary} />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#888" />
              </TouchableOpacity>
              {index < profileMenuItems.length - 1 && <Divider style={styles.menuDivider} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={async () => {
            await dispatch(logout());
            router.replace("/(auth)/login");
          }}
          style={styles.logoutButton}
          textColor={Colors.light.error}
        >
          <MaterialCommunityIcons name="logout" size={16} /> Logout
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  profileCard: {
    margin: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarSection: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    backgroundColor: Colors.light.primary,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedText: {
    marginLeft: 4,
    fontSize: 12,
    color: Colors.light.success || "#4caf50",
    fontWeight: "bold",
  },
  portfolioCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
  },
  portfolioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  portfolioTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  viewAllText: {
    color: Colors.light.primary,
    fontSize: 14,
  },
  portfolioValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  portfolioStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.light.border || "#eee",
    marginHorizontal: 16,
  },
  quickActionsCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: Colors.light.primary + "10",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  menuCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
  },
  menuContent: {
    padding: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: "#888",
  },
  menuDivider: {
    backgroundColor: Colors.light.border || "#eee",
    marginLeft: 68,
  },
  logoutContainer: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  logoutButton: {
    borderColor: Colors.light.error,
  },
});
