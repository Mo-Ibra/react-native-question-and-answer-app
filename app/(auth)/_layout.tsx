import { useAuth } from "@/context/AuthContext";
import { Redirect, Slot } from "expo-router";
import { Text, View } from "react-native";

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (user) {
    return <Redirect href="/" />;
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return <Slot />;
}
