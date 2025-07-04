import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendIp, setBackendIp] = useState("192.168.43.82");

  const validateForm = () => {
    if (!email || !username || !password || !confirmPassword) {
      setError("All fields except Full Name are required");
      return false;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    setError("");
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError("");
    try {
      const API_URL = `http://${backendIp}:5000/api/auth/register`;
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, fullName }),
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        setError(`Invalid JSON response: ${jsonErr}`);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        let errorMsg = data.message || data.error;
        if (typeof errorMsg === "object") {
          errorMsg = JSON.stringify(errorMsg, null, 2);
        }
        if (!errorMsg && typeof data === "object") {
          errorMsg = JSON.stringify(data, null, 2);
        }
        setError(
          `Backend error (${res.status}): ` +
            (errorMsg || "Registration failed")
        );
        setLoading(false);
        return;
      }
      Alert.alert("Success", "Registration successful! Please login.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (err) {
      if (
        err instanceof TypeError &&
        err.message.includes("Network request failed")
      ) {
        setError("Network error: " + err.message);
      } else {
        setError(
          "Unexpected error: " +
            (err instanceof Error ? err.message : String(err))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
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
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Full Name (Optional)"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {error ? (
          <Text
            style={{
              color: "red",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
        ) : null}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing Up..." : "Sign Up"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: "#007AFF",
    textAlign: "center",
    marginTop: 15,
  },
});
