import { Question } from "@/services/questionServices";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function VotingSection({
  question,
  userVote,
  voting,
  isAuthor,
  handleVote,
}: { question: Question; userVote: 1 | -1 | null; voting: boolean; isAuthor: boolean; handleVote: (value: 1 | -1) => void }) {
  return (
    <View style={styles.votingContainer}>
      <TouchableOpacity
        style={[
          styles.voteButton,
          userVote === 1 && styles.voteButtonActive,
          voting && styles.voteButtonDisabled,
        ]}
        onPress={() => handleVote(1)}
        disabled={voting || isAuthor}
      >
        <Text
          style={[
            styles.voteButtonText,
            userVote === 1 && styles.voteButtonTextActive,
          ]}
        >
          ▲
        </Text>
      </TouchableOpacity>

      <View style={styles.votesDisplayContainer}>
        <Text style={styles.votesDisplay}>{question.votes}</Text>
        <Text style={styles.votesLabel}>votes</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.voteButton,
          userVote === -1 && styles.voteButtonActiveDown,
          voting && styles.voteButtonDisabled,
        ]}
        onPress={() => handleVote(-1)}
        disabled={voting || isAuthor}
      >
        <Text
          style={[
            styles.voteButtonText,
            userVote === -1 && styles.voteButtonTextActiveDown,
          ]}
        >
          ▼
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  votingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  voteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voteButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  voteButtonActiveDown: {
    backgroundColor: "#ff4444",
    borderColor: "#ff4444",
  },
  voteButtonDisabled: {
    opacity: 0.5,
  },
  voteButtonText: {
    fontSize: 24,
    color: "#666",
    fontWeight: "bold",
  },
  voteButtonTextActive: {
    color: "#fff",
  },
  voteButtonTextActiveDown: {
    color: "#fff",
  },
  votesDisplayContainer: {
    marginHorizontal: 25,
    alignItems: "center",
  },
  votesDisplay: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  votesLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
