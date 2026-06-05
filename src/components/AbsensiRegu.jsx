import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Clock, CheckCircle2, UserCheck, RefreshCw, ClipboardList, HelpCircle } from 'lucide-react';

export default function AbsensiRegu({ users, areas, attendanceLogs, onAddAttendance }) {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [hari, setHari] = useState(() => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date().getDay()];
  });
  const [tanggal, setTanggal] = useState(todayStr);
  const [selectedRegu, setSelectedRegu] = useState('Regu A');
  const [selectedShift, setSelectedShift] = useState('P'); // 'P' | 'S' | 'M' | 'Kh'

  // Get active guards for the selected Regu
  const reguMembers = users.filter(u => u.regu === selectedRegu);

  // Rows state for table editing
  const [rows, setRows] = useState([]);

  // Get time string by shift
  const getJamDinas = (shiftCode) => {
    if (shiftCode === 'P') return '06.00 - 14.00';
    if (shiftCode === 'S') return '14.00 - 22.00';
    if (shiftCode === 'M') return '22.00 - 06.00';
    return '08.00 - 17.00'; // Khusus
  };

  // Re-generate table rows when Regu or Shift changes
  useEffect(() => {
    // Check if there's already a saved log for this Date + Regu + Shift combination
    const existingLog = attendanceLogs.find(
      log => log.tanggal === tanggal && log.regu === selectedRegu && log.shift === selectedShift
    );

    if (existingLog) {
      setRows(existingLog.details);
    } else {
      // Default plotting: distribute members across different posts
      const defaultRows = reguMembers.map((member, index) => {
        // Pick a default area based on index
        const areaIndex = index % (areas.length || 1);
        const defaultArea = areas[areaIndex] ? areas[areaIndex].titik : '';
        
        return {
          personilId: member.id,
          nama: member.nama,
          jabatan: member.jabatan,
          status: 'Hadir', // Hadir, Tidak Hadir, Tukar Shift, Sakit, Cuti, Mangkir, Tanpa Keterangan
          alasan: '',
          penggantiId: '',
          posPlotting: defaultArea,
          jamDinas: getJamDinas(selectedShift)
        };
      });
      setRows(defaultRows);
    }
  }, [selectedRegu, selectedShift, tanggal, users, areas, attendanceLogs]);

  const handleRowChange = (index, field, value) => {
    setRows(prev => prev.map((row, idx) => {
      if (idx !== index) return row;
      
      const updated = { ...row, [field]: value };
      
      // If status changes to Hadir, reset reason and substitute
      if (field === 'status') {
        if (value === 'Hadir') {
          updated.alasan = '';
          updated.penggantiId = '';
        } else if (value === 'Tukar Shift') {
          updated.alasan = 'Tukar Shift';
        } else if (value === 'Sakit') {
          updated.alasan = 'Sakit';
          updated.posPlotting = '-';
        } else if (value === 'Cuti') {
          updated.alasan = 'Cuti';
          updated.posPlotting = '-';
        } else if (value === 'Mangkir') {
          updated.alasan = 'Mangkir';
          updated.posPlotting = '-';
        }
      }
      return updated;
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (rows.length === 0) {
      alert('Tidak ada anggota regu untuk diabsensi.');
      return;
    }

    onAddAttendance({
      tanggal,
      hari,
      regu: selectedRegu,
      shift: selectedShift,
      jamDinas: getJamDinas(selectedShift),
      details: rows
    });
  };

  // Get substitute options (all users except the ones in active Regu)
  const substituteOptions = users.filter(u => u.regu !== selectedRegu && ['Danru', 'Wadanru', 'Anggota'].includes(u.jabatan));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* FORM INPUT ABSENSI */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={20} className="text-primary" />
          <span>Form Isian Absensi Regu & Plotting Penjagaan</span>
        </h3>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Metadata Parameters */}
          <div className="grid-cols-4" style={{ gap: '1rem' }}>
            <div className="step-field">
              <label><Calendar size={12} /> HARI</label>
              <select value={hari} onChange={e => setHari(e.target.value)} className="modern-select">
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            
            <div className="step-field">
              <label><Calendar size={12} /> TANGGAL</label>
              <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="modern-input" required />
            </div>

            <div className="step-field">
              <label><Users size={12} /> REGU</label>
              <select value={selectedRegu} onChange={e => setSelectedRegu(e.target.value)} className="modern-select">
                {['Regu A', 'Regu B', 'Regu C', 'Regu D', 'Non-Regu'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="step-field">
              <label><Clock size={12} /> SHIFT JAGA</label>
              <select value={selectedShift} onChange={e => setSelectedShift(e.target.value)} className="modern-select">
                <option value="P">P (Pagi: 06:00-14:00)</option>
                <option value="S">S (Siang: 14:00-22:00)</option>
                <option value="M">M (Malam: 22:00-06:00)</option>
                <option value="Kh">Kh (Khusus)</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-glass)', borderRadius: '8px', background: 'rgba(0,0,0,0.1)' }}>
            <table className="absensi-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>No</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama (Auto)</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Jabatan (Auto)</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Keterangan Hadir</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Jika Tidak Hadir Karena</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Pengganti (Tukar Shift / Backup)</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Plotting Pos (Pilih)</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Jam Dinas</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Tidak ada personil yang terdaftar dalam {selectedRegu}.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr key={row.personilId} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700 }}>{row.nama}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.jabatan}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <select 
                          value={row.status} 
                          onChange={e => handleRowChange(idx, 'status', e.target.value)} 
                          className="modern-select"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', minWidth: '110px' }}
                        >
                          <option value="Hadir">Hadir</option>
                          <option value="Tidak Hadir">Tidak Hadir</option>
                          <option value="Tukar Shift">Tukar Shift</option>
                          <option value="Sakit">Sakit</option>
                          <option value="Cuti">Cuti</option>
                          <option value="Mangkir">Mangkir</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <input 
                          type="text" 
                          value={row.alasan} 
                          onChange={e => handleRowChange(idx, 'alasan', e.target.value)} 
                          placeholder="-" 
                          disabled={row.status === 'Hadir'}
                          className="modern-input" 
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <select 
                          value={row.penggantiId} 
                          onChange={e => handleRowChange(idx, 'penggantiId', e.target.value)} 
                          disabled={row.status !== 'Tukar Shift' && row.status !== 'Tidak Hadir'}
                          className="modern-select"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          <option value="">-- Tidak Ada --</option>
                          {substituteOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.nama} ({opt.jabatan} - {opt.regu})</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <select 
                          value={row.posPlotting} 
                          onChange={e => handleRowChange(idx, 'posPlotting', e.target.value)} 
                          disabled={['Sakit', 'Cuti', 'Mangkir'].includes(row.status)}
                          className="modern-select"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          <option value="-">-</option>
                          {areas.map(a => (
                            <option key={a.id} value={a.titik}>{a.titik}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {row.jamDinas}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn-primary" style={{ padding: '0.65rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} /> Simpan Absensi & Plotting
            </button>
          </div>
        </form>
      </div>

      {/* HISTORI ABSENSI HARIAN */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck size={20} className="text-primary" />
          <span>Histori Absensi & Plotting Terdaftar</span>
        </h3>
        
        <div className="grid-cols-3" style={{ gap: '1rem' }}>
          {attendanceLogs.length === 0 ? (
            <div style={{ gridColumn: 'span 3', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              Belum ada log absensi terdaftar. Silakan buat absensi baru di atas.
            </div>
          ) : (
            [...attendanceLogs].reverse().map((log, index) => {
              const presentCount = log.details.filter(d => d.status === 'Hadir' || d.status === 'Tukar Shift').length;
              return (
                <div key={log.id || index} className="glass-panel" style={{ padding: '1rem', borderLeft: '3px solid var(--color-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{log.regu}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.hari}, {log.tanggal}</p>
                    </div>
                    <span className="badge badge-info" style={{ fontSize: '0.6rem' }}>Shift {log.shift}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Jam Dinas:</span>
                      <span style={{ fontWeight: 600 }}>{log.jamDinas}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Kepatuhan Plotting:</span>
                      <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{presentCount} / {log.details.length} Personil</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
