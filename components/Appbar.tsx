import { Profile } from "@/services/profileServices";
import { User } from "firebase/auth";
import { DocumentData } from "firebase/firestore";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
    <View style={styles.wrapper}>
      <View style={styles.header}>
        {/* User info */}
        <View style={styles.userInfo}>
          <Text style={styles.email} numberOfLines={1}>
            {user?.email}
          </Text>

          <View style={styles.coinsBadge}>
            <Text style={styles.coinsText}>
              💰 {profile?.coins ?? 0} Coins
            </Text>
          </View>
        </View>

        {/* Logout */}
        <Pressable
          onPress={onLogout}
          android_ripple={{ color: "#eee" }}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 40,
    marginBottom: 20,
  },
  header: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    // shadow iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,

    // shadow Android
    elevation: 4,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  email: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  coinsBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  coinsText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E7D32",
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D32F2F",
  },
});

