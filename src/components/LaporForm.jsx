import React, { useState } from 'react';
import { Send, Camera, MapPin, FileText, AlertTriangle, CheckCircle, X } from 'lucide-react';

export default function LaporForm({ currentUser, areas, onAddReport, onAddLog }) {
  const [jenis, setJenis] = useState('patroli');
  const [areaId, setAreaId] = useState('');
  const [kondisi, setKondisi] = useState('Aman dan Kondusif');
  const [keterangan, setKeterangan] = useState('');
  const [foto, setFoto] = useState(null);
  const [katMutasi, setKatMutasi] = useState('informasi');
  const [lokasiMutasi, setLokasiMutasi] = useState('');
  const [uraianMutasi, setUraianMutasi] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const KATEGORI_MUTASI = [
    { id: 'informasi', label: 'Informasi', color: '#3b82f6' },
    { id: 'kehilangan', label: 'Kehilangan', color: '#f59e0b' },
    { id: 'kerusakan', label: 'Kerusakan', color: '#ef4444' },
    { id: 'gangguan', label: 'Gangguan', color: '#dc2626' },
    { id: 'emergency', label: 'Emergency', color: '#7c3aed' }
  ];

  const KONDISI_OPTIONS = [
    'Aman dan Kondusif', 'Ada Aktivitas', 'Renovasi',
    'Kebocoran Air', 'Kerusakan Lampu', 'Kerusakan Fasilitas',
    'Pintu Terbuka', 'Orang Mencurigakan', 'Lainnya'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (jenis === 'patroli' && !areaId) {
      setErrors({ area: 'Pilih titik patroli terlebih dahulu' });
      return;
    }
    if (jenis === 'mutasi' && !lokasiMutasi.trim()) {
      setErrors({ lokasi: 'Lokasi / pos harus diisi' });
      return;
    }
    if (jenis === 'mutasi' && !uraianMutasi.trim()) {
      setErrors({ uraian: 'Uraian kejadian harus diisi' });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (jenis === 'patroli') {
        const area = areas.find(a => a.id === areaId);
        const isAman = kondisi === 'Aman dan Kondusif' || kondisi === 'Ada Aktivitas' || kondisi === 'Renovasi';
        onAddReport({
          timestamp: new Date().toISOString(),
          timestampEnd: new Date().toISOString(),
          userId: currentUser.id,
          userName: currentUser.nama,
          areaId: area.id,
          gedung: area.gedung || 'SMPJDC',
          lantai: area.lantai,
          zona: area.zona,
          titik: area.titik,
          shift: '-',
          kategori: isAman ? '-' : kondisi,
          kodeTemuan: '-',
          temuan: isAman ? 'Normal' : kondisi,
          status: isAman ? 'normal' : 'temuan',
          kondisi: kondisi,
          severity: isAman ? 'Rendah' : 'Sedang',
          keterangan: keterangan,
          foto: foto
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        onAddLog({
          waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          jamKejadian: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          lokasi: lokasiMutasi,
          uraian: uraianMutasi,
          kategori: katMutasi,
          foto: foto,
          petugas: currentUser.nama,
          nrp: currentUser.nrp,
          tanggal: today,
          pelapor: currentUser.nama
        });
      }

      setLoading(false);
      setDone(true);
      setKeterangan('');
      setUraianMutasi('');
      setLokasiMutasi('');
      setFoto(null);
      setAreaId('');
      setTimeout(() => setDone(false), 3000);
    }, 500);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} className="text-primary" />
          <span>Form Laporan Cepat</span>
        </h3>

        {done ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <CheckCircle size={48} style={{ color: 'var(--color-success)', marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Laporan Terkirim!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{currentUser.nama}</strong> — laporan berhasil disimpan.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Jenis Laporan */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={() => setJenis('patroli')} style={{
                flex: 1, padding: '0.5rem', borderRadius: '8px', border: `2px solid ${jenis === 'patroli' ? 'var(--color-primary)' : 'var(--border-glass)'}`,
                background: jenis === 'patroli' ? 'rgba(59,130,246,0.08)' : 'transparent',
                color: jenis === 'patroli' ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
                transition: 'all 0.2s'
              }}>
                <MapPin size={14} /> Laporan Patroli
              </button>
              <button type="button" onClick={() => setJenis('mutasi')} style={{
                flex: 1, padding: '0.5rem', borderRadius: '8px', border: `2px solid ${jenis === 'mutasi' ? 'var(--color-primary)' : 'var(--border-glass)'}`,
                background: jenis === 'mutasi' ? 'rgba(59,130,246,0.08)' : 'transparent',
                color: jenis === 'mutasi' ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem',
                transition: 'all 0.2s'
              }}>
                <AlertTriangle size={14} /> Mutasi / Kejadian
              </button>
            </div>

            {/* ── LAPORAN PATROLI ── */}
            {jenis === 'patroli' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TITIK PATROLI</label>
                  <select value={areaId} onChange={e => setAreaId(e.target.value)} className="modern-select" required>
                    <option value="">— Pilih Titik —</option>
                    {areas.map(a => (
                      <option key={a.id} value={a.id}>{a.titik} ({a.lantai === '1'||a.lantai === '2'||a.lantai === '3'||a.lantai === '4'||a.lantai === '5'||a.lantai === '6' ? `Lt.${a.lantai}` : a.lantai})</option>
                    ))}
                  </select>
                  {errors.area && <span style={{ fontSize: '0.72rem', color: 'var(--color-danger)' }}>{errors.area}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>KONDISI</label>
                  <select value={kondisi} onChange={e => setKondisi(e.target.value)} className="modern-select">
                    {KONDISI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>KETERANGAN <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opsional)</span></label>
                  <textarea value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Tulis keterangan tambahan..." className="modern-input" style={{ height: '70px', resize: 'vertical', fontSize: '0.8rem', padding: '0.5rem' }} />
                </div>
              </>
            )}

            {/* ── MUTASI / KEJADIAN ── */}
            {jenis === 'mutasi' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>KATEGORI</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {KATEGORI_MUTASI.map(k => (
                      <button key={k.id} type="button" onClick={() => setKatMutasi(k.id)} style={{
                        padding: '0.35rem 0.6rem', borderRadius: '6px',
                        border: `1.5px solid ${katMutasi === k.id ? k.color : 'var(--border-glass)'}`,
                        background: katMutasi === k.id ? `${k.color}18` : 'transparent',
                        color: katMutasi === k.id ? k.color : 'var(--text-secondary)',
                        fontWeight: 600, cursor: 'pointer', fontSize: '0.72rem',
                        transition: 'all 0.2s'
                      }}>{k.label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>LOKASI / POS</label>
                  <input type="text" value={lokasiMutasi} onChange={e => setLokasiMutasi(e.target.value)} placeholder="Contoh: Lobby Utama / Lt.3 / Pos 00" className="modern-input" style={{ fontSize: '0.82rem' }} required />
                  {errors.lokasi && <span style={{ fontSize: '0.72rem', color: 'var(--color-danger)' }}>{errors.lokasi}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>URAIAN KEJADIAN</label>
                  <textarea value={uraianMutasi} onChange={e => setUraianMutasi(e.target.value)} placeholder="Jelaskan kejadian secara detail..." className="modern-input" style={{ height: '100px', resize: 'vertical', fontSize: '0.8rem', padding: '0.5rem' }} required />
                  {errors.uraian && <span style={{ fontSize: '0.72rem', color: 'var(--color-danger)' }}>{errors.uraian}</span>}
                </div>
              </>
            )}

            {/* Foto (opsional) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>FOTO BUKTI <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opsional)</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {foto ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={foto} alt="preview" style={{ height: '60px', width: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-glass)' }} />
                    <button type="button" onClick={() => setFoto(null)} style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--color-danger)', border: 'none', borderRadius: '50%', color: 'white', width: '18px', height: '18px', fontSize: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={10} /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => { const f = prompt('Tempel URL foto (atau kosongkan):'); if (f) setFoto(f); }} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Camera size={14} /> Tambah Foto
                  </button>
                )}
              </div>
            </div>

            {/* Info Pelapor */}
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.6rem', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
              <FileText size={12} />
              <span>Melapor sebagai: <strong style={{ color: 'var(--text-primary)' }}>{currentUser.nama}</strong> ({currentUser.nrp})</span>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <Send size={16} /> {loading ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}