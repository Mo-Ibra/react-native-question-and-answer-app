import { useAuth } from "@/context/AuthContext";
import {
  getQuestionById,
  Question,
  updateQuestion,
} from "@/services/questionServices";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

export default function EditQuestion() {
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const { id } = useLocalSearchParams();

  const [question, setQuestion] = useState<Question | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        setLoading(true);

        const q = await getQuestionById(id as string);

        if (!q) {
          Alert.alert("Error", "Question not found");
          router.back();
          return;
        }

        if (q.authorId !== user?.uid) {
          Alert.alert("Error", "You are not authorized to edit this question");
          router.back();
          return;
        }

        setQuestion(q);
        setTitle(q.title);
        setContent(q.content);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [id]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Error", "Please enter question content");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    setUpdating(true);

    try {
      await updateQuestion(
        id as string,
        user.uid,
        title.trim(),
        content.trim()
      );

      Alert.alert("Success", "Question updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading question...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Question</Text>
        </View>

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter question title"
            value={title}
            onChangeText={setTitle}
            maxLength={200}
            editable={!updating}
          />
          <Text style={styles.charCount}>{title.length}/200</Text>
        </View>

        {/* Content Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Question Content *</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Describe your question in detail..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={1000}
            editable={!updating}
          />
          <Text style={styles.charCount}>{content.length}/1000</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={updating}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              updating && styles.disabledButton,
            ]}
            onPress={handleUpdate}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Update Question</Text>
            )}
          </TouchableOpacity>
        </View>
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
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  titleInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  contentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    backgroundColor: "#f9f9f9",
  },
  charCount: {
    textAlign: "right",
    color: "#999",
    fontSize: 12,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});
