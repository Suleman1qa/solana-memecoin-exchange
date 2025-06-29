import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useEffect } from "react";

// auth Screens
import LoginScreen from "../screens/auth/LoginScreen.js";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import VerifyEmailScreen from "../screens/auth/VerifyEmailScreen";

// Main Screens
import HomeScreen from "../screens/main/HomeScreen";
import MarketScreen from "../screens/main/MarketScreen";
import WalletScreen from "../screens/main/WalletScreen";
import ProfileScreen from "../screens/main/ProfileScreen";

// Detail Screens
import TokenDetailScreen from "../screens/details/TokenDetailScreen";
import TradingScreen from "../screens/details/TradingScreen";
import WalletDetailScreen from "../screens/details/WalletDetailScreen";
import SwapScreen from "../screens/details/SwapScreen";
import DepositScreen from "../screens/details/DepositScreen";
import WithdrawScreen from "../screens/details/WithdrawScreen";
import TransferScreen from "../screens/details/TransferScreen";
import OrderHistoryScreen from "../screens/details/OrderHistoryScreen";
import TransactionHistoryScreen from "../screens/details/TransactionHistoryScreen";
import SettingsScreen from "../screens/details/SettingsScreen";
import HelpScreen from "../screens/details/HelpScreen";
import { theme } from "../theme.js";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: theme.colors.text,
      headerTitleStyle: {
        ...theme.fonts.medium,
      },
      cardStyle: { backgroundColor: theme.colors.background },
    }}
  >
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
  </Stack.Navigator>
);

// Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: "#888",
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
      },
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: theme.colors.text,
      headerTitleStyle: {
        ...theme.fonts.medium,
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="home" type="material" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Market"
      component={MarketScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="trending-up" type="material" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Wallet"
      component={WalletScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon
            name="account-balance-wallet"
            type="material"
            color={color}
            size={size}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="person" type="material" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Main Navigator
const MainNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: theme.colors.text,
      headerTitleStyle: {
        ...theme.fonts.medium,
      },
      cardStyle: { backgroundColor: theme.colors.background },
    }}
  >
    <Stack.Screen
      name="TabNavigator"
      component={TabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="TokenDetail"
      component={TokenDetailScreen}
      options={{ title: "Token Details" }}
    />
    <Stack.Screen name="Trading" component={TradingScreen} />
    <Stack.Screen
      name="WalletDetail"
      component={WalletDetailScreen}
      options={{ title: "Wallet Details" }}
    />
    <Stack.Screen name="Swap" component={SwapScreen} />
    <Stack.Screen name="Deposit" component={DepositScreen} />
    <Stack.Screen name="Withdraw" component={WithdrawScreen} />
    <Stack.Screen name="Transfer" component={TransferScreen} />
    <Stack.Screen
      name="OrderHistory"
      component={OrderHistoryScreen}
      options={{ title: "Order History" }}
    />
    <Stack.Screen
      name="TransactionHistory"
      component={TransactionHistoryScreen}
      options={{ title: "Transaction History" }}
    />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Help" component={HelpScreen} />
  </Stack.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("Navigation state changed:", { isAuthenticated, user });
  }, [isAuthenticated, user]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen
          name="Main"
          component={MainNavigator}
          listeners={{
            focus: () => {
              console.log("Main navigator focused");
            },
          }}
        />
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          listeners={{
            focus: () => {
              console.log("Auth navigator focused");
            },
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
