# 📱 Q&A App – React Native + Firebase

A modern **Questions & Answers mobile application** built with **React Native (Expo)** and **Firebase**, inspired by platforms like Stack Overflow.

This project focuses on **clean architecture**, **real-time updates**, and a **coin-based reward system**, making it a scalable and production-ready mobile app.

---

## 🚀 Features

- 🔐 User authentication using Firebase Auth  
- ❓ Create, edit, and delete questions  
- 💬 Post answers with coin validation  
- 👍👎 Vote on questions and answers (real-time)  
- 💰 Coins & rewards system  
- ⚡ Real-time updates using Firestore listeners  
- 🧠 Optimized data fetching with caching  
- 🧩 Clean and reusable UI components  
- 📱 Responsive and mobile-friendly design  

---

## 🛠 Tech Stack

- **React Native (Expo)**
- **TypeScript**
- **Firebase**
  - Authentication
  - Firestore (real-time database)
- **Expo Router**
- **Custom React Hooks**
- **Modular Service Layer**

---

## 🧠 Architecture Overview

```
src/
├── app/                # Pages (Expo Router)
├── components/         # Reusable UI components
├── hooks/              # Custom hooks (data, cache, real-time)
├── services/           # Firebase logic & business rules
├── context/            # Global app contexts (Auth)
├── lib/                # Firebase config & helpers
└── types/              # Shared TypeScript types
```

### Key Architectural Decisions
- Pages handle routing and high-level logic
- Components are UI-only (no business logic)
- Hooks manage data fetching, caching, and subscriptions
- Services isolate Firebase operations
- Real-time listeners are used without unnecessary re-fetching

---

## 💰 Coins System

- Users earn coins by receiving upvotes
- Posting an answer costs coins
- Voting affects the author's coin balance
- All validations are enforced at the service level

---

## ⚡ Real-Time Data

- Question votes update instantly
- Answer votes update instantly
- Coin balance syncs automatically
- Firestore onSnapshot listeners are optimized to avoid over-fetching

---

## 🧩 Custom Hooks

- useAuth – Authentication & user state  
- useQuestions – Questions list with caching & refresh  
- useQuestion – Single question with real-time votes  
- useAnswers – Answers, voting, and coin validation  
- useQuestionVotes – User voting state  

---

## 📦 Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Mo-Ibra/react-native-question-and-answer-app.git
cd react-native-question-and-answer-app
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Configure Firebase
Add your Firebase config in:

```ts
src/lib/firebase.ts
```

### 4️⃣ Run the app
```bash
npx expo start
```

---

## 🧪 Future Improvements

- Search & filtering
- Pagination / infinite scrolling
- Accepted answers
- Notifications
- Offline-first caching
- Unit & integration tests

---

## 👨‍💻 Author

**Mo Ibra**

Full Stack Web/Mobile Developer

---

## 📄 License

MIT License

⭐ If you like this project, give it a star!
