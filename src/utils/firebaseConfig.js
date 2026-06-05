// Firebase Configuration
// Buat project Firebase di https://console.firebase.google.com/
// 1. Tambah project → Web → Daftarkan app
// 2. Copy konfigurasi di bawah ini
// 3. Enable Firestore Database di Firebase Console
// 4. Atur rules: allow read, write: if true (testing) atau pakai auth

const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
};

// Jika apiKey kosong, Firebase tidak akan diaktifkan
// dan aplikasi tetap pakai localStorage seperti biasa
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && firebaseConfig.projectId;
};

export default firebaseConfig;
