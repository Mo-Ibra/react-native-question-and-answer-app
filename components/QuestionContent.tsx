import { Question } from "@/services/questionServices";
import { StyleSheet, Text, View } from "react-native";

export default function QuestionContent({
  question,
  isAuthor,
}: {
  question: Question;
  isAuthor: boolean;
}) {
  return (
    <>
      <View style={styles.contentContainer}>
        <Text style={styles.contentLabel}>Question Details:</Text>
        <Text style={styles.contentText}>{question.content}</Text>
      </View>

      {isAuthor && (
        <View style={styles.authorBadge}>
          <Text style={styles.authorBadgeText}>You are the author</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
