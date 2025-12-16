import { db } from "@/lib/firebase";
import { doc, increment, runTransaction } from "firebase/firestore";

const UPVOTE_REWARD = 5;

export async function voteQuestion(
  questionId: string,
  voterId: string,
  questionAuthorId: string,
  value: 1 | -1
) {
  // /questions/htvZAR9MjMbR54pOLxVM
  const questionRef = doc(db, "questions", questionId);

  // /questions/htvZAR9MjMbR54pOLxVM/votes/8XDInHnDMEj3bd9kkOkW
  const voteRef = doc(db, "questions", questionId, "votes", voterId);

  // /users/8XDInHnDMEj3bd9kkOkW
  const authorRef = doc(db, "users", questionAuthorId);

  await runTransaction(db, async (tx) => {
    const voteSnap = await tx.get(voteRef);

    // check if user not voted yet
    if (!voteSnap.exists()) {
      // First time voting
      tx.set(voteRef, { value });
      tx.update(questionRef, {
        votes: increment(value),
      });

      // If upvote => reward author
      if (value === 1) {
        tx.update(authorRef, {
          coins: increment(UPVOTE_REWARD),
        });
      }
    } else {
      const prev = voteSnap.data().value;
      // If user try to vote again
      if (prev === value) return;

      // If user change vote
      tx.update(voteRef, { value });
      tx.update(questionRef, {
        votes: increment(value - prev),
      });

      if (prev === -1 && value === 1) {
        tx.update(authorRef, {
          coins: increment(UPVOTE_REWARD),
        });
      }

      if (prev === 1 && value === -1) {
        tx.update(authorRef, {
          coins: increment(-UPVOTE_REWARD),
        });
      }
    }
  });
}
