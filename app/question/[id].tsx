import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { formatDate } from "@/lib/helper";
import {
  Answer,
  canUserAnswer,
  createAnswer,
  deleteAnswer,
  getQuestionAnswers,
} from "@/services/answerServices";
import { voteAnswer } from "@/services/answerVoteServices";
import {
  Question,
  deleteQuestion,
  getQuestionById,
} from "@/services/questionServices";
import { voteQuestion } from "@/services/questionVotesServices";
import { router, useLocalSearchParams } from "expo-router";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";

export default function QuestionDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [voting, setVoting] = useState(false);

  // Answers stats
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [answerContent, setAnswerContent] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [canAffordAnswer, setCanAffordAnswer] = useState(true);

  // Answer votes state
  const [answerVotes, setAnswerVotes] = useState<Record<string, 1 | -1 | null>>(
    {}
  );
  const [votingAnswers, setVotingAnswers] = useState<Record<string, boolean>>(
    {}
  );

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

  const fetchAnswers = async () => {
    try {
      setLoadingAnswers(true);
      const fetchedAnswers = await getQuestionAnswers(id as string);
      setAnswers(fetchedAnswers);
    } catch (error) {
    } finally {
      setLoadingAnswers(false);
    }
  };

  const checkUserCoins = async () => {
    if (!user) return;
    const canAfford = await canUserAnswer(user.uid);
    setCanAffordAnswer(canAfford);
  };

  useEffect(() => {
    fetchQuestion();
    fetchAnswers();
    checkUserCoins();
  }, [id]);

  // Listen to user's vote in real-time
  // When a user votes, update the button
  useEffect(() => {
    if (!user || !id) return;

    const voteRef = doc(db, "questions", id as string, "votes", user.uid);

    const unsubscribe = onSnapshot(voteRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserVote(snapshot.data().value);
      } else {
        setUserVote(null);
      }
    });

    return () => unsubscribe();
  }, [id, user]);

  // Listen to question votes in real-time
  // When a user votes, update the question votes count
  useEffect(() => {
    if (!id) return;

    const questionRef = doc(db, "questions", id as string);
    const unsubscribe = onSnapshot(questionRef, (snapshot) => {
      if (snapshot.exists()) {
        setQuestion((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            votes: snapshot.data().votes || 0,
          };
        });
      }
    });

    return () => unsubscribe();
  }, [id]);

  // Listen to answers in real-time
  useEffect(() => {
    if (!id) return;
    const answersRef = collection(db, "questions", id as string, "answers");
    const unsubscribe = onSnapshot(answersRef, () => {
      fetchAnswers();
    });
    return () => unsubscribe();
  }, [id]);

  // Listen to user's votes on answers in real-time
  useEffect(() => {
    if (!user || !id || answers.length === 0) return;

    const unsubscribes = answers.map((answer) => {
      const voteRef = doc(
        db,
        "questions",
        id as string,
        "answers",
        answer.id,
        "votes",
        user.uid
      );

      return onSnapshot(voteRef, (snapshot) => {
        setAnswerVotes((prev) => ({
          ...prev,
          [answer.id]: snapshot.exists() ? snapshot.data().value : null,
        }));
      });
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [id, user, answers.length]);

  const isAuthor = question?.authorId === user?.uid;

  const handleVote = async (value: 1 | -1) => {
    if (!user || !question) {
      Alert.alert("Error", "You must be logged in to vote");
      return;
    }

    if (isAuthor) {
      Alert.alert("Error", "You cannot vote on your own question");
      return;
    }

    try {
      setVoting(true);

      await voteQuestion(question.id, user.uid, question.authorId, value);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to vote");
      console.log(error);
    } finally {
      setVoting(false);
    }
  };

  const handleAnswerVote = async (answer: Answer, value: 1 | -1) => {
    if (!user || !question) {
      Alert.alert("Error", "You must be logged in to vote");
      return;
    }

    if (answer.authorId === user.uid) {
      Alert.alert("Error", "You cannot vote on your own answer");
      return;
    }

    try {
      setVotingAnswers((prev) => ({ ...prev, [answer.id]: true }));
      await voteAnswer(
        question.id,
        answer.id,
        user.uid,
        answer.authorId,
        value
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to vote");
    } finally {
      setVotingAnswers((prev) => ({ ...prev, [answer.id]: false }));
    }
  };

  const handleSubmitAnswer = async () => {
    if (!user || !question) {
      Alert.alert("Error", "You must be logged in to answer");
      return;
    }

    if (!answerContent.trim()) {
      Alert.alert("Error", "Please write your answer");
      return;
    }

    if (!canAffordAnswer) {
      Alert.alert(
        "Not Enough Coins",
        "You need 10 coins to post an answer. Earn more coins by getting upvotes on your questions!"
      );
      return;
    }

    try {
      setSubmittingAnswer(true);
      await createAnswer(question.id, user.uid, answerContent);
      setAnswerContent("");
      Alert.alert("Success", "Your answer has been posted!");
      checkUserCoins();
    } catch (error: any) {
      if (error.message === "NOT_ENOUGH_COINS") {
        Alert.alert(
          "Not Enough Coins",
          "You need 10 coins to post an answer. Earn more coins by getting upvotes on your questions!"
        );
      } else {
        Alert.alert("Error", error.message || "Failed to post answer");
      }
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!user || !question) return;

    Alert.alert(
      "Delete Answer",
      "Are you sure you want to delete this answer?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAnswer(question.id, answerId, user.uid);
              Alert.alert("Success", "Answer deleted successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
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

          {/* Voting Section */}
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

          {isAuthor && (
            <Text style={styles.cannotVoteText}>
              You cannot vote on your own question
            </Text>
          )}

          {/* Metadata */}
          <View style={styles.metadataContainer}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Posted:</Text>
              <Text style={styles.metadataValue}>
                {formatDate(question.createdAt)}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Answers:</Text>
              <Text style={styles.metadataValue}>{answers.length}</Text>
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

          {/* Answers Section */}
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
                    ⚠️ You don't have enough coins. Earn coins by getting
                    upvotes!
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
                    <Text style={styles.submitAnswerButtonText}>
                      Post Answer
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Answers List */}
            {loadingAnswers ? (
              <View style={styles.loadingAnswersContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingAnswersText}>
                  Loading answers...
                </Text>
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
                const userAnswerVote = answerVotes[answer.id] || null;
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
                            userAnswerVote === 1 &&
                              styles.answerVoteButtonTextActive,
                          ]}
                        >
                          ▲
                        </Text>
                      </TouchableOpacity>

                      <Text style={styles.answerVotesCount}>
                        {answer.votes}
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.answerVoteButton,
                          userAnswerVote === -1 &&
                            styles.answerVoteButtonActiveDown,
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
                              <Text style={styles.deleteAnswerText}>
                                Delete
                              </Text>
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  cannotVoteText: {
    textAlign: "center",
    color: "#ff9800",
    fontSize: 12,
    marginBottom: 15,
    fontStyle: "italic",
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
