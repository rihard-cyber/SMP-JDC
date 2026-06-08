/**
 * =======================================================
 *   SMPJDC SECURITY MANAGEMENT SYSTEM
 *   Module: Barcode & Checkpoint Generator
 *   Signed by: Richard Meha (by -Richard)
 *   Last Maintained: 2026-06-07
 *   Description: Master area checkpoint registration, QR sticker
 *                bulk printing (iframe) and blob downloading.
 * =======================================================
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Download, 
  Printer, 
  Layers, 
  Check,
  Building,
  User,
  UserCheck,
  Phone,
  Hash,
  RefreshCw
} from 'lucide-react';

const FLOOR_OPTIONS = [
  { value: 'Basement', label: 'Basement' },
  { value: '1', label: 'Lantai 1' },
  { value: '2', label: 'Lantai 2' },
  { value: '3', label: 'Lantai 3' },
  { value: '4', label: 'Lantai 4' },
  { value: '5', label: 'Lantai 5' },
  { value: '6', label: 'Lantai 6' },
  { value: 'Halaman Depan', label: 'Halaman Depan' },
  { value: 'Halaman Samping Kanan', label: 'Halaman Samping Kanan' },
  { value: 'Halaman Samping Kiri', label: 'Halaman Samping Kiri' },
  { value: 'Halaman Belakang', label: 'Halaman Belakang' },
  { value: 'Pos 00', label: 'Pos 00' },
  { value: 'R. Teknik', label: 'R. Teknik' },
];

const ZONE_OPTIONS = ['A', 'B', 'C', 'D'];

const QR_LOCATION_CODES = {
  'Basement': 'BSMT',
  '1': 'LT01','2': 'LT02','3': 'LT03','4': 'LT04','5': 'LT05','6': 'LT06',
  'Halaman Depan': 'HD',
  'Halaman Samping Kanan': 'HSKN',
  'Halaman Samping Kiri': 'HSKR',
  'Halaman Belakang': 'HB',
  'Pos 00': 'POS',
  'R. Teknik': 'RTEK'
};

const REGU_OPTIONS = ['Regu A', 'Regu B', 'Regu C', 'Regu D'];
const SHIFT_OPTIONS = [
  { value: 'Pagi', label: 'Pagi (06:00 - 14:00)' },
  { value: 'Siang', label: 'Siang (14:00 - 22:00)' },
  { value: 'Malam', label: 'Malam (22:00 - 06:00)' }
];

export default function BarcodeGenerator({ areas, onAddArea, users, onAddUser }) {
  // Single Area Creator state
  const [floor, setFloor] = useState('1');
  const [floorCustom, setFloorCustom] = useState('');
  const [zone, setZone] = useState('Zone A');
  const [zoneCustom, setZoneCustom] = useState('');
  const [titik, setTitik] = useState('');
  const [nomorTitik, setNomorTitik] = useState('');
  const [qrCounter, setQrCounter] = useState(() => {
    try { return parseInt(localStorage.getItem('smpjdc_qr_counter') || '1'); }
    catch { return 1; }
  });

  useEffect(() => {
    const nums = areas.map(a => parseInt(a.nomorTitik, 10)).filter(n => !isNaN(n));
    const next = nums.length > 0 ? String(Math.max(...nums) + 1) : '1';
    if (!nomorTitik) setNomorTitik(next);
  }, [areas]);

  // User & Role Creator state
  const [userName, setUserName] = useState('');
  const [userNrp, setUserNrp] = useState('');
  const [userRole, setUserRole] = useState('Anggota');
  const [userAvatar, setUserAvatar] = useState('');
  const [userPin, setUserPin] = useState('');
  const [userRegu, setUserRegu] = useState('Regu A');
  const [userShift, setUserShift] = useState('Pagi');
  const [userHp, setUserHp] = useState('');

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim() || !userNrp.trim()) {
      alert('Nama dan NRP wajib diisi!');
      return;
    }
    if (userPin.length > 0 && userPin.length < 4) {
      alert('PIN minimal 4 digit (kosongkan jika tidak ingin PIN)');
      return;
    }
    if (users && users.some(u => u.nrp === userNrp)) {
      alert(`Error: NRP ${userNrp} sudah digunakan oleh anggota lain!`);
      return;
    }

    onAddUser({
      nama: userName, nrp: userNrp, jabatan: userRole,
      avatar: userAvatar, pin: userPin || userNrp.slice(-4),
      regu: userRegu, shift: userShift, nomorHp: userHp, status: 'Aktif'
    });

    setUserName(''); setUserNrp(''); setUserRole('Anggota');
    setUserAvatar(''); setUserPin(''); setUserRegu('Regu A');
    setUserShift('Pagi'); setUserHp('');
  };

  // Bulk Generator state
  const [bulkCount, setBulkCount] = useState(100);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [bulkDownloadReady, setBulkDownloadReady] = useState(false);

  const canvasRef = useRef(null);

  const floorFinal = floor === '__LAINNYA__' ? (floorCustom.trim() || 'Custom') : floor;
  const zoneFinal = zone === '__LAINNYA__' ? (zoneCustom.trim() || 'Custom') : zone;
  const qrLocCode = QR_LOCATION_CODES[floor] || floorFinal.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  const getQRPattern = () => {
    const num = String(qrCounter).padStart(3, '0');
    return `QR-${qrLocCode}-${num}`;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!titik.trim()) { alert('Lokasi tidak boleh kosong!'); return; }
    const qrCode = nomorTitik.trim() ? `JDC-${qrLocCode}-${nomorTitik.trim()}` : getQRPattern();
    onAddArea({ gedung: 'SMPJDC - Jakarta Design Center', lantai: floorFinal, zona: zoneFinal, nomorTitik: nomorTitik.trim(), titik: titik.trim(), qrCode });
    const newCount = qrCounter + 1;
    setQrCounter(newCount);
    localStorage.setItem('smpjdc_qr_counter', String(newCount));
    setTitik('');
  };

  const handleDownloadQR = async (area) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(area.qrCode)}`;
    
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${area.qrCode}.png`;
      link.href = objectUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      console.error('Download QR failed:', err);
      const link = document.createElement('a');
      link.download = `${area.qrCode}.png`;
      link.href = qrUrl;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrintQR = (area) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(area.qrCode)}`;
    
    const printWin = window.open('', '_blank', 'width=400,height=600');
    if (!printWin) {
      alert('Izinkan popup untuk mencetak barcode, atau cetak manual.');
      return;
    }
    printWin.document.write(`
      <html>
        <head>
          <title>Cetak QR Checkpoint - ${area.qrCode}</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
              text-align: center;
              color: #0b0f19;
            }
            .qr-card {
              border: 3px double #0b0f19;
              padding: 25px;
              border-radius: 12px;
              display: inline-block;
              background: #fff;
            }
            img { width: 280px; height: 280px; margin-bottom: 15px; }
            h2 { margin: 0 0 5px 0; font-size: 22px; letter-spacing: 1px; }
            p { margin: 0; font-size: 14px; color: #555; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <img src="${qrUrl}" alt="QR Checkpoint" />
            <h2>${area.qrCode}</h2>
            <p style="font-weight: bold; margin-bottom: 4px;">${area.titik}</p>
            <p>${area.gedung} - Lantai ${area.lantai} (${area.zona})</p>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #999;">Tutup jendela ini setelah mencetak.</p>
          <script>window.onload=function(){setTimeout(function(){window.print();},500)};<\/script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handlePrintAllQRs = () => {
    if (areas.length === 0) {
      alert('Tidak ada master area untuk dicetak!');
      return;
    }
    
    const printWin = window.open('', '_blank', 'width=500,height=700');
    if (!printWin) {
      alert('Izinkan popup untuk mencetak barcode, atau cetak manual.');
      return;
    }
    
    let htmlContent = `
      <html>
        <head>
          <title>Cetak Semua QR Checkpoint SMPJDC</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #0b0f19;
            }
            .print-page {
              page-break-after: always;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              box-sizing: border-box;
              text-align: center;
              padding: 40px;
            }
            .qr-card {
              border: 4px double #0b0f19;
              padding: 30px;
              border-radius: 16px;
              display: inline-block;
              background: #fff;
            }
            img { width: 320px; height: 320px; margin-bottom: 20px; }
            h2 { margin: 0 0 8px 0; font-size: 26px; letter-spacing: 1px; }
            p { margin: 0; font-size: 16px; color: #444; }
            .print-page:last-child { page-break-after: avoid; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
    `;
    
    areas.forEach(area => {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(area.qrCode)}`;
      htmlContent += `
        <div class="print-page">
          <div class="qr-card">
            <img src="${qrUrl}" alt="QR" />
            <h2>${area.qrCode}</h2>
            <p style="font-weight: bold; margin-bottom: 5px;">${area.titik}</p>
            <p>${area.gedung} - Lantai ${area.lantai} (${area.zona})</p>
          </div>
        </div>
      `;
    });
    
    htmlContent += `
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 1500);
        };
      <\/script>
        </body>
      </html>
    `;
    
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  const handleBulkGenerate = async () => {
    setGenerating(true);
    setBulkDownloadReady(false);
    setGenProgress(0);

    const areasToGenerate = areas;
    const total = areasToGenerate.length;

    for (let i = 0; i < total; i++) {
      const area = areasToGenerate[i];
      const qrData = area.qrCode || `JDC-${area.zona || 'X'}-${area.nomorTitik}`;
      try {
        const resp = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `QR-${qrData.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Gagal download QR untuk', qrData, e);
      }
      await new Promise(r => setTimeout(r, 200));
      setGenProgress(Math.round(((i + 1) / total) * 100));
    }

    setGenerating(false);
    setBulkDownloadReady(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Hidden Canvas for QR Rendering */}
      <canvas ref={canvasRef} width="250" height="290" style={{ display: 'none' }} />

      <div className="grid-cols-3" style={{ gap: '2rem' }}>
        
        {/* 1. SINGLE AREA REGISTRATION FORM */}
        <div className="glass-panel panel-body" style={{ height: 'fit-content' }}>
          <h3 className="section-title">
            <Plus size={18} className="text-primary" style={{ flexShrink: 0 }} />
            <span>Registrasi Area Baru</span>
          </h3>

          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            <div className="form-field">
              <label className="form-label">LOKASI / GEDUNG</label>
              <div className="form-input-wrap" style={{ opacity: 0.6 }}>
                <Building size={16} />
                <input type="text" value="SMPJDC - Jakarta Design Center" disabled className="form-input" />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">LANTAI</label>
                <select value={floor} onChange={e => setFloor(e.target.value)} className="form-select">
                  {FLOOR_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  <option value="__LAINNYA__">Lainnya...</option>
                </select>
                {floor === '__LAINNYA__' && (
                  <input type="text" value={floorCustom} onChange={e => setFloorCustom(e.target.value)} placeholder="Tulis lantai manual" className="form-input form-input-sm" />
                )}
              </div>
              <div className="form-field">
                <label className="form-label">NOMOR TITIK</label>
                <input type="text" value={nomorTitik} onChange={e => setNomorTitik(e.target.value)} placeholder="Cth: 1, 2, 3 atau ID" className="form-input" />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">ZONA</label>
                <select value={zone} onChange={e => setZone(e.target.value)} className="form-select">
                  {ZONE_OPTIONS.map(z => <option key={z} value={z}>{z}</option>)}
                  <option value="__LAINNYA__">Lainnya...</option>
                </select>
                {zone === '__LAINNYA__' && (
                  <input type="text" value={zoneCustom} onChange={e => setZoneCustom(e.target.value)} placeholder="Tulis zona manual" className="form-input form-input-sm" />
                )}
              </div>
              <div className="form-field">
                <label className="form-label">LOKASI / TITIK PATROLI</label>
                <input type="text" value={titik} onChange={e => setTitik(e.target.value)} placeholder="Contoh: Lobby Utama, Lift A Lt 1" className="form-input" required />
              </div>
            </div>

            {(titik || nomorTitik) && (
              <div className="glass-panel" style={{ padding: '0.75rem', background: 'rgba(59,130,246,0.02)', fontSize: '0.75rem', borderStyle: 'dashed' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div className="preview-row"><span className="preview-label">Lokasi:</span><span className="preview-value">SMPJDC - Jakarta Design Center</span></div>
                  <div className="preview-row"><span className="preview-label">Lantai:</span><span className="preview-value">{FLOOR_OPTIONS.find(f => f.value === floor)?.label || floorFinal}</span></div>
                  <div className="preview-row"><span className="preview-label">No. Titik:</span><span className="preview-value">{nomorTitik || '-'}</span></div>
                  <div className="preview-row"><span className="preview-label">Zona:</span><span className="preview-value">{zoneFinal}</span></div>
                  <div className="preview-row"><span className="preview-label">Lokasi:</span><span className="preview-value">{titik || '-'}</span></div>
                  <div style={{ marginTop: '0.3rem', paddingTop: '0.3rem', borderTop: '1px solid var(--border-glass)' }}>
                    <span className="preview-label">QR Code:</span>
                    <p className="preview-qr">{nomorTitik.trim() ? `JDC-${qrLocCode}-${nomorTitik.trim()}` : getQRPattern()}</p>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary btn-full">
              <Plus size={16} /> Daftarkan Area
            </button>

          </form>
        </div>

        {/* 2. BULK BARCODE GENERATOR PANEL */}
        <div className="glass-panel panel-body" style={{ height: 'fit-content' }}>
          <h3 className="section-title">
            <Layers size={18} className="text-primary" style={{ flexShrink: 0 }} />
            <span>Generator Barcode Massal</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <p className="text-secondary" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
              Untuk peluncuran area baru SMPJDC secara masif, generate barcode dan download dalam bentuk ZIP untuk dicetak sekaligus.
            </p>

            <div className="form-field">
              <label className="form-label">JUMLAH BARCODE</label>
              <select value={bulkCount} onChange={(e) => setBulkCount(parseInt(e.target.value))} className="form-select">
                <option value="100">100 Barcode Lokasi</option>
                <option value="500">500 Barcode Lokasi</option>
                <option value="1000">1000 Barcode Lokasi</option>
              </select>
            </div>

            {generating ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="flex-between" style={{ fontSize: '0.75rem' }}>
                  <span>Memproses QR codes...</span>
                  <span>{genProgress}%</span>
                </div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${genProgress}%` }} /></div>
              </div>
            ) : bulkDownloadReady ? (
              <div className="glass-panel" style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Check size={18} /> <span>{bulkCount} Barcodes Siap Didownload!</span>
                </div>
                <button onClick={() => {
                  const link = document.createElement('a');
                  link.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SMPJDC-BULK-${bulkCount}`;
                  link.download = `smpjdc-${bulkCount}-barcodes.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  setBulkDownloadReady(false);
                }} className="btn-primary btn-full" style={{ background: 'var(--color-success)' }}>
                  <Download size={16} /> Download Sample PNG
                </button>
              </div>
            ) : (
              <button onClick={handleBulkGenerate} className="btn-secondary btn-full">Generate QR Codes</button>
            )}

            <div className="text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.4' }}>
              <p>• Output berupa file PNG beresolusi tinggi.</p>
              <p>• Token dinamis disematkan secara acak guna mencegah duplikasi.</p>
            </div>
          </div>
        </div>

        {/* 3. USER & ROLE REGISTRATION FORM */}
        <div className="glass-panel panel-body" style={{ height: 'fit-content' }}>
          <h3 className="section-title">
            <User size={18} className="text-primary" style={{ flexShrink: 0 }} />
            <span>Registrasi Anggota & Role</span>
          </h3>

          <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-field">
              <label className="form-label">NAMA LENGKAP</label>
              <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Contoh: Richard Meha" className="form-input" required />
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">NRP / ID</label>
                <div className="input-btn-group">
                  <input type="text" value={userNrp} onChange={e => setUserNrp(e.target.value)} placeholder="20005" className="form-input" required />
                  <button type="button" onClick={() => {
                    const existing = users.map(u => parseInt(u.nrp, 10)).filter(n => !isNaN(n));
                    const next = existing.length > 0 ? Math.max(...existing) + 1 : 10001;
                    setUserNrp(String(next).padStart(5, '0'));
                  }} title="Generate NRP" className="btn-gen">
                    <RefreshCw size={14} /> Generate
                  </button>
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">JABATAN / ROLE</label>
                <select value={userRole} onChange={e => setUserRole(e.target.value)} className="form-select">
                  <option value="Admin Super">Admin Super</option>
                  <option value="Manajemen">Manajemen</option>
                  <option value="SPV">SPV</option>
                  <option value="Danru">Danru</option>
                  <option value="Wadanru">Wadanru</option>
                  <option value="Anggota">Anggota</option>
                  <option value="Guest Viewer">Guest Viewer</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">REGU</label>
                <select value={userRegu} onChange={e => setUserRegu(e.target.value)} className="form-select">
                  {REGU_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">SHIFT</label>
                <select value={userShift} onChange={e => setUserShift(e.target.value)} className="form-select">
                  {SHIFT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label className="form-label"><Phone size={11} style={{ marginRight: '2px' }} /> NOMOR HP</label>
                <input type="text" value={userHp} onChange={e => setUserHp(e.target.value)} placeholder="0812xxxx" className="form-input" />
              </div>
              <div className="form-field">
                <label className="form-label"><Hash size={11} style={{ marginRight: '2px' }} /> PIN LOGIN</label>
                <input type="text" value={userPin} onChange={e => setUserPin(e.target.value)} placeholder="Default: 4 digit NRP" maxLength={12} className="form-input" />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">AVATAR URL (OPSIONAL)</label>
              <input type="text" value={userAvatar} onChange={e => setUserAvatar(e.target.value)} placeholder="https://images.unsplash.com/..." className="form-input" />
            </div>

            <button type="submit" className="btn-primary btn-full">
              <UserCheck size={16} /> Tambahkan Anggota
            </button>
          </form>
        </div>

        {/* 3. MASTER AREA LIST VIEW */}
        <div className="glass-panel grid-span-3 panel-body">
          <div className="flex-between" style={{ marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} className="text-primary" style={{ flexShrink: 0 }} />
              <span>Daftar Master Area Aktif SMPJDC ({areas.length})</span>
            </h3>
            <button type="button" onClick={handlePrintAllQRs} className="btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', width: 'auto' }}>
              <Printer size={14} /> Cetak Semua Barcode QR
            </button>
          </div>

          <div className="table-wrap">
            <table className="table-data">
              <thead>
                <tr>
                  <th>Lantai</th><th>No. Titik</th><th>Zona</th>
                  <th>Lokasi</th><th>QR Code</th><th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {[...areas].sort((a, b) => {
                  const na = parseInt(a.nomorTitik, 10);
                  const nb = parseInt(b.nomorTitik, 10);
                  if (isNaN(na) && isNaN(nb)) return a.nomorTitik?.localeCompare(b.nomorTitik || '');
                  if (isNaN(na)) return 1;
                  if (isNaN(nb)) return -1;
                  return na - nb;
                }).map((area, idx) => (
                  <tr key={area.id} className={idx % 2 === 0 ? 'row-even' : ''}>
                    <td>{['1','2','3','4','5','6'].includes(area.lantai) ? `Lantai ${area.lantai}` : area.lantai}</td>
                    <td className="td-mono td-label">{area.nomorTitik || '-'}</td>
                    <td>{area.zona}</td>
                    <td className="td-primary td-label">{area.titik}</td>
                    <td className="td-mono" style={{ fontSize: '0.75rem', opacity: 0.8 }}>{area.qrCode}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button onClick={() => handleDownloadQR(area)} title="Download Barcode PNG" className="btn-icon-primary"><Download size={14} /></button>
                        <button onClick={() => handlePrintQR(area)} title="Cetak Stiker Barcode" className="btn-icon"><Printer size={14} /></button>
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
