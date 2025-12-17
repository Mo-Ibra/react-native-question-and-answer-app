import { formatDate } from "@/lib/helper";
import { Question } from "@/services/questionServices";
import { StyleSheet, Text, View } from "react-native";

export default function QuestionMetaData({ question, answersLength }: { question: Question, answersLength: number }) {
  return (
    <View style={styles.metadataContainer}>
      <View style={styles.metadataItem}>
        <Text style={styles.metadataLabel}>Posted:</Text>
        <Text style={styles.metadataValue}>
          {formatDate(question.createdAt)}
        </Text>
      </View>
      <View style={styles.metadataItem}>
        <Text style={styles.metadataLabel}>Answers:</Text>
        <Text style={styles.metadataValue}>{answersLength}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
