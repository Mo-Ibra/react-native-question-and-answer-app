import { useAuth } from "@/context/AuthContext";
import { createQuestion } from "@/services/questionServices";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";

const QUESTION_COST = 20;

export default function CreateQuestion() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateQuestion = async () => {
    // التحقق من البيانات
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

    // التحقق من الرصيد
    if (!profile || profile.coins < QUESTION_COST) {
      Alert.alert(
        "Insufficient Coins",
        `You need ${QUESTION_COST} coins to create a question. Your balance: ${profile?.coins || 0}`
      );
      return;
    }

    setLoading(true);

    try {
      await createQuestion(user.uid, title.trim(), content.trim());
      
      Alert.alert("Success", "Question created successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
      
      // تنظيف الحقول
      setTitle("");
      setContent("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create question");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create New Question</Text>
          <Text style={styles.coinsInfo}>
            Your Balance: {profile?.coins || 0} coins
          </Text>
          <Text style={styles.costInfo}>Cost: {QUESTION_COST} coins</Text>
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
            editable={!loading}
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
            editable={!loading}
          />
          <Text style={styles.charCount}>{content.length}/1000</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleCreateQuestion}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Question</Text>
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
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  coinsInfo: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  costInfo: {
    fontSize: 14,
    color: "#ff6b6b",
    fontWeight: "600",
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