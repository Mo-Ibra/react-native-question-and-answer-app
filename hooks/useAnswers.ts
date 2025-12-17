import { db } from "@/lib/firebase";
import {
  Answer,
  canUserAnswer,
  createAnswer,
  getQuestionAnswers,
} from "@/services/answerServices";
import { voteAnswer } from "@/services/answerVoteServices";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useAnswers(questionId?: string, uid?: string) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerVotes, setAnswerVotes] = useState<Record<string, 1 | -1 | null>>(
    {}
  );
  const [canAfford, setCanAfford] = useState(true);
  const [loadingAnswers, setLoadingAnswers] = useState(true);

  // Get question answers
  useEffect(() => {
    if (!questionId) return;
    const ref = collection(db, "questions", questionId, "answers");
    return onSnapshot(ref, async () => {
      const data = await getQuestionAnswers(questionId);
      setAnswers(data);
      setLoadingAnswers(false);
    });
  }, [questionId]);

  // Get answer votes
  useEffect(() => {
    if (!questionId || !uid) return;

    answers.forEach((a) => {
      const ref = doc(
        db,
        "questions",
        questionId,
        "answers",
        a.id,
        "votes",
        uid
      );
      onSnapshot(ref, (snap) => {
        setAnswerVotes((prev) => ({
          ...prev,
          [a.id]: snap.exists() ? snap.data().value : null,
        }));
      });
    });
  }, [answers.length, questionId, uid]);

  const submitAnswer = async (content: string) => {
    if (!questionId || !uid) return;
    await createAnswer(questionId, uid, content);
    setCanAfford(await canUserAnswer(uid));
  };

  const vote = async (
    answer: Answer,
    value: 1 | -1,
    questionAuthorId: string
  ) => {
    if (!questionId || !uid) return;

    await voteAnswer(questionId, answer.id, uid, questionAuthorId, value);
  };

  return { answers, answerVotes, submitAnswer, vote, canAfford, loadingAnswers };
}
