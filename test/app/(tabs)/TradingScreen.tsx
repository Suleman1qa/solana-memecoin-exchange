import React, { useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { Card, Text, Button, Title, RadioButton } from "react-native-paper";
import { Colors } from "../../constants/Colors";

export default function TradingScreen({ route }: any) {
  // Defensive: handle missing route or params
  if (!route || !route.params) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Invalid navigation: No token selected.</Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  const { token, tokenId } = route.params || {};
  // If token is not provided but tokenId is, create a fallback token object
  const tokenData = token
    ? typeof token === "string" ? JSON.parse(token) : token
    : tokenId
      ? { symbol: tokenId.toUpperCase(), price: "", name: tokenId }
      : null;
  const [orderType, setOrderType] = useState("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState(tokenData?.price || "");
  const [result, setResult] = useState<string | null>(null);

  const handleOrder = () => {
    setResult(
      `Order placed: ${orderType.toUpperCase()} ${amount} ${tokenData?.symbol || "TOKEN"} at $${price}`
    );
  };

  if (!tokenData) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>No token selected.</Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{tokenData?.symbol || "Token"} Trading</Title>
          <Text style={styles.label}>Order Type</Text>
          <RadioButton.Group onValueChange={setOrderType} value={orderType}>
            <View style={styles.radioRow}>
              <RadioButton value="buy" /><Text>Buy</Text>
              <View style={{ width: 16 }} />
              <RadioButton value="sell" /><Text>Sell</Text>
            </View>
          </RadioButton.Group>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            keyboardType="numeric"
          />
          <Text style={styles.label}>Price (USD)</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Enter price"
            keyboardType="numeric"
          />
          <Button mode="contained" onPress={handleOrder} style={styles.button}>
            Place Order
          </Button>
          {result && <Text style={styles.result}>{result}</Text>}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    marginTop: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: Colors.light.text,
  },
  label: {
    marginTop: 16,
    marginBottom: 4,
    color: Colors.light.text,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border || "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  button: {
    marginTop: 16,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  result: {
    marginTop: 16,
    color: Colors.light.success || "#4caf50",
    fontWeight: "bold",
    textAlign: "center",
  },
});
