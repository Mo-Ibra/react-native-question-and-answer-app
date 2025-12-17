import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Question } from "@/services/questionServices";

interface Props {
  question: Question;
  isOwner: boolean;
  onPress: () => void;
}

export default function QuestionCard({ question, isOwner, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.title}>{question.title}</Text>

      <Text style={styles.content} numberOfLines={2}>
        {question.content}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.votes}>Votes: {question.votes}</Text>

        {isOwner && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Your Question</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  votes: {
    fontSize: 14,
    color: "#888",
  },
  badge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: "#2196F3",
    fontSize: 12,
    fontWeight: "600",
  },
});
