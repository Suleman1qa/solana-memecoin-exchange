import React from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useSelector } from "react-redux";
import {
  Card,
  Text,
  Button,
  TextInput,
  SegmentedButtons,
  List,
  Surface,
  IconButton,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootState } from "../../store";
import { Colors } from "../../constants/Colors";

const MOCK_ORDER_BOOK = {
  asks: [
    { price: "0.00001235", size: "1,234,567", total: "15.24" },
    { price: "0.00001234", size: "2,345,678", total: "28.95" },
    { price: "0.00001233", size: "3,456,789", total: "42.62" },
  ],
  bids: [
    { price: "0.00001232", size: "4,567,890", total: "56.28" },
    { price: "0.00001231", size: "5,678,901", total: "69.91" },
    { price: "0.00001230", size: "6,789,012", total: "83.50" },
  ],
};

export default function TradeScreen() {
  const { connected, balance } = useSelector(
    (state: RootState) => state.wallet
  );
  const [orderType, setOrderType] = React.useState("limit");
  const [side, setSide] = React.useState("buy");
  const [price, setPrice] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [selectedPair, setSelectedPair] = React.useState("BONK/SOL");

  if (!connected) {
    return (
      <View style={styles.container}>
        <Card style={styles.connectCard}>
          <Card.Content style={styles.connectCardContent}>
            <MaterialCommunityIcons
              name="wallet-outline"
              size={60}
              color={Colors.light.primary}
            />
            <Text style={styles.connectText}>
              Connect your wallet to start trading
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                /* TODO: Implement wallet connect */
              }}
              style={styles.connectButton}
            >
              Connect Wallet
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Trading Pair Selection */}
      <Surface style={styles.header}>
        <View style={styles.pairSelector}>
          <Text variant="titleMedium">{selectedPair}</Text>
          <IconButton icon="chevron-down" onPress={() => {}} />
        </View>
        <View style={styles.priceInfo}>
          <Text variant="titleLarge">0.00001233</Text>
          <Text style={styles.priceChange} variant="bodyMedium">
            +2.5%
          </Text>
        </View>
      </Surface>

      {/* Chart Placeholder */}
      <View style={styles.chartContainer}>
        <Text>Trading Chart Here</Text>
      </View>

      {/* Order Book */}
      <Card style={styles.section}>
        <Card.Title title="Order Book" />
        <Card.Content>
          <View style={styles.orderBookHeader}>
            <Text style={styles.orderBookHeaderText}>Price</Text>
            <Text style={styles.orderBookHeaderText}>Size</Text>
            <Text style={styles.orderBookHeaderText}>Total</Text>
          </View>

          {/* Asks (Sell Orders) */}
          {MOCK_ORDER_BOOK.asks.reverse().map((order, index) => (
            <View key={`ask-${index}`} style={styles.orderBookRow}>
              <Text style={[styles.orderPrice, styles.askPrice]}>
                {order.price}
              </Text>
              <Text style={styles.orderSize}>{order.size}</Text>
              <Text style={styles.orderTotal}>{order.total}</Text>
            </View>
          ))}

          {/* Spread */}
          <View style={styles.spreadRow}>
            <Text style={styles.spreadText}>Spread: 0.00000001 (0.08%)</Text>
          </View>

          {/* Bids (Buy Orders) */}
          {MOCK_ORDER_BOOK.bids.map((order, index) => (
            <View key={`bid-${index}`} style={styles.orderBookRow}>
              <Text style={[styles.orderPrice, styles.bidPrice]}>
                {order.price}
              </Text>
              <Text style={styles.orderSize}>{order.size}</Text>
              <Text style={styles.orderTotal}>{order.total}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Order Form */}
      <Card style={styles.section}>
        <Card.Content>
          <SegmentedButtons
            value={orderType}
            onValueChange={setOrderType}
            buttons={[
              { value: "limit", label: "Limit" },
              { value: "market", label: "Market" },
            ]}
            style={styles.segmentedButton}
          />

          <View style={styles.orderTypeButtons}>
            <Button
              mode={side === "buy" ? "contained" : "outlined"}
              onPress={() => setSide("buy")}
              style={[styles.sideButton, side === "buy" && styles.buyButton]}
              labelStyle={side === "buy" ? styles.activeButtonLabel : undefined}
            >
              Buy
            </Button>
            <Button
              mode={side === "sell" ? "contained" : "outlined"}
              onPress={() => setSide("sell")}
              style={[styles.sideButton, side === "sell" && styles.sellButton]}
              labelStyle={
                side === "sell" ? styles.activeButtonLabel : undefined
              }
            >
              Sell
            </Button>
          </View>

          {orderType === "limit" && (
            <TextInput
              label="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
              right={<TextInput.Affix text="SOL" />}
            />
          )}

          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            right={<TextInput.Affix text="BONK" />}
          />

          <View style={styles.balanceRow}>
            <Text variant="bodySmall">Available: {balance?.sol} SOL</Text>
            <Button
              compact
              mode="text"
              onPress={() => {
                /* TODO: Calculate max amount */
              }}
            >
              Max
            </Button>
          </View>

          <Button
            mode="contained"
            onPress={() => {
              /* TODO: Place order */
            }}
            style={[
              styles.submitButton,
              side === "buy" ? styles.buyButton : styles.sellButton,
            ]}
          >
            {side === "buy" ? "Buy" : "Sell"} {selectedPair.split("/")[0]}
          </Button>
        </Card.Content>
      </Card>

      {/* Recent Trades */}
      <Card style={styles.section}>
        <Card.Title
          title="Recent Trades"
          right={(props) => (
            <Button {...props} mode="text" onPress={() => {}}>
              View All
            </Button>
          )}
        />
        <Card.Content>
          <List.Item
            title="Buy"
            description="0.00001234"
            right={() => (
              <View style={styles.tradeInfo}>
                <Text>1,234,567 BONK</Text>
                <Text variant="bodySmall">2 mins ago</Text>
              </View>
            )}
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="arrow-up"
                size={24}
                color={Colors.light.success}
              />
            )}
          />
          <List.Item
            title="Sell"
            description="0.00001233"
            right={() => (
              <View style={styles.tradeInfo}>
                <Text>2,345,678 BONK</Text>
                <Text variant="bodySmall">5 mins ago</Text>
              </View>
            )}
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="arrow-down"
                size={24}
                color={Colors.light.error}
              />
            )}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pairSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  priceChange: {
    color: Colors.light.success,
  },
  chartContainer: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  section: {
    margin: 16,
    marginBottom: 8,
  },
  segmentedButton: {
    marginBottom: 16,
  },
  orderTypeButtons: {
    flexDirection: "row",
    marginBottom: 16,
  },
  sideButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  buyButton: {
    backgroundColor: Colors.light.success,
  },
  sellButton: {
    backgroundColor: Colors.light.error,
  },
  activeButtonLabel: {
    color: "#fff",
  },
  input: {
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  submitButton: {
    height: 48,
  },
  orderBookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  orderBookHeaderText: {
    flex: 1,
    textAlign: "right",
    fontWeight: "bold",
  },
  orderBookRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  orderPrice: {
    flex: 1,
    textAlign: "right",
    fontFamily: "monospace",
  },
  orderSize: {
    flex: 1,
    textAlign: "right",
    fontFamily: "monospace",
  },
  orderTotal: {
    flex: 1,
    textAlign: "right",
    fontFamily: "monospace",
  },
  askPrice: {
    color: Colors.light.error,
  },
  bidPrice: {
    color: Colors.light.success,
  },
  spreadRow: {
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: Colors.light.background,
  },
  spreadText: {
    color: Colors.light.text,
    opacity: 0.7,
  },
  tradeInfo: {
    alignItems: "flex-end",
  },
  connectCard: {
    margin: 16,
  },
  connectCardContent: {
    alignItems: "center",
    padding: 20,
  },
  connectText: {
    textAlign: "center",
    marginVertical: 20,
  },
  connectButton: {
    marginTop: 10,
    backgroundColor: Colors.light.primary,
  },
});
