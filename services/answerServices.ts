import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const ANSWER_COST = 10;

export interface Answer {
  id: string;
  content: string;
  authorId: string;
  votes: number;
  createdAt: Date;
}

export async function createAnswer(
  questionId: string,
  uid: string,
  content: string
): Promise<void> {
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

export async function updateAnswer(
  questionId: string,
  answerId: string,
  content: string,
  uid: string
): Promise<void> {
  const answerRef = doc(db, "questions", questionId, "answers", answerId);

  await runTransaction(db, async (tx) => {
    const answerSnap = await tx.get(answerRef);

    if (!answerSnap.exists()) {
      throw new Error("Answer not found!");
    }

    const answerData = answerSnap.data() as Answer;

    if (answerData.authorId !== uid) {
      throw new Error("You are not authorized to update this answer!");
    }

    tx.update(answerRef, {
      content,
    });
  });
}

export async function deleteAnswer(
  questionId: string,
  answerId: string,
  uid: string
): Promise<void> {
  const answerRef = doc(db, "questions", questionId, "answers", answerId);

  await runTransaction(db, async (tx) => {
    const answerSnap = await tx.get(answerRef);

    if (!answerSnap.exists()) {
      throw new Error("Answer not found!");
    }

    const answerData = answerSnap.data() as Answer;

    if (answerData.authorId !== uid) {
      throw new Error("You are not authorized to delete this answer!");
    }

    // Delete all votes for this answer
    const votesRef = collection(
      db,
      "questions",
      questionId,
      "answers",
      answerId,
      "votes"
    );

    const votesSnap = await getDocs(votesRef);

    votesSnap.forEach((voteDoc) => {
      tx.delete(voteDoc.ref);
    });

    tx.delete(answerRef);
  });
}

export async function getQuestionAnswers(
  questionId: string
): Promise<Answer[]> {
  try {
    const answersRef = collection(db, "questions", questionId, "answers");
    const q = query(answersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const answers: Answer[] = [];
    snapshot.forEach((doc) => {
      answers.push({
        id: doc.id,
        ...doc.data(),
      } as Answer);
    });

    return answers;
  } catch (error) {
    console.error("Error fetching answers:", error);
    throw new Error("Failed to fetch answers");
  }
}

export async function getAnswerById(
  questionId: string,
  answerId: string
): Promise<Answer | null> {
  try {
    const answerRef = doc(db, "questions", questionId, "answers", answerId);

    const answerSnap = await getDoc(answerRef);

    if (!answerSnap.exists()) {
      return null;
    }

    return {
      id: answerSnap.id,
      ...answerSnap.data(),
    } as Answer;
  } catch (error) {
    console.error("Error fetching answer:", error);
    throw new Error("Failed to fetch answer");
  }
}

// Helper function for check if user can answer or not
export async function canUserAnswer(uid: string): Promise<boolean> {
  try {
    const userRef = doc(db, "users", uid);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return false;
    }

    return userSnap.data().coins >= ANSWER_COST;
  } catch (error) {
    console.error("Error checking user coins:", error);
    return false;
  }
}
// Get answer count for a question
export async function getAnswerCount(questionId: string): Promise<number> {
  try {
    const answersRef = collection(db, "questions", questionId, "answers");
    const snapshot = await getDocs(answersRef);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting answer count:", error);
    return 0;
  }
}
