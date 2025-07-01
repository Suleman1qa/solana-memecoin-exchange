import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { List, Card, Switch } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [biometricAuth, setBiometricAuth] = React.useState(false);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Card.Title title="Notifications" />
        <Card.Content>
          <List.Item
            title="Push Notifications"
            description="Receive push notifications for trades and alerts"
            right={() => (
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                color={Colors.light.primary}
              />
            )}
          />
          <List.Item
            title="Email Notifications"
            description="Receive email updates for important events"
            right={() => (
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                color={Colors.light.primary}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Security" />
        <Card.Content>
          <List.Item
            title="Biometric Authentication"
            description="Use fingerprint or face ID for transactions"
            right={() => (
              <Switch
                value={biometricAuth}
                onValueChange={setBiometricAuth}
                color={Colors.light.primary}
              />
            )}
          />
          <List.Item
            title="Change Password"
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
            title="Two-Factor Authentication"
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

      <Card style={styles.section}>
        <Card.Title title="App Settings" />
        <Card.Content>
          <List.Item
            title="Currency"
            description="USD"
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
            title="Language"
            description="English"
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
});
