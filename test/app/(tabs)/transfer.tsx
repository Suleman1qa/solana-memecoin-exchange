import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import { Colors } from "../../constants/Colors";

export default function TransferScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.placeholderText}>Transfer screen placeholder (no real API logic).</Text>
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
  placeholderText: {
    textAlign: "center",
    color: Colors.light.text,
    fontSize: 18,
    padding: 32,
  },
});
