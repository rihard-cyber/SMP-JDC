import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import firebaseConfig, { isFirebaseConfigured } from './firebaseConfig';

let db = null;
let initialized = false;

export const initFirebase = () => {
  if (initialized) return db;
  initialized = true;

  if (!isFirebaseConfigured()) {
    console.log('[Firebase] Tidak dikonfigurasi — fallback ke localStorage');
    return null;
  }

  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('[Firebase] Terhubung:', firebaseConfig.projectId);
  } catch (e) {
    console.warn('[Firebase] Gagal init:', e);
    db = null;
  }
  return db;
};

// Subscribe real-time ke koleksi complaints
export const subscribeComplaints = (callback) => {
  const database = initFirebase();
  if (!database) {
    callback(null); // Firebase tidak aktif
    return () => {};
  }

  const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ firebaseId: doc.id, ...doc.data() });
    });
    callback(list);
  }, (error) => {
    console.warn('[Firebase] Gagal baca complaints:', error);
    callback(null);
  });
};

// Tambah komplain ke Firestore
export const addComplaintToFirestore = async (complaint) => {
  const database = initFirebase();
  if (!database) return null;

  try {
    const docRef = await addDoc(collection(db, 'complaints'), {
      ...complaint,
      firebaseSavedAt: serverTimestamp()
    });
    console.log('[Firebase] Komplain tersimpan:', docRef.id);
    return docRef.id;
  } catch (e) {
    console.warn('[Firebase] Gagal simpan:', e);
    return null;
  }
};

// Update komplain di Firestore
export const updateComplaintInFirestore = async (firebaseId, updates) => {
  const database = initFirebase();
  if (!database) return;

  try {
    await updateDoc(doc(db, 'complaints', firebaseId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('[Firebase] Gagal update:', e);
  }
};

// Load semua komplain dari Firestore (one-time, fallback)
export const loadAllComplaintsFromFirestore = async () => {
  const database = initFirebase();
  if (!database) return null;

  try {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ firebaseId: doc.id, ...doc.data() });
    });
    return list;
  } catch (e) {
    console.warn('[Firebase] Gagal load all:', e);
    return null;
  }
};
