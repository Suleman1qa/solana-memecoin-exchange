import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { Card, Text, Button, List } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootState } from "../../store";
import { Colors } from "../../constants/Colors";
import { routes } from "../../src/navigation/routes";

export default function WalletScreen() {
  const router = useRouter();
  const { balance, connected } = useSelector(
    (state: RootState) => state.wallet
  );
  const tokens = useSelector((state: RootState) => state.token.tokens);

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
              Connect your wallet to view balance and make transactions
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
      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text variant="titleMedium">Total Balance</Text>
          <Text style={styles.balanceText}>{balance.sol} SOL</Text>
          <View style={styles.actionButtons}>
            <Link href="../send" asChild>
              <Button
                mode="contained"
                style={[styles.actionButton, { marginRight: 8 }]}
              >
                Send
              </Button>
            </Link>
            <Link href="../receive" asChild>
              <Button mode="contained" style={styles.actionButton}>
                Receive
              </Button>
            </Link>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.tokensCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Tokens
          </Text>
          {Object.entries(balance.tokens).map(([mint, data]) => (
            <Link href={`../token/${mint}`} asChild>
              <List.Item
                key={mint}
                title={tokens[mint]?.symbol || "Unknown Token"}
                description={tokens[mint]?.name}
                left={(props) => (
                  <MaterialCommunityIcons
                    {...props}
                    name="currency-btc"
                    size={30}
                    color={Colors.light.primary}
                  />
                )}
                right={() => (
                  <View style={styles.tokenBalance}>
                    <Text>{data.amount}</Text>
                  </View>
                )}
              />
            </Link>
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
  balanceCard: {
    margin: 16,
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 8,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  tokensCard: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  tokenBalance: {
    justifyContent: "center",
  },
});
