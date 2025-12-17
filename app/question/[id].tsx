import AnswerSection from "@/components/AnswerSection";
import QuestionContent from "@/components/QuestionContent";
import QuestionHeaderWithActions from "@/components/QuestionHeaderWithActions";
import QuestionMetaData from "@/components/QuestionMetadata";
import QuestionTitle from "@/components/QuestionTitle";
import VotingSection from "@/components/VotingSection";
import { useAuth } from "@/context/AuthContext";
import { useAnswers } from "@/hooks/useAnswers";
import { useQuestion } from "@/hooks/useQuestion";
import { useQuestionVotes } from "@/hooks/useQuestionVotes";
import { db } from "@/lib/firebase";
import {
  Answer,
  canUserAnswer,
  createAnswer,
  deleteAnswer,
  getQuestionAnswers,
} from "@/services/answerServices";
// import { voteAnswer } from "@/services/answerVoteServices";
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

  const { question, loading } = useQuestion(id as string);

  const {
    userVote,
    loadingVotes,
    vote,
  } = useQuestionVotes(question?.id, user?.uid, question?.authorId);

  // Answers stats
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const [answerContent, setAnswerContent] = useState("");

  const {
    answers,
    answerVotes,
    submitAnswer,
    vote: voteAnswer,
    canAfford,
  } = useAnswers(question?.id, user?.uid);

  const [votingAnswers, setVotingAnswers] = useState<Record<string, boolean>>(
    {}
  );

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
      await vote(value);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to vote");
      console.log(error);
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
      await voteAnswer(answer, value, question.authorId);
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

    if (!canAfford) {
      Alert.alert(
        "Not Enough Coins",
        "You need 10 coins to post an answer. Earn more coins by getting upvotes on your questions!"
      );
      return;
    }

    try {
      await submitAnswer(answerContent);
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
            voting={loadingVotes}
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
            canAffordAnswer={canAfford}
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
