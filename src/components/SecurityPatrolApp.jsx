import React, { useState, useEffect } from 'react';
import { Camera, Clock, Check, AlertTriangle, QrCode, Shield, Wifi, WifiOff, Database, RefreshCw, ThumbsUp, MapPin } from 'lucide-react';
import KATEGORI_TEMUAN, { STATUS_PATROLI as SEVERITY_LEVELS } from '../data/kategoriTemuan';

export default function SecurityPatrolApp({ currentUser, areas, onAddReport, onTriggerSOS }) {
  const [step, setStep] = useState(1);
  const [shift, setShift] = useState('Pagi');
  const [area, setArea] = useState(null);
  const [online, setOnline] = useState(true);
  const [queue, setQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sapujagat_offline_queue')) || []; }
    catch { return []; }
  });

  const [mode, setMode] = useState(null); // null | 'normal' | 'temuan'
  const [kategori, setKategori] = useState('');
  const [temuan, setTemuan] = useState('');
  const [severity, setSeverity] = useState('low');
  const [deskripsi, setDeskripsi] = useState('');
  const [foto, setFoto] = useState(null);
  const [timeScan, setTimeScan] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => { localStorage.setItem('sapujagat_offline_queue', JSON.stringify(queue)); }, [queue]);
  useEffect(() => { if (online && queue.length > 0) { queue.forEach(r => onAddReport(r)); setQueue([]); } }, [online]);

  useEffect(() => { if (kategori) setTemuan(''); }, [kategori]);

  const kategoriData = KATEGORI_TEMUAN;
  const daftarTemuan = kategori ? kategoriData.find(k => k.id === kategori)?.items || [] : [];

  const handleScan = (id) => {
    const a = areas.find(x => x.id === id);
    if (!a) return;
    setArea(a);
    setTimeScan(new Date());
    setMode(null);
    setKategori('');
    setTemuan('');
    setSeverity('low');
    setDeskripsi('');
    setFoto(null);
    setStep(3);
  };

  const handleNormal = () => {
    const r = {
      timestamp: timeScan.toISOString(), timestampEnd: new Date().toISOString(),
      userId: currentUser.id, userName: currentUser.nama,
      areaId: area.id, gedung: 'JDC', lantai: area.lantai, zona: area.zona, titik: area.titik,
      shift, kategori: '-', kodeTemuan: '-', temuan: 'Normal', status: 'normal',
      kondisi: 'Aman dan Kondusif', severity: 'Rendah', keterangan: '', foto: null
    };
    online ? onAddReport(r) : setQueue(p => [...p, r]);
    setStep(4);
  };

  const handleTemuanSubmit = (e) => {
    e.preventDefault();
    if (!kategori || !temuan) { alert('Pilih kategori dan jenis temuan.'); return; }
    const kat = kategoriData.find(k => k.id === kategori);
    const item = daftarTemuan.find(t => t.kode === temuan);
    const severityMap = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi', critical: 'Kritis' };
    const r = {
      timestamp: timeScan.toISOString(), timestampEnd: new Date().toISOString(),
      userId: currentUser.id, userName: currentUser.nama,
      areaId: area.id, gedung: 'JDC', lantai: area.lantai, zona: area.zona, titik: area.titik,
      shift, kategori: kat?.nama || '', kodeTemuan: item?.kode || '', temuan: item?.nama || '',
      status: 'temuan', kondisi: item?.nama || 'Temuan', severity: severityMap[severity] || 'Rendah',
      keterangan: deskripsi, foto
    };
    online ? onAddReport(r) : setQueue(p => [...p, r]);
    setStep(4);
  };

  const handleBarcodeScan = () => {
    const val = barcodeInput.trim();
    if (!val) return;
    const found = areas.find(a =>
      a.qrCode.toLowerCase() === val.toLowerCase() ||
      a.id.toLowerCase() === val.toLowerCase()
    );
    if (found) {
      setScanResult(found);
      setBarcodeInput('');
    } else {
      alert(`QR Code "${val}" tidak ditemukan. Pastikan kode yang dimasukkan benar.`);
    }
  };

  const confirmScanResult = () => {
    if (scanResult) {
      handleScan(scanResult.id);
      setScanResult(null);
    }
  };

  const resetScan = () => { setArea(null); setScanResult(null); setBarcodeInput(''); setStep(2); };

  const labelSeverity = (v) => ({ low: 'Rendah', medium: 'Sedang', high: 'Tinggi', critical: 'Kritis' })[v] || v;
  const colorSeverity = (v) => ({ low: '#3b82f6', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' })[v] || '#3b82f6';

  return (
    <div className="mobile-phone-frame">
      <div className="mobile-screen">
        <div className="mobile-status-bar">
          <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
          <button onClick={() => setOnline(!online)} className="mobile-conn-toggle">
            {online ? <Wifi size={12} /> : <WifiOff size={12} />}<span>{online ? 'Online' : 'Offline'}</span>
          </button>
        </div>
        {queue.length > 0 && <div className="offline-badge"><Database size={12} /><span>{queue.length} offline</span></div>}
        <div className="mobile-header">
          <div className="mobile-brand">
            <img src="logo.png" alt="" className="mobile-logo" />
            <div><h4 className="mobile-app-title">SMPJDC</h4><p className="mobile-app-sub">SISTEM MANAGEMENT KEAMANAN JDC</p></div>
          </div>
          <button onClick={() => onTriggerSOS(currentUser.nama, area?.titik || 'Lobby')} className="sos-btn-small">SOS</button>
        </div>

        {step === 1 && (
          <div className="step-login">
            <div className="step-login-header">
              <div className="step-login-logo-wrap"><img src="logo.png" alt="" /></div>
              <h3>Mulai Tugas Patroli</h3>
              <p>Pilih shift dinas aktif Anda.</p>
            </div>
            <div className="glass-panel step-user-card">
              <img src={currentUser.avatar} alt="" className="step-avatar" />
              <div><h4>{currentUser.nama}</h4><p className="text-secondary">NRP: {currentUser.nrp}</p></div>
            </div>
            <div className="step-field">
              <label>SHIFT PATROLI</label>
              <select value={shift} onChange={e => setShift(e.target.value)} className="modern-select">
                <option value="Pagi">Pagi (07:00-15:00)</option>
                <option value="Siang">Siang (15:00-23:00)</option>
                <option value="Malam">Malam (23:00-07:00)</option>
              </select>
            </div>
            <button onClick={() => setStep(2)} className="btn-primary btn-full">Mulai Tugas</button>
          </div>
        )}

        {step === 2 && !scanResult && (
          <div className="step-scan">
            <div className="scan-qr-area">
              <div className="scan-qr-icon"><QrCode size={48} /></div>
              <h3>Scan Barcode Checkpoint</h3>
              <p>Arahkan kamera ke QR Code atau masukkan kode checkpoint.</p>
              <div className="step-field">
                <label>MASUKKAN KODE QR / BARCODE</label>
                <div className="scan-input-group">
                  <input type="text" value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBarcodeScan()} placeholder="Cth: JDC-BSMT-B-1" className="modern-input" style={{ flex: 1 }} />
                  <button onClick={handleBarcodeScan} className="btn-primary" style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}><QrCode size={16} /> Scan</button>
                </div>
              </div>
              <div className="step-hint">
                <MapPin size={14} style={{ opacity: 0.5 }} />
                <span>Atau pilih dari daftar checkpoint di bawah:</span>
              </div>
              <div className="scan-area-compact-list">
                {[...areas].sort((a, b) => {
                  const na = parseInt(a.nomorTitik, 10);
                  const nb = parseInt(b.nomorTitik, 10);
                  if (isNaN(na) && isNaN(nb)) return a.nomorTitik?.localeCompare(b.nomorTitik || '');
                  if (isNaN(na)) return 1;
                  if (isNaN(nb)) return -1;
                  return na - nb;
                }).map(a => (
                  <button key={a.id} onClick={() => { setScanResult(a); }} className="scan-compact-item">
                    <span className="scan-item-qr">{a.qrCode}</span>
                    <span className="scan-item-name">{a.titik}</span>
                    <span className="scan-item-floor">{['1','2','3','4','5','6'].includes(a.lantai) ? `Lt.${a.lantai}` : a.lantai}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && scanResult && (
          <div className="step-scan-result">
            <div className="scan-qr-area">
              <div className="scan-success-icon"><Check size={40} /></div>
              <h3>Checkpoint Ditemukan!</h3>
              <div className="glass-panel scan-location-detail">
                <div className="scan-detail-row">
                  <span className="scan-detail-label">Kode QR</span>
                  <span className="scan-detail-value mono">{scanResult.qrCode}</span>
                </div>
                <div className="scan-detail-row">
                  <span className="scan-detail-label">Gedung</span>
                  <span className="scan-detail-value">{scanResult.gedung}</span>
                </div>
                <div className="scan-detail-row">
                  <span className="scan-detail-label">Lantai</span>
                  <span className="scan-detail-value">{['1','2','3','4','5','6'].includes(scanResult.lantai) ? `Lantai ${scanResult.lantai}` : scanResult.lantai}</span>
                </div>
                <div className="scan-detail-row">
                  <span className="scan-detail-label">Zona</span>
                  <span className="scan-detail-value">Zona {scanResult.zona}</span>
                </div>
                <div className="scan-detail-row">
                  <span className="scan-detail-label">Titik</span>
                  <span className="scan-detail-value fw-700">{scanResult.titik}</span>
                </div>
              </div>
              <button onClick={confirmScanResult} className="btn-primary btn-full">Lanjutkan Patroli</button>
              <button onClick={() => setScanResult(null)} className="btn-secondary btn-full" style={{ marginTop: '0.3rem' }}>Kembali</button>
            </div>
          </div>
        )}

        {step === 3 && area && !mode && (
          <div className="step-decision">
            <div className="glass-panel form-location-box">
              <p className="form-label">LOKASI CHECKPOINT</p>
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
            <button onClick={resetScan} className="btn-secondary btn-full" style={{marginTop:'0.5rem'}}>Kembali</button>
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
                <label>TINGKAT KEPARAHAN</label>
                <div className="severity-grid">
                  {['low','medium','high','critical'].map(s => (
                    <button key={s} type="button" onClick={() => setSeverity(s)}
                      className={`severity-btn ${severity === s ? 'active' : ''}`}
                      style={{ '--c': colorSeverity(s), borderColor: severity === s ? colorSeverity(s) : 'var(--border-glass)', background: severity === s ? `${colorSeverity(s)}1A` : 'transparent', color: severity === s ? colorSeverity(s) : 'var(--text-secondary)' }}>
                      {labelSeverity(s)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="step-field">
                <label>DESKRIPSI</label>
                <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} className="modern-input form-textarea" rows={3} placeholder="Jelaskan temuan di lokasi..." />
              </div>
              <div className="step-field">
                <label>FOTO</label>
                {foto ? <div className="photo-preview"><img src={foto} alt="" /><button type="button" onClick={() => setFoto(null)} className="photo-remove">X</button></div>
                  : <label className="photo-upload-btn"><Camera size={16} /> Ambil Foto<input type="file" accept="image/*" onChange={e => { const f=e.target.files[0]; if(f){const r=new FileReader(); r.onloadend=()=>setFoto(r.result); r.readAsDataURL(f)} }} hidden /></label>}
              </div>
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setMode(null)} className="btn-secondary" style={{flex:1}}>Kembali</button>
              <button type="submit" className="btn-primary" style={{flex:2}}>Kirim Laporan</button>
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
              <div className="success-row"><span className="text-secondary">Status:</span><span className="fw-700" style={{color: mode === 'temuan' ? 'var(--color-warning)' : 'var(--color-success)'}}>{mode === 'temuan' ? 'Temuan' : 'Normal'}</span></div>
              {mode === 'temuan' && <><div className="success-row"><span className="text-secondary">Temuan:</span><span className="fw-700">{daftarTemuan.find(t=>t.kode===temuan)?.nama||'-'}</span></div>
              <div className="success-row"><span className="text-secondary">Severity:</span><span className="fw-700" style={{color:colorSeverity(severity)}}>{labelSeverity(severity)}</span></div></>}
            </div>
            <button onClick={resetScan} className="btn-primary btn-full">Scan Checkpoint Berikutnya</button>
          </div>
        )}
      </div>
    </div>
  );
}
