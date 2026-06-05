import React, { useState } from 'react';
import { Clock, MapPin, FileText, Camera, Send, History, Trash2, Info, Search, AlertTriangle, Wrench, Radio, X } from 'lucide-react';

const KATEGORI_MUTASI = [
  { id: 'informasi', label: 'Informasi', icon: Info, color: '#3b82f6' },
  { id: 'kehilangan', label: 'Kehilangan', icon: Search, color: '#f59e0b' },
  { id: 'kerusakan', label: 'Kerusakan', icon: Wrench, color: '#ef4444' },
  { id: 'gangguan', label: 'Gangguan', icon: AlertTriangle, color: '#dc2626' },
  { id: 'emergency', label: 'Emergency', icon: Radio, color: '#7c3aed' }
];

export default function MutasiPenjagaan({ currentUser, logs, onAddLog, onDeleteLog, areas }) {
  const [waktu, setWaktu] = useState(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  const [jamKejadian, setJamKejadian] = useState(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  const [lokasi, setLokasi] = useState('');
  const [uraian, setUraian] = useState('');
  const [kategori, setKategori] = useState('informasi');
  const [foto, setFoto] = useState(null);
  const [search, setSearch] = useState('');
  const [filterKat, setFilterKat] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!uraian.trim() || !lokasi.trim()) {
      alert('Lokasi dan uraian wajib diisi!');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    onAddLog({
      waktu,
      jamKejadian,
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
    setJamKejadian(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  };

  const filtered = logs.filter(l => {
    const matchSearch = !search || l.uraian.toLowerCase().includes(search.toLowerCase()) || l.lokasi.toLowerCase().includes(search.toLowerCase()) || l.petugas.toLowerCase().includes(search.toLowerCase());
    const matchKat = !filterKat || l.kategori === filterKat;
    return matchSearch && matchKat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="grid-cols-3" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* FORM INPUT MUTASI */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} className="text-primary" />
            <span>Input Catatan Mutasi</span>
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="grid-cols-2" style={{ gap: '0.75rem' }}>
              <div className="step-field">
                <label><Clock size={12} /> JAM LAPOR</label>
                <input type="time" value={waktu} onChange={e => setWaktu(e.target.value)} className="modern-input" />
              </div>
              <div className="step-field">
                <label><Clock size={12} /> JAM KEJADIAN</label>
                <input type="time" value={jamKejadian} onChange={e => setJamKejadian(e.target.value)} className="modern-input" />
              </div>
            </div>
            
            <div className="step-field">
              <label><MapPin size={12} /> PLOTTING POS / LOKASI</label>
              <select value={lokasi} onChange={e => setLokasi(e.target.value)} className="modern-select" required>
                <option value="">-- Pilih Pos Jaga --</option>
                {areas.map(a => <option key={a.id} value={a.titik}>{a.titik} ({['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17'].includes(a.lantai)?`Lt ${a.lantai}`:a.lantai})</option>)}
              </select>
            </div>
            
            <div className="step-field">
              <label>KATEGORI LAPORAN</label>
              <div className="mutasi-kategori-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                {KATEGORI_MUTASI.map(k => {
                  const Icon = k.icon;
                  return (
                    <button key={k.id} type="button" onClick={() => setKategori(k.id)}
                      className={`mutasi-kat-btn ${kategori === k.id ? 'active' : ''}`}
                      style={{ 
                        '--kat-color': k.color, 
                        borderColor: kategori === k.id ? k.color : 'var(--border-glass)', 
                        background: kategori === k.id ? `${k.color}1A` : 'transparent', 
                        color: kategori === k.id ? k.color : 'var(--text-secondary)',
                        padding: '0.4rem 0.5rem',
                        fontSize: '0.75rem'
                      }}>
                      <Icon size={14} /><span>{k.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="step-field">
              <label>URAIAN KEJADIAN / PERISTIWA</label>
              <textarea value={uraian} onChange={e => setUraian(e.target.value)} className="modern-input form-textarea" rows={3} placeholder="Tuliskan detail kejadian di pos jaga..." required />
            </div>
            
            <div className="step-field">
              <label>LAMPIRAN FOTO (OPSIONAL)</label>
              {foto ? <div className="photo-preview"><img src={foto} alt="" /><button type="button" onClick={() => setFoto(null)} className="photo-remove">X</button></div>
                : <label className="photo-upload-btn"><Camera size={16} /> Ambil Foto<input type="file" accept="image/*" onChange={e => { const f=e.target.files[0]; if(f){const r=new FileReader(); r.onloadend=()=>setFoto(r.result); r.readAsDataURL(f)} }} hidden /></label>}
            </div>
            
            <button type="submit" className="btn-primary btn-full" style={{ padding: '0.65rem' }}><Send size={16} /> Catat Ke Mutasi</button>
          </form>
        </div>

        {/* TABEL MUTASI / LAPORAN */}
        <div className="glass-panel grid-span-2" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} className="text-primary" />
              <span>Tabel Mutasi / Laporan (Kejadian / Peristiwa)</span>
            </h3>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari laporan..." className="modern-input" style={{ width: '150px', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} />
              <select value={filterKat} onChange={e => setFilterKat(e.target.value)} className="modern-select" style={{ width: '100px', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
                <option value="">Semua Kategori</option>
                {KATEGORI_MUTASI.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border-glass)', borderRadius: '8px', background: 'rgba(0,0,0,0.1)' }}>
            <table className="mutasi-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: '50px' }}>No</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: '100px' }}>Jam (Laporan)</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: '100px' }}>Jam Kejadian</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Uraian Laporan / Kejadian / Peristiwa</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: '100px' }}>Foto (Bukti)</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: '60px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Belum ada catatan mutasi atau kejadian terdaftar.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log, idx) => {
                    const kat = KATEGORI_MUTASI.find(k => k.id === log.kategori);
                    return (
                      <tr key={log.id || idx} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem' }}>
                          <div style={{ fontWeight: 600 }}>{log.waktu}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{log.tanggal}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {log.jamKejadian || log.waktu}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem' }}>
                          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                            <span className="badge" style={{ background: `${kat?.color || '#3b82f6'}1A`, color: kat?.color || '#3b82f6', fontSize: '0.55rem', padding: '0.05rem 0.25rem' }}>
                              {kat?.label || log.kategori}
                            </span>
                            <span>{log.lokasi}</span>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{log.uraian}</p>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Petugas: <strong>{log.petugas} (NRP: {log.nrp || '-'})</strong>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {log.foto ? (
                            <img 
                              src={log.foto} 
                              alt="Bukti" 
                              onClick={() => setSelectedPhoto(log.foto)}
                              style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border-glass)' }} 
                            />
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tidak ada</span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          {onDeleteLog && (
                            <button 
                              onClick={() => onDeleteLog(log.id)} 
                              style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px' }}
                              title="Hapus Catatan"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL UNTUK PREVIEW FOTO */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)} 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedPhoto(null)} 
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.9rem'
              }}
            >
              <X size={18} /> Tutup
            </button>
            <img src={selectedPhoto} alt="Bukti Kejadian" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', border: '2px solid var(--border-glass)' }} />
          </div>
        </div>
      )}
    </div>
  );
}
