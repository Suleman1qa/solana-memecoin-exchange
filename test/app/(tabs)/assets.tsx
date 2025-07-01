import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Link } from "expo-router";
import { useSelector } from "react-redux";
import { Card, Text, Button, List, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootState } from "../../store";
import { Colors } from "../../constants/Colors";

export default function AssetsScreen() {
  const { connected, balance } = useSelector(
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
              Connect your wallet to view your assets
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
      {/* Portfolio Value Card */}
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium">Total Portfolio Value</Text>
          <Text style={styles.portfolioValue}>$1,234.56</Text>
          <Text variant="bodySmall" style={styles.portfolioChange}>
            +2.5% (24h)
          </Text>

          <View style={styles.quickActions}>
            <Link href="../deposit" asChild>
              <Button
                mode="contained"
                icon="arrow-down"
                style={[styles.actionButton, { marginRight: 8 }]}
              >
                Deposit
              </Button>
            </Link>
            <Link href="../withdraw" asChild>
              <Button
                mode="contained"
                icon="arrow-up"
                style={styles.actionButton}
              >
                Withdraw
              </Button>
            </Link>
          </View>
        </Card.Content>
      </Card>

      {/* Trading Actions */}
      <Surface style={styles.tradingActions}>
        <Link href="../trade" asChild>
          <Button
            mode="contained-tonal"
            icon="swap-horizontal"
            contentStyle={styles.tradingButton}
          >
            Trade
          </Button>
        </Link>
        <Link href="../send" asChild>
          <Button
            mode="contained-tonal"
            icon="send"
            contentStyle={styles.tradingButton}
          >
            Send
          </Button>
        </Link>
        <Link href="../receive" asChild>
          <Button
            mode="contained-tonal"
            icon="download"
            contentStyle={styles.tradingButton}
          >
            Receive
          </Button>
        </Link>
        <Link href="../staking" asChild>
          <Button
            mode="contained-tonal"
            icon="bank"
            contentStyle={styles.tradingButton}
          >
            Stake
          </Button>
        </Link>
      </Surface>

      {/* Asset List */}
      <Card style={styles.section}>
        <Card.Title
          title="Your Assets"
          right={(props) => (
            <Link href="../transaction-history" asChild>
              <Button {...props} mode="text">
                History
              </Button>
            </Link>
          )}
        />
        <Card.Content>
          {/* SOL Balance */}
          <Link href="../token/sol" asChild>
            <List.Item
              title="Solana"
              description={`$${(Number(balance?.sol || 0) * 20).toFixed(2)}`}
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name="currency-sign"
                  size={30}
                  color={Colors.light.primary}
                />
              )}
              right={() => (
                <View style={styles.tokenBalance}>
                  <Text>{balance?.sol} SOL</Text>
                  <Text variant="bodySmall" style={styles.tokenChange}>
                    +1.2%
                  </Text>
                </View>
              )}
            />
          </Link>

          {/* Token Balances */}
          {Object.entries(balance?.tokens || {}).map(([mint, data]) => (
            <Link key={mint} href={`../token/${mint}`} asChild>
              <List.Item
                title={tokens[mint]?.symbol || "Unknown Token"}
                description={`$${(Number(data.amount || 0) * 0.01).toFixed(2)}`}
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
                    <Text variant="bodySmall" style={styles.tokenChange}>
                      +0.5%
                    </Text>
                  </View>
                )}
              />
            </Link>
          ))}
        </Card.Content>
      </Card>

      {/* Staking Overview */}
      <Card style={styles.section}>
        <Card.Title title="Staking" />
        <Card.Content>
          <List.Item
            title="Total Staked"
            description="12.5 SOL"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="bank"
                size={30}
                color={Colors.light.primary}
              />
            )}
            right={() => (
              <View style={styles.tokenBalance}>
                <Text>$250.00</Text>
                <Text variant="bodySmall" style={styles.apy}>
                  6.2% APY
                </Text>
              </View>
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
  portfolioValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 8,
  },
  portfolioChange: {
    color: Colors.light.success,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: "row",
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  tradingActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  tradingButton: {
    flexDirection: "column",
    gap: 4,
  },
  tokenBalance: {
    alignItems: "flex-end",
  },
  tokenChange: {
    color: Colors.light.success,
  },
  apy: {
    color: Colors.light.primary,
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
