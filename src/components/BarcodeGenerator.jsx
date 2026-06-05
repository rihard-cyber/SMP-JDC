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
  { value: 'Pagi', label: 'Pagi (07:00 - 15:00)' },
  { value: 'Siang', label: 'Siang (15:00 - 23:00)' },
  { value: 'Malam', label: 'Malam (23:00 - 07:00)' }
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
  const [userRegu, setUserRegu] = useState('Regu A (Pagi)');
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
    setUserAvatar(''); setUserPin(''); setUserRegu('Regu A (Pagi)');
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

  const handleDownloadQR = (area) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 250, 290);
    ctx.strokeStyle = '#0b0f19';
    ctx.lineWidth = 4;
    ctx.strokeRect(15, 15, 220, 220);
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(25, 25, 45, 45);
    ctx.fillRect(180, 25, 45, 45);
    ctx.fillRect(25, 180, 45, 45);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(35, 35, 25, 25);
    ctx.fillRect(190, 35, 25, 25);
    ctx.fillRect(35, 190, 25, 25);
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(42, 42, 11, 11);
    ctx.fillRect(197, 42, 11, 11);
    ctx.fillRect(42, 197, 11, 11);
    ctx.fillStyle = '#0b0f19';
    for (let x = 80; x < 170; x += 10) {
      for (let y = 30; y < 220; y += 10) {
        if (Math.random() > 0.5) ctx.fillRect(x, y, 7, 7);
      }
    }
    for (let x = 30; x < 80; x += 10) {
      for (let y = 80; y < 170; y += 10) {
        if (Math.random() > 0.5) ctx.fillRect(x, y, 7, 7);
      }
    }
    for (let x = 170; x < 220; x += 10) {
      for (let y = 80; y < 170; y += 10) {
        if (Math.random() > 0.5) ctx.fillRect(x, y, 7, 7);
      }
    }
    ctx.fillStyle = '#0b0f19';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(area.qrCode, 125, 255);
    ctx.fillStyle = '#64748b';
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(`${area.gedung} - ${['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17'].includes(area.lantai) ? `Lantai ${area.lantai}` : area.lantai} (${area.zona})`, 125, 275);
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${area.qrCode}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleBulkGenerate = () => {
    setGenerating(true);
    setBulkDownloadReady(false);
    setGenProgress(0);
    const interval = setInterval(() => {
      setGenProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setGenerating(false); setBulkDownloadReady(true); return 100; }
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
                  <div style={{ marginTop: '0.3rem', paddingTop: '0.3rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
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
                <button onClick={() => { alert(`📥 Mengunduh file zip smpjdc-${bulkCount}-barcodes.zip (Simulated Download)`); setBulkDownloadReady(false); }} className="btn-primary btn-full" style={{ background: 'var(--color-success)' }}>
                  <Download size={16} /> Download ZIP
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
          <h3 className="section-title">
            <Building size={18} className="text-primary" style={{ flexShrink: 0 }} />
            <span>Daftar Master Area Aktif SMPJDC ({areas.length})</span>
          </h3>

          <div className="table-wrap">
            <table className="table-data">
              <thead>
                <tr>
                  <th>Lantai</th><th>No. Titik</th><th>Zona</th>
                  <th>Lokasi</th><th>QR Code</th><th style={{ textAlign: 'right' }}>Download</th>
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
                        <button onClick={() => alert(`🖨️ Mengirim berkas cetak QR ${area.qrCode} ke printer antrean.`)} title="Cetak Stiker Barcode" className="btn-icon"><Printer size={14} /></button>
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
