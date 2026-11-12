firebase.initializeApp({
  apiKey: "AIzaSyDvRr7kcDG4Ip6Sa6G3mI7pWy58zRctHtE",
  authDomain: "cute-s-ai.firebaseapp.com",
  projectId: "cute-s-ai",
  storageBucket: "cute-s-ai.firebasestorage.app",
  messagingSenderId: "359897423825",
  appId: "1:359897423825:web:b1e75f2f4895802e524af0"
});
const auth = firebase.auth();
const db = firebase.firestore();
let store = null;
try { store = firebase.storage(); } catch (e) { console.warn('Storage off'); }
