import { Question } from "@/services/questionServices";
import { StyleSheet, Text, View } from "react-native";

export default function QuestionTitle({ question }: { question: Question }) {
  return (
    <View style={styles.titleContainer}>
      <Text style={styles.title}>{question.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginTop: 0,
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
});