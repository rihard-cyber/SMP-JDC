import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Download, 
  Printer, 
  Layers, 
  Check, 
  HelpCircle,
  FileCheck,
  Building,
  User,
  UserCheck
} from 'lucide-react';

export default function BarcodeGenerator({ areas, onAddArea, users, onAddUser }) {
  // Single Area Creator state
  const [floor, setFloor] = useState('1');
  const [zone, setZone] = useState('Zona A');
  const [titik, setTitik] = useState('');
  
  // User & Role Creator state
  const [userName, setUserName] = useState('');
  const [userNrp, setUserNrp] = useState('');
  const [userRole, setUserRole] = useState('Petugas Security');
  const [userAvatar, setUserAvatar] = useState('');

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim() || !userNrp.trim()) {
      alert('Nama dan NRP wajib diisi!');
      return;
    }
    if (users && users.some(u => u.nrp === userNrp)) {
      alert(`Error: NRP ${userNrp} sudah digunakan oleh anggota lain!`);
      return;
    }

    onAddUser({
      nama: userName,
      nrp: userNrp,
      jabatan: userRole,
      avatar: userAvatar
    });

    setUserName('');
    setUserNrp('');
    setUserRole('Petugas Security');
    setUserAvatar('');
  };
  
  // Bulk Generator state
  const [bulkCount, setBulkCount] = useState(100);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [bulkDownloadReady, setBulkDownloadReady] = useState(false);

  const canvasRef = useRef(null);

  // Generate QR Code Pattern code
  const getQRPattern = () => {
    const cleanFloor = floor.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const cleanZone = zone.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const cleanTitik = titik.replace(/[^A-Za-z0-9]/g, '-').toUpperCase();
    return `JDC-LT${cleanFloor}-${cleanZone}-${cleanTitik}`;
  };

  // Submit new Area
  const handleAdd = (e) => {
    e.preventDefault();
    if (!titik.trim()) {
      alert('Nama titik tidak boleh kosong!');
      return;
    }

    const qrCode = getQRPattern();
    onAddArea({
      gedung: 'JDC',
      lantai: floor,
      zona: zone,
      titik: titik,
      qrCode: qrCode
    });

    setTitik('');
  };

  // Draw simulated QR Code & download it
  const handleDownloadQR = (area) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 250, 290);
    
    // Draw outer QR frame
    ctx.strokeStyle = '#0b0f19';
    ctx.lineWidth = 4;
    ctx.strokeRect(15, 15, 220, 220);
    
    // Draw 3 Corner squares of QR
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(25, 25, 45, 45); // Top Left
    ctx.fillRect(180, 25, 45, 45); // Top Right
    ctx.fillRect(25, 180, 45, 45); // Bottom Left
    
    // Inner white squares
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(35, 35, 25, 25);
    ctx.fillRect(190, 35, 25, 25);
    ctx.fillRect(35, 190, 25, 25);
    
    // Inner black dots
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(42, 42, 11, 11);
    ctx.fillRect(197, 42, 11, 11);
    ctx.fillRect(42, 197, 11, 11);

    // Random noise pixels in the center of QR (simulate actual QR code)
    ctx.fillStyle = '#0b0f19';
    for (let x = 80; x < 170; x += 10) {
      for (let y = 30; y < 220; y += 10) {
        if (Math.random() > 0.5) {
          ctx.fillRect(x, y, 7, 7);
        }
      }
    }
    for (let x = 30; x < 80; x += 10) {
      for (let y = 80; y < 170; y += 10) {
        if (Math.random() > 0.5) {
          ctx.fillRect(x, y, 7, 7);
        }
      }
    }
    for (let x = 170; x < 220; x += 10) {
      for (let y = 80; y < 170; y += 10) {
        if (Math.random() > 0.5) {
          ctx.fillRect(x, y, 7, 7);
        }
      }
    }

    // Text Label below QR
    ctx.fillStyle = '#0b0f19';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(area.qrCode, 125, 255);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(`${area.gedung} - Lantai ${area.lantai} (${area.zona})`, 125, 275);

    // Trigger Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QR-${area.qrCode}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Bulk Generator Simulation
  const handleBulkGenerate = () => {
    setGenerating(true);
    setBulkDownloadReady(false);
    setGenProgress(0);

    const interval = setInterval(() => {
      setGenProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGenerating(false);
          setBulkDownloadReady(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Hidden Canvas for QR Rendering */}
      <canvas ref={canvasRef} width="250" height="290" style={{ display: 'none' }} />

      <div className="grid-cols-3" style={{ gap: '2rem' }}>
        
        {/* 1. SINGLE AREA REGISTRATION FORM */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Plus size={18} className="text-primary" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
            <span>Registrasi Area Baru</span>
          </h3>

          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>GEDUNG</label>
              <input type="text" value="Jakarta Design Center (JDC)" disabled className="modern-input" style={{ opacity: 0.6 }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>LANTAI</label>
                <select value={floor} onChange={(e) => setFloor(e.target.value)} className="modern-select">
                  <option value="B1">Basement B1</option>
                  <option value="1">Lantai 1</option>
                  <option value="2">Lantai 2</option>
                  <option value="3">Lantai 3</option>
                  <option value="4">Lantai 4</option>
                  <option value="5">Lantai 5</option>
                  <option value="6">Lantai 6</option>
                  <option value="7">Lantai 7</option>
                  <option value="Outdoor">Area Luar</option>
                </select>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ZONA</label>
                <select value={zone} onChange={(e) => setZone(e.target.value)} className="modern-select">
                  <option value="Zona A">Zona A</option>
                  <option value="Zona B">Zona B</option>
                  <option value="Zona C">Zona C</option>
                  <option value="Zona D">Zona D</option>
                  <option value="Zona E">Zona E</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>NAMA TITIK PATROLI</label>
              <input 
                type="text" 
                value={titik} 
                onChange={(e) => setTitik(e.target.value)} 
                placeholder="Contoh: Lift Timur, Tangga Darurat" 
                className="modern-input" 
              />
            </div>

            {titik && (
              <div className="glass-panel" style={{ padding: '0.75rem', background: 'rgba(59,130,246,0.02)', fontSize: '0.75rem', borderStyle: 'dashed' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Generated QR Token:</span>
                <p style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                  {getQRPattern()}
                </p>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              <Plus size={16} /> Daftarkan Area
            </button>

          </form>
        </div>

        {/* 2. BULK BARCODE GENERATOR PANEL */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Layers size={18} className="text-primary" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
            <span>Generator Barcode Massal</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Untuk peluncuran area baru JDC secara masif, generate barcode dan download dalam bentuk ZIP untuk dicetak sekaligus.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>JUMLAH BARCODE</label>
              <select 
                value={bulkCount} 
                onChange={(e) => setBulkCount(parseInt(e.target.value))} 
                className="modern-select"
              >
                <option value="100">100 Barcode Lokasi</option>
                <option value="500">500 Barcode Lokasi</option>
                <option value="1000">1000 Barcode Lokasi</option>
              </select>
            </div>

            {generating ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span>Memproses QR codes...</span>
                  <span>{genProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${genProgress}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.15s ease-out' }} />
                </div>
              </div>
            ) : bulkDownloadReady ? (
              <div className="glass-panel" style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Check size={18} /> <span>{bulkCount} Barcodes Siap Didownload!</span>
                </div>
                <button 
                  onClick={() => {
                    alert(`📥 Mengunduh file zip sapujagat-jdc-${bulkCount}-barcodes.zip (Simulated Download)`);
                    setBulkDownloadReady(false);
                  }}
                  className="btn-primary" 
                  style={{ width: '100%', background: 'var(--color-success)' }}
                >
                  <Download size={16} /> Download ZIP
                </button>
              </div>
            ) : (
              <button onClick={handleBulkGenerate} className="btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Generate QR Codes
              </button>
            )}

            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              <p>• Output berupa file PNG beresolusi tinggi.</p>
              <p>• Token dinamis disematkan secara acak guna mencegah duplikasi.</p>
            </div>
          </div>
        </div>

        {/* 3. USER & ROLE REGISTRATION FORM */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <User size={18} className="text-primary" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
            <span>Registrasi Anggota & Role</span>
          </h3>

          <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>NAMA LENGKAP</label>
              <input 
                type="text" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
                placeholder="Contoh: Richard Meha" 
                className="modern-input" 
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 0 }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>NRP / ID</label>
                <input 
                  type="text" 
                  value={userNrp} 
                  onChange={(e) => setUserNrp(e.target.value)} 
                  placeholder="20005" 
                  className="modern-input" 
                  required
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 0 }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>JABATAN / ROLE</label>
                <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="modern-select">
                  <option value="Super Admin">Super Admin</option>
                  <option value="Manager Security">Manager Security</option>
                  <option value="Chief Security">Chief Security</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Client (View Only)">Client (View Only)</option>
                  <option value="Petugas Security">Petugas Security</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AVATAR IMAGE URL (OPSIONAL)</label>
              <input 
                type="text" 
                value={userAvatar} 
                onChange={(e) => setUserAvatar(e.target.value)} 
                placeholder="https://images.unsplash.com/..." 
                className="modern-input" 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              <UserCheck size={16} /> Tambahkan Anggota
            </button>
          </form>
        </div>

        {/* 3. MASTER AREA LIST VIEW */}
        <div className="glass-panel grid-span-3" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Building size={18} className="text-primary" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
            <span>Daftar Master Area Aktif JDC ({areas.length})</span>
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Gedung</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Lantai</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Zona</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Titik / Pos Patroli</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Token QR Code</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Aksi Barcode</th>
                </tr>
              </thead>
              <tbody>
                {areas.map((area, idx) => (
                  <tr 
                    key={area.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.03)', 
                      background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' 
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{area.gedung}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{area.lantai !== 'Outdoor' ? `Lantai ${area.lantai}` : 'Outdoor'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{area.zona}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-primary)' }}>{area.titik}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', opacity: 0.8 }}>{area.qrCode}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleDownloadQR(area)}
                          title="Download Barcode PNG"
                          style={{
                            background: 'rgba(59,130,246,0.1)',
                            border: 'none',
                            color: 'var(--color-primary)',
                            padding: '0.35rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Download size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            alert(`🖨️ Mengirim berkas cetak QR ${area.qrCode} ke printer antrean.`);
                          }}
                          title="Cetak Stiker Barcode"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: 'var(--text-primary)',
                            padding: '0.35rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
