import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Card,
  Text,
  Button,
  TextInput,
  List,
  SegmentedButtons,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Colors } from "../../constants/Colors";

export default function WithdrawScreen() {
  const { connected, balance } = useSelector(
    (state: RootState) => state.wallet
  );
  const [address, setAddress] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [network, setNetwork] = React.useState("solana");

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
              Connect your wallet to withdraw funds
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
        <Card.Title title="Select Network" />
        <Card.Content>
          <SegmentedButtons
            value={network}
            onValueChange={setNetwork}
            buttons={[
              { value: "solana", label: "Solana" },
              { value: "spl", label: "SPL Token" },
            ]}
          />
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Withdrawal Details" />
        <Card.Content>
          <TextInput
            label="Recipient Address"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Affix text={network === "solana" ? "SOL" : "USDC"} />
            }
          />
          <View style={styles.balanceContainer}>
            <Text variant="bodySmall">Available: {balance?.sol} SOL</Text>
            <Button
              compact
              mode="text"
              onPress={() => setAmount(balance?.sol.toString())}
            >
              Max
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Network Fee" />
        <Card.Content>
          <List.Item
            title="Estimated Fee"
            description="0.000005 SOL"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="currency-usd"
                size={24}
                color={Colors.light.primary}
              />
            )}
          />
          <List.Item
            title="Processing Time"
            description="~30 seconds"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="clock-outline"
                size={24}
                color={Colors.light.primary}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Important Notes" />
        <Card.Content>
          <List.Item
            title="Minimum withdrawal"
            description={`${network === "solana" ? "0.01 SOL" : "1 USDC"}`}
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="information"
                size={24}
                color={Colors.light.primary}
              />
            )}
          />
          <List.Item
            title="Address verification"
            description="Please double-check the recipient address"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="alert"
                size={24}
                color={Colors.light.warning}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => {
          /* TODO: Implement withdraw */
        }}
        style={styles.withdrawButton}
        disabled={!address || !amount}
      >
        Withdraw
      </Button>
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
  input: {
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -4,
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
  withdrawButton: {
    margin: 16,
    marginTop: 8,
    backgroundColor: Colors.light.primary,
  },
});
