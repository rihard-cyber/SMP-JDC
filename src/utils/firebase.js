import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import firebaseConfig, { isFirebaseConfigured } from './firebaseConfig';

let db = null;
let analytics = null;
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
    analytics = getAnalytics(app);
    console.log('[Firebase] Terhubung:', firebaseConfig.projectId);
  } catch (e) {
    console.warn('[Firebase] Gagal init:', e);
    db = null;
  }
  return db;
};

export const getAnalyticsInstance = () => analytics;

// ─── Helper: buat subscription real-time ───
const createSubscriber = (collectionName, callback, orderField = 'createdAt') => {
  const database = initFirebase();
  if (!database) {
    callback(null);
    return () => {};
  }
  const q = query(collection(database, collectionName), orderBy(orderField, 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ firebaseId: doc.id, ...doc.data() });
    });
    callback(list);
  }, (error) => {
    console.warn(`[Firebase] Gagal baca ${collectionName}:`, error);
    callback(null);
  });
};

const createAdder = (collectionName) => async (data) => {
  const database = initFirebase();
  if (!database) return null;
  try {
    const docRef = await addDoc(collection(database, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      firebaseSavedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (e) {
    console.warn(`[Firebase] Gagal simpan ${collectionName}:`, e);
    return null;
  }
};

const createUpdater = (collectionName) => async (firebaseId, updates) => {
  const database = initFirebase();
  if (!database) return;
  try {
    await updateDoc(doc(database, collectionName, firebaseId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn(`[Firebase] Gagal update ${collectionName}:`, e);
  }
};

const createDeleter = (collectionName) => async (firebaseId) => {
  const database = initFirebase();
  if (!database) return;
  try {
    await deleteDoc(doc(database, collectionName, firebaseId));
  } catch (e) {
    console.warn(`[Firebase] Gagal hapus ${collectionName}:`, e);
  }
};

const createLoader = (collectionName, orderField = 'createdAt') => async () => {
  const database = initFirebase();
  if (!database) return null;
  try {
    const q = query(collection(database, collectionName), orderBy(orderField, 'desc'));
    const snapshot = await getDocs(q);
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ firebaseId: doc.id, ...doc.data() });
    });
    return list;
  } catch (e) {
    console.warn(`[Firebase] Gagal load ${collectionName}:`, e);
    return null;
  }
};

// ─── Complaints ───
export const subscribeComplaints = (callback) =>
  createSubscriber('complaints', callback);

export const addComplaintToFirestore = createAdder('complaints');

export const updateComplaintInFirestore = createUpdater('complaints');

export const loadAllComplaintsFromFirestore = createLoader('complaints');

// ─── Patrol Reports ───
export const subscribeReports = (callback) =>
  createSubscriber('patrol_reports', callback, 'timestamp');

export const addReportToFirestore = createAdder('patrol_reports');

export const updateReportInFirestore = createUpdater('patrol_reports');

export const deleteReportFromFirestore = createDeleter('patrol_reports');

// ─── Findings ───
export const subscribeFindings = (callback) =>
  createSubscriber('findings', callback);

export const addFindingToFirestore = createAdder('findings');

export const updateFindingInFirestore = createUpdater('findings');

// ─── Attendance Logs ───
export const subscribeAttendanceLogs = (callback) =>
  createSubscriber('attendance_logs', callback, 'tanggal');

export const addAttendanceLogToFirestore = createAdder('attendance_logs');

export const updateAttendanceLogInFirestore = createUpdater('attendance_logs');

// ─── Mutasi Logs ───
export const subscribeMutasiLogs = (callback) =>
  createSubscriber('mutasi_logs', callback);

export const addMutasiLogToFirestore = createAdder('mutasi_logs');

export const updateMutasiLogInFirestore = createUpdater('mutasi_logs');

export const deleteMutasiLogFromFirestore = createDeleter('mutasi_logs');

// ─── Users ───
export const subscribeUsers = (callback) =>
  createSubscriber('users', callback, 'nrp');

export const addUserToFirestore = createAdder('users');

export const updateUserInFirestore = createUpdater('users');

export const resetUsersInFirestore = async (defaultUsers) => {
  const database = initFirebase();
  if (!database) return false;
  try {
    const q = query(collection(database, 'users'));
    const snapshot = await getDocs(q);
    const deletePromises = [];
    snapshot.forEach((docSnapshot) => {
      deletePromises.push(deleteDoc(docSnapshot.ref));
    });
    await Promise.all(deletePromises);

    const addPromises = defaultUsers.map(async (u) => {
      const { firebaseId, ...userData } = u;
      const docRef = await addDoc(collection(database, 'users'), {
        ...userData,
        createdAt: serverTimestamp(),
        firebaseSavedAt: serverTimestamp()
      });
      return docRef.id;
    });
    await Promise.all(addPromises);
    return true;
  } catch (e) {
    console.warn('[Firebase] Gagal reset users:', e);
    return false;
  }
};

export const clearAllPatrolDataInFirestore = async () => {
  const database = initFirebase();
  if (!database) return false;
  const collections = ['patrol_reports', 'findings', 'mutasi_logs', 'attendance_logs', 'complaints'];
  try {
    for (const collName of collections) {
      const q = query(collection(database, collName));
      const snapshot = await getDocs(q);
      const deletePromises = [];
      snapshot.forEach((docSnapshot) => {
        deletePromises.push(deleteDoc(docSnapshot.ref));
      });
      await Promise.all(deletePromises);
    }
    return true;
  } catch (e) {
    console.warn('[Firebase] Gagal membersihkan data:', e);
    return false;
  }
};
