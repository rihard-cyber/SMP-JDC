/**
 * =======================================================
 *   SMPJDC SECURITY MANAGEMENT SYSTEM
 *   Module: Main Application Entry (App.jsx)
 *   Signed by: Richard Meha (by -Richard)
 *   Last Maintained: 2026-06-07
 *   Description: Main orchestrator of JDC management dashboard,
 *                complaints sync, and safe localStorage handler.
 * =======================================================
 */

import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { executeBackHandlers } from './utils/navigation';
import { hashPin, verifyPin, validateSession, signUserData, verifyUserDataSignature, signRoleInSession, verifyRoleInSession } from './utils/security';
import { compressImage } from './utils/image';
import { initFirebase, subscribeComplaints, addComplaintToFirestore, updateComplaintInFirestore,
  subscribeReports, addReportToFirestore,
  subscribeFindings, addFindingToFirestore, updateFindingInFirestore,
  subscribeAttendanceLogs, addAttendanceLogToFirestore, updateAttendanceLogInFirestore,
  subscribeMutasiLogs, addMutasiLogToFirestore, updateMutasiLogInFirestore, deleteMutasiLogFromFirestore,
  subscribeUsers, addUserToFirestore, updateUserInFirestore, resetUsersInFirestore,
  clearAllPatrolDataInFirestore } from './utils/firebase';
import { 
  LayoutDashboard, 
  QrCode, 
  FileSpreadsheet, 
  Smartphone, 
  Building,
  Target,
  LogOut,
  Shield,
  Menu,
  X,
  BookOpen,
  Users,
  Sun,
  Moon,
  ClipboardList,
  Mail,
  MessageSquare,
  Check,
  Key,
  FileText,
  Database,
  Camera,
  Lock
} from 'lucide-react';
import ManagementDashboard from './components/ManagementDashboard';
import SecurityPatrolApp from './components/SecurityPatrolApp';
import BarcodeGenerator from './components/BarcodeGenerator';
import ReportsExport from './components/ReportsExport';
import TargetDashboard from './components/TargetDashboard';
import LoginPage from './components/LoginPage';
import MutasiPenjagaan from './components/MutasiPenjagaan';
import UserManagement from './components/UserManagement';
import AbsensiRegu from './components/AbsensiRegu';
import LaporForm from './components/LaporForm';
import BackupRestore from './components/BackupRestore';
import ComplaintForm from './components/ComplaintForm';
import ComplaintAdmin from './components/ComplaintAdmin';
import BottomNav from './components/BottomNav';

const DB_VERSION_KEY = 'smpjdc_db_version';
const CURRENT_DB_VERSION = '5.1-stable';

const INITIAL_AREAS = [
  { id: 'bsmt-b-1', gedung: 'SMPJDC - Jakarta Design Center', lantai: 'Basement', nomorTitik: '1', zona: 'B', titik: 'Depan R. Electric', qrCode: 'JDC-BSMT-B-1' },
  { id: 'bsmt-a-2', gedung: 'SMPJDC - Jakarta Design Center', lantai: 'Basement', nomorTitik: '2', zona: 'A', titik: 'R. Ganti Pakaian Security', qrCode: 'JDC-BSMT-A-2' },
  { id: 'l1-a-3', gedung: 'SMPJDC - Jakarta Design Center', lantai: '1', nomorTitik: '3', zona: 'A', titik: 'Tangga Sudut BNI 46', qrCode: 'JDC-LT01-A-3' },
  { id: 'l1-b-4', gedung: 'SMPJDC - Jakarta Design Center', lantai: '1', nomorTitik: '4', zona: 'B', titik: 'Tangga Sudut Gardu PLN', qrCode: 'JDC-LT01-B-4' },
  { id: 'l2-b-5', gedung: 'SMPJDC - Jakarta Design Center', lantai: '2', nomorTitik: '5', zona: 'B', titik: 'Tangga Sudut Pantry', qrCode: 'JDC-LT02-B-5' },
  { id: 'l2-a-6', gedung: 'SMPJDC - Jakarta Design Center', lantai: '2', nomorTitik: '6', zona: 'A', titik: 'Tangga Sudut BNI 46', qrCode: 'JDC-LT02-A-6' },
  { id: 'l3-a-7', gedung: 'SMPJDC - Jakarta Design Center', lantai: '3', nomorTitik: '7', zona: 'A', titik: 'Tangga Sudut Staff Security', qrCode: 'JDC-LT03-A-7' },
  { id: 'l3-b-8', gedung: 'SMPJDC - Jakarta Design Center', lantai: '3', nomorTitik: '8', zona: 'B', titik: 'Tangga Sudut Gardu PLN', qrCode: 'JDC-LT03-B-8' },
  { id: 'l4-b-9', gedung: 'SMPJDC - Jakarta Design Center', lantai: '4', nomorTitik: '9', zona: 'B', titik: 'Tangga Sudut Pantry', qrCode: 'JDC-LT04-B-9' },
  { id: 'l4-a-10', gedung: 'SMPJDC - Jakarta Design Center', lantai: '4', nomorTitik: '10', zona: 'A', titik: 'Tangga Sudut BNI 46', qrCode: 'JDC-LT04-A-10' },
  { id: 'l5-b-11', gedung: 'SMPJDC - Jakarta Design Center', lantai: '5', nomorTitik: '11', zona: 'B', titik: 'Tangga Sudut Gardu PLN', qrCode: 'JDC-LT05-B-11' },
  { id: 'l5-a-12', gedung: 'SMPJDC - Jakarta Design Center', lantai: '5', nomorTitik: '12', zona: 'A', titik: 'Tangga Sudut R. Rapat JDC Office', qrCode: 'JDC-LT05-A-12' },
  { id: 'l6-a-13', gedung: 'SMPJDC - Jakarta Design Center', lantai: '6', nomorTitik: '13', zona: 'A', titik: 'Tangga Sudut Mushola', qrCode: 'JDC-LT06-A-13' },
  { id: 'l6-b-14', gedung: 'SMPJDC - Jakarta Design Center', lantai: '6', nomorTitik: '14', zona: 'B', titik: 'Depan Gudang Barang / R. Caraton', qrCode: 'JDC-LT06-B-14' },
  { id: 'hd-c-15', gedung: 'SMPJDC - Jakarta Design Center', lantai: 'Halaman Depan', nomorTitik: '15', zona: 'C', titik: 'Condor IAI DKI', qrCode: 'JDC-HD-C-15' },
  { id: 'hd-a-16', gedung: 'SMPJDC - Jakarta Design Center', lantai: 'Halaman Depan', nomorTitik: '16', zona: 'A', titik: 'Ruang Chiller', qrCode: 'JDC-HD-A-16' },
  { id: 'hd-lobby-17', gedung: 'SMPJDC - Jakarta Design Center', lantai: 'Halaman Depan', nomorTitik: '17', zona: 'Lobby', titik: 'Luar ATM Bank Niaga', qrCode: 'JDC-HD-LOBBY-17' },
  { id: 'hd-hd-18', gedung: 'SMPJDC - Jakarta Design Center', lantai: 'Halaman Depan', nomorTitik: '18', zona: 'Halaman Depan', titik: 'Pos Keluar', qrCode: 'JDC-HD-HD-18' },
  { id: 'hd-hd-19', gedung: 'SMPJDC - Jakarta Design Center', lantai: 'Halaman Depan', nomorTitik: '19', zona: 'Halaman Depan', titik: 'Pos Masuk', qrCode: 'JDC-HD-HD-19' },
  { id: 'hskn-a-20', gedung: 'SMPJDC - Jakarta Design Center', lantai: 'Halaman Samping Kanan', nomorTitik: '20', zona: 'A', titik: 'Tiang Canopy Basement', qrCode: 'JDC-HSKN-A-20' },
  { id: 'hb-hb-21', gedung: 'SMPJDC - Jakarta Design Center', lantai: 'Halaman Belakang', nomorTitik: '21', zona: 'Halaman Belakang', titik: 'Tembok Belakang Gardu Genset', qrCode: 'JDC-HB-HB-21' },
  { id: 'hb-hb-22', gedung: 'SMPJDC - Jakarta Design Center', lantai: 'Halaman Belakang', nomorTitik: '22', zona: 'Halaman Belakang', titik: 'Tembok Ujung Parkir Motor', qrCode: 'JDC-HB-HB-22' },
  { id: 'hb-hb-23', gedung: 'SMPJDC - Jakarta Design Center', lantai: 'Halaman Belakang', nomorTitik: '23', zona: 'Halaman Belakang', titik: 'Tembok Depan Gardu PLN', qrCode: 'JDC-HB-HB-23' },
  { id: 'hskr-b-24', gedung: 'SMPJDC - Jakarta Design Center', lantai: 'Halaman Samping Kiri', nomorTitik: '24', zona: 'B', titik: 'Pintu Tangga Sudut Antar Pentos ASP', qrCode: 'JDC-HSKR-B-24' },
  { id: 'pos-25', gedung: 'SMPJDC - Jakarta Design Center', lantai: 'Pos 00', nomorTitik: '25', zona: 'Posco Security', titik: 'Pos 00', qrCode: 'JDC-POS-25' },
  { id: 'rtek-26', gedung: 'SMPJDC - Jakarta Design Center', lantai: 'R. Teknik', nomorTitik: '26', zona: 'Petugas Teknik', titik: 'R. Teknik', qrCode: 'JDC-RTEK-26' },
];

const INITIAL_REPORTS = [];
const INITIAL_FINDINGS = [];

const BASE_USERS = [
  { id: 1, nrp: '10001', nama: 'Richard', jabatan: 'Admin Super', regu: '' },
  { id: 2, nrp: '10002', nama: 'Pak Kusnan', jabatan: 'Manajemen', regu: '' },
  { id: 3, nrp: '10003', nama: 'Agus Siraitin', jabatan: 'SPV', regu: '' },
  { id: 4, nrp: '20001', nama: 'Wahyudi', jabatan: 'Danru', regu: 'Regu A' },
  { id: 5, nrp: '20002', nama: 'Faizal Tanjung', jabatan: 'Wadanru', regu: 'Regu A' },
  { id: 6, nrp: '20003', nama: 'Agus Hendraya', jabatan: 'Danru', regu: 'Regu B' },
  { id: 7, nrp: '20004', nama: 'Suparlan', jabatan: 'Wadanru', regu: 'Regu B' },
  { id: 8, nrp: '20005', nama: 'Sutrijono', jabatan: 'Danru', regu: 'Regu C' },
  { id: 9, nrp: '20006', nama: 'Dedy K', jabatan: 'Wadanru', regu: 'Regu C' },
  { id: 10, nrp: '20007', nama: 'M. Iqbal', jabatan: 'Danru', regu: 'Regu D' },
  { id: 11, nrp: '20008', nama: 'Dimas Pratama Putra', jabatan: 'Wadanru', regu: 'Regu D' },
];

const mapDepartment = (kategori, temuanText = '') => {
  const text = (kategori + ' ' + temuanText).toLowerCase();
  const wordMatch = (words) => {
    const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp('\\b(' + escaped.join('|') + ')\\b', 'i').test(text);
  };
  if (wordMatch(['ahu', 'chiller', 'lift', 'eskalator', 'listrik', 'pipa', 'lampu', 'teknik', 'bocor', 'rusak', 'fasilitas'])) {
    return 'Teknisi';
  }
  if (wordMatch(['kotor', 'sampah', 'bersih', 'basah', 'cleaning', 'toilet', 'jamban', 'bau', 'aroma'])) {
    return 'Cleaning';
  }
  return 'Keamanan';
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasUsers, setHasUsers] = useState(true);
  const [showSplash, setShowSplash] = useState(false);
  const [cyberLogs, setCyberLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('BOOTING...');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSOS, setActiveSOS] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [sosAudio, setSosAudio] = useState(null);

  // Profile & Email Verification State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [verifStep, setVerifStep] = useState('idle'); // idle | send | verify | done
  const [newEmail, setNewEmail] = useState('');
  const [verifCode, setVerifCode] = useState('');
  const [verifSentCode, setVerifSentCode] = useState('');
  const [verifMethod, setVerifMethod] = useState('email');
  const [verifLoading, setVerifLoading] = useState(false);
  const [verifError, setVerifError] = useState('');

  // Custom Profile Update States
  const [tempAvatar, setTempAvatar] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [activeProfileTab, setActiveProfileTab] = useState('info'); // info | photo | pin | email

  useEffect(() => {
    if (showProfileModal && currentUser) {
      setTempAvatar(currentUser.avatar || '');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setProfileError('');
      setProfileSuccess('');
      setActiveProfileTab('info');
      setNewEmail(currentUser.email || '');
      setVerifStep('idle');
      setVerifError('');
    }
  }, [showProfileModal, currentUser]);

  const handleSendVerification = () => {
    if (!newEmail.includes('@') || !newEmail.includes('.')) {
      setVerifError('Masukkan alamat email yang valid');
      return;
    }
    setVerifError('');
    setVerifLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setTimeout(() => {
      setVerifSentCode(code);
      setVerifStep('verify');
      setVerifLoading(false);
      addToast(`Kode verifikasi telah dikirim ke ${verifMethod === 'email' ? 'email' : 'WhatsApp'}`, 'success');
    }, 800);
  };

  const handleVerifyCode = () => {
    if (verifCode === verifSentCode) {
      setVerifStep('done');
      const updatedUsers = users.map(u =>
        u.id === currentUser.id ? { ...u, email: newEmail } : u
      );
      setUsers(updatedUsers);
      setCurrentUser(prev => ({ ...prev, email: newEmail }));
      localStorage.setItem('sapujagat_users', JSON.stringify(updatedUsers));
      signUserData(updatedUsers);
      addToast('Email berhasil diperbarui!', 'success');
    } else {
      setVerifError('Kode verifikasi salah. Coba lagi.');
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('sapujagat_users');
    const users = stored ? JSON.parse(stored) : null;
    const hasExistingUsers = Array.isArray(users) && users.length > 0;

    // Anti-tamper: verifikasi signature data user
    if (hasExistingUsers) {
      const valid = verifyUserDataSignature(users);
      if (!valid) {
        console.warn('[Security] Data user telah dimanipulasi! Menghapus session.');
        localStorage.removeItem('smpjdc_session');
        localStorage.removeItem('sapujagat_users_sig');
        setHasUsers(false);
        setAuthenticated(false);
        return;
      }
    }
    setHasUsers(hasExistingUsers);

    const sessionStr = localStorage.getItem('smpjdc_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (validateSession(session)) {
          const userList = hasExistingUsers ? users : [];
          const found = userList.find(u => u.id === session.userId);
          if (found) {
            // Anti-tamper: verifikasi role dalam session
            if (session.roleToken && !verifyRoleInSession(found.id, found.jabatan, session.roleToken)) {
              console.warn('[Security] Role user telah dimanipulasi! Logout paksa.');
              localStorage.removeItem('smpjdc_session');
              setAuthenticated(false);
              return;
            }
            setCurrentUser(found);
            setAuthenticated(true);
            setShowSplash(true);
            
            // Restore last active route from hash or last_route, default to guard/dashboard
            const hash = window.location.hash.replace('#/', '').replace('#', '');
            const lastRoute = localStorage.getItem('smpjdc_last_route');
            const defaultTab = ['Danru', 'Wadanru', 'Anggota'].includes(found.jabatan) ? 'guard-simulator' : 'dashboard';
            const initialTab = hash || lastRoute || defaultTab;
            
            setCurrentTab(initialTab);
            window.location.hash = '#/' + initialTab;
            localStorage.setItem('smpjdc_last_route', initialTab);
            return;
          }
        }
      } catch (e) {
        localStorage.removeItem('smpjdc_session');
      }
    }
    setAuthenticated(false);
  }, []);

  // Sync tab state when browser popstate triggers (e.g. Back button in browser/PWA)
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash && hash !== 'login') {
        const validTabs = [
          'dashboard', 'absensi', 'target-compliance', 'barcodes', 
          'mutasi', 'reports', 'guard-simulator', 'user-management', 
          'backup', 'lapor', 'complaint'
        ];
        if (validTabs.includes(hash)) {
          setCurrentTab(hash);
          localStorage.setItem('smpjdc_last_route', hash);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const clearSOS = React.useCallback(() => {
    if (sosAudio) {
      try {
        sosAudio.stop();
      } catch (e) {}
      setSosAudio(null);
    }
    setActiveSOS(null);
  }, [sosAudio]);

  // Handle Android back button natively (Capacitor WebView)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let backButtonSub;
    try {
      backButtonSub = CapApp.addListener('backButton', () => {
        // 1. Run custom back handlers (modals inside sub-components)
        if (executeBackHandlers()) {
          return;
        }

        // 2. Handle overlays in App.jsx itself
        if (showProfileModal) {
          setShowProfileModal(false);
          setVerifStep('idle');
          setVerifError('');
          return;
        }

        if (activeSOS) {
          clearSOS();
          return;
        }

        // 3. If on home/dashboard tab, show exit confirmation modal
        const defaultTab = currentUser && ['Danru', 'Wadanru', 'Anggota'].includes(currentUser.jabatan) 
          ? 'guard-simulator' 
          : 'dashboard';
          
        if (currentTab === defaultTab) {
          setShowExitConfirm(true);
        } else {
          // 4. Otherwise, go back in history
          window.history.back();
        }
      });
    } catch (e) {
      console.warn("Gagal menambahkan listener tombol back native:", e);
    }

    return () => {
      if (backButtonSub) {
        backButtonSub.then(sub => sub.remove());
      }
    };
  }, [currentUser, currentTab, showProfileModal, activeSOS, sosAudio, clearSOS]);

  // Splash screen effect
  useEffect(() => {
    if (!showSplash) return;
    const allLogs = [
      '>> INITIALIZING SMPJDC SECURITY SYSTEM...',
      '>> LOAD SYSTEM DRIVER: anti_fraud_gps.sys ... OK',
      '>> CONNECTING CENTRAL DATABASE DIRECTORY...',
      '>> VERIFYING ACCESS PRIVILEGES... BY_RICHARDMEHA',
      '>> SYNCING TENANT TARGETS & FLOOR MAPS...',
      '>> DEPLOYING OFFLINE TRANSACTION CACHE...',
      '>> INTRUSION DETECTION SYSTEM: SHIELD ACTIVE',
      '>> PROTOCOL STACK STABILIZED... SECURE',
      '>> BOOT COMPLETED: SMPJDC IS READY!'
    ];

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(prev + Math.floor(Math.random() * 8) + 4, 100);
      });
    }, 120);

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < allLogs.length) {
        setCyberLogs(prev => [...prev, allLogs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 320);

    const statusInterval = setInterval(() => {
      setProgress(p => {
        if (p < 30) setStatusText('BOOTING CORE...');
        else if (p < 65) setStatusText('CALIBRATING SENSORS...');
        else if (p < 90) setStatusText('DECRYPTING INTERFACE...');
        else {
          setStatusText('SECURE & OPERATIONAL');
          clearInterval(statusInterval);
        }
        return p;
      });
    }, 200);

    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
      clearInterval(statusInterval);
      clearTimeout(timer);
    };
  }, [showSplash]);

  const [theme, setTheme] = useState(() => localStorage.getItem('smpjdc_theme') || 'dark');
  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('smpjdc_theme', next);
      return next;
    });
  };

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('sapujagat_users');
      const parsed = saved ? JSON.parse(saved) : null;
      const dbVersion = localStorage.getItem(DB_VERSION_KEY);

      if (Array.isArray(parsed) && parsed.length > 0 && dbVersion === CURRENT_DB_VERSION) {
        // Ensure all PINs are hashed (migrate from plaintext if needed)
        parsed.forEach(u => {
          const stored = localStorage.getItem(`smpjdc_pin_${u.id}`);
          if (stored && !stored.startsWith('h')) {
            localStorage.setItem(`smpjdc_pin_${u.id}`, hashPin(stored));
          }
          delete u.pin;
        });
        localStorage.setItem('sapujagat_users', JSON.stringify(parsed));
        signUserData(parsed);
        return parsed;
      }

      // Version mismatch — merge semua user default, jangan hapus data existing
      const existingMap = {};
      if (Array.isArray(parsed)) {
        parsed.forEach(u => {
          // Migrasi: ubah 'role' ke 'jabatan' jika masih pakai field lama
          if (u.role && !u.jabatan) {
            u.jabatan = u.role;
            delete u.role;
          }
          existingMap[u.nrp] = u;
        });
      }
      BASE_USERS.forEach(bu => {
        if (!existingMap[bu.nrp]) {
          existingMap[bu.nrp] = { ...bu };
        } else {
          // Update Agus Siraitin to oversee all regus
          if (bu.nrp === '10003') existingMap[bu.nrp].regu = '';
        }
      });
      const merged = Object.values(existingMap);
      merged.forEach(u => {
        const stored = localStorage.getItem(`smpjdc_pin_${u.id}`);
        if (!stored) {
          localStorage.setItem(`smpjdc_pin_${u.id}`, hashPin(u.nrp));
        } else if (stored && !stored.startsWith('h')) {
          localStorage.setItem(`smpjdc_pin_${u.id}`, hashPin(stored));
        }
        delete u.pin;
      });
      localStorage.setItem('sapujagat_users', JSON.stringify(merged));
      signUserData(merged);
      localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
      return merged;
    } catch (e) {
      return [];
    }
  });

  const [areas, setAreas] = useState(() => {
    try {
      const saved = localStorage.getItem('sapujagat_areas');
      const parsed = saved ? JSON.parse(saved) : null;
      const dbVersion = localStorage.getItem(DB_VERSION_KEY);

      if (Array.isArray(parsed) && parsed.length > 0 && dbVersion === CURRENT_DB_VERSION) {
        return parsed;
      }

      // Overwrite areas with INITIAL_AREAS (26 real JDC areas) on version mismatch / fresh install
      localStorage.setItem('sapujagat_areas', JSON.stringify(INITIAL_AREAS));
      localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
      return INITIAL_AREAS;
    } catch (e) {
      return INITIAL_AREAS;
    }
  });

  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem('sapujagat_reports');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REPORTS;
    } catch (e) {
      return INITIAL_REPORTS;
    }
  });

  const [findings, setFindings] = useState(() => {
    try {
      const saved = localStorage.getItem('sapujagat_findings');
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(f => ({
          ...f,
          department: f.department || mapDepartment(f.kategori, f.detail || ''),
          waStatus: f.waStatus || 'Belum Dikirim'
        }));
      }
      return INITIAL_FINDINGS;
    } catch (e) {
      return INITIAL_FINDINGS;
    }
  });

  const [mutasiLogs, setMutasiLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('smpjdc_mutasi_logs');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  const [attendanceLogs, setAttendanceLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('smpjdc_attendance_logs');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem('smpjdc_complaints');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const pruneReportsAndRetry = () => {
    setReports(prev => {
      const pruned = prev.map((r, idx) => {
        if (idx >= 10 && r.foto) {
          return { ...r, foto: null };
        }
        return r;
      });
      try {
        localStorage.setItem('sapujagat_reports', JSON.stringify(pruned));
      } catch (e) {
        const hardPruned = pruned.slice(0, 20).map(r => ({ ...r, foto: null }));
        try {
          localStorage.setItem('sapujagat_reports', JSON.stringify(hardPruned));
        } catch (err) {
          console.error('Hard prune of reports failed:', err);
        }
      }
      return pruned;
    });
  };

  const pruneFindingsAndRetry = () => {
    setFindings(prev => {
      const pruned = prev.map((f, idx) => {
        if (idx >= 10 && f.foto) {
          return { ...f, foto: null };
        }
        return f;
      });
      try {
        localStorage.setItem('sapujagat_findings', JSON.stringify(pruned));
      } catch (e) {
        const hardPruned = pruned.slice(0, 20).map(f => ({ ...f, foto: null }));
        try {
          localStorage.setItem('sapujagat_findings', JSON.stringify(hardPruned));
        } catch (err) {
          console.error('Hard prune of findings failed:', err);
        }
      }
      return pruned;
    });
  };

  const pruneMutasiAndRetry = () => {
    setMutasiLogs(prev => {
      const pruned = prev.map((m, idx) => {
        if (idx >= 10 && m.foto) {
          return { ...m, foto: null };
        }
        return m;
      });
      try {
        localStorage.setItem('smpjdc_mutasi_logs', JSON.stringify(pruned));
      } catch (e) {
        const hardPruned = pruned.slice(0, 20).map(m => ({ ...m, foto: null }));
        try {
          localStorage.setItem('smpjdc_mutasi_logs', JSON.stringify(hardPruned));
        } catch (err) {
          console.error('Hard prune of mutasi failed:', err);
        }
      }
      return pruned;
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem('sapujagat_users', JSON.stringify(users));
      signUserData(users);
      
      // Auto-initialize PINs for all users synced from Firebase/local who don't have one in localStorage
      if (Array.isArray(users)) {
        users.forEach(u => {
          const stored = localStorage.getItem(`smpjdc_pin_${u.id}`);
          if (!stored) {
            localStorage.setItem(`smpjdc_pin_${u.id}`, hashPin(u.nrp));
          } else if (stored && !stored.startsWith('h')) {
            localStorage.setItem(`smpjdc_pin_${u.id}`, hashPin(stored));
          }
        });
      }
    } catch (e) {
      console.error('Failed to save users to localStorage', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('sapujagat_areas', JSON.stringify(areas));
    } catch (e) {
      console.error('Failed to save areas to localStorage', e);
    }
  }, [areas]);

  useEffect(() => {
    try {
      localStorage.setItem('sapujagat_reports', JSON.stringify(reports));
    } catch (e) {
      console.error('Failed to save reports to localStorage', e);
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        pruneReportsAndRetry();
      }
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem('sapujagat_findings', JSON.stringify(findings));
    } catch (e) {
      console.error('Failed to save findings to localStorage', e);
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        pruneFindingsAndRetry();
      }
    }
  }, [findings]);

  useEffect(() => {
    try {
      localStorage.setItem('smpjdc_mutasi_logs', JSON.stringify(mutasiLogs));
    } catch (e) {
      console.error('Failed to save mutasi logs to localStorage', e);
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        pruneMutasiAndRetry();
      }
    }
  }, [mutasiLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('smpjdc_attendance_logs', JSON.stringify(attendanceLogs));
    } catch (e) {
      console.error('Failed to save attendance logs to localStorage', e);
    }
  }, [attendanceLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('smpjdc_complaints', JSON.stringify(complaints));
    } catch (e) {
      console.warn('[Complaint] Gagal sync ke localStorage:', e);
    }
  }, [complaints]);

  // Firebase real-time subscription untuk complaints
  useEffect(() => {
    const db = initFirebase();
    if (!db) return;

    const unsub = subscribeComplaints((firebaseData) => {
      if (!firebaseData) return;
      setComplaints(prev => {
        const merged = [...firebaseData];
        prev.forEach(local => {
          const exists = merged.find(m => m.id === local.id || (m.firebaseId && m.firebaseId === local.firebaseId));
          if (!exists) merged.push(local);
        });
        try { localStorage.setItem('smpjdc_complaints', JSON.stringify(merged)); } catch (e) {}
        return merged;
      });
    });
    return () => unsub();
  }, []);

  // Firebase real-time subscription untuk patrol reports
  useEffect(() => {
    const db = initFirebase();
    if (!db) return;
    const unsub = subscribeReports((firebaseData) => {
      if (!firebaseData) return;
      setReports(prev => {
        const merged = [...firebaseData];
        prev.forEach(local => {
          const exists = merged.find(m => m.id === local.id || (m.firebaseId && m.firebaseId === local.firebaseId));
          if (!exists) merged.push(local);
        });
        try { localStorage.setItem('sapujagat_reports', JSON.stringify(merged)); } catch (e) {}
        return merged;
      });
    });
    return () => unsub();
  }, []);

  // Firebase real-time subscription untuk findings
  useEffect(() => {
    const db = initFirebase();
    if (!db) return;
    const unsub = subscribeFindings((firebaseData) => {
      if (!firebaseData) return;
      setFindings(prev => {
        const merged = [...firebaseData];
        prev.forEach(local => {
          const exists = merged.find(m => m.id === local.id || (m.firebaseId && m.firebaseId === local.firebaseId));
          if (!exists) merged.push(local);
        });
        try { localStorage.setItem('sapujagat_findings', JSON.stringify(merged)); } catch (e) {}
        return merged;
      });
    });
    return () => unsub();
  }, []);

  // Firebase real-time subscription untuk attendance logs
  useEffect(() => {
    const db = initFirebase();
    if (!db) return;
    const unsub = subscribeAttendanceLogs((firebaseData) => {
      if (!firebaseData) return;
      setAttendanceLogs(prev => {
        const merged = [...firebaseData];
        prev.forEach(local => {
          const exists = merged.find(m => m.id === local.id || (m.firebaseId && m.firebaseId === local.firebaseId));
          if (!exists) merged.push(local);
        });
        try { localStorage.setItem('smpjdc_attendance_logs', JSON.stringify(merged)); } catch (e) {}
        return merged;
      });
    });
    return () => unsub();
  }, []);

  // Firebase real-time subscription untuk mutasi logs
  useEffect(() => {
    const db = initFirebase();
    if (!db) return;
    const unsub = subscribeMutasiLogs((firebaseData) => {
      if (!firebaseData) return;
      setMutasiLogs(prev => {
        const merged = [...firebaseData];
        prev.forEach(local => {
          const exists = merged.find(m => m.id === local.id || (m.firebaseId && m.firebaseId === local.firebaseId));
          if (!exists) merged.push(local);
        });
        try { localStorage.setItem('smpjdc_mutasi_logs', JSON.stringify(merged)); } catch (e) {}
        return merged;
      });
    });
    return () => unsub();
  }, []);

  // Firebase real-time subscription untuk users
  useEffect(() => {
    const db = initFirebase();
    if (!db) return;
    const unsub = subscribeUsers((firebaseData) => {
      if (!firebaseData) return;
      setUsers(prev => {
        const merged = [...firebaseData];
        prev.forEach(local => {
          const exists = merged.find(u => u.id === local.id || (u.firebaseId && u.firebaseId === local.firebaseId));
          if (!exists) merged.push(local);
        });
        try {
          localStorage.setItem('sapujagat_users', JSON.stringify(merged));
          signUserData(merged);
        } catch (e) {}
        return merged;
      });
    });
    return () => unsub();
  }, []);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const playSOSSiren = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.connect(audioCtx.destination);
      let osc = null;
      let sirenInterval = null;

      const startOsc = () => {
        if (osc) { try { osc.stop(); } catch(e) {} }
        osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.5);
        osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 1.0);
        osc.connect(gain);
        osc.start();
        osc.onended = () => { osc = null; };
      };

      startOsc();
      sirenInterval = setInterval(startOsc, 1000);

      return {
        audioCtx,
        stop: () => {
          clearInterval(sirenInterval);
          if (osc) { try { osc.stop(); } catch(e) {} }
          try { audioCtx.close(); } catch(e) {}
        }
      };
    } catch (e) {
      return null;
    }
  };

  const triggerSOS = (officerName, areaName) => {
    const alert = {
      id: Date.now(),
      officer: officerName,
      location: areaName,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setActiveSOS(alert);
    addToast(`🚨 ALARM SOS DARURAT! Petugas ${officerName} di ${areaName}`, 'danger');
    const audio = playSOSSiren();
    if (audio) setSosAudio(audio);
  };

  const handleAddReport = (newReport) => {
    const reportId = `rep-${Date.now()}-${Math.floor(Math.random() * 90000)}`;
    const reportData = { id: reportId, ...newReport };
    setReports(prev => [reportData, ...prev]);
    addToast(`Patroli sukses disubmit di ${newReport.titik} (${newReport.kondisi})`, 'success');

    addReportToFirestore(reportData).then(firebaseId => {
      if (firebaseId) {
        setReports(prev => prev.map(r =>
          r.id === reportId ? { ...r, firebaseId } : r
        ));
      }
    });

    if (newReport.kondisi !== 'Aman dan Kondusif' && newReport.kondisi !== 'Ada Aktivitas' && newReport.kondisi !== 'Renovasi') {
      const findingId = `find-${Math.floor(1000 + Math.random() * 9000)}`;
      const dept = mapDepartment(newReport.kondisi, newReport.keterangan || '');
      const findingData = {
        id: findingId,
        reportId,
        kategori: newReport.kondisi,
        area: `${newReport.gedung} Lt.${newReport.lantai} ${newReport.zona} - ${newReport.titik}`,
        tanggal: newReport.timestamp,
        pelapor: newReport.userName,
        status: 'Open',
        severity: newReport.severity || 'Rendah',
        detail: newReport.keterangan || `Ditemukan kondisi ${newReport.kondisi}`,
        foto: newReport.foto,
        department: dept,
        waStatus: 'Belum Dikirim',
        waSentAt: null
      };
      setFindings(prev => [findingData, ...prev]);
      addFindingToFirestore(findingData).then(firebaseId => {
        if (firebaseId) {
          setFindings(prev => prev.map(f =>
            f.id === findingId ? { ...f, firebaseId } : f
          ));
        }
      });
      addToast(`⚠️ Tiket temuan otomatis dibuat untuk ${dept} [Severity: ${newReport.severity || 'Rendah'}]`, 'warning');
    }
  };

  const updateFindingStatus = (findingId, newStatus) => {
    let updatedFinding = null;
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        addToast(`Status temuan ${f.kategori} diubah ke ${newStatus}`, 'info');
        updatedFinding = { ...f, status: newStatus };
        if (updatedFinding.firebaseId) {
          updateFindingInFirestore(updatedFinding.firebaseId, { status: newStatus });
        }
        return updatedFinding;
      }
      return f;
    }));
  };

  const dispatchFinding = (findingId, dept) => {
    let updatedFinding = null;
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        addToast(`Tiket didisposisikan ke ${dept}`, 'info');
        updatedFinding = { 
          ...f, 
          department: dept, 
          waStatus: `Terkirim (${dept})`,
          waSentAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        };
        if (updatedFinding.firebaseId) {
          updateFindingInFirestore(updatedFinding.firebaseId, {
            department: dept,
            waStatus: `Terkirim (${dept})`,
            waSentAt: updatedFinding.waSentAt
          });
        }
        return updatedFinding;
      }
      return f;
    }));
  };

  const handleAddMutasi = (log) => {
    const id = `mut-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const mutasiData = { id, ...log };
    setMutasiLogs(prev => [mutasiData, ...prev]);
    addMutasiLogToFirestore(mutasiData).then(firebaseId => {
      if (firebaseId) {
        setMutasiLogs(prev => prev.map(m =>
          m.id === id ? { ...m, firebaseId } : m
        ));
      }
    });
    addToast('Catatan mutasi berhasil disimpan', 'success');
  };

  const handleDeleteMutasi = (id) => {
    const target = mutasiLogs.find(l => l.id === id);
    setMutasiLogs(prev => prev.filter(l => l.id !== id));
    if (target?.firebaseId) {
      deleteMutasiLogFromFirestore(target.firebaseId);
    }
    addToast('Catatan mutasi dihapus', 'info');
  };

  const handleAddComplaint = (complaint) => {
    console.log('[Complaint] handleAddComplaint dipanggil:', complaint?.ticketId);
    setComplaints(prev => {
      const updated = [complaint, ...prev];
      try {
        localStorage.setItem('smpjdc_complaints', JSON.stringify(updated));
        console.log('[Complaint] localStorage tersimpan, total:', updated.length);
      } catch (e) {
        console.warn('[Complaint] Gagal simpan ke localStorage:', e);
      }
      return updated;
    });
    addToast(`Komplain ${complaint.ticketId} berhasil dikirim!`, 'success');

    // Firebase sync (background)
    addComplaintToFirestore(complaint).then(firebaseId => {
      if (firebaseId) {
        setComplaints(prev => prev.map(c =>
          c.id === complaint.id ? { ...c, firebaseId } : c
        ));
      }
    });
  };
  
  const handleUpdateComplaint = (id, updates) => {
    const target = complaints.find(c => c.id === id);
    setComplaints(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      try {
        localStorage.setItem('smpjdc_complaints', JSON.stringify(updated));
      } catch (e) {
        console.warn('[Complaint] Gagal update localStorage:', e);
      }
      return updated;
    });
    if (updates.status === 'Selesai') {
      addToast(`Komplain #${id} ditandai selesai`, 'success');
    }

    // Firebase sync (background)
    if (target?.firebaseId) {
      updateComplaintInFirestore(target.firebaseId, updates);
    }
  };
  
  const handleAddArea = (newArea) => {
    const areaId = newArea.qrCode.toLowerCase().replace(/[^a-z0-9]/g, '-');
    setAreas(prev => [...prev, { id: areaId, ...newArea }]);
    addToast(`Area ${newArea.titik} (Lt.${newArea.lantai} - ${newArea.zona}) berhasil didaftarkan!`, 'success');
  };

  const handleAddUser = (newUser) => {
    const userId = Date.now() + Math.floor(Math.random() * 1000);
    const userData = {
      id: userId,
      nama: newUser.nama,
      nrp: newUser.nrp,
      jabatan: newUser.jabatan,
      regu: newUser.regu || '',
      avatar: newUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60',
      email: newUser.email || ''
    };
    setUsers(prev => [...prev, userData]);
    addUserToFirestore(userData).then(firebaseId => {
      if (firebaseId) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, firebaseId } : u
        ));
      }
    });
    if (newUser.pin) {
      localStorage.setItem(`smpjdc_pin_${userId}`, hashPin(newUser.pin));
    }
    addToast(`Anggota baru ${newUser.nama} (${newUser.jabatan}) berhasil didaftarkan!`, 'success');
  };

  const handleUpdateUser = (userId, updates) => {
    setUsers(prev => {
      const user = prev.find(u => u.id === userId);
      if (user && user.firebaseId) {
        updateUserInFirestore(user.firebaseId, updates);
      }
      return prev.map(u => u.id === userId ? { ...u, ...updates } : u);
    });
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
    addToast(`Data user berhasil diperbarui!`, 'success');
  };

  const handleResetUsers = async () => {
    addToast('Mereset database user di Firestore...', 'info');
    const success = await resetUsersInFirestore(BASE_USERS);
    if (success) {
      addToast('Database user di Firestore berhasil direset!', 'success');
      setUsers(BASE_USERS);
      localStorage.setItem('sapujagat_users', JSON.stringify(BASE_USERS));
      signUserData(BASE_USERS);
      BASE_USERS.forEach(bu => {
        localStorage.setItem(`smpjdc_pin_${bu.id}`, hashPin(bu.nrp));
      });
    } else {
      addToast('Gagal mereset database user di Firestore. Periksa koneksi internet.', 'danger');
    }
  };

  const handleClearAllData = async () => {
    addToast('Membersihkan seluruh data operasional di Firestore...', 'info');
    const success = await clearAllPatrolDataInFirestore();
    if (success) {
      addToast('Seluruh data operasional di Firestore berhasil dibersihkan!', 'success');
      setReports([]);
      setFindings([]);
      setMutasiLogs([]);
      setAttendanceLogs([]);
      setComplaints([]);
      localStorage.setItem('sapujagat_reports', JSON.stringify([]));
      localStorage.setItem('sapujagat_findings', JSON.stringify([]));
      localStorage.setItem('smpjdc_mutasi_logs', JSON.stringify([]));
      localStorage.setItem('smpjdc_attendance_logs', JSON.stringify([]));
      localStorage.setItem('smpjdc_complaints', JSON.stringify([]));
    } else {
      addToast('Gagal membersihkan data di Firestore. Periksa koneksi internet.', 'danger');
    }
  };

  const handleUpdateAvatar = async () => {
    setProfileError('');
    setProfileSuccess('');
    if (!tempAvatar) {
      setProfileError('Pilih atau upload foto terlebih dahulu.');
      return;
    }
    
    try {
      const updatedUsers = users.map(u =>
        u.id === currentUser.id ? { ...u, avatar: tempAvatar } : u
      );
      
      setUsers(updatedUsers);
      setCurrentUser(prev => ({ ...prev, avatar: tempAvatar }));
      localStorage.setItem('sapujagat_users', JSON.stringify(updatedUsers));
      signUserData(updatedUsers);
      
      if (currentUser.firebaseId) {
        await updateUserInFirestore(currentUser.firebaseId, { avatar: tempAvatar });
      }
      
      setProfileSuccess('Foto profil berhasil diperbarui!');
      addToast('Foto profil berhasil diperbarui!', 'success');
    } catch (e) {
      console.error(e);
      setProfileError('Gagal memperbarui foto profil.');
    }
  };

  const handleUpdatePin = async () => {
    setProfileError('');
    setProfileSuccess('');
    
    if (!currentPin || !newPin || !confirmPin) {
      setProfileError('Semua field PIN harus diisi.');
      return;
    }
    
    const storedPinHash = localStorage.getItem(`smpjdc_pin_${currentUser.id}`);
    
    if (storedPinHash && !verifyPin(currentPin, storedPinHash)) {
      setProfileError('PIN saat ini salah.');
      return;
    }
    
    if (newPin.length < 4) {
      setProfileError('PIN baru minimal 4 karakter.');
      return;
    }
    
    if (newPin !== confirmPin) {
      setProfileError('Konfirmasi PIN baru tidak cocok.');
      return;
    }
    
    try {
      const hashed = hashPin(newPin);
      localStorage.setItem(`smpjdc_pin_${currentUser.id}`, hashed);
      
      setProfileSuccess('PIN berhasil diperbarui!');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      addToast('PIN keamanan berhasil diperbarui!', 'success');
    } catch (e) {
      console.error(e);
      setProfileError('Gagal memperbarui PIN.');
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setAuthenticated(true);
    setShowSplash(true);
    const targetTab = ['Danru', 'Wadanru', 'Anggota'].includes(user.jabatan) ? 'guard-simulator' : 'dashboard';
    setCurrentTab(targetTab);
    window.location.hash = '#/' + targetTab;
    localStorage.setItem('smpjdc_last_route', targetTab);
  };

  const handleSetup = (user) => {
    setCurrentUser(user);
    setAuthenticated(true);
    setShowSplash(true);
    setHasUsers(true);
    setCurrentTab('dashboard');
    window.location.hash = '#/dashboard';
    localStorage.setItem('smpjdc_last_route', 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('smpjdc_session');
    localStorage.removeItem('smpjdc_last_route');
    window.location.hash = '#/login';
    setAuthenticated(false);
    setCurrentUser(null);
    setShowSplash(false);
    addToast('Anda telah logout', 'info');
  };

  const handleNavClick = (tabName) => {
    setCurrentTab(tabName);
    window.location.hash = '#/' + tabName;
    localStorage.setItem('smpjdc_last_route', tabName);
    setIsSidebarOpen(false);
  };

  const handleExitApp = () => {
    if (Capacitor.isNativePlatform()) {
      CapApp.exitApp();
    } else {
      setShowExitConfirm(false);
    }
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  const jabatanShort = {
    'Admin Super': 'Admin Super',
    'Manajemen': 'Manajemen',
    'SPV': 'SPV',
    'Danru': 'Danru',
    'Wadanru': 'Wadanru',
    'Anggota': 'Anggota',
    'Guest Viewer': 'Guest'
  };

  const isGodMode = currentUser?.jabatan === 'Admin Super';
  const isAdmin = ['Manajemen', 'SPV'].includes(currentUser?.jabatan);
  const isClient = currentUser?.jabatan === 'Guest Viewer';
  const isSuperAdmin = isGodMode;
  const isPatrol = ['Danru', 'Wadanru', 'Anggota'].includes(currentUser?.jabatan);

  // Public complaint form — accessible without login via QR code or direct URL
  const isPublicComplaint = typeof window !== 'undefined' && window.location.search.includes('complaint');
  if (isPublicComplaint) {
    return <div style={{ minHeight: '100vh', background: '#0f172a' }}><ComplaintForm onAddComplaint={handleAddComplaint} /></div>;
  }

  if (authenticated === null) {
    return <div className="login-page" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}><div className="cyber-grid" style={{ position: 'absolute', inset: 0 }}></div></div>;
  }

  if (!authenticated) {
    return <LoginPage onLogin={handleLogin} onSetup={handleSetup} hasUsers={hasUsers} />;
  }

  if (showSplash) {
    return (
      <div className="splash-screen cyber-screen">
        <div className="cyber-corner corner-tl"></div>
        <div className="cyber-corner corner-tr"></div>
        <div className="cyber-corner corner-bl"></div>
        <div className="cyber-corner corner-br"></div>
        <div className="cyber-grid"></div>
        <div className="cyber-scanline"></div>
        <div className="cyber-hud-container">
          <div className="hud-ring ring-outer"></div>
          <div className="hud-ring ring-middle"></div>
          <div className="hud-ring ring-inner"></div>
          <div className="hud-ring ring-dashed"></div>
          <div className="splash-logo-container">
            <img src="logo.png" alt="SMPJDC" className="splash-logo cyber-logo logo-3d-spin" />
          </div>
        </div>
        <div className="cyber-progress-container">
          <div className="cyber-progress-header">
            <span className="progress-label">CORE CALIBRATION</span>
            <span className="progress-percent">{progress}%</span>
          </div>
          <div className="cyber-progress-bar">
            <div className="cyber-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="cyber-console">
          <div className="console-header">
            <span className="console-title">[SMPJDC SECURE BOOT]</span>
            <span className="console-status blink">{statusText}</span>
          </div>
          <div className="console-body">
            {cyberLogs.slice(-4).map((log, idx) => (
              <p key={idx} className="console-line">{log}</p>
            ))}
          </div>
        </div>
        <div className="splash-footer cyber-footer">
          <p className="splash-title cyber-title">SMPJDC v2.0</p>
          <p className="splash-subtitle cyber-subtitle">SISTEM MANAGEMENT KEAMANAN JDC // BY_RICHARDMEHA</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-layout theme-${theme}`}>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo-box">
            <img src="logo.png" alt="SMPJDC" className="logo-3d" />
          </div>
          <div>
            <h2>SMPJDC<span className="text-primary"> JDC</span></h2>
            <p>SISTEM MANAGEMENT KEAMANAN JDC</p>
          </div>
        </div>

        <div className="sidebar-user glass-panel" onClick={() => setShowProfileModal(true)} style={{ cursor: 'pointer' }}>
          <img src={currentUser.avatar} alt={currentUser.nama} className="sidebar-avatar" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60'; }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentUser.nama}</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{currentUser.jabatan}</p>
          </div>
          <Mail size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, opacity: 0.6 }} />
        </div>

        <nav className="sidebar-nav">

          {/* GOD MODE — Admin Super: semua menu */}
          {isGodMode && (
            <>
              <button onClick={() => handleNavClick('dashboard')} className={`nav-tab-btn ${currentTab === 'dashboard' ? 'active' : ''}`}>
                <LayoutDashboard size={18} /> <span>Dashboard Utama</span>
              </button>
              <button onClick={() => handleNavClick('absensi')} className={`nav-tab-btn ${currentTab === 'absensi' ? 'active' : ''}`}>
                <ClipboardList size={18} /> <span>Absensi & Plotting</span>
              </button>
              <button onClick={() => handleNavClick('target-compliance')} className={`nav-tab-btn ${currentTab === 'target-compliance' ? 'active' : ''}`}>
                <Target size={18} /> <span>Dashboard Target</span>
              </button>
              <button onClick={() => handleNavClick('barcodes')} className={`nav-tab-btn ${currentTab === 'barcodes' ? 'active' : ''}`}>
                <QrCode size={18} /> <span>Master & Barcode QR</span>
              </button>
              <button onClick={() => handleNavClick('mutasi')} className={`nav-tab-btn ${currentTab === 'mutasi' ? 'active' : ''}`}>
                <BookOpen size={18} /> <span>Mutasi Penjagaan</span>
              </button>
              <button onClick={() => handleNavClick('reports')} className={`nav-tab-btn ${currentTab === 'reports' ? 'active' : ''}`}>
                <FileSpreadsheet size={18} /> <span>Laporan & Export</span>
              </button>
              <button onClick={() => handleNavClick('user-management')} className={`nav-tab-btn ${currentTab === 'user-management' ? 'active' : ''}`}>
                <Users size={18} /> <span>Management User</span>
              </button>
              <button onClick={() => handleNavClick('backup')} className={`nav-tab-btn ${currentTab === 'backup' ? 'active' : ''}`}>
                <Database size={18} /> <span>Backup & Restore</span>
              </button>
              <button onClick={() => handleNavClick('complaint')} className={`nav-tab-btn ${currentTab === 'complaint' ? 'active' : ''}`}>
                <MessageSquare size={18} /> <span>Komplain Masuk</span>
              </button>
              <button onClick={() => handleNavClick('guard-simulator')} className={`nav-tab-btn ${currentTab === 'guard-simulator' ? 'active' : ''}`}
                style={{ marginTop: '1.5rem', border: '1px dashed var(--color-primary-glow)', background: currentTab === 'guard-simulator' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.03)' }}>
                <Smartphone size={18} /> <span style={{ fontWeight: 600 }}>Simulasi HP Petugas</span>
              </button>
            </>
          )}

          {/* HIERARCHY ADMIN — Manajemen / SPV */}
          {isAdmin && !isClient && !isGodMode && (
            <>
              <button onClick={() => handleNavClick('dashboard')} className={`nav-tab-btn ${currentTab === 'dashboard' ? 'active' : ''}`}>
                <LayoutDashboard size={18} /> <span>Dashboard Management</span>
              </button>
              <button onClick={() => handleNavClick('absensi')} className={`nav-tab-btn ${currentTab === 'absensi' ? 'active' : ''}`}>
                <ClipboardList size={18} /> <span>Absensi & Plotting</span>
              </button>
              <button onClick={() => handleNavClick('target-compliance')} className={`nav-tab-btn ${currentTab === 'target-compliance' ? 'active' : ''}`}>
                <Target size={18} /> <span>Dashboard Target</span>
              </button>
              <button onClick={() => handleNavClick('barcodes')} className={`nav-tab-btn ${currentTab === 'barcodes' ? 'active' : ''}`}>
                <QrCode size={18} /> <span>Master & Barcode QR</span>
              </button>
              <button onClick={() => handleNavClick('mutasi')} className={`nav-tab-btn ${currentTab === 'mutasi' ? 'active' : ''}`}>
                <BookOpen size={18} /> <span>Mutasi Penjagaan</span>
              </button>
              <button onClick={() => handleNavClick('reports')} className={`nav-tab-btn ${currentTab === 'reports' ? 'active' : ''}`}>
                <FileSpreadsheet size={18} /> <span>Laporan & Export</span>
              </button>
              <button onClick={() => handleNavClick('complaint')} className={`nav-tab-btn ${currentTab === 'complaint' ? 'active' : ''}`}>
                <MessageSquare size={18} /> <span>Komplain Masuk</span>
              </button>
            </>
          )}

          {/* GUEST VIEWER */}
          {isClient && (
            <button onClick={() => handleNavClick('target-compliance')} className={`nav-tab-btn ${currentTab === 'target-compliance' ? 'active' : ''}`}>
              <Target size={18} /> <span>Dashboard Target SMPJDC</span>
            </button>
          )}

          {/* PATROL — Danru / Wadanru / Anggota */}
          {isPatrol && (
            <>
              {['Danru', 'Wadanru'].includes(currentUser.jabatan) && (
                <>
                  <button onClick={() => handleNavClick('absensi')} className={`nav-tab-btn ${currentTab === 'absensi' ? 'active' : ''}`}>
                    <ClipboardList size={18} /> <span>Absensi & Plotting</span>
                  </button>
                  <button onClick={() => handleNavClick('mutasi')} className={`nav-tab-btn ${currentTab === 'mutasi' ? 'active' : ''}`}>
                    <BookOpen size={18} /> <span>Mutasi Penjagaan</span>
                  </button>
                  <button onClick={() => handleNavClick('reports')} className={`nav-tab-btn ${currentTab === 'reports' ? 'active' : ''}`}>
                    <FileSpreadsheet size={18} /> <span>Laporan & Log Temuan</span>
                  </button>
                </>
              )}
              {['Danru', 'Wadanru', 'Anggota'].includes(currentUser.jabatan) && (
                <button onClick={() => handleNavClick('guard-simulator')} className={`nav-tab-btn ${currentTab === 'guard-simulator' ? 'active' : ''}`}
                  style={{ border: '1px dashed var(--color-primary-glow)', background: currentTab === 'guard-simulator' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.03)' }}>
                  <Smartphone size={18} /> <span style={{ fontWeight: 600 }}>Aplikasi Patroli</span>
                </button>
              )}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-info">
            <Building size={14} />
            <span>SMPJDC - Jakarta Design Center</span>
          </div>
          <button onClick={toggleTheme} className="theme-toggle-btn" title={`Mode ${theme === 'dark' ? 'Terang' : 'Gelap'}`}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>
          <div className="sidebar-footer-copy">
            © 2026 SMPJDC By_RichardMeha.
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="global-header">
          <div className="header-left">
            <div className="header-brand-row">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="menu-toggle-btn" aria-label="Toggle Sidebar">
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="header-logo-box">
                <img src="logo.png" alt="SMPJDC" className="logo-3d" />
              </div>
            </div>
            <div className="header-text-box">
              <h1 className="header-title">
                {currentTab === 'dashboard' && 'Dashboard Manajemen Keamanan'}
                {currentTab === 'absensi' && 'Absensi & Plotting Penjagaan'}
                {currentTab === 'target-compliance' && 'Dashboard Target & SLA'}
                {currentTab === 'barcodes' && 'Master Area & Barcode Generator'}
                {currentTab === 'mutasi' && 'Mutasi Penjagaan'}
                {currentTab === 'reports' && 'Laporan Patroli & Log Temuan'}
                {currentTab === 'guard-simulator' && (isGodMode ? 'Simulasi HP Petugas' : 'Aplikasi Patroli')}
                {currentTab === 'user-management' && 'Management User'}
                {currentTab === 'backup' && 'Backup & Restore Data'}
                {currentTab === 'lapor' && 'Lapor Cepat'}
                {currentTab === 'complaint' && 'Komplain Masuk & Management Tiket'}
              </h1>
              <p className="header-desc">
                {currentTab === 'dashboard' && 'Pemantauan real-time petugas, status area, dan statistik keamanan.'}
                {currentTab === 'absensi' && 'Input absensi harian regu dan plotting pos penugasan personil security.'}
                {currentTab === 'target-compliance' && 'Realisasi patroli, SLA penyelesaian kendala, dan target SMPJDC Tenant.'}
                {currentTab === 'barcodes' && 'Daftar master area SMPJDC, cetak barcode QR, dan generate massal.'}
                {currentTab === 'mutasi' && 'Catatan serah terima shift, informasi, dan kejadian antar petugas.'}
                {currentTab === 'reports' && 'Filter laporan patroli harian/shift, ekspor ke PDF/Excel, dan follow-up temuan.'}
                {currentTab === 'guard-simulator' && (isGodMode ? 'Uji coba alur patroli petugas security menggunakan HP virtual.' : 'Aplikasi patroli untuk scan barcode, laporan temuan, dan catatan mutasi.')}
                {currentTab === 'user-management' && 'Kelola user, tambah anggota baru, atur role dan akses sistem.'}
                {currentTab === 'backup' && 'Ekspor dan impor seluruh data sistem untuk keamanan data.'}
                {currentTab === 'lapor' && 'Form pengisian laporan cepat patroli dan mutasi kejadian.'}
                {currentTab === 'complaint' && 'Kelola komplain masuk dari tenant/pelanggan, disposisi ke departemen, dan pantau status tiket.'}
              </p>
            </div>
          </div>

          <div className="header-right">
            <div className="header-user-badge">
              <Shield size={14} />
              <span>{currentUser.nama} ({jabatanShort[currentUser.jabatan] || currentUser.jabatan})</span>
            </div>
            <button onClick={handleLogout} className="btn-logout" title="Logout">
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </header>

        <div className="animate-slide-up">
          {currentTab === 'dashboard' && (isGodMode || (isAdmin && !isClient)) && (
            <ManagementDashboard reports={reports} findings={findings} areas={areas} users={users} attendanceLogs={attendanceLogs} mutasiLogs={mutasiLogs} complaints={complaints} onUpdateStatus={updateFindingStatus} onDispatchFinding={dispatchFinding} onUpdateComplaint={handleUpdateComplaint} />
          )}

          {currentTab === 'absensi' && (isGodMode || isAdmin || ['Danru', 'Wadanru'].includes(currentUser.jabatan)) && (
            <AbsensiRegu 
              users={users} 
              areas={areas} 
              attendanceLogs={attendanceLogs} 
              onAddAttendance={(newAttendance) => {
                const id = `att-${Date.now()}`;
                setAttendanceLogs(prev => {
                  const existingIndex = prev.findIndex(
                    l => l.tanggal === newAttendance.tanggal && l.regu === newAttendance.regu && l.shift === newAttendance.shift
                  );
                  if (existingIndex > -1) {
                    const updated = [...prev];
                    updated[existingIndex] = { id: prev[existingIndex].id, ...newAttendance };
                    addToast(`Absensi ${newAttendance.regu} (${newAttendance.tanggal}) berhasil diperbarui`, 'success');
                    const fbId = prev[existingIndex].firebaseId;
                    if (fbId) {
                      updateAttendanceLogInFirestore(fbId, newAttendance);
                    }
                    return updated;
                  } else {
                    const entry = { id, ...newAttendance };
                    addAttendanceLogToFirestore(entry).then(firebaseId => {
                      if (firebaseId) {
                        setAttendanceLogs(prev => prev.map(a =>
                          a.id === id ? { ...a, firebaseId } : a
                        ));
                      }
                    });
                    addToast(`Absensi ${newAttendance.regu} (${newAttendance.tanggal}) berhasil disimpan`, 'success');
                    return [...prev, entry];
                  }
                });
              }} 
            />
          )}

          {currentTab === 'target-compliance' && (
            <TargetDashboard reports={reports} findings={findings} areas={areas} currentUser={currentUser} isClient={isClient} />
          )}

          {currentTab === 'barcodes' && (isGodMode || (isAdmin && !isClient)) && (
            <BarcodeGenerator areas={areas} onAddArea={handleAddArea} users={users} onAddUser={handleAddUser} addToast={addToast} />
          )}

          {currentTab === 'mutasi' && (isGodMode || (isAdmin && !isClient) || ['Danru', 'Wadanru'].includes(currentUser?.jabatan)) && (
            <MutasiPenjagaan currentUser={currentUser} logs={mutasiLogs} onAddLog={handleAddMutasi} onDeleteLog={handleDeleteMutasi} areas={areas} />
          )}

          {currentTab === 'reports' && (isGodMode || (isAdmin && !isClient) || ['Danru', 'Wadanru'].includes(currentUser?.jabatan)) && (
            <ReportsExport reports={reports} findings={findings} users={users} onUpdateFindingStatus={updateFindingStatus} onDispatchFinding={dispatchFinding} />
          )}

          {currentTab === 'guard-simulator' && currentUser && (isGodMode || ['Danru', 'Wadanru', 'Anggota'].includes(currentUser.jabatan)) && (
            <div className="mobile-simulator-container">
              <SecurityPatrolApp currentUser={currentUser} areas={areas} attendanceLogs={attendanceLogs} reports={reports} findings={findings} mutasiLogs={mutasiLogs} onAddReport={handleAddReport} onAddLog={handleAddMutasi} onTriggerSOS={triggerSOS} />
            </div>
          )}

          {currentTab === 'user-management' && isSuperAdmin && (
            <UserManagement users={users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} />
          )}

          {currentTab === 'backup' && isSuperAdmin && (
            <div style={{ padding: '1rem 0' }}>
              <BackupRestore addToast={addToast} onResetUsers={handleResetUsers} onClearAllData={handleClearAllData} />
            </div>
          )}

          {currentTab === 'lapor' && isPatrol && (
            <LaporForm currentUser={currentUser} areas={areas} onAddReport={handleAddReport} onAddLog={handleAddMutasi} />
          )}

          {currentTab === 'complaint' && (isGodMode || (isAdmin && !isClient)) && (
            <ComplaintAdmin complaints={complaints} onUpdateComplaint={handleUpdateComplaint} />
          )}

          <footer className="app-footer">
            <span>© 2026 <strong className="text-primary">SMPJDC</strong>. Hak Cipta Dilindungi.</span>
            <span>Developer: <strong>By_RichardMeha</strong></span>
          </footer>
        </div>
      </main>

      <BottomNav
        currentTab={currentTab}
        onNavClick={handleNavClick}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        user={currentUser}
      />

      {activeSOS && (
        <div className="panic-overlay">
          <div className="panic-card">
            <div className="panic-sos-icon">SOS</div>
            <h2 style={{ color: 'var(--color-danger)', fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>DARURAT / EMERGENCY!</h2>
            <p style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 500 }}>
              Petugas <span style={{ textDecoration: 'underline', fontWeight: 700 }}>{activeSOS.officer}</span> menekan Tombol SOS Panic!
            </p>
            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', textAlign: 'left', background: 'rgba(239, 68, 68, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Lokasi Kejadian:</span>
                <span style={{ fontWeight: 700 }}>{activeSOS.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Waktu Kejadian:</span>
                <span style={{ fontWeight: 700 }}>{activeSOS.time} WIB</span>
              </div>
            </div>
            <button onClick={clearSOS} className="btn-danger" style={{ width: '100%', padding: '1rem' }}>
              Matikan Alarm & Tanggapi Kejadian
            </button>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="panic-overlay" style={{ zIndex: 10000 }}>
          <div className="panic-card" style={{ maxWidth: '360px', width: '90%', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--border-radius-lg)' }}>
            <div className="panic-sos-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
              <Shield size={32} />
            </div>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 800 }}>Keluar dari Aplikasi?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Apakah Anda yakin ingin menutup aplikasi patroli SMPJDC?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleExitApp} className="btn-danger" style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem', fontWeight: 700 }}>
                Ya, Keluar
              </button>
              <button onClick={handleCancelExit} className="btn-secondary" style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem', fontWeight: 700 }}>
                Tidak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile & Email Reset Modal */}
      {showProfileModal && (
        <div className="sidebar-overlay" onClick={() => { setShowProfileModal(false); setVerifStep('idle'); setVerifError(''); }} style={{ zIndex: 200 }}>
          <div className="panic-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px', width: '90%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--border-radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                <Shield size={20} className="text-primary" /> Pengaturan Profil
              </h3>
              <button onClick={() => { setShowProfileModal(false); setVerifStep('idle'); setVerifError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', whiteSpace: 'nowrap' }} className="filter-tabs-wrap">
              <button onClick={() => { setActiveProfileTab('info'); setProfileError(''); setProfileSuccess(''); }} style={{ background: activeProfileTab === 'info' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', border: 'none', color: activeProfileTab === 'info' ? 'var(--color-primary)' : 'var(--text-secondary)', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Informasi</button>
              <button onClick={() => { setActiveProfileTab('photo'); setProfileError(''); setProfileSuccess(''); }} style={{ background: activeProfileTab === 'photo' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', border: 'none', color: activeProfileTab === 'photo' ? 'var(--color-primary)' : 'var(--text-secondary)', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Foto Profil</button>
              <button onClick={() => { setActiveProfileTab('pin'); setProfileError(''); setProfileSuccess(''); }} style={{ background: activeProfileTab === 'pin' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', border: 'none', color: activeProfileTab === 'pin' ? 'var(--color-primary)' : 'var(--text-secondary)', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>PIN Keamanan</button>
              <button onClick={() => { setActiveProfileTab('email'); setProfileError(''); setProfileSuccess(''); }} style={{ background: activeProfileTab === 'email' ? 'rgba(59, 130, 246, 0.15)' : 'transparent', border: 'none', color: activeProfileTab === 'email' ? 'var(--color-primary)' : 'var(--text-secondary)', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Verifikasi Email</button>
            </div>

            {/* Profile Notifications */}
            {profileError && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.15)', marginBottom: '1rem', textAlign: 'left' }}>
                ⚠️ {profileError}
              </div>
            )}
            {profileSuccess && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.15)', marginBottom: '1rem', textAlign: 'left' }}>
                ✅ {profileSuccess}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Tab: Info */}
              {activeProfileTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-glass)' }}>
                    <img src={currentUser.avatar} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop'; }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{currentUser.nama}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{currentUser.jabatan}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>NRP: {currentUser.nrp} • Regu: {currentUser.regu || '-'}</div>
                    </div>
                  </div>
                  
                  <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Status Akun:</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>AKTIF / SECURE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Email Terdaftar:</span>
                      <span style={{ fontWeight: 600 }}>{currentUser.email || '(Belum disinkronkan)'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Sumber Sesi:</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.firebaseId ? `Cloud (FB-${currentUser.firebaseId.slice(0,6)})` : 'Local Storage'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Photo */}
              {activeProfileTab === 'photo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '0.5rem' }}>
                    <img src={tempAvatar} alt="Preview Avatar" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop'; }} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Preview Foto Profil</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label className="photo-upload-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px dashed var(--color-primary)', background: 'rgba(59, 130, 246, 0.05)', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
                      <Camera size={16} /> Ambil / Upload Foto Baru
                      <input type="file" accept="image/*" onChange={e => {
                        const f = e.target.files[0];
                        if (f) {
                          const r = new FileReader();
                          r.onloadend = () => {
                            compressImage(r.result, 400, 400, 0.6).then(compressed => setTempAvatar(compressed));
                          };
                          r.readAsDataURL(f);
                        }
                        e.target.value = '';
                      }} hidden />
                    </label>

                    {/* Presets Grid */}
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Atau Pilih Avatar Default:</span>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                        {[
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop',
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop',
                          'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&fit=crop',
                          'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&fit=crop',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop'
                        ].map((url, idx) => (
                          <img 
                            key={idx} 
                            src={url} 
                            alt="" 
                            onClick={() => setTempAvatar(url)}
                            style={{ 
                              width: '42px', 
                              height: '42px', 
                              borderRadius: '50%', 
                              objectFit: 'cover', 
                              cursor: 'pointer', 
                              border: tempAvatar === url ? '3.5px solid var(--color-primary)' : '2px solid transparent',
                              transition: 'all 0.2s',
                              opacity: tempAvatar === url ? 1 : 0.75
                            }} 
                          />
                        ))}
                      </div>
                    </div>

                    <button onClick={handleUpdateAvatar} className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.5rem' }}>
                      Simpan Foto Profil
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: PIN */}
              {activeProfileTab === 'pin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="form-field">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Lock size={12} /> PIN Keamanan Saat Ini</label>
                    <input 
                      type="password" 
                      value={currentPin} 
                      onChange={e => setCurrentPin(e.target.value.slice(0, 12))} 
                      placeholder="Masukkan PIN saat ini" 
                      className="modern-input" 
                      style={{ fontSize: '0.82rem' }} 
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Lock size={12} /> PIN Baru</label>
                    <input 
                      type="password" 
                      value={newPin} 
                      onChange={e => setNewPin(e.target.value.slice(0, 12))} 
                      placeholder="Masukkan PIN baru" 
                      className="modern-input" 
                      style={{ fontSize: '0.82rem' }} 
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Lock size={12} /> Konfirmasi PIN Baru</label>
                    <input 
                      type="password" 
                      value={confirmPin} 
                      onChange={e => setConfirmPin(e.target.value.slice(0, 12))} 
                      placeholder="Ulangi PIN baru" 
                      className="modern-input" 
                      style={{ fontSize: '0.82rem' }} 
                    />
                  </div>

                  <button onClick={handleUpdatePin} className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.5rem' }}>
                    Perbarui PIN Keamanan
                  </button>
                </div>
              )}

              {/* Tab: Email */}
              {activeProfileTab === 'email' && (
                <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.01)', border: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Mail size={16} className="text-primary" />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Email & Verifikasi</span>
                  </div>

                  {verifStep === 'idle' && (
                    <>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        Email saat ini: <strong style={{ color: 'var(--text-primary)' }}>{currentUser.email || '(belum diatur)'}</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Masukkan email baru" className="modern-input" style={{ fontSize: '0.82rem' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={handleSendVerification} className="btn-primary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                            <Key size={14} /> Kirim Kode Verifikasi
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {verifStep === 'verify' && (
                    <>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        Kode verifikasi telah dikirim ke <strong>{verifMethod === 'email' ? newEmail : 'WhatsApp'}</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input type="text" value={verifCode} onChange={e => setVerifCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Masukkan kode 6 digit" className="modern-input" style={{ fontSize: '1.1rem', textAlign: 'center', letterSpacing: '0.3em', fontWeight: 700 }} maxLength={6} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={handleVerifyCode} className="btn-primary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                            <Check size={14} /> Verifikasi & Simpan
                          </button>
                        </div>
                        <button onClick={() => { setVerifStep('idle'); setVerifError(''); setVerifCode(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: '0.25rem' }}>← Kembali</button>
                      </div>
                    </>
                  )}

                  {verifStep === 'done' && (
                    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Email Berhasil Diperbarui!</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email baru: <strong style={{ color: 'var(--color-primary)' }}>{newEmail}</strong></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="glass-panel toast-item" style={{
            borderLeft: `4px solid ${
              t.type === 'success' ? 'var(--color-success)' : 
              t.type === 'danger' ? 'var(--color-danger)' : 
              t.type === 'warning' ? 'var(--color-warning)' : 'var(--color-primary)'
            }`
          }}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
