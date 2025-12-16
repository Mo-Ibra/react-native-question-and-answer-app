import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { signIn } from "@/services/authServices";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      setError("Please enter email and password");
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password);
      router.replace("/");
    } catch (e: any) {
      console.log(e);
      if (e.code === "auth/invalid-email") {
        Alert.alert("Error", "Invalid email or password");
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        Sign in
      </Text>

      <TextInput
        placeholder="Your Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: "#2563eb",
          padding: 14,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Sign in</Text>
        )}
      </TouchableOpacity>

      {error && <Text style={{ color: "red", marginTop: 16 }}>{error}</Text>}

      <TouchableOpacity
        onPress={() => router.push("/register")}
        style={{ marginTop: 16 }}
      >
        <Text style={{ textAlign: "center" }}>
          <Text>Don&apos;t have an account? </Text>
          <Text style={{ color: "#2563eb", fontWeight: "bold" }}> Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
