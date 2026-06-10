/**
 * =======================================================
 *   SMPJDC SECURITY MANAGEMENT SYSTEM
 *   Module: Security Patrol Mobile App (Simulation)
 *   Signed by: Richard Meha (by -Richard)
 *   Last Maintained: 2026-06-07
 *   Description: Mobile UI simulation for security officers, 
 *                html5-qrcode integration, GPS anti-fraud.
 * =======================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Camera, Clock, Check, AlertTriangle, QrCode, Shield,
  Wifi, WifiOff, Database, ThumbsUp, MapPin,
  FileText, History, Send, Info, Search, Wrench, Radio, X
} from 'lucide-react';
import KATEGORI_TEMUAN from '../data/kategoriTemuan';
import { Html5Qrcode } from 'html5-qrcode';
import { getGPSCoordinates, generateAntiFraudData } from '../utils/security';
import { compressImage } from '../utils/image';
import { registerBackHandler } from '../utils/navigation';

const KATEGORI_MUTASI = [
  { id: 'informasi', label: 'Informasi', icon: Info, color: '#3b82f6' },
  { id: 'kehilangan', label: 'Kehilangan', icon: Search, color: '#f59e0b' },
  { id: 'kerusakan', label: 'Kerusakan', icon: Wrench, color: '#ef4444' },
  { id: 'gangguan', label: 'Gangguan', icon: AlertTriangle, color: '#dc2626' },
  { id: 'emergency', label: 'Emergency', icon: Radio, color: '#7c3aed' },
  { id: '__lainnya__', label: 'Lainnya...', icon: X, color: '#6b7280' }
];

export default function SecurityPatrolApp({
  currentUser, areas, posList = [], attendanceLogs = [], reports = [], findings = [], mutasiLogs = [],
  onAddReport, onTriggerSOS, onAddLog
}) {
  const [online, setOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [queue, setQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sapujagat_offline_queue')) || []; }
    catch { return []; }
  });

  // Real network detection
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sapujagat_offline_queue', JSON.stringify(queue));
    } catch (e) {
      console.error('Gagal menyimpan antrean offline ke localStorage:', e);
    }
  }, [queue]);

  // Auto-flush queue when online (both on mount and on reconnect)
  useEffect(() => {
    if (online && queue.length > 0) {
      const flushQueue = async () => {
        const items = [...queue];
        for (const item of items) {
          try {
            const data = item.data || item;
            if (item.type === 'mutasi') {
              await onAddLog(data);
            } else {
              await onAddReport(data);
            }
          } catch (e) {
            console.error('Gagal kirim antrean offline:', e);
          }
        }
        setQueue([]);
      };
      flushQueue();
    }
  }, [online]);

  const [tab, setTab] = useState('patroli');
  const [showPlottingModal, setShowPlottingModal] = useState(false);
  const [lastPlottingId, setLastPlottingId] = useState(() => {
    return localStorage.getItem('smpjdc_last_plotting_id') || '';
  });

  // ── Tab: Patroli ──
  const [step, setStep] = useState(1); // 1=start, 2=scan, 3=lapor, 4=done
  const [shift, setShift] = useState('Pagi');
  const [area, setArea] = useState(null);
  const [timeScan, setTimeScan] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [mode, setMode] = useState(null);
  const [kategori, setKategori] = useState('');
  const [temuan, setTemuan] = useState('');
  const [severity, setSeverity] = useState('low');
  const [deskripsi, setDeskripsi] = useState('');
  const [foto, setFoto] = useState(null);
  const [scanError, setScanError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);

  // Trigger early Geolocation permissions and warm up GPS coordinates
  useEffect(() => {
    if (step === 2) {
      setScanning(true);
      getGPSCoordinates().then(() => {});
    } else {
      setScanning(false);
    }
  }, [step]);

  // Handle back button interception for step and tab navigation in simulator app
  useEffect(() => {
    const unregister = registerBackHandler(() => {
      if (tab !== 'patroli') {
        setTab('patroli');
        return true;
      }
      if (step === 3 && mode) {
        setMode(null);
        return true;
      }
      if (step > 1) {
        if (step === 4) {
          resetLaporan();
        } else {
          setStep(prev => prev - 1);
        }
        return true;
      }
      return false;
    });
    return unregister;
  }, [tab, step, mode]);

  // Live Camera Scanner Lifecycle using html5-qrcode
  useEffect(() => {
    let html5QrCode;
    const elementId = "reader";
    
    if (scanning && step === 2) {
      setScanLoading(true);
      setScanError('');
      
      const timer = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode(elementId);
          html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 220, height: 220 }
            },
            (decodedText) => {
              handleBarcodeScannedSuccessfully(decodedText);
              if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(err => console.error(err));
              }
            },
            () => {
              // scanning...
            }
          ).then(() => {
            setScanLoading(false);
          }).catch(err => {
            console.warn("Kamera scanner gagal aktif:", err);
            setScanLoading(false);
            setScanning(false);
            setScanError(`Gagal akses kamera: ${err.message || err}. Pastikan izin kamera telah diberikan. Gunakan input manual di bawah.`);
          });
        } catch (e) {
          console.error("Html5Qrcode scanner failed to initialize:", e);
          setScanLoading(false);
          setScanError(`Scanner Error: ${e.message || e}`);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().catch(err => console.error(err));
        }
      };
    }
  }, [scanning, step]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = attendanceLogs.find(log => log.tanggal === todayStr);
  const myPlotting = todayLog?.details?.find(d => d.personilId === currentUser.id);

  useEffect(() => {
    if (myPlotting && todayLog) {
      const shiftMap = { P: 'Pagi (06:00-14:00)', S: 'Siang (14:00-22:00)', M: 'Malam (22:00-06:00)', Kh: 'Khusus' };
      setShift(shiftMap[todayLog.shift] || 'Pagi');
    }
  }, [myPlotting, todayLog]);

  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playBeep = (freq, duration, delay) => {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + duration);
        }, delay);
      };
      
      playBeep(880, 0.15, 0);
      playBeep(880, 0.15, 200);
      playBeep(1200, 0.3, 400);
    } catch (e) {
      console.warn('Gagal memutar suara alarm:', e);
    }
  };

  useEffect(() => {
    if (myPlotting && todayLog) {
      const currentPlottingId = `${todayLog.id}-${myPlotting.posPlotting}-${myPlotting.status}`;
      if (lastPlottingId && lastPlottingId !== currentPlottingId) {
        playAlarmSound();
        setShowPlottingModal(true);
        if (navigator.vibrate) {
          try { navigator.vibrate([200, 100, 200]); } catch (e) {}
        }
      }
      setLastPlottingId(currentPlottingId);
      localStorage.setItem('smpjdc_last_plotting_id', currentPlottingId);
    } else if (!myPlotting) {
      setLastPlottingId('');
      localStorage.removeItem('smpjdc_last_plotting_id');
    }
  }, [myPlotting, todayLog]);

  useEffect(() => { if (kategori) setTemuan(''); }, [kategori]);

  const kategoriData = KATEGORI_TEMUAN;
  const daftarTemuan = kategori ? kategoriData.find(k => k.id === kategori)?.items || [] : [];

  const resetLaporan = () => {
    setStep(1); setArea(null); setTimeScan(null);
    setMode(null); setKategori(''); setTemuan('');
    setSeverity('low'); setDeskripsi(''); setFoto(null);
    setBarcodeInput(''); setScanError('');
  };

  const playBeepSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime); // 1200Hz Beep
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12); // Beep duration 120ms
    } catch (e) {
      console.warn('Gagal memutar bip suara:', e);
    }
  };

  const handleBarcodeScannedSuccessfully = (val) => {
    let cleanVal = val.trim();
    if (!cleanVal) return;

    // Smart URL Parsing: Ekstrak parameter query jika QR code berisi URL lengkap
    if (cleanVal.startsWith('http://') || cleanVal.startsWith('https://')) {
      try {
        const urlObj = new URL(cleanVal);
        const checkpointParam = urlObj.searchParams.get('checkpoint') || 
                                urlObj.searchParams.get('code') || 
                                urlObj.searchParams.get('id');
        
        if (checkpointParam) {
          cleanVal = checkpointParam.trim();
        } else {
          // Fallback ke segment path terakhir
          const pathSegments = urlObj.pathname.split('/').filter(Boolean);
          if (pathSegments.length > 0) {
            cleanVal = pathSegments[pathSegments.length - 1].trim();
          }
        }
      } catch (e) {
        console.warn('Gagal memproses QR URL:', e);
      }
    }

    // Cari area berdasarkan kecocokan case-insensitive atau jika kode terdeteksi di dalam string QR
    const found = areas.find(a =>
      a.qrCode.toLowerCase() === cleanVal.toLowerCase() ||
      a.id.toLowerCase() === cleanVal.toLowerCase() ||
      cleanVal.toLowerCase().includes(a.qrCode.toLowerCase())
    );

    if (found) {
      playBeepSound();
      setArea(found);
      setTimeScan(new Date());
      setBarcodeInput('');
      setMode(null);
      setKategori('');
      setTemuan('');
      setSeverity('low');
      setDeskripsi('');
      setFoto(null);
      setStep(3);
      setScanning(false);
      setScanError('');
    } else {
      setScanError(`QR Code "${cleanVal}" tidak terdaftar di checkpoint JDC.`);
      // Sembunyikan error setelah 4 detik agar bisa mencoba scan ulang dengan nyaman
      setTimeout(() => {
        setScanError('');
      }, 4000);
    }
  };

  const handleBarcodeScan = () => {
    handleBarcodeScannedSuccessfully(barcodeInput);
  };

  const handleNormal = async () => {
    const fraudData = await generateAntiFraudData(currentUser.id);
    const r = {
      timestamp: timeScan.toISOString(), timestampEnd: new Date().toISOString(),
      userId: currentUser.id, userName: currentUser.nama,
      areaId: area.id, gedung: 'JDC', lantai: area.lantai, zona: area.zona, titik: area.titik,
      shift, kategori: '-', kodeTemuan: '-', temuan: 'Normal', status: 'normal',
      kondisi: 'Aman dan Kondusif', severity: 'Rendah', keterangan: '', foto: null,
      antiFraud: fraudData
    };
    (online ? onAddReport(r) : setQueue(p => [...p, { type: 'report', data: r }]));
    setStep(4);
  };

  const handleTemuanSubmit = async (e) => {
    e.preventDefault();
    if (!kategori || !temuan) return;
    const kat = kategoriData.find(k => k.id === kategori);
    const item = daftarTemuan.find(t => t.kode === temuan);
    const severityMap = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi', critical: 'Kritis' };
    
    const fraudData = await generateAntiFraudData(currentUser.id);
    const r = {
      timestamp: timeScan.toISOString(), timestampEnd: new Date().toISOString(),
      userId: currentUser.id, userName: currentUser.nama,
      areaId: area.id, gedung: 'JDC', lantai: area.lantai, zona: area.zona, titik: area.titik,
      shift, kategori: kat?.nama || '', kodeTemuan: item?.kode || '', temuan: item?.nama || '',
      status: 'temuan', kondisi: item?.nama || 'Temuan', severity: severityMap[severity] || 'Rendah',
      keterangan: deskripsi, foto,
      antiFraud: fraudData
    };
    (online ? onAddReport(r) : setQueue(p => [...p, { type: 'report', data: r }]));
    setStep(4);
  };

  // ── Tab: Mutasi ──
  const [mKat, setMKat] = useState('informasi');
  const [mKatLainnya, setMKatLainnya] = useState('');
  const [mLokasi, setMLokasi] = useState('');
  const [mUraian, setMUraian] = useState('');
  const [mFoto, setMFoto] = useState(null);
  const [mErrors, setMErrors] = useState({});
  const [mSent, setMSent] = useState(false);

  // ── Tab: Temuan (Standalone) ──
  const [tLokasi, setTLokasi] = useState('');
  const [tKategori, setTKategori] = useState('');
  const [tTemuan, setTTemuan] = useState('');
  const [tSeverity, setTSeverity] = useState('low');
  const [tDeskripsi, setTDeskripsi] = useState('');
  const [tFoto, setTFoto] = useState(null);
  const [tSent, setTSent] = useState(false);

  const handleTemuanStandaloneSubmit = async (e) => {
    e.preventDefault();
    if (!tLokasi || !tKategori || !tTemuan) return;
    const fraudData = await generateAntiFraudData(currentUser.id);
    const selectedArea = areas.find(a => tLokasi.includes(a.titik));
    const reportData = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      areaId: selectedArea?.id || 'manual',
      titik: tLokasi,
      lantai: selectedArea?.lantai || '-',
      zona: selectedArea?.zona || '-',
      gedung: selectedArea?.gedung || 'SMPJDC - Jakarta Design Center',
      qrCode: selectedArea?.qrCode || 'MANUAL',
      userName: currentUser.nama,
      userId: currentUser.id,
      nrp: currentUser.nrp,
      kondisi: 'Ada Temuan',
      keterangan: tDeskripsi,
      severity: colorSeverity(tSeverity).replace('#','') === '10b981' ? 'Rendah' : tSeverity === 'medium' ? 'Sedang' : tSeverity === 'high' ? 'Tinggi' : 'Kritis',
      foto: tFoto,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      shift: shift,
      antiFraud: fraudData,
      jabatan: currentUser.jabatan,
      regu: currentUser.regu || ''
    };
    if (online) {
      onAddReport(reportData);
    } else {
      setQueue(p => [...p, { type: 'report', data: reportData }]);
    }
    setTSent(true);
    setTKategori(''); setTTemuan(''); setTSeverity('low'); setTDeskripsi(''); setTFoto(null); setTLokasi('');
    setTimeout(() => setTSent(false), 3000);
  };

  const handleMutasiSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!mLokasi.trim()) errs.lokasi = 'Lokasi harus diisi';
    if (!mUraian.trim()) errs.uraian = 'Uraian harus diisi';
    if (Object.keys(errs).length) { setMErrors(errs); return; }
    setMErrors({});
    
    const fraudData = await generateAntiFraudData(currentUser.id);
    const mutasiData = {
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      jamKejadian: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      lokasi: mLokasi.trim(), uraian: mUraian.trim(),
      kategori: mKat === '__lainnya__' ? `Lainnya: ${mKatLainnya.trim() || 'Custom'}` : mKat,
      foto: mFoto, petugas: currentUser.nama, nrp: currentUser.nrp,
      tanggal: todayStr, pelapor: currentUser.nama,
      antiFraud: fraudData
    };
    if (online) {
      onAddLog(mutasiData);
    } else {
      setQueue(p => [...p, { type: 'mutasi', data: mutasiData }]);
    }
    setMSent(true);
    setMLokasi(''); setMUraian(''); setMFoto(null); setMKat('informasi'); setMKatLainnya('');
    setTimeout(() => setMSent(false), 3000);
  };

  // ── Tab: Riwayat ──
  const myReports = reports.filter(r => r.userId === currentUser.id).slice(0, 20);
  const myFindings = findings.filter(f => f.pelapor === currentUser.nama).slice(0, 20);
  const myMutasi = mutasiLogs.filter(m => m.petugas === currentUser.nama).slice(0, 20);
  const [riwayatTab, setRiwayatTab] = useState('patroli');

  const labelSeverity = (v) => ({ low: 'Rendah', medium: 'Sedang', high: 'Tinggi', critical: 'Kritis' })[v] || v;
  const colorSeverity = (v) => ({ low: '#3b82f6', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' })[v] || '#3b82f6';

  return (
    <div className="mobile-phone-frame">
      <div className="mobile-screen">
        {/* Status Bar */}
        <div className="mobile-status-bar">
          <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
          <button onClick={() => setOnline(!online)} className="mobile-conn-toggle">
            {online ? <Wifi size={12} /> : <WifiOff size={12} />}<span>{online ? 'Online' : 'Offline'}</span>
          </button>
        </div>
        {queue.length > 0 && <div className="offline-badge"><Database size={12} /><span>{queue.length} offline</span></div>}

        {/* Header with SOS */}
        <div className="mobile-header">
          <div className="mobile-brand">
            <img src="logo.png" alt="" className="mobile-logo logo-3d" />
            <div><h4 className="mobile-app-title">SMPJDC</h4><p className="mobile-app-sub">Aplikasi Patroli</p></div>
          </div>
          <button onClick={() => onTriggerSOS(currentUser.nama, area?.titik || 'Lobby')} className="sos-btn-small">SOS</button>
        </div>

        {/* User info card */}
        <div className="glass-panel step-user-card" style={{ marginBottom: '0.5rem' }}>
          <img src={currentUser.avatar} alt="" className="step-avatar" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60'; }} />
          <div>
            <h4>{currentUser.nama}</h4>
            <p className="text-secondary" style={{ fontSize: '0.7rem' }}>NRP: {currentUser.nrp} • {currentUser.jabatan}</p>
          </div>
        </div>

        {/* Empty Plotting Warning Banner */}
        {(!todayLog || (todayLog && !myPlotting)) && (
          <>
            <style>{`
              @keyframes warning-pulse {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                70% { transform: scale(1.02); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
              }
            `}</style>
            <div style={{
              margin: '0 0.5rem 0.6rem 0.5rem',
              padding: '0.65rem 0.8rem',
              background: !todayLog ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: !todayLog ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              color: !todayLog ? '#f59e0b' : '#ef4444',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: !todayLog ? '0 0 10px rgba(245, 158, 11, 0.08)' : '0 0 10px rgba(239, 68, 68, 0.08)',
              animation: 'warning-pulse 2s infinite'
            }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, lineHeight: '1.3' }}>
                <span style={{ fontWeight: 800, color: !todayLog ? '#fbbf24' : '#f87171', display: 'block', fontSize: '0.75rem', marginBottom: '0.1rem' }}>
                  {!todayLog ? 'PERINGATAN PLOTTING KOSONG' : 'ANDA TIDAK TERDAFTAR'}
                </span>
                {!todayLog 
                  ? 'Danru belum mengisi absensi & plotting hari ini! Harap hubungi Danru regu Anda untuk konfirmasi shift.' 
                  : 'Nama Anda tidak terdaftar pada plotting hari ini! Silakan hubungi Danru untuk update jadwal.'}
              </div>
            </div>
          </>
        )}

        {/* Tab Navigation */}
        <div className="mobile-tab-bar" style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', background: 'var(--bg-glass)', borderRadius: '10px', padding: '0.2rem' }}>
          <button onClick={() => { setTab('patroli'); resetLaporan(); }} className={`mobile-tab ${tab === 'patroli' ? 'active' : ''}`} style={{
            flex: 1, padding: '0.45rem 0.3rem', fontSize: '0.7rem', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            background: tab === 'patroli' ? 'var(--color-primary)' : 'transparent',
            color: tab === 'patroli' ? 'white' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'
          }}><QrCode size={14} /> Patroli</button>
          <button onClick={() => setTab('temuan')} className={`mobile-tab ${tab === 'temuan' ? 'active' : ''}`} style={{
            flex: 1, padding: '0.45rem 0.3rem', fontSize: '0.7rem', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            background: tab === 'temuan' ? 'var(--color-primary)' : 'transparent',
            color: tab === 'temuan' ? 'white' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'
          }}><AlertTriangle size={14} /> Temuan</button>
          <button onClick={() => setTab('mutasi')} className={`mobile-tab ${tab === 'mutasi' ? 'active' : ''}`} style={{
            flex: 1, padding: '0.45rem 0.3rem', fontSize: '0.7rem', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            background: tab === 'mutasi' ? 'var(--color-primary)' : 'transparent',
            color: tab === 'mutasi' ? 'white' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'
          }}><FileText size={14} /> Mutasi</button>
          <button onClick={() => setTab('riwayat')} className={`mobile-tab ${tab === 'riwayat' ? 'active' : ''}`} style={{
            flex: 1, padding: '0.45rem 0.3rem', fontSize: '0.7rem', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            background: tab === 'riwayat' ? 'var(--color-primary)' : 'transparent',
            color: tab === 'riwayat' ? 'white' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'
          }}><History size={14} /> Riwayat</button>
        </div>

        {/* ============================================================ */}
        {/* TAB: PATROLI */}
        {/* ============================================================ */}
        {tab === 'patroli' && (
          <>
            {step === 1 && (
              <div className="step-login">
                <div className="step-login-header">
                  <h3>Mulai Patroli</h3>
                  <p>Scan barcode checkpoint untuk memulai patroli.</p>
                </div>
                {!todayLog && (
                  <div className="glass-panel" style={{ padding: '0.75rem', borderLeft: '3px solid var(--color-warning)', background: 'rgba(245,158,11,0.08)', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                      <AlertTriangle size={11} /> PLOTTING BELUM DIISI
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Danru/Wadanru belum mengisi absensi & plotting untuk hari ini. Hubungi Danru regu Anda.
                    </p>
                  </div>
                )}
                {todayLog && !myPlotting && (
                  <div className="glass-panel" style={{ padding: '0.75rem', borderLeft: '3px solid var(--color-danger)', background: 'rgba(239,68,68,0.08)', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                      <AlertTriangle size={11} /> ANDA TIDAK TERDAFTAR
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Nama Anda tidak ditemukan di absensi & plotting hari ini. Hubungi Danru untuk konfirmasi.
                    </p>
                  </div>
                )}
                {myPlotting && (
                  <div className="glass-panel" style={{ padding: '0.75rem', borderLeft: '3px solid var(--color-success)', background: 'rgba(16,185,129,0.05)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                      <Shield size={11} /> PLOTTING AKTIF
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Shift:</span>
                      <span style={{ fontWeight: 700 }}>{todayLog?.shift === 'P' ? 'Pagi' : todayLog?.shift === 'S' ? 'Siang' : todayLog?.shift === 'M' ? 'Malam' : shift}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Pos:</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{myPlotting.posPlotting}</span>
                    </div>
                  </div>
                )}
                <div className="step-field">
                  <label>SHIFT PATROLI</label>
                  <select value={shift} onChange={e => setShift(e.target.value)} className="modern-select" disabled={!!myPlotting}>
                    <option value="Pagi">Pagi (06:00-14:00)</option>
                    <option value="Siang">Siang (14:00-22:00)</option>
                    <option value="Malam">Malam (22:00-06:00)</option>
                  </select>
                </div>
                <button onClick={() => setStep(2)} className="btn-primary btn-full">Mulai Scan</button>
              </div>
            )}

            {step === 2 && (
              <div className="step-scan">
                <style>{`
                  @keyframes scan-anim {
                    0% { top: 10%; }
                    50% { top: 90%; }
                    100% { top: 10%; }
                  }
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
                <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Kamera Pemindai Checkpoint</h3>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Arahkan kamera ke QR Code checkpoint</p>
                </div>

                {/* Video Scanner Container */}
                <div style={{ position: 'relative', width: '100%', minHeight: '220px', borderRadius: '12px', overflow: 'hidden', background: '#090f1d', border: '2px solid rgba(59, 130, 246, 0.4)', boxShadow: '0 0 20px rgba(59, 130, 246, 0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <div id="reader" style={{ width: '100%', minHeight: '220px' }}></div>
                  
                  {scanning && !scanLoading && (
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem', zIndex: 10 }}>
                      <div style={{ position: 'absolute', top: 15, left: 15, width: 22, height: 22, borderTop: '4px solid #00f0ff', borderLeft: '4px solid #00f0ff' }}></div>
                      <div style={{ position: 'absolute', top: 15, right: 15, width: 22, height: 22, borderTop: '4px solid #00f0ff', borderRight: '4px solid #00f0ff' }}></div>
                      <div style={{ position: 'absolute', bottom: 15, left: 15, width: 22, height: 22, borderBottom: '4px solid #00f0ff', borderLeft: '4px solid #00f0ff' }}></div>
                      <div style={{ position: 'absolute', bottom: 15, right: 15, width: 22, height: 22, borderBottom: '4px solid #00f0ff', borderRight: '4px solid #00f0ff' }}></div>
                      
                      {/* Laser Line */}
                      <div className="cyber-scanner-line" style={{
                        position: 'absolute', left: '10%', right: '10%', height: '3px',
                        background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
                        boxShadow: '0 0 10px #00f0ff',
                        animation: 'scan-anim 2.5s linear infinite'
                      }}></div>
                    </div>
                  )}

                  {scanLoading && (
                    <div style={{ zIndex: 5, color: '#00f0ff', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'absolute' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid rgba(0,240,255,0.2)', borderTopColor: '#00f0ff', animation: 'spin 0.8s linear infinite' }}></div>
                      <span style={{ fontWeight: 600 }}>Menghidupkan Kamera...</span>
                    </div>
                  )}

                  {scanError && (
                    <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, padding: '0.5rem', background: 'rgba(239, 68, 68, 0.95)', color: 'white', borderRadius: '8px', fontSize: '0.67rem', zIndex: 20, fontWeight: 700, textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }}>
                      ⚠️ {scanError}
                    </div>
                  )}
                </div>

                {/* Fallback Manual Input */}
                <div className="glass-panel" style={{ padding: '0.75rem', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>INPUT MANUAL KODE BARCODE</label>
                  <div className="scan-input-group">
                    <input type="text" value={barcodeInput} onChange={e => { setBarcodeInput(e.target.value); setScanError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleBarcodeScan()}
                      placeholder="Cth: JDC-BSMT-B-1" className="modern-input" style={{ flex: 1, fontSize: '0.8rem' }} />
                    <button onClick={handleBarcodeScan} className="btn-primary" style={{ padding: '0.4rem 0.8rem', whiteSpace: 'nowrap', fontSize: '0.75rem', fontWeight: 700 }}><QrCode size={13} /> Scan</button>
                  </div>
                  {scanError && <div style={{ fontSize: '0.65rem', color: 'var(--color-danger)', marginTop: '0.3rem', fontWeight: 600 }}>⚠️ {scanError}</div>}
                </div>

                <div className="step-hint" style={{ marginBottom: '0.4rem' }}><MapPin size={12} style={{ opacity: 0.5 }} /><span>Atau pilih lokasi langsung:</span></div>
                <div className="scan-area-compact-list" style={{ maxHeight: '110px', overflowY: 'auto' }}>
                  {[...areas].sort((a, b) => {
                    const na = parseInt(a.nomorTitik, 10);
                    const nb = parseInt(b.nomorTitik, 10);
                    if (isNaN(na) && isNaN(nb)) return (a.nomorTitik || '').localeCompare(b.nomorTitik || '');
                    if (isNaN(na)) return 1; if (isNaN(nb)) return -1; return na - nb;
                  }).map(a => (
                    <button key={a.id} onClick={() => {
                      setArea(a); setTimeScan(new Date());
                      setMode(null); setKategori(''); setTemuan('');
                      setSeverity('low'); setDeskripsi(''); setFoto(null);
                      setStep(3);
                      setScanning(false);
                    }} className="scan-compact-item" style={{ padding: '0.35rem 0.5rem' }}>
                      <span className="scan-item-qr" style={{ fontSize: '0.62rem' }}>{a.qrCode}</span>
                      <span className="scan-item-name" style={{ fontSize: '0.65rem' }}>{a.titik}</span>
                      <span className="scan-item-floor" style={{ fontSize: '0.6rem' }}>{['1','2','3','4','5','6'].includes(a.lantai) ? `Lt.${a.lantai}` : a.lantai}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => { resetLaporan(); setStep(1); setScanning(false); }} className="btn-secondary btn-full" style={{ marginTop: '0.5rem', padding: '0.5rem' }}>Kembali</button>
              </div>
            )}

            {step === 3 && area && !mode && (
              <div className="step-decision">
                <div className="glass-panel form-location-box">
                  <p className="form-label">CHECKPOINT TERSCAN</p>
                  <h4 className="form-location-name">{area.titik}</h4>
                  <p className="text-secondary form-location-detail">{area.gedung} | {['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17'].includes(area.lantai) ? `Lantai ${area.lantai}` : area.lantai} | Zona: {area.zona}</p>
                  {timeScan && <div className="form-scan-time"><Clock size={12} /><span>{timeScan.toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'})} WIB</span></div>}
                </div>
                <p className="decision-label">PILIH STATUS AREA:</p>
                <button onClick={handleNormal} className="decision-btn decision-normal">
                  <ThumbsUp size={32} />
                  <span className="decision-btn-title">NORMAL</span>
                  <span className="decision-btn-sub">Tidak ada temuan</span>
                </button>
                <button onClick={() => setMode('temuan')} className="decision-btn decision-temuan">
                  <AlertTriangle size={32} />
                  <span className="decision-btn-title">TEMUAN</span>
                  <span className="decision-btn-sub">Ada temuan / kendala</span>
                </button>
                <button onClick={() => setStep(2)} className="btn-secondary btn-full" style={{ marginTop: '0.5rem' }}>Kembali</button>
              </div>
            )}

            {step === 3 && area && mode === 'temuan' && (
              <form onSubmit={handleTemuanSubmit} className="step-form">
                <div className="glass-panel form-location-box">
                  <p className="form-label">LOKASI CHECKPOINT</p>
                  <h4 className="form-location-name">{area.titik}</h4>
                  <p className="text-secondary form-location-detail">{['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17'].includes(area.lantai) ? `Lantai ${area.lantai}` : area.lantai} | Zona: {area.zona}</p>
                  {timeScan && <div className="form-scan-time"><Clock size={12} /><span>{timeScan.toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'})} WIB</span></div>}
                </div>
                <div className="glass-panel form-section">
                  <h5 className="form-section-title"><AlertTriangle size={14} /> FORM TEMUAN</h5>
                  <div className="step-field">
                    <label>KATEGORI</label>
                    <select value={kategori} onChange={e => setKategori(e.target.value)} className="modern-select" required>
                      <option value="">-- Pilih --</option>
                      {kategoriData.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </div>
                  <div className="step-field">
                    <label>JENIS TEMUAN</label>
                    <select value={temuan} onChange={e => setTemuan(e.target.value)} className="modern-select" disabled={!kategori} required>
                      <option value="">-- Pilih --</option>
                      {daftarTemuan.map(t => <option key={t.kode} value={t.kode}>[{t.kode}] {t.nama}</option>)}
                    </select>
                  </div>
                  <div className="step-field">
                    <label>SEVERITY</label>
                    <div className="severity-grid">
                      {['low','medium','high','critical'].map(s => (
                        <button key={s} type="button" onClick={() => setSeverity(s)}
                          className={`severity-btn ${severity === s ? 'active' : ''}`}
                          style={{
                            '--c': colorSeverity(s), borderColor: severity === s ? colorSeverity(s) : 'var(--border-glass)',
                            background: severity === s ? `${colorSeverity(s)}1A` : 'transparent',
                            color: severity === s ? colorSeverity(s) : 'var(--text-secondary)'
                          }}>
                          {labelSeverity(s)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="step-field">
                    <label>DESKRIPSI</label>
                    <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} className="modern-input form-textarea" rows={3} placeholder="Jelaskan temuan..." />
                  </div>
                  <div className="step-field">
                    <label>FOTO</label>
                    {foto ? <div className="photo-preview"><img src={foto} alt="" /><button type="button" onClick={() => setFoto(null)} className="photo-remove">X</button></div>
                      : <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <label className="photo-upload-btn"><Camera size={14} /> 📷 Kamera
                            <input type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => { compressImage(r.result).then(compressed => setFoto(compressed)); }; r.readAsDataURL(f); } e.target.value = ''; }} hidden />
                          </label>
                          <label className="photo-upload-btn" style={{ background: 'rgba(255,255,255,0.04)' }}><Camera size={14} /> 🖼 Galeri
                            <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => { compressImage(r.result).then(compressed => setFoto(compressed)); }; r.readAsDataURL(f); } e.target.value = ''; }} hidden />
                          </label>
                        </div>}
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setMode(null)} className="btn-secondary" style={{ flex: 1 }}>Kembali</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2, opacity: kategori && temuan ? 1 : 0.5 }} disabled={!kategori || !temuan}>Kirim Laporan</button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="step-success">
                <div className="success-icon-wrap"><Check size={40} /></div>
                <h3>Laporan Terkirim!</h3>
                <p className="text-secondary">Data patroli tercatat di Dashboard Monitoring.</p>
                <div className="glass-panel success-summary">
                  <div className="success-row"><span className="text-secondary">Lokasi:</span><span className="fw-700">{area?.titik}</span></div>
                  <div className="success-row"><span className="text-secondary">Status:</span>
                    <span className="fw-700" style={{ color: mode === 'temuan' ? 'var(--color-warning)' : 'var(--color-success)' }}>
                      {mode === 'temuan' ? 'Temuan' : 'Normal'}
                    </span>
                  </div>
                  {mode === 'temuan' && (
                    <>
                      <div className="success-row"><span className="text-secondary">Temuan:</span><span className="fw-700">{daftarTemuan.find(t => t.kode === temuan)?.nama || '-'}</span></div>
                      <div className="success-row"><span className="text-secondary">Severity:</span><span className="fw-700" style={{ color: colorSeverity(severity) }}>{labelSeverity(severity)}</span></div>
                    </>
                  )}
                </div>
                <button onClick={() => { resetLaporan(); setStep(2); }} className="btn-primary btn-full">Scan Checkpoint Berikutnya</button>
                <button onClick={() => { resetLaporan(); }} className="btn-secondary btn-full">Selesai Patroli</button>
              </div>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* TAB: TEMUAN (Standalone) */}
        {/* ============================================================ */}
        {tab === 'temuan' && (
          <div className="step-form">
            {tSent && (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: 'rgba(16,185,129,0.08)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
                <Check size={36} style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-success)' }}>Temuan Terkirim!</h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Laporan temuan berhasil disimpan ke Dashboard.</p>
                <button onClick={() => { setTSent(false); setTKategori(''); setTTemuan(''); setTSeverity('low'); setTDeskripsi(''); setTFoto(null); setTLokasi(''); }} className="btn-secondary btn-full" style={{ marginTop: '0.75rem' }}>
                  Buat Temuan Baru
                </button>
              </div>
            )}
            {!tSent && (
              <form onSubmit={handleTemuanStandaloneSubmit}>
                <div className="glass-panel form-section">
                  <h5 className="form-section-title"><AlertTriangle size={14} /> FORM TEMUAN / KENDALA</h5>
                  
                  <div className="step-field">
                    <label>LOKASI / AREA</label>
                    <select value={tLokasi} onChange={e => setTLokasi(e.target.value)} className="modern-select" required>
                      <option value="">-- Pilih Area --</option>
                      {areas.map(a => (
                        <option key={a.id} value={`${a.titik} (${a.zona} - ${['1','2','3','4','5','6'].includes(a.lantai) ? `Lt.${a.lantai}` : a.lantai})`}>
                          {a.titik} — {a.qrCode}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="step-field">
                    <label>KATEGORI</label>
                    <select value={tKategori} onChange={e => setTKategori(e.target.value)} className="modern-select" required>
                      <option value="">-- Pilih --</option>
                      {kategoriData.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </div>

                  <div className="step-field">
                    <label>JENIS TEMUAN</label>
                    <select value={tTemuan} onChange={e => setTTemuan(e.target.value)} className="modern-select" disabled={!tKategori} required>
                      <option value="">-- Pilih --</option>
                      {daftarTemuan.filter(t => t.kategori === tKategori).map(t => (
                        <option key={t.kode} value={t.kode}>[{t.kode}] {t.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div className="step-field">
                    <label>SEVERITY</label>
                    <div className="severity-grid">
                      {['low','medium','high','critical'].map(s => (
                        <button key={s} type="button" onClick={() => setTSeverity(s)}
                          className={`severity-btn ${tSeverity === s ? 'active' : ''}`}
                          style={{
                            '--c': colorSeverity(s), borderColor: tSeverity === s ? colorSeverity(s) : 'var(--border-glass)',
                            background: tSeverity === s ? `${colorSeverity(s)}1A` : 'transparent',
                            color: tSeverity === s ? colorSeverity(s) : 'var(--text-secondary)'
                          }}>
                          {labelSeverity(s)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="step-field">
                    <label>DESKRIPSI</label>
                    <textarea value={tDeskripsi} onChange={e => setTDeskripsi(e.target.value)} className="modern-input form-textarea" rows={3} placeholder="Jelaskan temuan / kendala..." />
                  </div>

                  <div className="step-field">
                    <label>FOTO</label>
                    {tFoto ? <div className="photo-preview"><img src={tFoto} alt="" /><button type="button" onClick={() => setTFoto(null)} className="photo-remove">X</button></div>
                      : <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <label className="photo-upload-btn"><Camera size={14} /> 📷 Kamera
                            <input type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => { compressImage(r.result).then(compressed => setTFoto(compressed)); }; r.readAsDataURL(f); } e.target.value = ''; }} hidden />
                          </label>
                          <label className="photo-upload-btn" style={{ background: 'rgba(255,255,255,0.04)' }}><Camera size={14} /> 🖼 Galeri
                            <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => { compressImage(r.result).then(compressed => setTFoto(compressed)); }; r.readAsDataURL(f); } e.target.value = ''; }} hidden />
                          </label>
                        </div>}
                  </div>
                </div>
                <button type="submit" className="btn-primary btn-full" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Send size={16} /> Kirim Temuan
                </button>
              </form>
            )}

            {/* Riwayat temuan terbaru */}
            {myFindings.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <History size={13} /> Riwayat Temuan Saya
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {myFindings.slice(0, 5).map(f => (
                    <div key={f.id} className="glass-panel" style={{ padding: '0.5rem 0.65rem', fontSize: '0.7rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700 }}>{f.kategori}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(f.tanggal).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>📍 {f.area}</div>
                      <div style={{ color: 'var(--text-primary)', marginTop: '0.15rem' }}>{f.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: MUTASI */}
        {/* ============================================================ */}
        {tab === 'mutasi' && (
          <div className="step-form">
            {mSent && (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: 'rgba(16,185,129,0.08)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
                <Check size={36} style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-success)' }}>Mutasi Terkirim!</h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Catatan mutasi berhasil disimpan.</p>
              </div>
            )}

            {!mSent && (
              <>
                <div className="glass-panel form-section">
                  <h5 className="form-section-title"><FileText size={14} /> FORM MUTASI / KEJADIAN</h5>

                  <div className="step-field">
                    <label>KATEGORI</label>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {KATEGORI_MUTASI.map(k => (
                        <button key={k.id} type="button" onClick={() => { setMKat(k.id); if (k.id !== '__lainnya__') setMKatLainnya(''); }} style={{
                          padding: '0.35rem 0.5rem', borderRadius: '6px', fontSize: '0.67rem',
                          border: `1.5px solid ${mKat === k.id ? k.color : 'var(--border-glass)'}`,
                          background: mKat === k.id ? `${k.color}18` : 'transparent',
                          color: mKat === k.id ? k.color : 'var(--text-secondary)',
                          fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                          display: 'flex', alignItems: 'center', gap: '0.2rem'
                        }}>{k.label}</button>
                      ))}
                    </div>
                    {mKat === '__lainnya__' && (
                      <input type="text" value={mKatLainnya} onChange={e => setMKatLainnya(e.target.value)}
                        placeholder="Ketik kategori lain..." className="modern-input" style={{ marginTop: '0.4rem', fontSize: '0.8rem' }} />
                    )}
                  </div>

                  <div className="step-field">
                    <label>LOKASI / POS</label>
                    <input type="text" value={mLokasi} onChange={e => { setMLokasi(e.target.value); setMErrors(p => ({ ...p, lokasi: '' })); }}
                      placeholder="Contoh: Lobby Utama / Lt.3" className="modern-input" style={{ fontSize: '0.8rem' }} />
                    {mErrors.lokasi && <span style={{ fontSize: '0.65rem', color: 'var(--color-danger)' }}>{mErrors.lokasi}</span>}
                  </div>

                  <div className="step-field">
                    <label>URAIAN KEJADIAN</label>
                    <textarea value={mUraian} onChange={e => { setMUraian(e.target.value); setMErrors(p => ({ ...p, uraian: '' })); }}
                      placeholder="Jelaskan kejadian secara detail..." className="modern-input" style={{ height: '80px', resize: 'vertical', fontSize: '0.8rem', padding: '0.5rem' }} />
                    {mErrors.uraian && <span style={{ fontSize: '0.65rem', color: 'var(--color-danger)' }}>{mErrors.uraian}</span>}
                  </div>

                  <div className="step-field">
                    <label>FOTO <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opsional)</span></label>
                    {mFoto ? <div className="photo-preview"><img src={mFoto} alt="" /><button type="button" onClick={() => setMFoto(null)} className="photo-remove">X</button></div>
                      : <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <label className="photo-upload-btn"><Camera size={14} /> 📷 Kamera
                            <input type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => { compressImage(r.result).then(compressed => setMFoto(compressed)); }; r.readAsDataURL(f); } e.target.value = ''; }} hidden />
                          </label>
                          <label className="photo-upload-btn" style={{ background: 'rgba(255,255,255,0.04)' }}><Camera size={14} /> 🖼 Galeri
                            <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => { compressImage(r.result).then(compressed => setMFoto(compressed)); }; r.readAsDataURL(f); } e.target.value = ''; }} hidden />
                          </label>
                        </div>}
                  </div>
                </div>

                <button onClick={handleMutasiSubmit} className="btn-primary btn-full" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Send size={16} /> Kirim Mutasi
                </button>
              </>
            )}

            {/* Riwayat mutasi terbaru */}
            {myMutasi.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <History size={13} /> Riwayat Mutasi Terbaru
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {myMutasi.slice(0, 5).map(m => (
                    <div key={m.id} className="glass-panel" style={{ padding: '0.5rem 0.65rem', fontSize: '0.7rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700 }}>{m.kategori}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{m.tanggal} {m.waktu}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>{m.lokasi}</div>
                      <div style={{ color: 'var(--text-primary)', marginTop: '0.15rem' }}>{m.uraian}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: RIWAYAT */}
        {/* ============================================================ */}
        {tab === 'riwayat' && (
          <div>
            {/* Sub-tab: Patroli / Temuan / Mutasi */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', background: 'var(--bg-glass)', borderRadius: '8px', padding: '0.15rem' }}>
              {[
                { id: 'patroli', label: 'Patroli', icon: MapPin },
                { id: 'temuan', label: 'Temuan', icon: AlertTriangle },
                { id: 'mutasi', label: 'Mutasi', icon: FileText }
              ].map(st => (
                <button key={st.id} onClick={() => setRiwayatTab(st.id)} style={{
                  flex: 1, padding: '0.35rem 0.2rem', fontSize: '0.62rem', fontWeight: 700,
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  background: riwayatTab === st.id ? 'var(--color-primary)' : 'transparent',
                  color: riwayatTab === st.id ? 'white' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem'
                }}><st.icon size={11} /> {st.label}</button>
              ))}
            </div>

            {/* Riwayat Patroli */}
            {riwayatTab === 'patroli' && (
              <>
                {myReports.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <MapPin size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                    <p>Belum ada laporan patroli.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {myReports.map(r => (
                      <div key={r.id} className="glass-panel" style={{ padding: '0.55rem 0.65rem', fontSize: '0.7rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                          <span style={{ fontWeight: 700 }}>{r.titik}</span>
                          <span style={{ color: r.status === 'normal' ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 600, fontSize: '0.6rem' }}>
                            {r.status === 'normal' ? 'NORMAL' : 'TEMUAN'}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                          {r.gedung} • {['1','2','3','4','5','6'].includes(r.lantai) ? `Lt.${r.lantai}` : r.lantai} • {r.shift}
                        </div>
                        {r.keterangan && <div style={{ marginTop: '0.2rem', color: 'var(--text-primary)' }}>{r.keterangan}</div>}
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', marginTop: '0.15rem' }}>
                          {r.timestamp ? new Date(r.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Riwayat Temuan */}
            {riwayatTab === 'temuan' && (
              <>
                {myFindings.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <AlertTriangle size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                    <p>Belum ada temuan.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {myFindings.map(f => (
                      <div key={f.id} className="glass-panel" style={{ padding: '0.55rem 0.65rem', fontSize: '0.7rem', borderLeft: `3px solid ${f.severity === 'Kritis' ? '#dc2626' : f.severity === 'Tinggi' ? '#ef4444' : f.severity === 'Sedang' ? '#f59e0b' : '#3b82f6'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700 }}>{f.kategori}</span>
                          <span style={{
                            fontSize: '0.55rem', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: 700,
                            background: f.status === 'Open' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                            color: f.status === 'Open' ? 'var(--color-danger)' : 'var(--color-success)'
                          }}>{f.status}</span>
                        </div>
                        <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.65rem' }}>{f.area}</div>
                        {f.detail && <div style={{ marginTop: '0.15rem', color: 'var(--text-primary)' }}>{f.detail}</div>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem', color: 'var(--text-muted)', fontSize: '0.6rem' }}>
                          <span>{f.severity}</span>
                          <span>{f.tanggal ? new Date(f.tanggal).toLocaleString('id-ID', { dateStyle: 'short' }) : '-'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Riwayat Mutasi */}
            {riwayatTab === 'mutasi' && (
              <>
                {myMutasi.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <FileText size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                    <p>Belum ada catatan mutasi.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {myMutasi.map(m => (
                      <div key={m.id} className="glass-panel" style={{ padding: '0.55rem 0.65rem', fontSize: '0.7rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700 }}>{m.kategori}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>{m.tanggal} {m.waktu}</span>
                        </div>
                        <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.65rem' }}>{m.lokasi}</div>
                        <div style={{ marginTop: '0.15rem', color: 'var(--text-primary)' }}>{m.uraian}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Plotting Assignment Alarm Overlay */}
        {showPlottingModal && myPlotting && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(9, 15, 29, 0.96)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px'
          }}>
            <div className="glass-panel" style={{
              width: '100%',
              maxWidth: '280px',
              padding: '1.75rem 1.25rem',
              textAlign: 'center',
              border: '2px solid var(--color-primary)',
              boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '55px',
                height: '55px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '2px solid var(--color-primary)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)',
                animation: 'pulse 1.5s infinite'
              }}>
                <Shield size={28} />
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', marginBottom: '0.2rem' }}>PLOTTING DITERIMA!</h3>
                <p style={{ fontSize: '0.67rem', color: 'var(--text-secondary)' }}>Danru telah memperbarui plotting penugasan Anda.</p>
              </div>

              <div className="glass-panel" style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.02)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                fontSize: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Shift:</span>
                  <strong style={{ color: 'white' }}>{todayLog?.shift === 'P' ? 'Pagi' : todayLog?.shift === 'S' ? 'Siang' : todayLog?.shift === 'M' ? 'Malam' : 'Khusus'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Jam Dinas:</span>
                  <strong style={{ color: 'white' }}>{myPlotting.jamDinas}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Pos Jaga:</span>
                  <strong style={{ color: 'var(--color-primary)', fontSize: '0.8rem' }}>📍 {myPlotting.posPlotting}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status Jaga:</span>
                  <span className="badge badge-info" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>{myPlotting.status}</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setShowPlottingModal(false)}
                className="btn-primary" 
                style={{ width: '100%', padding: '0.65rem', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Terima Tugas & Standby
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}