import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text, Chip, DataTable } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

// Mock data - replace with real data from Redux store
const mockOrders = [
  {
    id: "1",
    type: "buy",
    token: "BONK",
    amount: "100000",
    price: "0.00001234",
    total: "1.234",
    status: "completed",
    date: "2024-03-10T10:30:00Z",
  },
  {
    id: "2",
    type: "sell",
    token: "PEPE",
    amount: "50000",
    price: "0.00005678",
    total: "2.839",
    status: "completed",
    date: "2024-03-09T15:45:00Z",
  },
];

export default function OrderHistoryScreen() {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.filtersCard}>
        <Card.Content style={styles.filters}>
          <Chip selected onPress={() => {}} style={styles.filterChip}>
            All
          </Chip>
          <Chip onPress={() => {}} style={styles.filterChip}>
            Buy
          </Chip>
          <Chip onPress={() => {}} style={styles.filterChip}>
            Sell
          </Chip>
        </Card.Content>
      </Card>

      <Card style={styles.ordersCard}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Type</DataTable.Title>
            <DataTable.Title>Token</DataTable.Title>
            <DataTable.Title numeric>Amount</DataTable.Title>
            <DataTable.Title numeric>Total</DataTable.Title>
          </DataTable.Header>

          {mockOrders.map((order) => (
            <DataTable.Row key={order.id}>
              <DataTable.Cell>
                <View style={styles.typeContainer}>
                  <MaterialCommunityIcons
                    name={order.type === "buy" ? "arrow-down" : "arrow-up"}
                    size={16}
                    color={
                      order.type === "buy"
                        ? Colors.light.success
                        : Colors.light.error
                    }
                  />
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color:
                          order.type === "buy"
                            ? Colors.light.success
                            : Colors.light.error,
                      },
                    ]}
                  >
                    {order.type.toUpperCase()}
                  </Text>
                </View>
              </DataTable.Cell>
              <DataTable.Cell>{order.token}</DataTable.Cell>
              <DataTable.Cell numeric>{order.amount}</DataTable.Cell>
              <DataTable.Cell numeric>{order.total} SOL</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
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
  ordersCard: {
    margin: 16,
    marginTop: 8,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
