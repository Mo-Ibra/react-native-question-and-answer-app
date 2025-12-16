// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";

import { initializeAuth } from 'firebase/auth';

import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';

import { getFirestore } from "firebase/firestore";

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD30eE1VPaD1teGJxH8SifjvJ5q0NARGzQ",
  authDomain: "auth-project-dcf84.firebaseapp.com",
  projectId: "auth-project-dcf84",
  storageBucket: "auth-project-dcf84.firebasestorage.app",
  messagingSenderId: "844941441078",
  appId: "1:844941441078:web:35f1c8c62e6049d4718097",
  measurementId: "G-QK2220NRRY",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);