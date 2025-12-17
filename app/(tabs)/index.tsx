import Appbar from "@/components/Appbar";
import QuestionCard from "@/components/QuestionCard";
import { useAuth } from "@/context/AuthContext";
import { useQuestions } from "@/hooks/useQuestions";
import { logout } from "@/services/authServices";
import { Redirect, useRouter } from "expo-router";
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";

export default function Index() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const {
    questions,
    loading: loadingQuestions,
    refreshing,
    refresh,
  } = useQuestions(!!user);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <View style={styles.container}>
      <Appbar user={user} profile={profile} onLogout={() => logout()} />
      <View style={styles.questionsContainer}>
        <View style={styles.questionsHeader}>
          <Text style={styles.title}>All Questions</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/create-question")}
          >
            <Text style={styles.createButtonText}>+ New Question</Text>
          </TouchableOpacity>
        </View>

        {loadingQuestions ? (
          <Text>Loading questions...</Text>
        ) : (
          <FlatList
            data={questions}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refresh} />
            }
            renderItem={({ item }) => (
              <QuestionCard
                question={item}
                isOwner={item.authorId === user.uid}
                onPress={() => router.push(`/question/${item.id}`)}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No questions yet</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  questionsContainer: {
    flex: 1,
  },
  questionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  createButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    fontSize: 16,
  },
});
