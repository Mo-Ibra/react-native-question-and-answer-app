import { formatDate } from "@/lib/helper";
import { Answer } from "@/services/answerServices";
import { User } from "firebase/auth";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AnswerSection({
  user,
  answers,
  canAffordAnswer,
  answerContent,
  setAnswerContent,
  submittingAnswer,
  handleSubmitAnswer,
  handleAnswerVote,
  handleDeleteAnswer,
  loadingAnswers,
  answerVotes,
  votingAnswers,
}: {
  user: User | null;
  answers: Answer[];
  canAffordAnswer: boolean;
  answerContent: string;
  setAnswerContent: React.Dispatch<React.SetStateAction<string>>;
  submittingAnswer: boolean;
  handleSubmitAnswer: () => void;
  handleAnswerVote: (answer: Answer, value: 1 | -1) => void;
  handleDeleteAnswer: (answerId: string) => void;
  loadingAnswers: boolean;
  answerVotes: Record<string, 1 | -1 | null>;
  votingAnswers: Record<string, boolean>;
}) {
  return (
    <View style={styles.answersSection}>
      <View style={styles.answersSectionHeader}>
        <Text style={styles.answersSectionTitle}>
          Answers ({answers.length})
        </Text>
      </View>

      {/* Answer Input */}
      {user && (
        <View style={styles.answerInputContainer}>
          <Text style={styles.answerInputLabel}>
            Your Answer (Costs 10 coins)
          </Text>
          {!canAffordAnswer && (
            <Text style={styles.notEnoughCoinsText}>
              ⚠️ You don't have enough coins. Earn coins by getting upvotes!
            </Text>
          )}
          <TextInput
            style={styles.answerInput}
            placeholder="Write your answer here..."
            multiline
            numberOfLines={4}
            value={answerContent}
            onChangeText={setAnswerContent}
            editable={!submittingAnswer}
          />
          <TouchableOpacity
            style={[
              styles.submitAnswerButton,
              (!canAffordAnswer || submittingAnswer) &&
                styles.submitAnswerButtonDisabled,
            ]}
            onPress={handleSubmitAnswer}
            disabled={!canAffordAnswer || submittingAnswer}
          >
            {submittingAnswer ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitAnswerButtonText}>Post Answer</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Answers List */}
      {loadingAnswers ? (
        <View style={styles.loadingAnswersContainer}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.loadingAnswersText}>Loading answers...</Text>
        </View>
      ) : answers.length === 0 ? (
        <View style={styles.noAnswersContainer}>
          <Text style={styles.noAnswersText}>
            No answers yet. Be the first to answer!
          </Text>
        </View>
      ) : (
        answers.map((answer) => {
          const isAnswerAuthor = answer.authorId === user?.uid;
          const userAnswerVote = answerVotes?.[answer.id] || null;
          const isVotingThisAnswer = votingAnswers[answer.id] || false;

          return (
            <View key={answer.id} style={styles.answerCard}>
              {/* Answer Voting Section */}
              <View style={styles.answerVotingSection}>
                <TouchableOpacity
                  style={[
                    styles.answerVoteButton,
                    userAnswerVote === 1 && styles.answerVoteButtonActive,
                    isVotingThisAnswer && styles.voteButtonDisabled,
                  ]}
                  onPress={() => handleAnswerVote(answer, 1)}
                  disabled={isVotingThisAnswer || isAnswerAuthor}
                >
                  <Text
                    style={[
                      styles.answerVoteButtonText,
                      userAnswerVote === 1 && styles.answerVoteButtonTextActive,
                    ]}
                  >
                    ▲
                  </Text>
                </TouchableOpacity>

                <Text style={styles.answerVotesCount}>{answer.votes}</Text>

                <TouchableOpacity
                  style={[
                    styles.answerVoteButton,
                    userAnswerVote === -1 && styles.answerVoteButtonActiveDown,
                    isVotingThisAnswer && styles.voteButtonDisabled,
                  ]}
                  onPress={() => handleAnswerVote(answer, -1)}
                  disabled={isVotingThisAnswer || isAnswerAuthor}
                >
                  <Text
                    style={[
                      styles.answerVoteButtonText,
                      userAnswerVote === -1 &&
                        styles.answerVoteButtonTextActiveDown,
                    ]}
                  >
                    ▼
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Answer Content */}
              <View style={styles.answerMainContent}>
                <View style={styles.answerHeader}>
                  {isAnswerAuthor && (
                    <>
                      <View style={styles.answerAuthorBadge}>
                        <Text style={styles.answerAuthorBadgeText}>
                          Your Answer
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteAnswer(answer.id)}
                      >
                        <Text style={styles.deleteAnswerText}>Delete</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
                <Text style={styles.answerContent}>{answer.content}</Text>
                <View style={styles.answerFooter}>
                  <Text style={styles.answerDate}>
                    {formatDate(answer.createdAt)}
                  </Text>
                </View>
                {isAnswerAuthor && (
                  <Text style={styles.cannotVoteAnswerText}>
                    You cannot vote on your own answer
                  </Text>
                )}
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  answersSection: {
    marginTop: 30,
    paddingTop: 30,
    borderTopWidth: 2,
    borderTopColor: "#e0e0e0",
  },
  answersSectionHeader: {
    marginBottom: 20,
  },
  answersSectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  answerInputContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  answerInputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  notEnoughCoinsText: {
    fontSize: 13,
    color: "#ff9800",
    marginBottom: 10,
    fontWeight: "500",
  },
  answerInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  submitAnswerButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitAnswerButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitAnswerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingAnswersContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingAnswersText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  noAnswersContainer: {
    padding: 30,
    alignItems: "center",
  },
  noAnswersText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  answerCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  answerVotingSection: {
    alignItems: "center",
    marginRight: 15,
    paddingRight: 15,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  answerVoteButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    marginVertical: 4,
  },
  answerVoteButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  answerVoteButtonActiveDown: {
    backgroundColor: "#ff4444",
    borderColor: "#ff4444",
  },
  voteButtonDisabled: {
    opacity: 0.5,
  },
  answerVoteButtonText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "bold",
  },
  answerVoteButtonTextActive: {
    color: "#fff",
  },
  answerVoteButtonTextActiveDown: {
    color: "#fff",
  },
  answerVotesCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 8,
  },
  answerMainContent: {
    flex: 1,
  },
  answerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  deleteAnswerText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "600",
  },
  answerContent: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
    marginBottom: 12,
  },
  answerFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  answerDate: {
    fontSize: 12,
    color: "#999",
  },
  answerAuthorBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  answerAuthorBadgeText: {
    color: "#1976D2",
    fontSize: 11,
    fontWeight: "600",
  },
  cannotVoteAnswerText: {
    fontSize: 11,
    color: "#ff9800",
    marginTop: 8,
    fontStyle: "italic",
  },
});
