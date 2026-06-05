import React, { useState, useEffect, useRef } from 'react';
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
  UserPlus,
  Users
} from 'lucide-react';
import ManagementDashboard from './components/ManagementDashboard';
import SecurityPatrolApp from './components/SecurityPatrolApp';
import BarcodeGenerator from './components/BarcodeGenerator';
import ReportsExport from './components/ReportsExport';
import TargetDashboard from './components/TargetDashboard';
import LoginPage from './components/LoginPage';
import MutasiPenjagaan from './components/MutasiPenjagaan';
import UserManagement from './components/UserManagement';

const INITIAL_USERS = [];
const DB_VERSION_KEY = 'smpjdc_db_version';
const CURRENT_DB_VERSION = '2.5-rileas';

const SEED_USERS = [
  { id: 1, nama: 'Richard', nrp: '10001', jabatan: 'Admin Super', regu: '-', pin: '@Meha1122', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop' },
  { id: 2, nama: 'Pak Kusnan', nrp: '10002', jabatan: 'Manajemen', regu: '-', pin: '0002', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop' },
  { id: 3, nama: 'Agus Siraitin', nrp: '10003', jabatan: 'SPV', regu: '-', pin: '0003', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop' },
  { id: 4, nama: 'Wahyudi', nrp: '20001', jabatan: 'Danru', regu: 'Regu A', pin: '0001', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&fit=crop' },
  { id: 5, nama: 'Faizal Tanjung', nrp: '20002', jabatan: 'Wadanru', regu: 'Regu A', pin: '0002', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&fit=crop' },
  { id: 6, nama: 'Agus Hendraya', nrp: '20003', jabatan: 'Danru', regu: 'Regu B', pin: '0003', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&fit=crop' },
  { id: 7, nama: 'Suparlan', nrp: '20004', jabatan: 'Wadanru', regu: 'Regu B', pin: '0004', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&fit=crop' },
  { id: 8, nama: 'Sutrijono', nrp: '20005', jabatan: 'Danru', regu: 'Regu C', pin: '0005', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop' },
  { id: 9, nama: 'Dedy K', nrp: '20006', jabatan: 'Wadanru', regu: 'Regu C', pin: '0006', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop' },
  { id: 10, nama: 'M. Iqbal', nrp: '20007', jabatan: 'Danru', regu: 'Regu D', pin: '0007', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&fit=crop' },
  { id: 11, nama: 'Dimas Pratama Putra', nrp: '20008', jabatan: 'Wadanru', regu: 'Regu D', pin: '0008', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&fit=crop' },
];

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

export default function App() {
  const [authenticated, setAuthenticated] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasUsers, setHasUsers] = useState(true);
  const [showSplash, setShowSplash] = useState(false);
  const [cyberLogs, setCyberLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('BOOTING...');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSOS, setActiveSOS] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [sosAudio, setSosAudio] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('sapujagat_users');
    const users = stored ? JSON.parse(stored) : null;
    const hasExistingUsers = Array.isArray(users) && users.length > 0;
    setHasUsers(hasExistingUsers);

    const session = localStorage.getItem('smpjdc_session');
    if (session) {
      try {
        const { userId } = JSON.parse(session);
        const userList = hasExistingUsers ? users : [];
        const found = userList.find(u => u.id === userId);
        if (found) {
          setCurrentUser(found);
          setAuthenticated(true);
          setShowSplash(true);
          return;
        }
      } catch (e) {}
    }
    setAuthenticated(false);
  }, []);

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

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('sapujagat_users');
      const parsed = saved ? JSON.parse(saved) : null;
      const dbVersion = localStorage.getItem(DB_VERSION_KEY);

      if (Array.isArray(parsed) && parsed.length > 0 && dbVersion === CURRENT_DB_VERSION) {
        return parsed;
      }

      // Version mismatch — merge seed users into existing, don't wipe UI-added users
      const existingMap = {};
      if (Array.isArray(parsed)) {
        parsed.forEach(u => { existingMap[u.nrp] = u; });
      }

      SEED_USERS.forEach(su => {
        if (existingMap[su.nrp]) {
          existingMap[su.nrp] = { ...existingMap[su.nrp], ...su };
        } else {
          existingMap[su.nrp] = su;
        }
        localStorage.setItem(`smpjdc_pin_${su.id}`, su.pin);
      });

      const merged = Object.values(existingMap);
      localStorage.setItem('sapujagat_users', JSON.stringify(merged));
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

      // Merge INITIAL_AREAS into existing, update by id
      const existingMap = {};
      if (Array.isArray(parsed)) {
        parsed.forEach(a => { existingMap[a.id] = a; });
      }

      INITIAL_AREAS.forEach(sa => {
        existingMap[sa.id] = sa; // seed areas always win (schema changes)
      });

      const merged = Object.values(existingMap);
      localStorage.setItem('sapujagat_areas', JSON.stringify(merged));
      localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
      return merged;
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
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FINDINGS;
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

  useEffect(() => {
    localStorage.setItem('sapujagat_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sapujagat_areas', JSON.stringify(areas));
  }, [areas]);

  useEffect(() => {
    localStorage.setItem('sapujagat_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('sapujagat_findings', JSON.stringify(findings));
  }, [findings]);

  useEffect(() => {
    localStorage.setItem('smpjdc_mutasi_logs', JSON.stringify(mutasiLogs));
  }, [mutasiLogs]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const playSOSSiren = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.5);
      osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 1.0);
      osc.loop = true;
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      return { osc, gain, audioCtx };
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

  const clearSOS = () => {
    if (sosAudio) {
      try {
        sosAudio.osc.stop();
        sosAudio.audioCtx.close();
      } catch (e) {}
      setSosAudio(null);
    }
    setActiveSOS(null);
  };

  const handleAddReport = (newReport) => {
    const reportId = `rep-${Math.floor(1000 + Math.random() * 9000)}`;
    const reportData = { id: reportId, ...newReport };
    setReports(prev => [reportData, ...prev]);
    addToast(`Patroli sukses disubmit di ${newReport.titik} (${newReport.kondisi})`, 'success');

    if (newReport.kondisi !== 'Aman dan Kondusif' && newReport.kondisi !== 'Ada Aktivitas' && newReport.kondisi !== 'Renovasi') {
      const findingId = `find-${Math.floor(1000 + Math.random() * 9000)}`;
      setFindings(prev => [{
        id: findingId,
        reportId,
        kategori: newReport.kondisi,
        area: `${newReport.gedung} Lt.${newReport.lantai} ${newReport.zona} - ${newReport.titik}`,
        tanggal: newReport.timestamp,
        pelapor: newReport.userName,
        status: 'Open',
        severity: newReport.severity || 'Rendah',
        detail: newReport.keterangan || `Ditemukan kondisi ${newReport.kondisi}`,
        foto: newReport.foto
      }, ...prev]);
      addToast(`⚠️ Tiket temuan otomatis dibuat [Severity: ${newReport.severity || 'Rendah'}]`, 'warning');
    }
  };

  const updateFindingStatus = (findingId, newStatus) => {
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        addToast(`Status temuan ${f.kategori} diubah ke ${newStatus}`, 'info');
        return { ...f, status: newStatus };
      }
      return f;
    }));
  };

  const handleAddMutasi = (log) => {
    const id = `mut-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setMutasiLogs(prev => [{ id, ...log }, ...prev]);
    addToast('Catatan mutasi berhasil disimpan', 'success');
  };

  const handleDeleteMutasi = (id) => {
    setMutasiLogs(prev => prev.filter(l => l.id !== id));
    addToast('Catatan mutasi dihapus', 'info');
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
      ...newUser,
      avatar: newUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60'
    };
    setUsers(prev => [...prev, userData]);
    if (newUser.pin) {
      localStorage.setItem(`smpjdc_pin_${userId}`, newUser.pin);
    }
    addToast(`Anggota baru ${newUser.nama} (${newUser.jabatan}) berhasil didaftarkan!`, 'success');
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setAuthenticated(true);
    setShowSplash(true);
    setCurrentTab(['Danru', 'Wadanru', 'Anggota'].includes(user.jabatan) ? 'guard-simulator' : 'dashboard');
  };

  const handleSetup = (user) => {
    setCurrentUser(user);
    setAuthenticated(true);
    setShowSplash(true);
    setHasUsers(true);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('smpjdc_session');
    setAuthenticated(false);
    setCurrentUser(null);
    setShowSplash(false);
    addToast('Anda telah logout', 'info');
  };

  const handleNavClick = (tabName) => {
    setCurrentTab(tabName);
    setIsSidebarOpen(false);
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
            <img src="logo.png" alt="SMPJDC" className="splash-logo cyber-logo" />
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
    <div className="dashboard-layout">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo-box">
            <img src="logo.png" alt="SMPJDC" />
          </div>
          <div>
            <h2>SMPJDC<span className="text-primary"> JDC</span></h2>
            <p>SISTEM MANAGEMENT KEAMANAN JDC</p>
          </div>
        </div>

        <div className="sidebar-user glass-panel">
          <img src={currentUser.avatar} alt={currentUser.nama} className="sidebar-avatar" />
          <div>
            <h4>{currentUser.nama}</h4>
            <p>{currentUser.jabatan}</p>
          </div>
        </div>

        <nav className="sidebar-nav">

          {/* GOD MODE — Admin Super: semua menu */}
          {isGodMode && (
            <>
              <button onClick={() => handleNavClick('dashboard')} className={`nav-tab-btn ${currentTab === 'dashboard' ? 'active' : ''}`}>
                <LayoutDashboard size={18} /> <span>Dashboard Admin</span>
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
                <LayoutDashboard size={18} /> <span>Dashboard Admin</span>
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
              <button onClick={() => handleNavClick('guard-simulator')} className={`nav-tab-btn ${currentTab === 'guard-simulator' ? 'active' : ''}`}
                style={{ marginTop: '1.5rem', border: '1px dashed var(--color-primary-glow)', background: currentTab === 'guard-simulator' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.03)' }}>
                <Smartphone size={18} /> <span style={{ fontWeight: 600 }}>Simulasi HP Petugas</span>
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
            <button onClick={() => handleNavClick('guard-simulator')} className={`nav-tab-btn ${currentTab === 'guard-simulator' ? 'active' : ''}`}
              style={{ border: '1px dashed var(--color-primary-glow)', background: currentTab === 'guard-simulator' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.03)' }}>
              <Smartphone size={18} /> <span style={{ fontWeight: 600 }}>Aplikasi Patroli</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-info">
            <Building size={14} />
            <span>SMPJDC - Jakarta Design Center</span>
          </div>
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
                <img src="logo.png" alt="SMPJDC" />
              </div>
            </div>
            <div className="header-text-box">
              <h1 className="header-title">
                {currentTab === 'dashboard' && 'Dashboard Manajemen Keamanan'}
                {currentTab === 'target-compliance' && 'Dashboard Target & SLA'}
                {currentTab === 'barcodes' && 'Master Area & Barcode Generator'}
                {currentTab === 'mutasi' && 'Mutasi Penjagaan'}
                {currentTab === 'reports' && 'Laporan Patroli & Log Temuan'}
                {currentTab === 'guard-simulator' && (isPatrol ? 'Aplikasi Patroli Anggota' : 'Simulasi HP Petugas')}
                {currentTab === 'user-management' && 'Management User'}
              </h1>
              <p className="header-desc">
                {currentTab === 'dashboard' && 'Pemantauan real-time petugas, status area, dan statistik keamanan.'}
                {currentTab === 'target-compliance' && 'Realisasi patroli, SLA penyelesaian kendala, dan target SMPJDC Tenant.'}
                {currentTab === 'barcodes' && 'Daftar master area SMPJDC, cetak barcode QR, dan generate massal.'}
                {currentTab === 'mutasi' && 'Catatan serah terima shift, informasi, dan kejadian antar petugas.'}
                {currentTab === 'reports' && 'Filter laporan patroli harian/shift, ekspor ke PDF/Excel, dan follow-up temuan.'}
                {currentTab === 'guard-simulator' && (isPatrol ? 'Aplikasi patroli untuk mencatat scan checkpoint dan laporan temuan.' : 'Uji coba alur patroli petugas security menggunakan HP virtual.')}
                {currentTab === 'user-management' && 'Kelola user, tambah anggota baru, atur role dan akses sistem.'}
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
            <ManagementDashboard reports={reports} findings={findings} areas={areas} users={users} onUpdateStatus={updateFindingStatus} />
          )}

          {currentTab === 'target-compliance' && (
            <TargetDashboard reports={reports} findings={findings} areas={areas} currentUser={currentUser} isClient={isClient} />
          )}

          {currentTab === 'barcodes' && (isGodMode || (isAdmin && !isClient)) && (
            <BarcodeGenerator areas={areas} onAddArea={handleAddArea} users={users} onAddUser={handleAddUser} />
          )}

          {currentTab === 'mutasi' && (isGodMode || (isAdmin && !isClient)) && (
            <MutasiPenjagaan currentUser={currentUser} logs={mutasiLogs} onAddLog={handleAddMutasi} onDeleteLog={handleDeleteMutasi} areas={areas} />
          )}

          {currentTab === 'reports' && (isGodMode || (isAdmin && !isClient)) && (
            <ReportsExport reports={reports} findings={findings} users={users} onUpdateFindingStatus={updateFindingStatus} />
          )}

          {currentTab === 'guard-simulator' && currentUser && (
            <div className="mobile-simulator-container">
              <SecurityPatrolApp currentUser={currentUser} areas={areas} onAddReport={handleAddReport} onTriggerSOS={triggerSOS} />
            </div>
          )}

          {currentTab === 'user-management' && isSuperAdmin && (
            <UserManagement users={users} onAddUser={handleAddUser} />
          )}

          <footer className="app-footer">
            <span>© 2026 <strong className="text-primary">SMPJDC</strong>. Hak Cipta Dilindungi.</span>
            <span>Developer: <strong>By_RichardMeha</strong></span>
          </footer>
        </div>
      </main>

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

      <style>{`
        .nav-tab-btn {
          display: flex; align-items: center; gap: 0.75rem; width: 100%;
          background: transparent; border: none; color: var(--text-secondary);
          padding: 0.8rem 1rem; border-radius: var(--border-radius-sm);
          cursor: pointer; font-family: var(--font-sans); font-weight: 500;
          font-size: 0.9rem; text-align: left; transition: var(--transition-smooth);
        }
        .nav-tab-btn:hover { background: rgba(255, 255, 255, 0.05); color: var(--text-primary); }
        .nav-tab-btn.active { background: rgba(59, 130, 246, 0.15); color: var(--color-primary); font-weight: 600; }
        .text-primary { color: var(--color-primary); }
        .sidebar-brand {
          display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem;
        }
        .sidebar-logo-box {
          background: rgba(255, 255, 255, 0.05); padding: 0.35rem 0.5rem;
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--border-glass);
        }
        .sidebar-logo-box img { height: 28px; width: auto; object-fit: contain; }
        .sidebar-brand h2 { font-size: 1.2rem; font-weight: 800; letter-spacing: 0.05em; }
        .sidebar-brand p { font-size: 0.65rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
        .sidebar-user { padding: 0.8rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
        .sidebar-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-primary); }
        .sidebar-user h4 { font-size: 0.85rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
        .sidebar-user p { font-size: 0.7rem; color: var(--text-secondary); }
        .sidebar-nav { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .sidebar-footer { padding: 0.75rem 0; border-top: 1px solid var(--border-glass); display: flex; flex-direction: column; gap: 0.3rem; }
        .sidebar-footer-info { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-muted); }
        .sidebar-footer-copy { font-size: 0.65rem; color: var(--text-muted); opacity: 0.7; }
        .header-user-badge {
          display: flex; align-items: center; gap: 0.4rem;
          background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 0.4rem 0.8rem; border-radius: 8px;
          font-size: 0.75rem; color: var(--color-primary); font-weight: 600;
        }
        .btn-logout {
          display: flex; align-items: center; gap: 0.4rem;
          background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--color-danger); padding: 0.4rem 0.8rem;
          border-radius: 8px; cursor: pointer; font-size: 0.75rem;
          font-weight: 600; font-family: var(--font-sans);
          transition: var(--transition-smooth); white-space: nowrap;
        }
        .btn-logout:hover { background: rgba(239, 68, 68, 0.2); }
        .app-footer {
          margin-top: 3rem; padding-top: 1.5rem;
          border-top: 1px solid var(--border-glass);
          text-align: center; font-size: 0.8rem; color: var(--text-secondary);
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 1rem;
        }
        .toast-container {
          position: fixed; bottom: 20px; right: 20px;
          z-index: 1000; display: flex; flex-direction: column; gap: 0.5rem;
        }
        .toast-item {
          padding: 0.8rem 1.2rem; font-size: 0.85rem;
          display: flex; align-items: center; gap: 0.5rem;
          animation: slide-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
