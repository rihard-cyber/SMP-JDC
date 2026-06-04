import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  Clock, 
  Smartphone, 
  Check, 
  AlertTriangle,
  QrCode,
  Shield,
  HelpCircle,
  TrendingUp,
  UserCheck,
  Wifi,
  WifiOff,
  Database,
  RefreshCw
} from 'lucide-react';

export default function SecurityPatrolApp({ currentUser, areas, onAddReport, onTriggerSOS }) {
  // Alur Patroli Steps: 1 = Shift Select/Login, 2 = Ready to Scan, 3 = Patrol Form & Anti-Fraud, 4 = Success
  const [patrolStep, setPatrolStep] = useState(1);
  const [selectedShift, setSelectedShift] = useState('Pagi');
  const [selectedArea, setSelectedArea] = useState(null);
  
  // Advanced Features: Connection Simulator & Offline Queue
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('sapujagat_offline_queue');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed parsing sapujagat_offline_queue, falling back:", e);
      return [];
    }
  });
  
  // Anti-fraud controller states
  const [gpsRange, setGpsRange] = useState('in-range'); // 'in-range' | 'out-of-range'
  const [enableSelfie, setEnableSelfie] = useState(false);
  const [selfieTaken, setSelfieTaken] = useState(false);
  
  // Form states
  const [kondisi, setKondisi] = useState('Aman dan Kondusif');
  const [severity, setSeverity] = useState('Rendah'); // 'Rendah' | 'Sedang' | 'Tinggi'
  const [keterangan, setKeterangan] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  
  // Dynamic Checklist States (stores true/false for checklist checkboxes)
  const [checklistAnswers, setChecklistAnswers] = useState({});
  
  // Tracking states
  const [timeStart, setTimeStart] = useState(null);
  const [timeScan, setTimeScan] = useState(null);
  const [timeEnd, setTimeEnd] = useState(null);

  // Device Info Simulation
  const simulatedDevice = {
    model: 'Android 14 (Redmi Note 13 Pro)',
    browser: 'Chrome Mobile v125.0.2',
    ip: '192.168.43.82',
    imei: '35829104-8849-214'
  };

  // Sync offline queue to localstorage
  useEffect(() => {
    localStorage.setItem('sapujagat_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Set initial times on steps
  useEffect(() => {
    if (patrolStep === 2) {
      setTimeStart(new Date());
    }
  }, [patrolStep]);

  // Auto-sync offline queue when toggled back online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      // Sync reports back to central DB
      offlineQueue.forEach(report => {
        onAddReport(report);
      });
      setOfflineQueue([]);
      alert(`🔄 Koneksi pulih! ${offlineQueue.length} laporan patroli offline berhasil disinkronisasi ke Dashboard.`);
    }
  }, [isOnline]);

  // Determine dynamic checklist template based on area type
  const getAreaChecklistTemplate = (area) => {
    if (!area) return [];
    
    // Server Room / Risky areas
    if (area.titik.toLowerCase().includes('server') || area.titik.toLowerCase().includes('panel')) {
      return [
        { key: 'ac_status', label: 'Suhu ruangan AC dingin (< 20°C)' },
        { key: 'magnetic_lock', label: 'Pintu magnetik terkunci rapat' },
        { key: 'led_indicator', label: 'Indikator lampu server hijau (Normal)' },
        { key: 'apar_ready', label: 'Tabung APAR tersedia & jarum hijau' }
      ];
    }
    // Lift / Elevator
    if (area.titik.toLowerCase().includes('lift') || area.titik.toLowerCase().includes('elevator')) {
      return [
        { key: 'door_sensor', label: 'Sensor pintu lift berfungsi responsif' },
        { key: 'indicator_light', label: 'Lampu indikator lantai menyala' },
        { key: 'noise_level', label: 'Lift bergerak mulus tanpa suara aneh' },
        { key: 'emergency_call', label: 'Tombol panggilan darurat menyala' }
      ];
    }
    // Parking / Basement
    if (area.lantai === 'B1' || area.titik.toLowerCase().includes('parkir')) {
      return [
        { key: 'leakage', label: 'Bebas dari kebocoran pipa / air' },
        { key: 'lighting', label: 'Penerangan area cukup & terang' },
        { key: 'wrong_parking', label: 'Tidak ada kendaraan parkir liar/menghalangi' },
        { key: 'puddle', label: 'Lantai bebas genangan air / oli' }
      ];
    }
    // General Lobby / Hallway / Mushola
    return [
      { key: 'cleanliness', label: 'Area dalam kondisi bersih dan rapi' },
      { key: 'electrical', label: 'Semua sakelar lampu menyala normal' },
      { key: 'obstruction', label: 'Koridor darurat bebas dari hambatan' },
      { key: 'locked_doors', label: 'Pintu-pintu ruangan terkunci setelah jam kerja' }
    ];
  };

  const checklistTemplate = getAreaChecklistTemplate(selectedArea);

  // Initialize checklist answers when area is scanned
  const handleScanArea = (areaId) => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return;
    
    setSelectedArea(area);
    const template = getAreaChecklistTemplate(area);
    const initialAnswers = {};
    template.forEach(item => {
      initialAnswers[item.key] = false;
    });
    setChecklistAnswers(initialAnswers);
    setTimeScan(new Date());
    setPatrolStep(3);
  };

  // Toggle checklist item
  const handleToggleChecklist = (key) => {
    setChecklistAnswers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit report logic
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (gpsRange === 'out-of-range') {
      alert('❌ PROSES DIBLOKIR: Anda berada di luar radius lokasi barcode (10-20 meter). Sistem anti-kecurangan aktif.');
      return;
    }

    // Check if all checklist items are ticked
    const allChecked = Object.values(checklistAnswers).every(v => v === true);
    if (!allChecked && kondisi === 'Aman dan Kondusif') {
      alert('⚠️ Perhatian: Anda harus memeriksa dan mencentang semua item checklist verifikasi area sebelum mengirim laporan sebagai "Aman".');
      return;
    }

    const submitTime = new Date();
    setTimeEnd(submitTime);

    const reportData = {
      timestamp: timeScan.toISOString(),
      timestampEnd: submitTime.toISOString(),
      userId: currentUser.id,
      userName: currentUser.nama,
      areaId: selectedArea.id,
      gedung: selectedArea.gedung,
      lantai: selectedArea.lantai,
      zona: selectedArea.zona,
      titik: selectedArea.titik,
      shift: selectedShift,
      kondisi: kondisi,
      severity: kondisi !== 'Aman dan Kondusif' ? severity : 'Rendah',
      keterangan: keterangan,
      foto: attachedPhoto,
      checklist: checklistAnswers,
      antiFraud: {
        gpsValid: gpsRange === 'in-range',
        gpsCoords: gpsRange === 'in-range' ? { lat: -6.2148, lng: 106.8015 } : { lat: -6.2201, lng: 106.7902 },
        radius: gpsRange === 'in-range' ? 12 : 1250,
        dynamicToken: `TOKEN-${selectedArea.qrCode}-${Math.floor(1000 + Math.random() * 9000)}`,
        device: simulatedDevice.model,
        ip: simulatedDevice.ip,
        selfieUrl: enableSelfie ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60' : null
      }
    };

    if (isOnline) {
      onAddReport(reportData);
    } else {
      // Offline mode cache queue
      setOfflineQueue(prev => [...prev, reportData]);
      alert('💾 Offline Mode: Laporan tersimpan di memori HP. Akan otomatis terunggah saat sinyal/internet kembali aktif.');
    }
    
    setPatrolStep(4);
  };

  const handleReset = () => {
    setSelectedArea(null);
    setKondisi('Aman dan Kondusif');
    setSeverity('Rendah');
    setKeterangan('');
    setAttachedPhoto(null);
    setChecklistAnswers({});
    setSelfieTaken(false);
    setPatrolStep(2);
  };

  return (
    <div className="mobile-phone-frame">
      <div className="mobile-screen">
        
        {/* Device Status Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '0.7rem', 
          color: 'rgba(255,255,255,0.4)', 
          marginBottom: '1rem',
          padding: '0 0.5rem',
          alignItems: 'center'
        }}>
          <span>09:41</span>
          
          {/* Connection Mode Toggle (Simulation Switcher) */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              type="button" 
              onClick={() => setIsOnline(!isOnline)}
              style={{
                border: 'none',
                background: 'transparent',
                color: isOnline ? 'var(--color-success)' : 'var(--color-danger)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontSize: '0.7rem',
                fontWeight: 700
              }}
              title="Klik untuk simulasi sinyal"
            >
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </button>
            <span style={{ color: gpsRange === 'in-range' ? 'var(--color-success)' : 'var(--color-danger)' }}>●</span>
          </div>
        </div>

        {/* Offline Queue Badge Notification */}
        {offlineQueue.length > 0 && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            padding: '0.4rem',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--color-warning)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Database size={12} />
              <span>{offlineQueue.length} Laporan Pending Offline</span>
            </div>
            {isOnline && (
              <RefreshCw size={12} className="spin" style={{ animation: 'spin 2s linear infinite' }} />
            )}
          </div>
        )}

        {/* Header App */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingBottom: '0.75rem', 
          marginBottom: '1rem', 
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="logo.png" alt="JDC" style={{ height: '22px', width: 'auto', objectFit: 'contain' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>SAPUJAGAT MOBILE</h4>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>JDC Security Patrol App</p>
            </div>
          </div>
          <button 
            onClick={() => onTriggerSOS(currentUser.nama, selectedArea ? selectedArea.titik : 'Lobby Utama')}
            style={{ 
              background: 'var(--color-danger)', 
              color: 'white', 
              border: 'none', 
              padding: '0.3rem 0.6rem', 
              borderRadius: '6px', 
              fontSize: '0.75rem', 
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 10px var(--color-danger-glow)'
            }}
          >
            🚨 SOS
          </button>
        </div>

        {/* STEP 1: LOGIN & SHIFT SELECT */}
        {patrolStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                background: 'rgba(255, 255, 255, 0.05)',
                width: '90px',
                height: '50px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                padding: '0.25rem'
              }}>
                <img src="logo.png" alt="Logo JDC" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Mulai Tugas Patroli</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Silakan pilih shift dinas aktif Anda.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.nama} 
                style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h4 style={{ fontSize: '0.9rem' }}>{currentUser.nama}</h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>NRP: {currentUser.nrp}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PILIH SHIFT PATROLI</label>
              <select 
                value={selectedShift} 
                onChange={(e) => setSelectedShift(e.target.value)}
                className="modern-select"
              >
                <option value="Pagi">Shift Pagi (07:00 - 15:00)</option>
                <option value="Siang">Shift Siang (15:00 - 23:00)</option>
                <option value="Malam">Shift Malam (23:00 - 07:00)</option>
              </select>
            </div>

            <button 
              onClick={() => setPatrolStep(2)} 
              className="btn-primary" 
              style={{ width: '100%', padding: '0.9rem' }}
            >
              Mulai Tugas Patroli
            </button>
          </div>
        )}

        {/* STEP 2: READY TO SCAN */}
        {patrolStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Target Dashboard Progress */}
            <div className="glass-panel" style={{ padding: '0.85rem', background: 'rgba(59, 130, 246, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 600 }}>Target Shift ({selectedShift})</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>4 / 12 Checkpoints</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '33%', height: '100%', background: 'var(--color-primary)', borderRadius: '3px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                <span>Realisasi: 33%</span>
                <span>Sisa Target: 8 Area</span>
              </div>
            </div>

            <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '15px', padding: '2rem 1rem', textAlign: 'center', background: 'rgba(0,0,0,0.15)' }}>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 1.25rem auto', display: 'flex', alignItems: 'center', justifyItems: 'center', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', justifyContent: 'center' }}>
                <QrCode size={40} className="text-primary" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Scan Barcode Checkpoint</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1.2rem 0', lineHeight: '1.4' }}>
                Arahkan kamera ke Barcode / QR Code lokasi JDC yang terpasang di dinding.
              </p>

              {/* Webcam scan dropdown simulator */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SIMULASIKAN SCAN AREA:</label>
                <select 
                  onChange={(e) => handleScanArea(e.target.value)} 
                  className="modern-select"
                  defaultValue=""
                  style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                >
                  <option value="" disabled>-- Pilih area untuk scan --</option>
                  {['B1', '1', '2', '3', '4', '5', '6', '7', 'Outdoor'].map(fl => {
                    const floorAreas = areas.filter(a => a.lantai === fl);
                    if (floorAreas.length === 0) return null;
                    return (
                      <optgroup key={fl} label={fl === 'Outdoor' ? 'Area Luar' : fl === 'B1' ? 'Basement B1' : `Lantai ${fl}`}>
                        {floorAreas.map(a => (
                          <option key={a.id} value={a.id}>{a.titik}</option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>💡 Ketentuan Patroli:</p>
              <p>• Dilarang scan menggunakan foto barcode (Anti-Fraud Lock aktif).</p>
              <p>• Lokasi GPS wajib aktif dan terverifikasi dalam jangkauan barcode.</p>
            </div>
          </div>
        )}

        {/* STEP 3: PATROL FORM & ANTI-FRAUD VERIFICATION */}
        {patrolStep === 3 && selectedArea && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Auto Prefilled Location */}
            <div className="glass-panel" style={{ padding: '0.85rem', background: 'rgba(59, 130, 246, 0.05)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Identifikasi Lokasi (Auto-Detect)</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>{selectedArea.titik}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Gedung: {selectedArea.gedung} | Lt. {selectedArea.lantai} | Zona: {selectedArea.zona}
              </p>
              <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(59, 130, 246, 0.15)', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Waktu Scan:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {timeScan ? timeScan.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''} WIB
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Hari & Tanggal:</span>
                  <span style={{ fontWeight: 700 }}>
                    {timeScan ? timeScan.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* ANTI-KECURANGAN (Anti-Fraud Validation Console) */}
            <div className="glass-panel" style={{ padding: '0.85rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h5 style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-primary)' }}>
                <Shield size={14} /> Anti-Kecurangan (Anti-Fraud Radar)
              </h5>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                
                {/* Visual GPS Radar map representation */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
                  <svg viewBox="0 0 100 100" style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                    {/* Outer range circle */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    {/* Inner validation radius (10-20m circle) */}
                    <circle cx="50" cy="50" r="15" fill={gpsRange === 'in-range' ? 'rgba(16,185,129,0.1)' : 'none'} stroke={gpsRange === 'in-range' ? 'var(--color-success)' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5" />
                    {/* Center point representing barcode stiker */}
                    <circle cx="50" cy="50" r="3" fill="var(--color-primary)" />
                    {/* Guard position pin */}
                    <circle cx={gpsRange === 'in-range' ? "53" : "15"} cy={gpsRange === 'in-range' ? "48" : "75"} r="4" fill={gpsRange === 'in-range' ? 'var(--color-success)' : 'var(--color-danger)'} />
                  </svg>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600 }}>Jarak:</span>
                      <span style={{ color: gpsRange === 'in-range' ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 700 }}>
                        {gpsRange === 'in-range' ? '12 meter' : '150 meter'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() => setGpsRange('in-range')}
                        style={{
                          flex: 1,
                          padding: '0.2rem',
                          fontSize: '0.6rem',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          background: gpsRange === 'in-range' ? 'var(--color-success)' : 'rgba(255,255,255,0.05)',
                          color: 'white'
                        }}
                      >
                        In-Range
                      </button>
                      <button
                        type="button"
                        onClick={() => setGpsRange('out-of-range')}
                        style={{
                          flex: 1,
                          padding: '0.2rem',
                          fontSize: '0.6rem',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          background: gpsRange === 'out-of-range' ? 'var(--color-danger)' : 'rgba(255,255,255,0.05)',
                          color: 'white'
                        }}
                      >
                        Out-of-Range
                      </button>
                    </div>
                  </div>
                </div>

                {gpsRange === 'out-of-range' && (
                  <div style={{ color: 'var(--color-danger)', fontSize: '0.65rem', display: 'flex', gap: '0.25rem', padding: '0.25rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
                    <AlertTriangle size={12} />
                    <span>Error: GPS di luar batas (150m). Kirim laporan dikunci.</span>
                  </div>
                )}

                {/* Device Info */}
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.1rem', paddingLeft: '0.2rem' }}>
                  <div>Device: <span>{simulatedDevice.model}</span></div>
                  <div>IP: <span>{simulatedDevice.ip}</span></div>
                  <div>Token Lokasi: <span style={{ color: 'var(--color-success)' }}>Dynamic QR Verified</span></div>
                </div>

                {/* Selfie Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                  <input 
                    type="checkbox" 
                    id="selfieCheck" 
                    checked={enableSelfie} 
                    onChange={(e) => setEnableSelfie(e.target.checked)}
                  />
                  <label htmlFor="selfieCheck" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Wajibkan Selfie Patroli</label>
                </div>

                {enableSelfie && (
                  <div style={{ 
                    border: '1px dashed rgba(255,255,255,0.1)', 
                    borderRadius: '8px', 
                    padding: '0.5rem', 
                    textAlign: 'center', 
                    background: 'rgba(0,0,0,0.1)'
                  }}>
                    {selfieTaken ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-success)' }}>
                        <Check size={16} /> <span>Selfie terverifikasi (Mock)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelfieTaken(true)}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border-glass)',
                          color: 'var(--text-primary)',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Camera size={14} /> Ambil Selfie Sekarang
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* DYNAMIC PARAMETER CHECKLIST (Zone-Specific) */}
            <div className="glass-panel" style={{ padding: '0.85rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h5 style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                Checklist Verifikasi Fisik Pos
              </h5>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {checklistTemplate.map(item => (
                  <div 
                    key={item.key} 
                    onClick={() => handleToggleChecklist(item.key)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      fontSize: '0.75rem', 
                      cursor: 'pointer',
                      padding: '0.3rem',
                      borderRadius: '4px',
                      background: checklistAnswers[item.key] ? 'rgba(16,185,129,0.05)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '3px',
                      border: `1.5px solid ${checklistAnswers[item.key] ? 'var(--color-success)' : 'var(--text-muted)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: checklistAnswers[item.key] ? 'var(--color-success)' : 'transparent'
                    }}>
                      {checklistAnswers[item.key] && <Check size={10} color="#fff" />}
                    </div>
                    <span style={{ color: checklistAnswers[item.key] ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Condition Checkbox */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>KONDISI AREA</label>
              <select 
                value={kondisi} 
                onChange={(e) => setKondisi(e.target.value)}
                className="modern-select"
                style={{ fontSize: '0.8rem' }}
              >
                {conditionsList.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* SEVERITY LEVEL SELECTOR (Appears only if condition is not OK) */}
            {kondisi !== 'Aman dan Kondusif' && kondisi !== 'Ada Aktivitas' && kondisi !== 'Renovasi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 600 }}>TINGKAT SEVERITY / PRIORITAS</label>
                <select 
                  value={severity} 
                  onChange={(e) => setSeverity(e.target.value)}
                  className="modern-select"
                  style={{ fontSize: '0.8rem', borderColor: 'var(--color-danger)' }}
                >
                  <option value="Rendah">Rendah (Low)</option>
                  <option value="Sedang">Sedang (Medium)</option>
                  <option value="Tinggi">Tinggi (High / Kritikal)</option>
                </select>
              </div>
            )}

            {/* Keterangan */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>KETERANGAN / TEMUAN</label>
              <textarea 
                value={keterangan} 
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: Lampu koridor mati 2 unit..."
                className="modern-input"
                style={{ height: '70px', resize: 'none', fontSize: '0.8rem' }}
              />
            </div>

            {/* Photo upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FOTO DOKUMENTASI (OPSIONAL)</label>
              
              {attachedPhoto ? (
                <div style={{ position: 'relative', width: '100%', height: '100px', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={attachedPhoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={() => setAttachedPhoto(null)}
                    style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.65rem', cursor: 'pointer' }}
                  >
                    X
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <label style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.4rem', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px dashed var(--border-glass)', 
                    padding: '0.6rem', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}>
                    <Camera size={16} /> Kamera / Galeri
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoSelect} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Submit / Cancel Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={handleReset} 
                className="btn-secondary" 
                style={{ flex: 1, padding: '0.7rem' }}
              >
                Batal
              </button>
              
              <button 
                type="submit" 
                disabled={gpsRange === 'out-of-range' || (enableSelfie && !selfieTaken)}
                className="btn-primary" 
                style={{ 
                  flex: 2, 
                  padding: '0.7rem',
                  opacity: (gpsRange === 'out-of-range' || (enableSelfie && !selfieTaken)) ? 0.4 : 1,
                  cursor: (gpsRange === 'out-of-range' || (enableSelfie && !selfieTaken)) ? 'not-allowed' : 'pointer'
                }}
              >
                Kirim Laporan
              </button>
            </div>

          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {patrolStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '2rem 0', textAlign: 'center' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: 'var(--color-success)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <Check size={36} />
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Laporan Terkirim!</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', padding: '0 0.5rem' }}>
                {isOnline ? 
                  'Patroli checkpoint berhasil diverifikasi dan terupdate ke Dashboard Manajemen secara real-time.' :
                  'Koneksi offline. Patroli berhasil disimpan secara lokal dan akan terkirim saat internet kembali.'
                }
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '0.75rem', width: '100%', background: 'rgba(255,255,255,0.02)', fontSize: '0.75rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Waktu Scan:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {timeScan ? timeScan.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''} WIB
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Hari/Tanggal:</span>
                <span style={{ fontWeight: 700 }}>
                  {timeScan ? timeScan.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </span>
              </div>
            </div>

            <button 
              onClick={handleReset} 
              className="btn-primary" 
              style={{ width: '100%', padding: '0.8rem', marginTop: '1rem' }}
            >
              Scan Checkpoint Berikutnya
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
