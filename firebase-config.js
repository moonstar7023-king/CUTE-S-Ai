// Firebase Console > Project settings > Your apps > Web app: apni values yahan paste karein
firebase.initializeApp({
  apiKey:"PASTE_API_KEY", authDomain:"PASTE.firebaseapp.com", projectId:"PASTE",
  storageBucket:"PASTE.appspot.com", messagingSenderId:"PASTE", appId:"PASTE"
});
const auth=firebase.auth(), db=firebase.firestore(), store=firebase.storage();
