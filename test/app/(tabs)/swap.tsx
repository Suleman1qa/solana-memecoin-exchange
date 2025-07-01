import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { Card, Text, TextInput, Button, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootState } from "../../store";
import { Colors } from "../../constants/Colors";

export default function SwapScreen() {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const { connected } = useSelector((state: RootState) => state.wallet);
  const tokens = useSelector((state: RootState) => state.token.tokens);

  const handleSwap = async () => {
    try {
      setLoading(true);
      // TODO: Implement swap functionality
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Swap failed:", error);
    } finally {
      setLoading(false);
    }
  };

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
              Connect your wallet to start swapping tokens
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
    <View style={styles.container}>
      <Card style={styles.swapCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Swap Tokens
          </Text>

          <View style={styles.inputContainer}>
            <Text>From</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={fromAmount}
                onChangeText={setFromAmount}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholder="0.0"
              />
              <Button
                mode="outlined"
                onPress={() => {
                  /* TODO: Open token selector */
                }}
                style={styles.tokenButton}
              >
                SOL
                <MaterialCommunityIcons name="chevron-down" size={20} />
              </Button>
            </View>
          </View>

          <IconButton
            icon="swap-vertical"
            size={24}
            onPress={() => {
              const temp = fromAmount;
              setFromAmount(toAmount);
              setToAmount(temp);
            }}
            style={styles.swapButton}
          />

          <View style={styles.inputContainer}>
            <Text>To</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={toAmount}
                onChangeText={setToAmount}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholder="0.0"
              />
              <Button
                mode="outlined"
                onPress={() => {
                  /* TODO: Open token selector */
                }}
                style={styles.tokenButton}
              >
                Select Token
                <MaterialCommunityIcons name="chevron-down" size={20} />
              </Button>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleSwap}
            loading={loading}
            disabled={loading || !fromAmount || !toAmount}
            style={styles.swapActionButton}
          >
            Swap
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  connectCard: {
    marginTop: 16,
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
  swapCard: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  input: {
    flex: 1,
    marginRight: 8,
    backgroundColor: Colors.light.background,
  },
  tokenButton: {
    minWidth: 120,
  },
  swapButton: {
    alignSelf: "center",
    margin: 8,
  },
  swapActionButton: {
    marginTop: 16,
    backgroundColor: Colors.light.primary,
  },
});
