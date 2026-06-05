import React, { useState } from 'react';
import { UserPlus, User, Shield, Smartphone, Hash, Users, Search, ChevronDown, ChevronRight, Save, MessageSquare } from 'lucide-react';
import { getWAContacts, saveWAContacts } from '../data/waContacts';

const ROLE_OPTIONS = [
  'Admin Super', 'Manajemen', 'SPV', 'Danru', 'Wadanru', 'Anggota', 'Guest Viewer'
];

const REGU_PRESETS = ['Regu A', 'Regu B', 'Regu C', 'Regu D'];

const ROLE_COLORS = {
  'Admin Super': '#ef4444',
  'Manajemen': '#3b82f6',
  'SPV': '#f59e0b',
  'Danru': '#06b6d4',
  'Wadanru': '#14b8a6',
  'Anggota': '#10b981',
  'Guest Viewer': '#8b5cf6'
};

export default function UserManagement({ users, onAddUser }) {
  const [reguPilih, setReguPilih] = useState('Regu B');
  const [reguKustom, setReguKustom] = useState('');
  const [anggotaInput, setAnggotaInput] = useState('');
  const [role, setRole] = useState('Anggota');
  const [search, setSearch] = useState('');
  const [reguBuka, setReguBuka] = useState({});
  const [waContacts, setWaContacts] = useState(() => getWAContacts());
  const [saveStatus, setSaveStatus] = useState('');

  const updateWAField = (dept, field, value) => {
    setWaContacts(prev => ({
      ...prev,
      [dept]: {
        ...prev[dept],
        [field]: value
      }
    }));
  };

  const handleWASave = (e) => {
    e.preventDefault();
    saveWAContacts(waContacts);
    setSaveStatus('✓ Pengaturan nomor WhatsApp berhasil disimpan!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const isReguKustom = reguPilih === '__LAINNYA__';

  const anggotaList = anggotaInput.split('\n').map(s => s.trim()).filter(Boolean);

  const existingNrp = users.map(u => parseInt(u.nrp, 10)).filter(n => !isNaN(n));
  const nextNrp = existingNrp.length > 0 ? Math.max(...existingNrp) + 1 : 10001;

  const generateNrp = () => String(nextNrp).padStart(5, '0');

  const handleSubmit = (e) => {
    e.preventDefault();
    const regu = isReguKustom ? reguKustom.trim() : reguPilih;
    if (!regu) { alert('Pilih atau tulis nama Regu!'); return; }
    if (anggotaList.length === 0) { alert('Masukkan minimal 1 nama anggota!'); return; }

    let nrpCounter = nextNrp;
    anggotaList.forEach(nama => {
      const nrp = String(nrpCounter++).padStart(5, '0');
      onAddUser({
        nama,
        nrp,
        jabatan: role,
        regu,
        pin: nrp.slice(-4),
        status: 'Aktif'
      });
    });

    setAnggotaInput('');
  };

  const filteredUsers = users.filter(u =>
    u.nama.toLowerCase().includes(search.toLowerCase()) ||
    u.nrp.toLowerCase().includes(search.toLowerCase()) ||
    u.jabatan.toLowerCase().includes(search.toLowerCase()) ||
    (u.regu || '').toLowerCase().includes(search.toLowerCase())
  );

  const groupedByRegu = {};
  filteredUsers.forEach(u => {
    const g = u.regu || 'Tanpa Regu';
    if (!groupedByRegu[g]) groupedByRegu[g] = [];
    groupedByRegu[g].push(u);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Form Tambah Anggota per Regu */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={18} className="text-primary" />
          <span>Tambah Anggota per Regu</span>
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>REGU</label>
              <div className="login-input-wrap">
                <Users size={16} />
                <select value={reguPilih} onChange={e => setReguPilih(e.target.value)} className="modern-select" style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.8rem', padding: '0.45rem 0' }}>
                  {REGU_PRESETS.map(r => <option key={r} value={r}>{r}</option>)}
                  <option value="__LAINNYA__">Lainnya...</option>
                </select>
              </div>
              {isReguKustom && (
                <input type="text" value={reguKustom} onChange={e => setReguKustom(e.target.value)} placeholder="Tulis nama Regu" className="modern-input" style={{ marginTop: '0.3rem', fontSize: '0.8rem' }} />
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ROLE</label>
              <div className="login-input-wrap">
                <Shield size={16} />
                <select value={role} onChange={e => setRole(e.target.value)} className="modern-select" style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.8rem', padding: '0.45rem 0' }}>
                  {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>NAMA ANGGOTA <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(1 nama per baris)</span></label>
            <textarea
              value={anggotaInput}
              onChange={e => setAnggotaInput(e.target.value)}
              placeholder={`Wahyudi\nFaizal Tanjung\nAgus Hendraya`}
              className="modern-input"
              style={{ height: '100px', resize: 'vertical', fontSize: '0.8rem', padding: '0.5rem' }}
              required
            />
            {anggotaList.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div>Akan mendaftarkan <strong>{anggotaList.length} anggota</strong> ke <strong>{isReguKustom ? reguKustom || '...' : reguPilih}</strong> dengan role <strong>{role}</strong></div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  NRP: {generateNrp()} – {String(nextNrp + anggotaList.length - 1).padStart(5, '0')}
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            <UserPlus size={16} /> Daftarkan {anggotaList.length > 0 ? `${anggotaList.length} Anggota` : 'Anggota'}
          </button>
        </form>
      </div>

      {/* Panel Pengaturan Nomor WA Disposisi */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} className="text-primary" />
          <span>Pengaturan Disposisi WhatsApp</span>
        </h3>
        
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
          Tentukan nama, nomor WhatsApp penerima, dan emoji untuk masing-masing departemen tindak lanjut. 
          Pastikan nomor menggunakan format kode negara tanpa tanda <code>+</code> atau <code>0</code> di awal (contoh: <code>6281234567890</code>).
        </p>

        <form onSubmit={handleWASave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* Keamanan */}
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{waContacts.Keamanan.emoji || '🛡️'}</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Departemen Keamanan</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>NAMA PENERIMA</label>
                  <input 
                    type="text" 
                    value={waContacts.Keamanan.nama} 
                    onChange={e => updateWAField('Keamanan', 'nama', e.target.value)}
                    className="modern-input" 
                    required 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>NOMOR WHATSAPP</label>
                  <input 
                    type="text" 
                    value={waContacts.Keamanan.nomor} 
                    onChange={e => updateWAField('Keamanan', 'nomor', e.target.value)}
                    className="modern-input" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Teknisi */}
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{waContacts.Teknisi.emoji || '🛠️'}</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Departemen Engineering / Teknisi</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>NAMA PENERIMA</label>
                  <input 
                    type="text" 
                    value={waContacts.Teknisi.nama} 
                    onChange={e => updateWAField('Teknisi', 'nama', e.target.value)}
                    className="modern-input" 
                    required 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>NOMOR WHATSAPP</label>
                  <input 
                    type="text" 
                    value={waContacts.Teknisi.nomor} 
                    onChange={e => updateWAField('Teknisi', 'nomor', e.target.value)}
                    className="modern-input" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Cleaning Service */}
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{waContacts.Cleaning.emoji || '🧹'}</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Departemen Cleaning Service</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>NAMA PENERIMA</label>
                  <input 
                    type="text" 
                    value={waContacts.Cleaning.nama} 
                    onChange={e => updateWAField('Cleaning', 'nama', e.target.value)}
                    className="modern-input" 
                    required 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>NOMOR WHATSAPP</label>
                  <input 
                    type="text" 
                    value={waContacts.Cleaning.nomor} 
                    onChange={e => updateWAField('Cleaning', 'nomor', e.target.value)}
                    className="modern-input" 
                    required 
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            {saveStatus && (
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#10b981', 
                background: 'rgba(16, 185, 129, 0.1)', 
                padding: '0.35rem 0.75rem', 
                borderRadius: '6px',
                fontWeight: 600
              }}>
                {saveStatus}
              </span>
            )}
            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={14} /> Simpan Pengaturan WA
            </button>
          </div>
        </form>
      </div>

      {/* Daftar User per Regu */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} className="text-primary" />
            <span>Daftar User ({users.length})</span>
          </h3>
          <div className="login-input-wrap" style={{ width: '220px' }}>
            <Search size={14} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama / NRP / role / regu..." className="modern-input" style={{ fontSize: '0.75rem' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Object.entries(groupedByRegu).map(([regu, members]) => (
            <div key={regu} className="glass-panel" style={{ padding: '0', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
              <div
                onClick={() => setReguBuka(prev => ({ ...prev, [regu]: !prev[regu] }))}
                style={{ padding: '0.65rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(59,130,246,0.05)' }}
              >
                {reguBuka[regu] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Shield size={14} className="text-primary" />
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{regu}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{members.length} anggota</span>
              </div>
              {reguBuka[regu] && members.map(u => (
                <div key={u.id} style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <img src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40'} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(59,130,246,0.2)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{u.nama}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span>NRP: {u.nrp}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.05rem 0.35rem', borderRadius: '3px', fontSize: '0.6rem', fontWeight: 700, background: `${ROLE_COLORS[u.jabatan] || '#666'}20`, color: ROLE_COLORS[u.jabatan] || '#666' }}>
                        {u.jabatan}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {!reguBuka[regu] && (
                <div style={{ padding: '0.4rem 1rem 0.4rem 2.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {members.slice(0, 3).map(m => m.nama).join(', ')}{members.length > 3 ? `, +${members.length - 3} lagi` : ''}
                </div>
              )}
            </div>
          ))}
          {Object.keys(groupedByRegu).length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {search ? 'Tidak ada user yang cocok.' : 'Belum ada user terdaftar.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
