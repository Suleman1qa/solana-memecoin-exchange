import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "../../constants/Colors";

export default function TokenDetailScreen() {
  const router = useRouter();
  const { tokenId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Token: {tokenId}</Text>
          <Button mode="contained" onPress={() => router.push({ pathname: "/(tabs)/TradingScreen", params: { tokenId } })} style={styles.tradeButton}>
            Trade
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    color: Colors.light.text,
  },
  tradeButton: {
    marginTop: 16,
  },
});
