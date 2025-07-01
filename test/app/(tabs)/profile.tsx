import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { Card, Text, List, Button, Avatar, Switch } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootState } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { Colors } from "../../constants/Colors";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Settings state
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [biometricAuth, setBiometricAuth] = React.useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={user?.username?.substring(0, 2).toUpperCase() || "U"}
          style={styles.avatar}
        />
        <Text style={styles.username}>{user?.username || "User"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Card style={styles.section}>
        <Card.Title title="Quick Actions" />
        <Card.Content>
          <Link href="../order-history" asChild>
            <List.Item
              title="Order History"
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name="history"
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
          </Link>
          <Link href="../transaction-history" asChild>
            <List.Item
              title="Transaction History"
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name="bank-transfer"
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
          </Link>
          <Link href="../staking" asChild>
            <List.Item
              title="Staking"
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name="bank"
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
          </Link>
        </Card.Content>
      </Card>

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
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="key"
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
            title="Two-Factor Authentication"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="shield-check"
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

      <Card style={styles.section}>
        <Card.Title title="App Settings" />
        <Card.Content>
          <List.Item
            title="Currency"
            description="USD"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="currency-usd"
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
            title="Language"
            description="English"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="translate"
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
          <Link href="../help" asChild>
            <List.Item
              title="Help & Support"
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name="help-circle"
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
          </Link>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        contentStyle={styles.logoutButtonContent}
      >
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.light.primary,
  },
  avatar: {
    backgroundColor: Colors.light.background,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.background,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: Colors.light.background,
    opacity: 0.8,
  },
  section: {
    margin: 16,
    marginBottom: 8,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
    backgroundColor: Colors.light.error,
  },
  logoutButtonContent: {
    height: 48,
  },
});
