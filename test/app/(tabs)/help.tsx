import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Card, List, Button, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

export default function HelpScreen() {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Need Help?
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Get support or send us your feedback
          </Text>
          <Button
            mode="contained"
            icon="chat"
            style={styles.button}
            onPress={() => {
              /* TODO: Implement chat support */
            }}
          >
            Contact Support
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Frequently Asked Questions" />
        <Card.Content>
          <List.Accordion
            title="How do I connect my wallet?"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="wallet"
                size={24}
                color={Colors.light.primary}
              />
            )}
          >
            <List.Item
              title="Connecting Your Wallet"
              description="Download a Solana wallet, click 'Connect Wallet' in the app, and follow the prompts to connect securely."
              descriptionNumberOfLines={4}
            />
          </List.Accordion>

          <List.Accordion
            title="How to buy/sell tokens?"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="swap-horizontal"
                size={24}
                color={Colors.light.primary}
              />
            )}
          >
            <List.Item
              title="Trading Instructions"
              description="Navigate to the Swap screen, select the tokens you want to trade, enter the amount, and confirm the transaction."
              descriptionNumberOfLines={4}
            />
          </List.Accordion>

          <List.Accordion
            title="What are the fees?"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="cash"
                size={24}
                color={Colors.light.primary}
              />
            )}
          >
            <List.Item
              title="Fee Structure"
              description="Trading fees vary by token and liquidity pool. Network fees apply for on-chain transactions."
              descriptionNumberOfLines={4}
            />
          </List.Accordion>

          <List.Accordion
            title="How to stake tokens?"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="bank"
                size={24}
                color={Colors.light.primary}
              />
            )}
          >
            <List.Item
              title="Staking Guide"
              description="Go to the Staking screen, choose a staking pool, enter the amount you want to stake, and confirm the transaction."
              descriptionNumberOfLines={4}
            />
          </List.Accordion>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Quick Links" />
        <Card.Content>
          <List.Item
            title="Documentation"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="book-open-variant"
                size={24}
                color={Colors.light.primary}
              />
            )}
            right={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="chevron-right"
                size={24}
                color={Colors.light.text}
              />
            )}
          />
          <List.Item
            title="Video Tutorials"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="video"
                size={24}
                color={Colors.light.primary}
              />
            )}
            right={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="chevron-right"
                size={24}
                color={Colors.light.text}
              />
            )}
          />
          <List.Item
            title="Community Forum"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="forum"
                size={24}
                color={Colors.light.primary}
              />
            )}
            right={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="chevron-right"
                size={24}
                color={Colors.light.text}
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
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
    opacity: 0.7,
  },
  button: {
    marginTop: 8,
    backgroundColor: Colors.light.primary,
  },
});
