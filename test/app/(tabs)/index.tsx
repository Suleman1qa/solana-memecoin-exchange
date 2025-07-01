import React, { useEffect } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootState } from "../../store";
import { updateMarketData } from "../../store/slices/marketSlice";
import { Colors } from "../../constants/Colors";

// Mock data for demonstration
const MOCK_MARKET_DATA = {
  token1: {
    price: "0.000123",
    change24h: "+15.5",
    volume24h: "1234567",
    marketCap: "1000000",
  },
  token2: {
    price: "0.000456",
    change24h: "-5.2",
    volume24h: "987654",
    marketCap: "2000000",
  },
};

const TokenListItem = ({ tokenMint, data }: any) => {
  const router = useRouter();
  const tokens = useSelector((state: RootState) => state.token.tokens);
  const token = tokens[tokenMint] || {
    symbol: "Unknown",
    name: "Unknown Token",
  };

  return (
    <Card
      style={styles.card}
      onPress={() => router.push(`/token/${tokenMint}`)}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.tokenInfo}>
          <MaterialCommunityIcons
            name="currency-btc"
            size={40}
            color={Colors.light.primary}
          />
          <View style={styles.tokenDetails}>
            <Text style={styles.symbolText}>{token.symbol}</Text>
            <Text variant="bodySmall">{token.name}</Text>
          </View>
        </View>

        <View style={styles.priceInfo}>
          <Text style={styles.priceText}>${data.price}</Text>
          <Text
            style={[
              styles.changeText,
              {
                color: data.change24h.startsWith("-")
                  ? Colors.light.error
                  : Colors.light.success,
              },
            ]}
          >
            {data.change24h}%
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

export default function MarketScreen() {
  const dispatch = useDispatch();
  const { marketData, loading } = useSelector(
    (state: RootState) => state.market
  );

  useEffect(() => {
    // Simulate fetching market data
    dispatch(updateMarketData(MOCK_MARKET_DATA));
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={Object.entries(marketData)}
        keyExtractor={([mint]) => mint}
        renderItem={({ item: [mint, data] }) => (
          <TokenListItem tokenMint={mint} data={data} />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
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
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
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
    fontSize: 16,
    fontWeight: "bold",
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  changeText: {
    fontSize: 14,
    marginTop: 4,
  },
});
