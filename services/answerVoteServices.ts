import { doc, runTransaction, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

const UPVOTE_REWARD = 3;
const DOWNVOTE_PENALTY = 3;

export async function voteAnswer(
  questionId: string,
  answerId: string,
  voterId: string,
  answerAuthorId: string,
  value: 1 | -1
) {
  const answerRef = doc(db, "questions", questionId, "answers", answerId);

  const voteRef = doc(
    db,
    "questions",
    questionId,
    "answers",
    answerId,
    "votes",
    voterId
  );

  const authorRef = doc(db, "users", answerAuthorId);

  await runTransaction(db, async (tx) => {
    const voteSnap = await tx.get(voteRef);

    if (!voteSnap.exists()) {
      tx.set(voteRef, { value });
      tx.update(answerRef, {
        votes: increment(value),
      });

      tx.update(authorRef, {
        coins: increment(value === 1 ? UPVOTE_REWARD : -DOWNVOTE_PENALTY),
      });
    } else {
      const prev = voteSnap.data().value;

      if (prev === value) return;

      tx.update(voteRef, { value });
      tx.update(answerRef, {
        votes: increment(value - prev),
      });

      if (prev === -1 && value === 1) {
        tx.update(authorRef, {
          coins: increment(UPVOTE_REWARD + DOWNVOTE_PENALTY),
        });
      }

      if (prev === 1 && value === -1) {
        tx.update(authorRef, {
          coins: increment(-(UPVOTE_REWARD + DOWNVOTE_PENALTY)),
        });
      }
    }
  });
}
