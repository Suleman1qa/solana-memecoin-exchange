import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Snackbar,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../../store/slices/authSlice.js";
import { theme } from "../../theme.js";
import * as Updates from "expo-updates";

// Helper function for logging
const log = (message, data) => {
  const logMessage = `[${Updates.channel || "development"}] ${message}`;
  if (data) {
    console.log(logMessage, JSON.stringify(data, null, 2));
  } else {
    console.log(logMessage);
  }
};

const LoginScreen = ({ navigation }) => {
  log("🎭 LoginScreen rendered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => {
    log("🔄 Auth state in selector", state.auth);
    return state.auth;
  });

  useEffect(() => {
    log("🎬 LoginScreen mounted");
    return () => {
      log("🔚 LoginScreen unmounted");
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    log("📊 Auth state changed", {
      isLoading,
      hasError: !!error,
      isAuthenticated,
    });

    if (error) {
      log("❌ Error state", { error });
      setSnackbarVisible(true);
    }

    if (isAuthenticated) {
      log("✅ User authenticated");
    }
  }, [isLoading, error, isAuthenticated]);

  const handleLogin = async () => {
    try {
      console.warn("=== LOGIN START ===");
      console.warn("Attempting login with:", { email });

      const resultAction = await dispatch(login({ email, password }));
      console.warn("Dispatch result:", {
        type: resultAction.type,
        isSuccess: login.fulfilled.match(resultAction),
        isError: login.rejected.match(resultAction),
      });

      if (login.fulfilled.match(resultAction)) {
        console.warn("Login Success:", {
          hasUser: !!resultAction.payload?.user,
          hasToken: !!resultAction.payload?.token,
        });
      } else if (login.rejected.match(resultAction)) {
        console.warn("Login Rejected:", resultAction.error);
        Alert.alert(
          "Login Failed",
          resultAction.error?.message ||
            "Please check your credentials and try again"
        );
      }
    } catch (error) {
      console.warn("Login Error:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      console.warn("=== LOGIN END ===");
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const dismissSnackbar = () => {
    setSnackbarVisible(false);
    dispatch(clearError());
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/memecoinEx-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Solana Memecoin Exchange</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              log("📝 Email input changed");
              setEmail(text);
            }}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary } }}
            disabled={isLoading}
            error={!!error}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={(text) => {
              log("📝 Password input changed");
              setPassword(text);
            }}
            mode="outlined"
            secureTextEntry={secureTextEntry}
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary } }}
            disabled={isLoading}
            error={!!error}
            right={
              <TextInput.Icon
                name={secureTextEntry ? "eye" : "eye-off"}
                onPress={toggleSecureEntry}
                color={theme.colors.primary}
              />
            }
          />

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgotPassword}
            disabled={isLoading}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.text} size="small" />
            ) : (
              "Log In"
            )}
          </Button>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              disabled={isLoading}
            >
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={dismissSnackbar}
          action={{
            label: "Dismiss",
            onPress: dismissSnackbar,
          }}
          duration={3000}
          style={[styles.snackbar, { backgroundColor: theme.colors.error }]}
        >
          {error}
        </Snackbar>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginTop: 10,
  },
  formContainer: {
    width: "100%",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "transparent",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
  },
  button: {
    padding: 5,
    backgroundColor: theme.colors.primary,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    color: theme.colors.text,
  },
  registerLink: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  snackbar: {
    backgroundColor: theme.colors.error,
  },
});

export default LoginScreen;
