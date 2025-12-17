import AnswerSection from "@/components/AnswerSection";
import QuestionContent from "@/components/QuestionContent";
import QuestionHeaderWithActions from "@/components/QuestionHeaderWithActions";
import QuestionMetaData from "@/components/QuestionMetadata";
import QuestionTitle from "@/components/QuestionTitle";
import VotingSection from "@/components/VotingSection";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
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
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [canAffordAnswer, setCanAffordAnswer] = useState(true);
  const [answerContent, setAnswerContent] = useState("");

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
            <QuestionHeaderWithActions
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          )}

          {/* Question Title */}
          <QuestionTitle question={question} />

          {/* Voting Section */}
          <VotingSection
            question={question}
            userVote={userVote}
            voting={voting}
            isAuthor={isAuthor}
            handleVote={handleVote}
          />

          {isAuthor && (
            <Text style={styles.cannotVoteText}>
              You cannot vote on your own question
            </Text>
          )}

          {/* Metadata */}
          <QuestionMetaData
            question={question}
            answersLength={answers.length}
          />

          <QuestionContent question={question} isAuthor={isAuthor} />

          {/* Answers Section */}
          <AnswerSection
            user={user}
            answers={answers}
            canAffordAnswer={canAffordAnswer}
            answerContent={answerContent}
            setAnswerContent={setAnswerContent}
            submittingAnswer={submittingAnswer}
            handleSubmitAnswer={handleSubmitAnswer}
            handleAnswerVote={handleAnswerVote}
            handleDeleteAnswer={handleDeleteAnswer}
            loadingAnswers={loadingAnswers}
            answerVotes={answerVotes}
            votingAnswers={votingAnswers}
          />
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
  cannotVoteText: {
    textAlign: "center",
    color: "#ff9800",
    fontSize: 12,
    marginBottom: 15,
    fontStyle: "italic",
  },
});
