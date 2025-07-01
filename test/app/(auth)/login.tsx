import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/slices/authSlice";
import { Colors } from "../../constants/Colors";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      // TODO: Implement actual login API call
      // For now, we'll simulate a successful login
      const mockResponse = {
        user: {
          _id: "1",
          email,
          username: email.split("@")[0],
        },
        token: "mock_token",
      };

      dispatch(loginSuccess(mockResponse));
      router.replace("/(tabs)");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Login
      </Button>

      <Button
        mode="text"
        onPress={() => router.push("/signup")}
        style={styles.linkButton}
      >
        Don't have an account? Sign up
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: Colors.light.primary,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    backgroundColor: Colors.light.primary,
  },
  linkButton: {
    marginTop: 15,
  },
  error: {
    color: Colors.light.error,
    marginBottom: 10,
    textAlign: "center",
  },
});
