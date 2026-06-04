import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Shield, 
  QrCode, 
  FileSpreadsheet, 
  AlertTriangle, 
  PhoneCall, 
  Smartphone, 
  User, 
  Building,
  Target,
  LogOut,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import ManagementDashboard from './components/ManagementDashboard';
import SecurityPatrolApp from './components/SecurityPatrolApp';
import BarcodeGenerator from './components/BarcodeGenerator';
import ReportsExport from './components/ReportsExport';
import TargetDashboard from './components/TargetDashboard';

// Mock Initial Data for Database tables
const INITIAL_USERS = [
  { id: 1, nama: 'Budi Santoso', nrp: '10001', jabatan: 'Super Admin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=60' },
  { id: 2, nama: 'Hendra Wijaya', nrp: '10002', jabatan: 'Manager Security', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60' },
  { id: 3, nama: 'Joko Susilo', nrp: '10003', jabatan: 'Chief Security', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60' },
  { id: 4, nama: 'Agus Prayitno', nrp: '10004', jabatan: 'Supervisor', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=60' },
  { id: 5, nama: 'Pak Iwan', nrp: '10005', jabatan: 'Client (View Only)', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop&q=60' },
  { id: 6, nama: 'Ahmad Rafli', nrp: '20001', jabatan: 'Petugas Security', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=60' },
  { id: 7, nama: 'Candra Hermawan', nrp: '20002', jabatan: 'Petugas Security', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=60' }
];

const INITIAL_AREAS = [
  // Basement B1
  { id: 'b1-zona-a', gedung: 'JDC', lantai: 'B1', zona: 'Zona A', titik: 'Parkir VIP', qrCode: 'JDC-LTB1-ZONA-A-PARKIR-VIP' },
  { id: 'b1-zona-b', gedung: 'JDC', lantai: 'B1', zona: 'Zona B', titik: 'Parkir Motor', qrCode: 'JDC-LTB1-ZONA-B-PARKIR-MOTOR' },
  { id: 'b1-zona-c', gedung: 'JDC', lantai: 'B1', zona: 'Zona C', titik: 'Parkir Mobil', qrCode: 'JDC-LTB1-ZONA-C-PARKIR-MOBIL' },
  // Lantai 1
  { id: 'l1-lobby', gedung: 'JDC', lantai: '1', zona: 'Lobby Utama', titik: 'Meja Resepsionis', qrCode: 'JDC-LT01-LOBBY-UTAMA' },
  { id: 'l1-lift-a', gedung: 'JDC', lantai: '1', zona: 'Zona A', titik: 'Lift A & B', qrCode: 'JDC-LT01-ZONA-A-LIFT-AB' },
  { id: 'l1-toilet', gedung: 'JDC', lantai: '1', zona: 'Zona B', titik: 'Toilet & Mushola', qrCode: 'JDC-LT01-ZONA-B-TOILET-MUSHOLA' },
  // Lantai 2 to 6
  { id: 'l2-zona-a', gedung: 'JDC', lantai: '2', zona: 'Zona A', titik: 'Koridor Barat Lt.2', qrCode: 'JDC-LT02-ZONA-A-KORIDOR' },
  { id: 'l3-zona-a', gedung: 'JDC', lantai: '3', zona: 'Zona A', titik: 'Koridor Barat Lt.3', qrCode: 'JDC-LT03-ZONA-A-KORIDOR' },
  { id: 'l4-zona-a', gedung: 'JDC', lantai: '4', zona: 'Zona A', titik: 'Koridor Barat Lt.4', qrCode: 'JDC-LT04-ZONA-A-KORIDOR' },
  { id: 'l5-zona-a', gedung: 'JDC', lantai: '5', zona: 'Zona A', titik: 'Koridor Barat Lt.5', qrCode: 'JDC-LT05-ZONA-A-KORIDOR' },
  { id: 'l6-zona-a', gedung: 'JDC', lantai: '6', zona: 'Zona A', titik: 'Koridor Barat Lt.6', qrCode: 'JDC-LT06-ZONA-A-KORIDOR' },
  // Lantai 7 (Top floor server and lifts)
  { id: 'l7-zona-a', gedung: 'JDC', lantai: '7', zona: 'Zona A', titik: 'Koridor Utama Lt.7', qrCode: 'JDC-LT07-ZONA-A-KORIDOR-UTAMA' },
  { id: 'l7-lift-timur', gedung: 'JDC', lantai: '7', zona: 'Zona B', titik: 'Lift Timur', qrCode: 'JDC-LT07-ZONA-B-LIFT-TIMUR' },
  { id: 'l7-zona-c', gedung: 'JDC', lantai: '7', zona: 'Zona C', titik: 'Ruang Server Tenant', qrCode: 'JDC-LT07-ZONA-C-RUANG-SERVER' },
  // Area Luar
  { id: 'ext-front', gedung: 'JDC', lantai: 'Outdoor', zona: 'Front Area', titik: 'Drop Off Utama', qrCode: 'JDC-LTEXT-FRONT-DROP-OFF' },
  { id: 'ext-rear', gedung: 'JDC', lantai: 'Outdoor', zona: 'Rear Area', titik: 'Loading Dock', qrCode: 'JDC-LTEXT-REAR-LOADING-DOCK' },
  { id: 'ext-taxi', gedung: 'JDC', lantai: 'Outdoor', zona: 'Drop Off', titik: 'Pangkalan Taxi', qrCode: 'JDC-LTEXT-DROP-OFF-TAXI' }
];

const INITIAL_REPORTS = [
  {
    id: 'rep-001',
    timestamp: '2026-06-04T08:15:00Z',
    timestampEnd: '2026-06-04T08:16:10Z',
    userId: 6,
    userName: 'Ahmad Rafli',
    areaId: 'l1-lobby',
    gedung: 'JDC',
    lantai: '1',
    zona: 'Lobby Utama',
    titik: 'Meja Resepsionis',
    shift: 'Pagi',
    kondisi: 'Aman dan Kondusif',
    keterangan: 'Kondisi lobby aman, situasi kondusif, pengunjung normal.',
    foto: null,
    antiFraud: {
      gpsValid: true,
      gpsCoords: { lat: -6.2146, lng: 106.8012 },
      radius: 12,
      dynamicToken: 'TOKEN-JDC-LT01-LOBBY-UTAMA-8123',
      device: 'Samsung Galaxy S23 (Chrome v122)',
      ip: '192.168.10.150',
      selfieUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=80&auto=format&fit=crop&q=60'
    }
  },
  {
    id: 'rep-002',
    timestamp: '2026-06-04T09:30:00Z',
    timestampEnd: '2026-06-04T09:32:05Z',
    userId: 6,
    userName: 'Ahmad Rafli',
    areaId: 'l7-lift-timur',
    gedung: 'JDC',
    lantai: '7',
    zona: 'Zona B',
    titik: 'Lift Timur',
    shift: 'Pagi',
    kondisi: 'Lampu Mati',
    keterangan: 'Lampu koridor depan Lift Timur padam 2 unit.',
    foto: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=300&auto=format&fit=crop&q=60',
    antiFraud: {
      gpsValid: true,
      gpsCoords: { lat: -6.2148, lng: 106.8015 },
      radius: 15,
      dynamicToken: 'TOKEN-JDC-LT07-ZONA-B-LIFT-TIMUR-9428',
      device: 'Samsung Galaxy S23 (Chrome v122)',
      ip: '192.168.10.150',
      selfieUrl: null
    }
  },
  {
    id: 'rep-003',
    timestamp: '2026-06-04T11:45:00Z',
    timestampEnd: '2026-06-04T11:46:20Z',
    userId: 7,
    userName: 'Candra Hermawan',
    areaId: 'b1-zona-b',
    gedung: 'JDC',
    lantai: 'B1',
    zona: 'Zona B',
    titik: 'Parkir Motor',
    shift: 'Pagi',
    kondisi: 'Aman dan Kondusif',
    keterangan: 'Patroli area parkir motor basement. Kendaraan tertata rapi.',
    foto: null,
    antiFraud: {
      gpsValid: true,
      gpsCoords: { lat: -6.2144, lng: 106.8010 },
      radius: 8,
      dynamicToken: 'TOKEN-JDC-LTB1-ZONA-B-PARKIR-MOTOR-2049',
      device: 'Oppo Reno 10 (Chrome v122)',
      ip: '192.168.10.162',
      selfieUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60'
    }
  },
  {
    id: 'rep-004',
    timestamp: '2026-06-04T14:10:00Z',
    timestampEnd: '2026-06-04T14:11:55Z',
    userId: 7,
    userName: 'Candra Hermawan',
    areaId: 'l7-zona-c',
    gedung: 'JDC',
    lantai: '7',
    zona: 'Zona C',
    titik: 'Ruang Server Tenant',
    shift: 'Siang',
    kondisi: 'CCTV Bermasalah',
    keterangan: 'Kamera CCTV arah koridor barat mati / no signal.',
    foto: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=300&auto=format&fit=crop&q=60',
    antiFraud: {
      gpsValid: true,
      gpsCoords: { lat: -6.2148, lng: 106.8016 },
      radius: 19,
      dynamicToken: 'TOKEN-JDC-LT07-ZONA-C-RUANG-SERVER-4092',
      device: 'Oppo Reno 10 (Chrome v122)',
      ip: '192.168.10.162',
      selfieUrl: null
    }
  }
];

const INITIAL_FINDINGS = [
  { id: 'find-001', reportId: 'rep-002', kategori: 'Lampu Mati', area: 'JDC Lt.7 Zona B - Lift Timur', tanggal: '2026-06-04T09:30:00Z', pelapor: 'Ahmad Rafli', status: 'Open', detail: 'Lampu koridor depan Lift Timur padam 2 unit.', foto: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=300&auto=format&fit=crop&q=60' },
  { id: 'find-002', reportId: 'rep-004', kategori: 'CCTV Bermasalah', area: 'JDC Lt.7 Zona C - Ruang Server Tenant', tanggal: '2026-06-04T14:10:00Z', pelapor: 'Candra Hermawan', status: 'On Progress', detail: 'Kamera CCTV arah koridor barat mati / no signal.', foto: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=300&auto=format&fit=crop&q=60' }
];

export default function App() {
  console.log("App component: initialization started");
  const [showSplash, setShowSplash] = useState(true);
  const [cyberLogs, setCyberLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('BOOTING...');

  useEffect(() => {
    const allLogs = [
      '>> INITIALIZING SAPUJAGAT SECURITIES...',
      '>> LOAD SYSTEM DRIVER: anti_fraud_gps.sys ... OK',
      '>> CONNECTING CENTRAL DATABASE DIRECTORY...',
      '>> VERIFYING ACCESS PRIVILEGES... BY_RICHARDMEHA',
      '>> SYNCING TENANT TARGETS & FLOOR MAPS...',
      '>> DEPLOYING OFFLINE TRANSACTION CACHE...',
      '>> INTRUSION DETECTION SYSTEM: SHIELD ACTIVE',
      '>> PROTOCOL STACK STABILIZED... SECURE',
      '>> BOOT COMPLETED: SAPUJAGAT JDC IS READY!'
    ];

    // Smooth progress bar calibration from 0 to 100
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + step, 100);
      });
    }, 120);

    // Print logs line by line
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < allLogs.length) {
        setCyberLogs(prev => [...prev, allLogs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 320);

    // Update status labels matching movie hacking terminals
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

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4200); // 4.2 seconds cinematic cyber intro

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
      clearInterval(statusInterval);
      clearTimeout(timer);
    };
  }, []);

  // Database States
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('sapujagat_users');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS;
    } catch (e) {
      console.error("Failed parsing sapujagat_users, falling back:", e);
      return INITIAL_USERS;
    }
  });

  const [areas, setAreas] = useState(() => {
    try {
      const saved = localStorage.getItem('sapujagat_areas');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_AREAS;
    } catch (e) {
      console.error("Failed parsing sapujagat_areas, falling back:", e);
      return INITIAL_AREAS;
    }
  });

  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem('sapujagat_reports');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REPORTS;
    } catch (e) {
      console.error("Failed parsing sapujagat_reports, falling back:", e);
      return INITIAL_REPORTS;
    }
  });

  const [findings, setFindings] = useState(() => {
    try {
      const saved = localStorage.getItem('sapujagat_findings');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FINDINGS;
    } catch (e) {
      console.error("Failed parsing sapujagat_findings, falling back:", e);
      return INITIAL_FINDINGS;
    }
  });

  // Simulator Contexts
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]); // Starts as Super Admin Budi Santoso
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSOS, setActiveSOS] = useState(null); // Active SOS Panic triggers
  const [toasts, setToasts] = useState([]);
  
  // Audio indicator for SOS
  const [sosAudio, setSosAudio] = useState(null);

  // Sync to Local Storage
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

  // Show live toast messages
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // SOS Sound Synth
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
      console.warn("Audio Context not supported or blocked by user gesture:", e);
      return null;
    }
  };

  // Trigger Emergency SOS Panic
  const triggerSOS = (officerName, areaName) => {
    const alert = {
      id: Date.now(),
      officer: officerName,
      location: areaName,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setActiveSOS(alert);
    addToast(`🚨 ALARM SOS DARURAT! Petugas ${officerName} di ${areaName}`, 'danger');
    
    // Play synthetic siren
    const audio = playSOSSiren();
    if (audio) {
      setSosAudio(audio);
    }
  };

  // Close SOS Siren
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

  // Handle Patrol Report Submission
  const handleAddReport = (newReport) => {
    const reportId = `rep-${Math.floor(1000 + Math.random() * 9000)}`;
    const reportData = {
      id: reportId,
      ...newReport
    };

    setReports(prev => [reportData, ...prev]);
    addToast(`Patroli sukses disubmit di ${newReport.titik} (${newReport.kondisi})`, 'success');

    // Automatically generate finding if condition is not safe
    if (newReport.kondisi !== 'Aman dan Kondusif' && newReport.kondisi !== 'Ada Aktivitas' && newReport.kondisi !== 'Renovasi') {
      const findingId = `find-${Math.floor(1000 + Math.random() * 9000)}`;
      const newFinding = {
        id: findingId,
        reportId: reportId,
        kategori: newReport.kondisi,
        area: `${newReport.gedung} Lt.${newReport.lantai} ${newReport.zona} - ${newReport.titik}`,
        tanggal: newReport.timestamp,
        pelapor: newReport.userName,
        status: 'Open',
        severity: newReport.severity || 'Rendah',
        detail: newReport.keterangan || `Ditemukan kondisi ${newReport.kondisi}`,
        foto: newReport.foto
      };
      setFindings(prev => [newFinding, ...prev]);
      addToast(`⚠️ Tiket temuan otomatis dibuat untuk ${newReport.kondisi} [Severity: ${newFinding.severity}]`, 'warning');
    }
  };

  // Update Finding Status
  const updateFindingStatus = (findingId, newStatus) => {
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        addToast(`Status temuan ${f.kategori} diubah ke ${newStatus}`, 'info');
        return { ...f, status: newStatus };
      }
      return f;
    }));
  };

  // Add Area Functionality
  const handleAddArea = (newArea) => {
    const areaId = newArea.qrCode.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const areaData = {
      id: areaId,
      ...newArea
    };
    setAreas(prev => [...prev, areaData]);
    addToast(`Area baru berhasil didaftarkan: ${newArea.titik}`, 'success');
  };

  // Add User / Role Functionality
  const handleAddUser = (newUser) => {
    const userId = users.length + 1;
    const userData = {
      id: userId,
      ...newUser,
      avatar: newUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60'
    };
    setUsers(prev => [...prev, userData]);
    addToast(`Anggota baru ${newUser.nama} (${newUser.jabatan}) berhasil didaftarkan!`, 'success');
  };

  const handleResetToProduction = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus SEMUA data simulasi (laporan, temuan, area, petugas) dan mengubah aplikasi ke mode siap rilis?")) {
      const prodUsers = [
        { id: 1, nama: 'Richard Meha', nrp: '99999', jabatan: 'Super Admin', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60' }
      ];
      setUsers(prodUsers);
      setAreas([]);
      setReports([]);
      setFindings([]);
      setCurrentUser(prodUsers[0]);
      setCurrentTab('dashboard');
      
      localStorage.setItem('sapujagat_users', JSON.stringify(prodUsers));
      localStorage.setItem('sapujagat_areas', JSON.stringify([]));
      localStorage.setItem('sapujagat_reports', JSON.stringify([]));
      localStorage.setItem('sapujagat_findings', JSON.stringify([]));
      localStorage.setItem('sapujagat_offline_queue', JSON.stringify([]));
      
      addToast("Database telah dibersihkan! Mode Rilis siap digunakan.", "success");
    }
  };

  // Switch role and navigate to appropriate page automatically
  const handleRoleChange = (userId) => {
    const selected = users.find(u => u.id === parseInt(userId));
    setCurrentUser(selected);
    addToast(`Login sebagai: ${selected.nama} (${selected.jabatan})`, 'success');
    
    if (selected.jabatan === 'Petugas Security') {
      setCurrentTab('guard-simulator');
    } else if (selected.jabatan === 'Client (View Only)') {
      setCurrentTab('dashboard');
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleNavClick = (tabName) => {
    setCurrentTab(tabName);
    setIsSidebarOpen(false);
  };

  if (showSplash) {
    return (
      <div className="splash-screen cyber-screen">
        {/* Cinematic tech corners */}
        <div className="cyber-corner corner-tl"></div>
        <div className="cyber-corner corner-tr"></div>
        <div className="cyber-corner corner-bl"></div>
        <div className="cyber-corner corner-br"></div>

        {/* Matrix grid and sweeping laser beam */}
        <div className="cyber-grid"></div>
        <div className="cyber-scanline"></div>

        {/* Dynamic rotating HUD rings around the central logo */}
        <div className="cyber-hud-container">
          <div className="hud-ring ring-outer"></div>
          <div className="hud-ring ring-middle"></div>
          <div className="hud-ring ring-inner"></div>
          <div className="hud-ring ring-dashed"></div>
          <div className="splash-logo-container">
            <img src="logo.png" alt="Logo JDC" className="splash-logo cyber-logo" />
          </div>
        </div>

        {/* System calibration progress panel */}
        <div className="cyber-progress-container">
          <div className="cyber-progress-header">
            <span className="progress-label">CORE CALIBRATION</span>
            <span className="progress-percent">{progress}%</span>
          </div>
          <div className="cyber-progress-bar">
            <div className="cyber-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Console output display */}
        <div className="cyber-console">
          <div className="console-header">
            <span className="console-title">[SAPUJAGAT CORE SECURE BOOT]</span>
            <span className="console-status blink">{statusText}</span>
          </div>
          <div className="console-body">
            {cyberLogs.slice(-4).map((log, idx) => (
              <p key={idx} className="console-line">{log}</p>
            ))}
          </div>
        </div>

        {/* Copyright branding watermark at the bottom */}
        <div className="splash-footer cyber-footer">
          <p className="splash-title cyber-title">SAPUJAGAT JDC v2.0</p>
          <p className="splash-subtitle cyber-subtitle">SECURED PATROL SYSTEM // BY_RICHARDMEHA</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.35rem 0.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-glass)'
          }}>
            <img src="logo.png" alt="Logo JDC" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.05em' }}>
              SAPUJAGAT<span style={{ color: 'var(--color-primary)' }}>JDC</span>
            </h2>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Patrol Guard System v2
            </p>
          </div>
        </div>

        {/* User Active Persona info */}
        <div className="glass-panel" style={{ padding: '0.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img 
            src={currentUser.avatar} 
            alt={currentUser.nama} 
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
          />
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentUser.nama}</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{currentUser.jabatan}</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {/* Main Dashboard (Admins & Client) */}
          {currentUser.jabatan !== 'Petugas Security' && (
            <>
              <button 
                onClick={() => handleNavClick('dashboard')} 
                className={`nav-tab-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard Admin</span>
              </button>

              <button 
                onClick={() => handleNavClick('target-compliance')} 
                className={`nav-tab-btn ${currentTab === 'target-compliance' ? 'active' : ''}`}
              >
                <Target size={18} />
                <span>Dashboard Target JDC</span>
              </button>

              <button 
                onClick={() => handleNavClick('barcodes')} 
                className={`nav-tab-btn ${currentTab === 'barcodes' ? 'active' : ''}`}
              >
                <QrCode size={18} />
                <span>Master & Barcode QR</span>
              </button>

              <button 
                onClick={() => handleNavClick('reports')} 
                className={`nav-tab-btn ${currentTab === 'reports' ? 'active' : ''}`}
              >
                <FileSpreadsheet size={18} />
                <span>Laporan & Export</span>
              </button>
            </>
          )}

          {/* Dedicated tab for Guard Simulator */}
          <button 
            onClick={() => handleNavClick('guard-simulator')} 
            className={`nav-tab-btn ${currentTab === 'guard-simulator' ? 'active' : ''}`}
            style={{ 
              marginTop: currentUser.jabatan === 'Petugas Security' ? '0px' : '1.5rem',
              border: '1px dashed var(--color-primary-glow)',
              background: currentTab === 'guard-simulator' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.03)'
            }}
          >
            <Smartphone size={18} className={currentTab === 'guard-simulator' ? 'text-primary' : ''} />
            <span style={{ fontWeight: 600 }}>Simulasi HP Petugas</span>
          </button>
        </nav>

        {/* JDC Logo Watermark / Version */}
        <div style={{ padding: '0.75rem 0', borderTop: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Building size={14} />
            <span>Jakarta Design Center</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.7 }}>
            © 2026 SAPUJAGAT JDC By_RichardMeha.
          </div>
        </div>
      </aside>

      {/* Main content body */}
      <main className="main-content">
        {/* Global Header */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingBottom: '1.5rem', 
          marginBottom: '2rem', 
          borderBottom: '1px solid var(--border-glass)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="menu-toggle-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                padding: '0.5rem',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '0.4rem',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <img src="logo.png" alt="Logo JDC" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {currentTab === 'dashboard' && 'Dashboard Manajemen Keamanan'}
                {currentTab === 'target-compliance' && 'Dashboard Target & SLA Tenant'}
                {currentTab === 'barcodes' && 'Master Area & Barcode Generator'}
                {currentTab === 'reports' && 'Laporan Patroli & Log Temuan'}
                {currentTab === 'guard-simulator' && 'Simulasi Aplikasi Patroli Anggota'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                {currentTab === 'dashboard' && 'Pemantauan real-time petugas, status area JDC, dan statistik patroli.'}
                {currentTab === 'target-compliance' && 'Realisasi patroli, SLA penyelesaian kendala, dan target JDC Tenant.'}
                {currentTab === 'barcodes' && 'Daftar master area JDC, cetak barcode QR, dan generate massal.'}
                {currentTab === 'reports' && 'Filter laporan patroli harian/shift, ekspor ke PDF/Excel, dan follow-up temuan.'}
                {currentTab === 'guard-simulator' && 'Uji coba alur patroli petugas security menggunakan HP virtual.'}
              </p>
            </div>
          </div>

          {/* Top Bar Controls & Persona Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={handleResetToProduction}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--color-danger)',
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              title="Reset database ke mode kosong untuk siap rilis"
            >
              🧹 Reset Rilis
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SIMULASI ROLE</span>
              <select 
                value={currentUser.id} 
                onChange={(e) => handleRoleChange(e.target.value)}
                className="modern-select"
                style={{ width: '220px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nama} ({u.jabatan})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Navigation Router View */}
        <div className="animate-slide-up">
          {currentTab === 'dashboard' && (
            <ManagementDashboard 
              reports={reports} 
              findings={findings} 
              areas={areas}
              users={users}
              onUpdateStatus={updateFindingStatus}
            />
          )}

          {currentTab === 'target-compliance' && (
            <TargetDashboard 
              reports={reports} 
              findings={findings} 
              areas={areas}
            />
          )}

          {currentTab === 'barcodes' && (
            <BarcodeGenerator 
              areas={areas} 
              onAddArea={handleAddArea}
              users={users}
              onAddUser={handleAddUser}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsExport 
              reports={reports} 
              findings={findings} 
              users={users}
              onUpdateFindingStatus={updateFindingStatus}
            />
          )}

          {currentTab === 'guard-simulator' && (
            <div className="mobile-simulator-container">
              <SecurityPatrolApp 
                currentUser={currentUser} 
                areas={areas} 
                onAddReport={handleAddReport}
                onTriggerSOS={triggerSOS}
              />
            </div>
          )}
          {/* Global Branded Copyright Watermark Footer */}
          <footer style={{ 
            marginTop: '3rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid var(--border-glass)', 
            textAlign: 'center', 
            fontSize: '0.8rem', 
            color: 'var(--text-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <span>© 2026 <strong style={{ color: 'var(--color-primary)' }}>SAPUJAGAT JDC</strong>. Hak Cipta Dilindungi.</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Developer / Copyright Watermark: <strong style={{ color: 'var(--text-secondary)' }}>By_RichardMeha</strong>
            </span>
          </footer>
        </div>
      </main>

      {/* SOS Alert Warning Popup */}
      {activeSOS && (
        <div className="panic-overlay">
          <div className="panic-card">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div className="sos-button" style={{ cursor: 'default' }}>SOS</div>
            </div>
            <h2 style={{ color: 'var(--color-danger)', fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>
              DARURAT / EMERGENCY!
            </h2>
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

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={clearSOS} 
                className="btn-danger" 
                style={{ flex: 1, padding: '1rem' }}
              >
                Matikan Alarm & Tanggapi Kejadian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Box */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {toasts.map(t => (
          <div 
            key={t.id} 
            className="glass-panel" 
            style={{ 
              padding: '0.8rem 1.2rem', 
              fontSize: '0.85rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              borderLeft: `4px solid ${
                t.type === 'success' ? 'var(--color-success)' : 
                t.type === 'danger' ? 'var(--color-danger)' : 
                t.type === 'warning' ? 'var(--color-warning)' : 'var(--color-primary)'
              }`,
              animation: 'slide-in 0.2s ease-out'
            }}
          >
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Sidebar Nav Buttons Local CSS override */}
      <style>{`
        .nav-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 0.8rem 1rem;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-family: var(--font-sans);
          font-weight: 500;
          font-size: 0.9rem;
          text-align: left;
          transition: var(--transition-smooth);
        }

        .nav-tab-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .nav-tab-btn.active {
          background: rgba(59, 130, 246, 0.15);
          color: var(--color-primary);
          font-weight: 600;
        }

        .text-primary {
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}
