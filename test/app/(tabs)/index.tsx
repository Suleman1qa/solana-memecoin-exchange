import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Text, Card, Avatar, ActivityIndicator } from "react-native-paper";
import { Colors } from "../../constants/Colors";

const Title = (props: any) => (
  <Text
    style={{ fontSize: 20, fontWeight: "bold", color: Colors.light.primary }}
    {...props}
  />
);
const Paragraph = (props: any) => (
  <Text style={{ fontSize: 16, color: "#888" }} {...props} />
);

// Dummy data for demonstration
const trendingTokens = [
  { address: "token1", symbol: "MEME", name: "Memecoin", price: "0.000123" },
  { address: "token2", symbol: "DOGE", name: "Dogecoin", price: "0.123456" },
];
const newListings: any[] = [];
const graduatingTokens: any[] = [];
const graduatedTokens: any[] = [];
const user = { username: "Trader" };
const isLoading = false;

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    // Simulate data fetch
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToTokenDetail = (tokenAddress: string) => {
    // navigation.navigate('TokenDetail', { tokenAddress });
  };

  const renderTokenListItem = ({ item }: { item: any }) => (
    <Card
      style={styles.card}
      onPress={() => navigateToTokenDetail(item.address)}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.tokenInfo}>
          <Avatar.Text
            size={40}
            label={item.symbol.charAt(0)}
            style={{ backgroundColor: Colors.light.primary }}
          />
          <View style={styles.tokenDetails}>
            <Text style={styles.symbolText}>{item.symbol}</Text>
            <Text>{item.name}</Text>
          </View>
        </View>
        <View style={styles.priceInfo}>
          <Text style={styles.priceText}>${item.price}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTokenSection = (
    title: string,
    data: any[],
    viewAllAction?: () => void,
    emptyMessage?: string
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Title>{title}</Title>
        {viewAllAction && (
          <TouchableOpacity onPress={viewAllAction}>
            <Text style={{ color: Colors.light.primary }}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      {data.length === 0 ? (
        <Text style={styles.emptyText}>{emptyMessage || "No tokens available"}</Text>
      ) : (
        <FlatList
          data={data}
          renderItem={renderTokenListItem}
          keyExtractor={(item) => item.address}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tokenList}
        />
      )}
    </View>
  );

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading && !refreshing && !trendingTokens.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.light.primary]}
          tintColor={Colors.light.primary}
        />
      }
    >
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <View style={styles.welcomeHeader}>
            <View>
              <Title>Welcome, {user?.username || "Trader"}!</Title>
              <Paragraph>Discover the newest Solana memecoins</Paragraph>
            </View>
            <Avatar.Text
              size={40}
              label={user?.username?.charAt(0) || "U"}
              color={Colors.light.text}
              style={styles.avatar}
            />
          </View>
        </Card.Content>
      </Card>
      {renderTokenSection(
        "Trending Memecoins",
        trendingTokens,
        undefined,
        "No trending tokens available"
      )}
      {renderTokenSection(
        "New Listings",
        newListings,
        undefined,
        "No new listings available"
      )}
      {renderTokenSection(
        "Graduating Soon",
        graduatingTokens,
        undefined,
        "No graduating tokens available"
      )}
      {renderTokenSection(
        "Recently Graduated",
        graduatedTokens,
        undefined,
        "No graduated tokens available"
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeCard: {
    margin: 16,
    backgroundColor: Colors.light.background,
    elevation: 4,
    borderRadius: 12,
  },
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: Colors.light.primary,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tokenList: {
    paddingVertical: 8,
  },
  card: {
    marginRight: 12,
    minWidth: 200,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenDetails: {
    marginLeft: 12,
  },
  symbolText: {
    fontWeight: "bold",
    fontSize: 18,
    color: Colors.light.primary,
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  priceText: {
    fontWeight: "bold",
    fontSize: 16,
    color: Colors.light.primary,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    padding: 16,
  },
});

export default HomeScreen;
