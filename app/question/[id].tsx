import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/helper";
import {
  Question,
  deleteQuestion,
  getQuestionById,
} from "@/services/questionServices";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet
} from "react-native";

export default function QuestionDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const q = await getQuestionById(id as string);
      if (q) {
        setQuestion(q);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load question");
      router.back();
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const isAuthor = question?.authorId === user?.uid;

  const handleEdit = () => {
    router.push(`/edit-question/${id}`);
  };

  const handleDelete = async () => {
    if (!user || !question) return;

    Alert.alert(
      "Delete Question",
      "Are you sure you want to delete this question?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteQuestion(question.id, user.uid);
              Alert.alert("Success", "Question deleted successfully", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading question...</Text>
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Question not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header with actions */}
        {isAuthor && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Question Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{question.title}</Text>
        </View>

        {/* Metadata */}
        <View style={styles.metadataContainer}>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Posted:</Text>
            <Text style={styles.metadataValue}>
              {formatDate(question.createdAt)}
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Votes:</Text>
            <Text style={styles.votesValue}>{question.votes}</Text>
          </View>
        </View>

        {/* Question Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.contentLabel}>Question Details:</Text>
          <Text style={styles.contentText}>{question.content}</Text>
        </View>

        {/* Author Badge */}
        {isAuthor && (
          <View style={styles.authorBadge}>
            <Text style={styles.authorBadgeText}>You are the author</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#ff4444",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  titleContainer: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#4CAF50",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    lineHeight: 36,
  },
  metadataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  metadataItem: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metadataValue: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  votesValue: {
    fontSize: 20,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  contentContainer: {
    marginBottom: 20,
  },
  contentLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 26,
    textAlign: "justify",
  },
  authorBadge: {
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    marginTop: 20,
  },
  authorBadgeText: {
    color: "#1976D2",
    fontWeight: "600",
    fontSize: 14,
  },
});
