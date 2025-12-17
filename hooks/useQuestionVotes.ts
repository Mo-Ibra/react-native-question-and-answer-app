import { db } from "@/lib/firebase";
import { voteQuestion } from "@/services/questionVotesServices";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useQuestionVotes(
  questionId?: string,
  uid?: string,
  authorId?: string
) {
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uid || !questionId) return;

    const ref = doc(db, "questions", questionId, "votes", uid);

    return onSnapshot(ref, (snap) => {
      setUserVote(snap.exists() ? snap.data().value : null);
    });
  }, [questionId, uid]);

  const vote = async (value: 1 | -1) => {
    if (!questionId || !uid || !authorId) return;

    setLoading(true);
    await voteQuestion(questionId, uid, authorId, value);
    setLoading(false);
  };

  return { userVote, vote, loading };
}
