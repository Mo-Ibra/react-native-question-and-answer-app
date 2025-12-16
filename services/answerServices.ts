import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const ANSWER_COST = 10;

export async function createAnswer(
  questionId: string,
  uid: string,
  content: string
) {
  const userRef = doc(db, "users", uid);
  const answersRef = collection(db, "questions", questionId, "answers");

  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    if (userSnap.data().coins < ANSWER_COST) {
      throw new Error("NOT_ENOUGH_COINS");
    }

    tx.update(userRef, {
      coins: userSnap.data().coins - ANSWER_COST,
    });

    tx.set(doc(answersRef), {
      content,
      authorId: uid,
      votes: 0,
      createdAt: serverTimestamp(),
    });
  });
}
