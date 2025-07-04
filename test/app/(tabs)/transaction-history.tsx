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
      return "arrow-up-bold";
    case "receive":
      return "arrow-down-bold";
    case "swap":
      return "swap-horizontal";
    default:
      return "help-circle-outline";
  }
};

export default function TransactionHistoryScreen() {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Transaction History (Mock Data)" />
        <Card.Content>
          {mockTransactions.length === 0 ? (
            <Text style={styles.placeholderText}>
              No transaction history data available.
            </Text>
          ) : (
            mockTransactions.map((tx) => (
              <List.Item
                key={tx.id}
                title={
                  tx.type === "swap"
                    ? `Swap: ${tx.amountFrom} ${tx.tokenFrom} → ${tx.amountTo} ${tx.tokenTo}`
                    : `${tx.type === "send" ? "Sent" : "Received"} ${tx.amount} ${tx.token}`
                }
                description={`Status: ${tx.status}  •  ${new Date(
                  tx.date
                ).toLocaleString()}`}
                left={(props) => (
                  <MaterialCommunityIcons
                    {...props}
                    name={getTransactionIcon(tx.type)}
                    size={28}
                    color={Colors.light.primary}
                  />
                )}
              />
            ))
          )}
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
  card: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
  },
  placeholderText: {
    textAlign: "center",
    color: Colors.light.text,
    fontSize: 18,
    padding: 32,
  },
});
