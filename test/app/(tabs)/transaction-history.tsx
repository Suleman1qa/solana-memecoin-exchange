import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text, List, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

// Mock data - replace with real data from Redux store
const mockTransactions = [
  {
    id: "1",
    type: "send",
    token: "SOL",
    amount: "1.5",
    to: "3Kzh...",
    status: "completed",
    date: "2024-03-10T12:30:00Z",
  },
  {
    id: "2",
    type: "receive",
    token: "BONK",
    amount: "100000",
    from: "7Yth...",
    status: "completed",
    date: "2024-03-09T18:45:00Z",
  },
  {
    id: "3",
    type: "swap",
    tokenFrom: "SOL",
    tokenTo: "PEPE",
    amountFrom: "0.5",
    amountTo: "25000",
    status: "completed",
    date: "2024-03-08T09:15:00Z",
  },
];

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "send":
      return "arrow-top-right";
    case "receive":
      return "arrow-bottom-left";
    case "swap":
      return "swap-horizontal";
    default:
      return "circle";
  }
};

const getTransactionColor = (type: string) => {
  switch (type) {
    case "send":
      return Colors.light.error;
    case "receive":
      return Colors.light.success;
    case "swap":
      return Colors.light.primary;
    default:
      return Colors.light.text;
  }
};

export default function TransactionHistoryScreen() {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.filtersCard}>
        <Card.Content style={styles.filters}>
          <Chip selected onPress={() => {}} style={styles.filterChip}>
            All
          </Chip>
          <Chip onPress={() => {}} style={styles.filterChip}>
            Send
          </Chip>
          <Chip onPress={() => {}} style={styles.filterChip}>
            Receive
          </Chip>
          <Chip onPress={() => {}} style={styles.filterChip}>
            Swap
          </Chip>
        </Card.Content>
      </Card>

      <Card style={styles.transactionsCard}>
        <Card.Content>
          {mockTransactions.map((tx) => (
            <List.Item
              key={tx.id}
              title={tx.type.toUpperCase()}
              description={new Date(tx.date).toLocaleString()}
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name={getTransactionIcon(tx.type)}
                  size={24}
                  color={getTransactionColor(tx.type)}
                />
              )}
              right={() => (
                <View style={styles.amountContainer}>
                  {tx.type === "swap" ? (
                    <>
                      <Text style={styles.amount}>
                        -{tx.amountFrom} {tx.tokenFrom}
                      </Text>
                      <Text style={styles.amount}>
                        +{tx.amountTo} {tx.tokenTo}
                      </Text>
                    </>
                  ) : (
                    <Text
                      style={[
                        styles.amount,
                        { color: getTransactionColor(tx.type) },
                      ]}
                    >
                      {tx.type === "send" ? "-" : "+"}
                      {tx.amount} {tx.token}
                    </Text>
                  )}
                </View>
              )}
            />
          ))}
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
  filtersCard: {
    margin: 16,
    marginBottom: 8,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    backgroundColor: Colors.light.background,
  },
  transactionsCard: {
    margin: 16,
    marginTop: 8,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontWeight: "bold",
  },
});
