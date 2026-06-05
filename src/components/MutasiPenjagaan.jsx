import React, { useState } from 'react';
import { Clock, MapPin, FileText, Camera, Send, History, Trash2, Info, Search, AlertTriangle, Wrench, Radio } from 'lucide-react';

const KATEGORI_MUTASI = [
  { id: 'informasi', label: 'Informasi', icon: Info, color: '#3b82f6' },
  { id: 'kehilangan', label: 'Kehilangan', icon: Search, color: '#f59e0b' },
  { id: 'kerusakan', label: 'Kerusakan', icon: Wrench, color: '#ef4444' },
  { id: 'gangguan', label: 'Gangguan', icon: AlertTriangle, color: '#dc2626' },
  { id: 'emergency', label: 'Emergency', icon: Radio, color: '#7c3aed' }
];

export default function MutasiPenjagaan({ currentUser, logs, onAddLog, onDeleteLog, areas }) {
  const [waktu, setWaktu] = useState(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  const [lokasi, setLokasi] = useState('');
  const [uraian, setUraian] = useState('');
  const [kategori, setKategori] = useState('informasi');
  const [foto, setFoto] = useState(null);
  const [search, setSearch] = useState('');
  const [filterKat, setFilterKat] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!uraian.trim() || !lokasi.trim()) {
      alert('Lokasi dan uraian wajib diisi!');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    onAddLog({
      waktu,
      lokasi,
      uraian: uraian.trim(),
      kategori,
      foto,
      petugas: currentUser.nama,
      nrp: currentUser.nrp,
      tanggal: today
    });
    setUraian('');
    setLokasi('');
    setKategori('informasi');
    setFoto(null);
    setWaktu(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  };

  const filtered = logs.filter(l => {
    const matchSearch = !search || l.uraian.toLowerCase().includes(search.toLowerCase()) || l.lokasi.toLowerCase().includes(search.toLowerCase()) || l.petugas.toLowerCase().includes(search.toLowerCase());
    const matchKat = !filterKat || l.kategori === filterKat;
    return matchSearch && matchKat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="grid-cols-2">
        {/* FORM INPUT MUTASI */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} className="text-primary" />
            <span>Input Mutasi Penjagaan</span>
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="step-field">
              <label><Clock size={12} /> JAM</label>
              <input type="time" value={waktu} onChange={e => setWaktu(e.target.value)} className="modern-input" />
            </div>
            <div className="step-field">
              <label><MapPin size={12} /> LOKASI</label>
              <select value={lokasi} onChange={e => setLokasi(e.target.value)} className="modern-select" required>
                <option value="">-- Pilih --</option>
                {areas.map(a => <option key={a.id} value={a.titik}>{a.titik} ({['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17'].includes(a.lantai)?`Lt ${a.lantai}`:a.lantai})</option>)}
              </select>
            </div>
            <div className="step-field">
              <label>KATEGORI</label>
              <div className="mutasi-kategori-grid">
                {KATEGORI_MUTASI.map(k => {
                  const Icon = k.icon;
                  return (
                    <button key={k.id} type="button" onClick={() => setKategori(k.id)}
                      className={`mutasi-kat-btn ${kategori === k.id ? 'active' : ''}`}
                      style={{ '--kat-color': k.color, borderColor: kategori === k.id ? k.color : 'var(--border-glass)', background: kategori === k.id ? `${k.color}1A` : 'transparent', color: kategori === k.id ? k.color : 'var(--text-secondary)' }}>
                      <Icon size={16} /><span>{k.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="step-field">
              <label>URAIAN KEJADIAN</label>
              <textarea value={uraian} onChange={e => setUraian(e.target.value)} className="modern-input form-textarea" rows={4} placeholder="Jelaskan kejadian, temuan, atau informasi yang perlu dicatat..." required />
            </div>
            <div className="step-field">
              <label>FOTO (OPSIONAL)</label>
              {foto ? <div className="photo-preview"><img src={foto} alt="" /><button type="button" onClick={() => setFoto(null)} className="photo-remove">X</button></div>
                : <label className="photo-upload-btn"><Camera size={16} /> Ambil Foto<input type="file" accept="image/*" onChange={e => { const f=e.target.files[0]; if(f){const r=new FileReader(); r.onloadend=()=>setFoto(r.result); r.readAsDataURL(f)} }} hidden /></label>}
            </div>
            <button type="submit" className="btn-primary btn-full"><Send size={16} /> Catat Mutasi</button>
          </form>
        </div>

        {/* RIWAYAT MUTASI */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} className="text-primary" />
            <span>Riwayat Mutasi ({filtered.length})</span>
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari..." className="modern-input" style={{ flex: 1, minWidth: '100px', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} />
            <select value={filterKat} onChange={e => setFilterKat(e.target.value)} className="modern-select" style={{ flex: 0.5, minWidth: '80px', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
              <option value="">Semua</option>
              {KATEGORI_MUTASI.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '520px', overflowY: 'auto' }}>
            {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Belum ada catatan mutasi.</p>}
            {filtered.map((log, idx) => {
              const kat = KATEGORI_MUTASI.find(k => k.id === log.kategori);
              return (
                <div key={log.id || idx} className="glass-panel" style={{ padding: '0.85rem', borderLeft: `3px solid ${kat?.color || '#3b82f6'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: `${kat?.color || '#3b82f6'}1A`, color: kat?.color || '#3b82f6', fontSize: '0.6rem' }}>{kat?.label || log.kategori}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{log.tanggal} {log.waktu}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{log.petugas}</span>
                    </div>
                    {onDeleteLog && <button onClick={() => onDeleteLog(log.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}><Trash2 size={12} /></button>}
                  </div>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}><strong>{log.lokasi}</strong></p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: '1.4' }}>{log.uraian}</p>
                  {log.foto && <img src={log.foto} alt="" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '6px', marginTop: '0.4rem' }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
