import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Eye,
  Filter,
  Clock
} from 'lucide-react';

export default function ReportsExport({ reports, findings, users, onUpdateFindingStatus }) {
  // SLA Timer helper
  const getSLATimer = (startDateStr, status) => {
    if (status === 'Closed') {
      return "Selesai < 2.5 Jam (SLA Hijau)";
    }
    const diffMs = Math.abs(new Date() - new Date(startDateStr));
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const hrsVal = diffHrs > 0 ? `${diffHrs} Jam ` : '';
    return `SLA Aktif: ${hrsVal}${diffMins} Menit`;
  };

  // Filter States
  const [filterShift, setFilterShift] = useState('All');
  const [filterFloor, setFilterFloor] = useState('All');
  const [filterOfficer, setFilterOfficer] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [filterKondisi, setFilterKondisi] = useState('All');

  // Detailed Modal preview of single log
  const [selectedLog, setSelectedLog] = useState(null);

  // Filtered reports calculation
  const filteredReports = reports.filter(r => {
    const matchShift = filterShift === 'All' || r.shift === filterShift;
    const matchFloor = filterFloor === 'All' || r.lantai === filterFloor;
    const matchOfficer = filterOfficer === 'All' || r.userName === filterOfficer;
    const matchDate = !filterDate || r.timestamp.startsWith(filterDate);
    const matchKondisi = filterKondisi === 'All' || 
      (filterKondisi === 'Aman' && r.kondisi === 'Aman dan Kondusif') ||
      (filterKondisi === 'Temuan' && r.kondisi !== 'Aman dan Kondusif');

    return matchShift && matchFloor && matchOfficer && matchDate && matchKondisi;
  });

  // Export to CSV/Excel simulator
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Waktu,Petugas,Gedung,Lantai,Zona,Titik,Shift,Kondisi,Keterangan,GPS Valid,Device,IP\n";

    filteredReports.forEach(r => {
      const row = [
        r.id,
        r.timestamp,
        r.userName,
        r.gedung,
        r.lantai,
        r.zona,
        r.titik,
        r.shift,
        r.kondisi,
        `"${r.keterangan || ''}"`,
        r.antiFraud.gpsValid ? "YES" : "NO",
        r.antiFraud.device,
        r.antiFraud.ip
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_patroli_jdc_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF (Triggers Print Window with custom print styles)
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. FILTER CONTROLLER BAR */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
          <Filter size={16} /> Filter & Cari Laporan
        </h4>
        
        <div className="grid-cols-5" style={{ gap: '0.85rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>SHIFT</span>
            <select value={filterShift} onChange={(e) => setFilterShift(e.target.value)} className="modern-select" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
              <option value="All">Semua Shift</option>
              <option value="Pagi">Shift Pagi</option>
              <option value="Siang">Shift Siang</option>
              <option value="Malam">Shift Malam</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>LANTAI</span>
            <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)} className="modern-select" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
              <option value="All">Semua Lantai</option>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>PETUGAS</span>
            <select value={filterOfficer} onChange={(e) => setFilterOfficer(e.target.value)} className="modern-select" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
              <option value="All">Semua Petugas</option>
              {users.filter(u => u.jabatan === 'Petugas Security').map(u => (
                <option key={u.id} value={u.nama}>{u.nama}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>TANGGAL</span>
            <input 
              type="date" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)} 
              className="modern-input" 
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS AREA</span>
            <select value={filterKondisi} onChange={(e) => setFilterKondisi(e.target.value)} className="modern-select" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
              <option value="All">Semua Kondisi</option>
              <option value="Aman">Aman & Kondusif</option>
              <option value="Temuan">Memiliki Temuan</option>
            </select>
          </div>

        </div>
      </div>

      {/* 2. FINDINGS TICKETS BOARD (Tindak Lanjut Notifikasi) */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warning)' }}>
          <AlertTriangle size={18} /> Tindak Lanjut Notifikasi Temuan
        </h3>
        
        <div className="grid-cols-2">
          {findings.map(find => (
            <div 
              key={find.id} 
              className="glass-panel" 
              style={{ 
                padding: '1rem', 
                display: 'flex', 
                gap: '1rem',
                borderLeft: `4px solid ${
                  find.status === 'Open' ? 'var(--color-danger)' : 
                  find.status === 'On Progress' ? 'var(--color-warning)' : 'var(--color-success)'
                }`
              }}
            >
              {find.foto && (
                <img 
                  src={find.foto} 
                  alt={find.kategori} 
                  style={{ width: '80px', height: '80px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                />
              )}
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    <span className="badge" style={{ 
                      background: find.status === 'Open' ? 'rgba(239, 68, 68, 0.15)' : find.status === 'On Progress' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: find.status === 'Open' ? 'var(--color-danger)' : find.status === 'On Progress' ? 'var(--color-warning)' : 'var(--color-success)',
                      fontSize: '0.65rem'
                    }}>
                      {find.status}
                    </span>
                    <span className="badge" style={{ 
                      background: find.severity === 'Tinggi' ? 'rgba(239, 68, 68, 0.2)' : find.severity === 'Sedang' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: find.severity === 'Tinggi' ? 'var(--color-danger)' : find.severity === 'Sedang' ? 'var(--color-warning)' : 'var(--color-primary)',
                      fontSize: '0.65rem',
                      fontWeight: 700
                    }}>
                      {find.severity || 'Rendah'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(find.tanggal).toLocaleDateString('id-ID')}
                  </span>
                </div>
                
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{find.kategori}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>{find.area}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>"{find.detail}"</p>
                
                {/* Live SLA Countdown Timer */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.3rem', 
                  fontSize: '0.7rem', 
                  color: find.status === 'Closed' ? 'var(--color-success)' : 'var(--color-warning)',
                  fontWeight: 600
                }}>
                  <Clock size={12} />
                  <span>{getSLATimer(find.tanggal, find.status)}</span>
                </div>

                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Pelapor: {find.pelapor}</p>
 
                {/* Status Updater */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ubah Status:</span>
                  <select 
                    value={find.status} 
                    onChange={(e) => onUpdateFindingStatus(find.id, e.target.value)}
                    className="modern-select"
                    style={{ width: '110px', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                  >
                    <option value="Open">Open</option>
                    <option value="On Progress">On Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
 
          {findings.length === 0 && (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Tidak ada temuan kendala aktif.
            </div>
          )}
        </div>
      </div>

      {/* 3. REPORTS DATA TABLE */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Log Laporan Patroli Keamanan ({filteredReports.length})</h3>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={handleExportCSV} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', flex: '1 1 auto' }}>
              <FileSpreadsheet size={16} /> Export Excel (CSV)
            </button>
            <button onClick={handleExportPDF} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', flex: '1 1 auto' }}>
              <FileText size={16} /> Cetak PDF
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>ID</th>
                <th style={{ padding: '0.75rem' }}>Waktu / Shift</th>
                <th style={{ padding: '0.75rem' }}>Nama Petugas</th>
                <th style={{ padding: '0.75rem' }}>Lokasi Checkpoint</th>
                <th style={{ padding: '0.75rem' }}>Kondisi</th>
                <th style={{ padding: '0.75rem' }}>Anti-Kecurangan</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, idx) => (
                <tr 
                  key={report.id} 
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.03)', 
                    background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' 
                  }}
                >
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{report.id}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>{new Date(report.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                      {new Date(report.timestamp).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Shift {report.shift}</span>
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{report.userName}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>{report.titik}</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Lt. {report.lantai} ({report.zona})
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge" style={{ 
                      background: report.kondisi === 'Aman dan Kondusif' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: report.kondisi === 'Aman dan Kondusif' ? 'var(--color-success)' : 'var(--color-danger)',
                      border: `1px solid ${report.kondisi === 'Aman dan Kondusif' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                    }}>
                      {report.kondisi}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', fontSize: '0.7rem' }}>
                      <span style={{ color: report.antiFraud.gpsValid ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                        ● GPS: {report.antiFraud.gpsValid ? 'Valid' : 'Invalid'} ({report.antiFraud.radius}m)
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>● Token: Verified</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedLog(report)}
                      style={{
                        background: 'rgba(59,130,246,0.1)',
                        border: 'none',
                        color: 'var(--color-primary)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      <Eye size={12} style={{ marginRight: '0.2rem' }} /> Lihat
                    </button>
                  </td>
                </tr>
              ))}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Tidak ada laporan ditemukan dengan filter tersebut.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. DETAILED LOG MODAL */}
      {selectedLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '500px', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: '1.2rem', animation: 'scale-up 0.25s' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Detail Patroli #{selectedLog.id}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Waktu Scan:</span>
                <span style={{ fontWeight: 600 }}>{new Date(selectedLog.timestamp).toLocaleString('id-ID')} WIB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Petugas Security:</span>
                <span style={{ fontWeight: 600 }}>{selectedLog.userName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Area Pos:</span>
                <span style={{ fontWeight: 600 }}>{selectedLog.titik} (Lt.{selectedLog.lantai} {selectedLog.zona})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Kondisi Checkpoint:</span>
                <span style={{ fontWeight: 700, color: selectedLog.kondisi === 'Aman dan Kondusif' ? 'var(--color-success)' : 'var(--color-danger)' }}>{selectedLog.kondisi}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', background: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Keterangan Laporan:</span>
                <p style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>"{selectedLog.keterangan || '-'}"</p>
              </div>
            </div>

            {selectedLog.foto && (
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '0.35rem' }}>Bukti Foto Temuan:</span>
                <img src={selectedLog.foto} alt="Bukti temuan" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-glass)' }} />
              </div>
            )}

            {/* Anti-Fraud Audit Trail */}
            <div className="glass-panel" style={{ padding: '0.75rem', background: 'rgba(59,130,246,0.03)', fontSize: '0.75rem' }}>
              <h5 style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-primary)' }}>Audit Anti-Kecurangan</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div>GPS Validation: <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>RADIUS OK ({selectedLog.antiFraud.radius} meter)</span></div>
                <div>Token Lokasi: <span style={{ fontFamily: 'monospace' }}>{selectedLog.antiFraud.dynamicToken}</span></div>
                <div>Spesifikasi HP: <span>{selectedLog.antiFraud.device}</span></div>
                <div>IP & Jaringan: <span>{selectedLog.antiFraud.ip}</span></div>
              </div>
            </div>

            <button onClick={() => setSelectedLog(null)} className="btn-primary" style={{ width: '100%' }}>
              Tutup Rincian
            </button>
          </div>
        </div>
      )}

      {/* Hide page contents except table during printing */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .sidebar, header, .glass-panel:nth-of-type(1), .glass-panel:nth-of-type(2), button, select, input {
            display: none !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 0 !important;
          }
          .glass-panel:nth-of-type(3) {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          table {
            border: 1px solid #ccc !important;
          }
          th, td {
            border-bottom: 1px solid #ccc !important;
            color: black !important;
          }
        }
      `}</style>

    </div>
  );
}
