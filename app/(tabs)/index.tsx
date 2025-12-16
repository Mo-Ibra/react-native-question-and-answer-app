import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/authServices";
import {
  deleteQuestion,
  getAllQuestions,
  Question,
} from "@/services/questionServices";
import { Redirect } from "expo-router";
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

  // حذف سؤال
  const handleDelete = async (questionId: string) => {
    if (!user) return;

    Alert.alert("Delete Question", "Are you sure you want to delete this question?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteQuestion(questionId, user.uid);
            Alert.alert("Success", "Question deleted successfully");
            fetchQuestions();
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
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
        <Text style={styles.title}>All Questions</Text>

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
              <View style={styles.questionCard}>
                <Text style={styles.questionTitle}>{item.title}</Text>
                <Text style={styles.questionContent} numberOfLines={2}>
                  {item.content}
                </Text>
                <View style={styles.questionFooter}>
                  <Text style={styles.votes}>Votes: {item.votes}</Text>
                  {item.authorId === user.uid && (
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
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
  deleteButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    fontSize: 16,
  },
});

// @ts-ignore: getReactNativePersistence exists in the RN bundle 