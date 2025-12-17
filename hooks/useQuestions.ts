import { getAllQuestions, Question } from "@/services/questionServices";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export function useQuestions(enabled: boolean) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuestions = async () => {
    try {
      const allQuestions = await getAllQuestions();
      setQuestions(allQuestions);
    } catch (error) {
      Alert.alert("Error", "Failed to load questions");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchQuestions();
    }
  }, [enabled, fetchQuestions]);

  const refresh = () => { 
    setRefreshing(true);
    fetchQuestions();
  };

  return {
    questions,
    loading,
    refreshing,
    refresh
  }
}
