import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type Profile = {
  email: string;
  coins: number;
  level: number;
  createdAt: Date;
}

export async function createProfile(uid: string, email: string) {
  const userRef = doc(db, "users", uid);

  console.log(userRef);

  await setDoc(userRef, { email, coins: 100, level: 1, createdAt: new Date() });
}

export async function getProfile(uid: string) {
  const userRef = doc(db, "users", uid);

  const snap = await getDoc(userRef);

  if (!snap.exists()) return null;

  return snap.data();
}
