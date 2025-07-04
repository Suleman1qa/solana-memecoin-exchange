import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Divider,
  Snackbar,
} from "react-native-paper";
import { Colors } from "../../constants/Colors";

// Dummy tokens for swap
const tokens = [
  { symbol: "MEME", name: "Memecoin", price: 0.000123 },
  { symbol: "DOGE", name: "Dogecoin", price: 0.123456 },
  { symbol: "USDT", name: "USD Token", price: 1.0 },
];

const SwapScreen = () => {
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [amount, setAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippageTolerance, setSlippageTolerance] = useState("1");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount("");
    setToAmount("");
  };

  const handleSwap = () => {
    if (!fromToken || !toToken || !amount || parseFloat(amount) <= 0) {
      setSnackbarMessage("Please enter a valid amount and select tokens.");
      setSnackbarVisible(true);
      return;
    }
    setSnackbarMessage(
      `Swapped ${amount} ${fromToken.symbol} to ${toToken.symbol}! (Simulated)`
    );
    setSnackbarVisible(true);
    setAmount("");
    setToAmount("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Swap</Title>
            <Text style={styles.cardSubtitle}>Trade tokens in an instant</Text>
            <View style={styles.tokenRow}>
              <Text style={styles.label}>From</Text>
              <TouchableOpacity style={styles.tokenSelector}>
                <Text style={styles.tokenSymbol}>{fromToken.symbol}</Text>
              </TouchableOpacity>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.0"
                style={styles.amountInput}
                mode="outlined"
                theme={{ colors: { primary: Colors.light.primary } }}
              />
            </View>
            <View style={styles.switchRow}>
              <TouchableOpacity
                onPress={handleSwapTokens}
                style={styles.switchButton}
              >
                <Text style={styles.switchButtonText}>⇅</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tokenRow}>
              <Text style={styles.label}>To</Text>
              <TouchableOpacity style={styles.tokenSelector}>
                <Text style={styles.tokenSymbol}>{toToken.symbol}</Text>
              </TouchableOpacity>
              <TextInput
                value={toAmount}
                onChangeText={setToAmount}
                keyboardType="numeric"
                placeholder="0.0"
                style={styles.amountInput}
                mode="outlined"
                theme={{ colors: { primary: Colors.light.primary } }}
              />
            </View>
            <View style={styles.slippageContainer}>
              <Text style={styles.slippageTitle}>Slippage Tolerance</Text>
              <View style={styles.slippageButtons}>
                {["0.5", "1", "2", "3"].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.slippageButton,
                      slippageTolerance === value && styles.activeSlippageButton,
                    ]}
                    onPress={() => setSlippageTolerance(value)}
                  >
                    <Text
                      style={[
                        styles.slippageButtonText,
                        slippageTolerance === value && styles.activeSlippageButtonText,
                      ]}
                    >
                      {value}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <Button
              mode="contained"
              onPress={handleSwap}
              style={styles.swapActionButton}
              disabled={!fromToken || !toToken || !amount || parseFloat(amount) <= 0}
            >
              Swap
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[styles.snackbar, { backgroundColor: Colors.light.background }]}
      >
        <Text style={{ color: '#000', textAlign: 'center' }}>{snackbarMessage}</Text>
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: Colors.light.primary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
  },
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: Colors.light.primary,
    marginRight: 8,
    width: 40,
  },
  tokenSelector: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  tokenSymbol: {
    color: Colors.light.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  amountInput: {
    flex: 1,
    backgroundColor: "transparent",
    height: 40,
  },
  slippageContainer: {
    marginBottom: 24,
  },
  slippageTitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  slippageButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  slippageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#333",
    minWidth: 60,
    alignItems: "center",
    marginRight: 8,
  },
  activeSlippageButton: {
    backgroundColor: Colors.light.primary,
  },
  slippageButtonText: {
    color: "#888",
    fontWeight: "bold",
  },
  activeSlippageButtonText: {
    color: Colors.light.text,
  },
  swapActionButton: {
    backgroundColor: Colors.light.primary,
    marginBottom: 16,
  },
  snackbar: {
    backgroundColor: Colors.light.background,
  },
  switchRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  switchButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    padding: 8,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  switchButtonText: {
    color: Colors.light.text,
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default SwapScreen;
