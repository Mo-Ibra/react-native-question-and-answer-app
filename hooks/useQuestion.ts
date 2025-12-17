import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getQuestionById, Question } from "@/services/questionServices";

export function useQuestion(id?: string) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let unsubscribe = () => {};

    (async () => {
      try {
        const q = await getQuestionById(id);
        if (q) setQuestion(q);

        const ref = doc(db, "questions", id);
        unsubscribe = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            setQuestion((prev) =>
              prev ? { ...prev, votes: snap.data().votes } : prev
            );
          }
        });
      } catch {
        Alert.alert("Error", "Failed to load question");
      } finally {
        setLoading(false);
      }
    })();

    return () => unsubscribe();
  }, [id]);

  return { question, loading };
}
