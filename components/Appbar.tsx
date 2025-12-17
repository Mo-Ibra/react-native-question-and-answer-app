import { Profile } from "@/services/profileServices";
import { User } from "firebase/auth";
import { DocumentData } from "firebase/firestore";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Appbar({
  user,
  profile,
  onLogout,
}: {
  user: User | null;
  profile: Profile | DocumentData | null;
  onLogout: () => void;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.coins}>Coins: {profile?.coins || 0}</Text>
      <Button title="Sign Out" onPress={onLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    marginBottom: 5,
  },
  coins: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
