import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/authServices";
import {
  getAllQuestions,
  deleteQuestion,
  Question,
} from "@/services/questionServices";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";

export default function Index() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // جلب الأسئلة
  const fetchQuestions = async () => {
    try {
      const allQuestions = await getAllQuestions();
      setQuestions(allQuestions);
    } catch (error) {
      Alert.alert("Error", "Failed to load questions");
      console.error(error);
    } finally {
      setLoadingQuestions(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQuestions();
    }
  }, [user]);

  // تحديث القائمة
  const onRefresh = () => {
    setRefreshing(true);
    fetchQuestions();
  };

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

  const isYourQuestion = (question: Question) => question.authorId === user.uid;

  return (
    <View style={styles.container}>
      {/* معلومات المستخدم */}
      <View style={styles.header}>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.coins}>Coins: {profile?.coins || 0}</Text>
        <Button title="Sign Out" onPress={() => logout()} />
      </View>

      {/* قائمة الأسئلة */}
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
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.questionCard}
                onPress={() => router.push(`/question/${item.id}`)}
                activeOpacity={0.7}
              >
                <Text style={styles.questionTitle}>{item.title}</Text>
                <Text style={styles.questionContent} numberOfLines={2}>
                  {item.content}
                </Text>
                <View style={styles.questionFooter}>
                  <Text style={styles.votes}>Votes: {item.votes}</Text>
                  {isYourQuestion(item) && (
                    <View style={styles.authorBadgeSmall}>
                      <Text style={styles.authorBadgeText}>Your Question</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
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
  questionCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  questionContent: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  questionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  votes: {
    fontSize: 14,
    color: "#888",
  },
  authorBadgeSmall: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  authorBadgeText: {
    color: "#2196F3",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    fontSize: 16,
  },
});