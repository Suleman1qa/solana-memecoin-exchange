import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Text, Button, Divider, List } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Colors } from "../../constants/Colors";

export default function DepositScreen() {
  const { connected } = useSelector((state: RootState) => state.wallet);
  const walletAddress = "3KZh..."; // Replace with actual wallet address

  const networks = [
    {
      name: "Solana",
      symbol: "SOL",
      icon: "wallet" as const,
      minDeposit: "0.01",
      confirmations: "32",
      time: "~30 seconds",
    },
    {
      name: "Solana Program (SPL)",
      symbol: "USDC",
      icon: "currency-usd" as const,
      minDeposit: "1",
      confirmations: "32",
      time: "~30 seconds",
    },
  ];

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
              Connect your wallet to view deposit address
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
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>
            Deposit Address
          </Text>
          <View style={styles.qrContainer}>
            <MaterialCommunityIcons
              name="qrcode"
              size={200}
              color={Colors.light.text}
            />
          </View>
          <View style={styles.addressContainer}>
            <Text selectable style={styles.address}>
              {walletAddress}
            </Text>
            <Button
              mode="contained-tonal"
              onPress={() => {
                /* TODO: Implement copy */
              }}
            >
              Copy Address
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Available Networks" />
        <Card.Content>
          {networks.map((network, index) => (
            <React.Fragment key={network.name}>
              <List.Item
                title={network.name}
                description={`Min. deposit: ${network.minDeposit} ${network.symbol}`}
                left={(props) => (
                  <MaterialCommunityIcons
                    {...props}
                    name={network.icon}
                    size={24}
                    color={Colors.light.primary}
                  />
                )}
              />
              <List.Item
                title="Network Details"
                description={`Required confirmations: ${network.confirmations}\nEstimated time: ${network.time}`}
                left={(props) => <View {...props} style={{ width: 24 }} />}
              />
              {index < networks.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Important Notes" />
        <Card.Content>
          <List.Item
            title="Send only supported tokens"
            description="Sending unsupported tokens may result in permanent loss"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="alert"
                size={24}
                color={Colors.light.warning}
              />
            )}
          />
          <List.Item
            title="Minimum deposit"
            description="Deposits below minimum may not be credited"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="information"
                size={24}
                color={Colors.light.primary}
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
  section: {
    margin: 16,
    marginBottom: 8,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  addressContainer: {
    alignItems: "center",
    gap: 8,
  },
  address: {
    fontSize: 16,
    fontFamily: "monospace",
    marginBottom: 8,
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
