import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const QUESTION_COST = 20;

export interface Question {
  id: string;
  title: string;
  content: string;
  authorId: string;
  votes: number;
  createdAt: Date;
}

export async function createQuestion(
  uid: string,
  title: string,
  content: string
) {
  const userRef = doc(db, "users", uid);
  const questionRef = collection(db, "questions");

  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);

    if (!userSnap.exists()) {
      throw new Error("User does not exist");
    }

    const coins = userSnap.data().coins;

    if (coins < QUESTION_COST) {
      throw new Error("Not enough coins");
    }

    tx.update(userRef, {
      coins: coins - QUESTION_COST,
    });

    tx.set(doc(questionRef), {
      title,
      content,
      authorId: uid,
      votes: 0,
      createdAt: serverTimestamp(),
    });
  });
}

export async function getAllQuestions(): Promise<Question[]> {
  try {
    const questionRef = collection(db, "questions");
    const q = query(questionRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Question[];
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
}

export async function getQuestionById(
  questionId: string
): Promise<Question | null> {
  try {
    const questionRef = doc(db, "questions", questionId);
    const snapshot = await getDoc(questionRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Question;
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
}

export async function updateQuestion(
  questionId: string,
  uid: string,
  title: string,
  content: string
) {
  try {
    const questionRef = doc(db, "questions", questionId);
    const snapshot = await getDoc(questionRef);

    if (!snapshot.exists()) {
      throw new Error("Question not found");
    }

    if (snapshot.data().authorId !== uid) {
      throw new Error("You are not authorized to update this question");
    }

    await updateDoc(questionRef, {
      title,
      content,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
}

export async function deleteQuestion(questionId: string, uid: string) {
  try {
    const questionRef = doc(db, "questions", questionId);
    const snapshot = await getDoc(questionRef);

    if (!snapshot.exists()) {
      throw new Error("Question not found");
    }

    if (snapshot.data().authorId !== uid) {
      throw new Error("You are not authorized to delete this question");
    }

    await deleteDoc(questionRef);
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
}
