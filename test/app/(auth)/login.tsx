import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/slices/authSlice";
import { Colors } from "../../constants/Colors";
import { Picker } from '@react-native-picker/picker';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendIp, setBackendIp] = useState("192.168.43.82"); // Default to your preferred or most current IP

  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const API_URL = `http://${backendIp}:5000/api/auth/login`;
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        setError(`Invalid JSON response: ${jsonErr}`);
        return;
      }
      if (!res.ok) {
        // Show backend error message, status code, and any details
        let errorMsg = data.message || data.error;
        if (typeof errorMsg === 'object') {
          errorMsg = JSON.stringify(errorMsg, null, 2);
        }
        if (!errorMsg && typeof data === 'object') {
          errorMsg = JSON.stringify(data, null, 2);
        }
        setError(
          `Backend error (${res.status}): ` + (errorMsg || "Login failed")
        );
        return;
      }
      dispatch(loginSuccess(data));
      router.replace("/(tabs)");
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("Network request failed")) {
        setError("Network error: " + err.message);
      } else {
        setError("Unexpected error: " + (err instanceof Error ? err.message : String(err)));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={backendIp}
        onValueChange={setBackendIp}
        style={{ marginBottom: 15 }}
      >
        <Picker.Item label="192.168.18.36" value="192.168.18.36" />
        <Picker.Item label="192.168.84.75" value="192.168.84.75" />
        <Picker.Item label="192.168.104.75" value="192.168.104.75" />
        <Picker.Item label="192.168.190.75" value="192.168.190.75" />
        <Picker.Item label="192.168.188.75" value="192.168.188.75" />
        <Picker.Item label="192.168.43.82" value="192.168.43.82" />
      </Picker>

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
