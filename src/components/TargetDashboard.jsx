import React, { useState } from 'react';
import { 
  Target, 
  Award, 
  Clock, 
  Zap,
  Building,
  User,
  Activity,
  FileText,
  AlertTriangle,
  AlertOctagon,
  MapPin
} from 'lucide-react';

export default function TargetDashboard({ reports, findings, areas, currentUser, isClient }) {
  const [perspective, setPerspective] = useState('tenant');
  const [selectedGuard, setSelectedGuard] = useState('Ahmad Rafli');

  // Statistics calculation for compliance
  const totalAreas = areas.length;
  const today = new Date().toISOString().split('T')[0];
  const reportsToday = reports.filter(r => r.timestamp.startsWith(today));
  
  // Compliance Rate (how many JDC areas visited today vs total areas)
  const uniqueVisitedToday = new Set(reportsToday.map(r => r.areaId)).size;
  const complianceRate = Math.round((uniqueVisitedToday / totalAreas) * 100) || 0;

  // SLA Resolution time calculation (simulated average: 2.5 hours)
  const avgSlaTime = "2.4 Jam";
  const slaCompliance = "96.5%";

  // Security Guards personal data metrics
  const guardsData = {
    'Ahmad Rafli': {
      targetCheckpoints: 12,
      completedCheckpoints: reports.filter(r => r.userName === 'Ahmad Rafli' && r.timestamp.startsWith(today)).length + 4, // Mock added for history
      avgScanInterval: '24 menit',
      shiftCompliance: '92%',
      level: 'Gold Guard',
      points: 1240,
      badges: ['Patrol Master', 'Disiplin Tinggi', 'Anti-Fraud Pass']
    },
    'Candra Hermawan': {
      targetCheckpoints: 12,
      completedCheckpoints: reports.filter(r => r.userName === 'Candra Hermawan' && r.timestamp.startsWith(today)).length + 2,
      avgScanInterval: '32 menit',
      shiftCompliance: '83%',
      level: 'Silver Guard',
      points: 980,
      badges: ['Gerak Cepat', 'Anti-Fraud Pass']
    }
  };

  const activeGuard = guardsData[selectedGuard] || guardsData['Ahmad Rafli'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* PERSPECTIVE SWITCHER */}
      {!isClient && (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="perspective-container">
            <button
              onClick={() => setPerspective('tenant')}
              className={`perspective-btn ${perspective === 'tenant' ? 'active' : ''}`}
            >
              <Building size={16} /> Admin Tenant (SLA)
            </button>
            <button
              onClick={() => setPerspective('guard')}
              className={`perspective-btn ${perspective === 'guard' ? 'active' : ''}`}
            >
              <User size={16} /> Anggota Patroli (Personal)
            </button>
          </div>
        </div>
      )}

      {/* 1. PERSPEKTIF ADMIN TENANT (SLA TARGETS) */}
      {perspective === 'tenant' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Target Compliance Indicators */}
          <div className="grid-cols-3">
            
            <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>COMPLIANCE RATE PATROLI</p>
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{complianceRate}%</h3>
                </div>
                <span className="badge badge-success" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' }}>Target 95%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${complianceRate}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', borderRadius: '4px' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {uniqueVisitedToday} dari {totalAreas} titik checkpoint SMPJDC telah dipatroli hari ini.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RATA-RATA SLA PENYELESAIAN</p>
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{avgSlaTime}</h3>
                </div>
                <span className="badge badge-info">Target &lt;4 Jam</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-success)' }}>
                <Clock size={14} />
                <span>Respons cepat tim engineering dan lapangan</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.8rem' }}>
                Dihitung sejak petugas melaporkan temuan (lampu/CCTV) hingga status "Closed".
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SLA COMPLIANCE TIKET</p>
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{slaCompliance}</h3>
                </div>
                <span className="badge badge-success">Target 90%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '96%', height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)', borderRadius: '4px' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Penyelesaian kendala SMPJDC memenuhi batas kesepakatan SLA.
              </p>
            </div>

          </div>

          {/* JDC Compliance Details list */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} className="text-primary" /> Target & Pencapaian Per Lantai SMPJDC
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['Basement', '1', '2', '3', '4', '5', '6', 'Halaman Depan', 'Halaman Samping Kanan', 'Pos 00', 'R. Teknik', 'Halaman Belakang', 'Halaman Samping Kiri'].map(floorKey => {
                const floorAreas = areas.filter(a => a.lantai === floorKey);
                if (floorAreas.length === 0) return null;

                const floorConfig = {
                  'Basement': { name: 'Basement', target: '2 kali scan per shift' },
                  '1': { name: 'Lantai 1', target: '2 kali scan per shift' },
                  '2': { name: 'Lantai 2', target: '2 kali scan per shift' },
                  '3': { name: 'Lantai 3', target: '2 kali scan per shift' },
                  '4': { name: 'Lantai 4', target: '2 kali scan per shift' },
                  '5': { name: 'Lantai 5', target: '2 kali scan per shift' },
                  '6': { name: 'Lantai 6', target: '2 kali scan per shift' },
                  'Halaman Depan': { name: 'Halaman Depan', target: '5 kali scan per shift' },
                  'Halaman Samping Kanan': { name: 'Halaman Samping Kanan', target: '1 kali scan per shift' },
                  'Pos 00': { name: 'Pos 00', target: '1 kali scan per shift' },
                  'R. Teknik': { name: 'R. Teknik', target: '1 kali scan per shift' },
                  'Halaman Belakang': { name: 'Halaman Belakang', target: '3 kali scan per shift' },
                  'Halaman Samping Kiri': { name: 'Halaman Samping Kiri', target: '1 kali scan per shift' }
                };

                const config = floorConfig[floorKey] || { name: `Lantai ${floorKey}`, target: '4 kali scan per shift' };

                // Get reports today for this floor's areas
                const visitedAreas = floorAreas.filter(a => reportsToday.some(r => r.areaId === a.id));
                const complianceVal = Math.round((visitedAreas.length / floorAreas.length) * 100) || 0;

                // Color based on compliance
                let colorClass = 'var(--color-danger)';
                if (complianceVal === 100) {
                  colorClass = 'var(--color-success)';
                } else if (complianceVal > 0) {
                  colorClass = 'var(--color-warning)';
                }

                // Custom status/missed areas text
                let descriptionText = `Target: ${config.target}. `;
                if (complianceVal === 100) {
                  descriptionText += 'Seluruh pos patroli aman dan sudah diperiksa.';
                } else if (complianceVal > 0) {
                  const unvisited = floorAreas.filter(a => !reportsToday.some(r => r.areaId === a.id));
                  descriptionText += `Pos terlewat: ${unvisited.map(a => a.titik).join(', ')}.`;
                } else {
                  descriptionText += 'Belum ada pos yang dipatroli pada shift ini.';
                }

                // If there are findings on this floor
                const floorFindings = findings.filter(f => f.status !== 'Closed' && floorAreas.some(a => f.area.includes(a.titik)));
                if (floorFindings.length > 0) {
                  descriptionText += ` Ditemukan ${floorFindings.length} kendala (${floorFindings.map(f => f.kategori).join(', ')}) - status On Progress.`;
                }

                return (
                  <div key={floorKey} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 700 }}>{config.name}</span>
                      <span style={{ fontWeight: 700, color: colorClass }}>
                        {complianceVal}% Compliance ({visitedAreas.length}/{floorAreas.length} Pos Checked)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px' }}>
                      <div style={{ width: `${complianceVal}%`, height: '100%', background: colorClass, borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                      {descriptionText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── TIKET TEMUAN AKTIF ── */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} className="text-primary" /> Tiket Temuan Aktif
            </h3>
            {findings.filter(f => f.status !== 'Closed').length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {findings.filter(f => f.status !== 'Closed').map(f => (
                  <div key={f.id} style={{
                    padding: '0.65rem 0.85rem', borderRadius: '8px',
                    background: 'rgba(59,130,246,0.02)', border: '1px solid var(--border-glass)',
                    borderLeft: `3px solid ${
                      f.severity === 'Kritis' || f.severity === 'Tinggi' ? '#ef4444' :
                      f.severity === 'Sedang' ? '#f59e0b' : '#3b82f6'
                    }`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{f.kategori}</span>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <span className="badge" style={{
                          fontSize: '0.6rem', padding: '0.1rem 0.4rem',
                          background: f.severity === 'Kritis' ? 'rgba(239,68,68,0.15)' :
                                     f.severity === 'Tinggi' ? 'rgba(239,68,68,0.1)' :
                                     f.severity === 'Sedang' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                          color: f.severity === 'Kritis' ? '#ef4444' :
                                 f.severity === 'Tinggi' ? '#ef4444' :
                                 f.severity === 'Sedang' ? '#f59e0b' : '#3b82f6'
                        }}>{f.severity || 'Rendah'}</span>
                        <span className="badge" style={{
                          fontSize: '0.6rem', padding: '0.1rem 0.4rem',
                          background: f.status === 'Open' ? 'rgba(239,68,68,0.1)' :
                                     f.status === 'In Progress' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                          color: f.status === 'Open' ? '#ef4444' :
                                 f.status === 'In Progress' ? '#f59e0b' : '#10b981'
                        }}>{f.status}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      📍 {f.area}
                    </p>
                    {f.detail && <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{f.detail}</p>}
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {f.department ? `Disposisi: ${f.department}` : ''} • {f.pelapor ? `Pelapor: ${f.pelapor}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                ✅ Semua tiket temuan sudah selesai. Tidak ada kendala aktif.
              </div>
            )}
          </div>

          {/* ── LAPORAN PATROLI HARI INI ── */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} className="text-primary" /> Laporan Patroli Hari Ini
            </h3>
            {reportsToday.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {reportsToday.slice(-10).reverse().map(r => (
                  <div key={r.id} style={{
                    padding: '0.55rem 0.75rem', borderRadius: '6px',
                    borderLeft: `3px solid ${
                      r.kondisi === 'Aman dan Kondusif' ? 'var(--color-success)' :
                      r.kondisi === 'Ada Aktivitas' || r.kondisi === 'Renovasi' ? 'var(--color-warning)' : 'var(--color-danger)'
                    }`,
                    background: 'rgba(255,255,255,0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                      <span style={{ fontWeight: 600 }}>{r.userName}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {new Date(r.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>{r.titik}</span>
                      <span style={{ color: 'var(--text-muted)' }}>({['1','2','3','4','5','6'].includes(r.lantai) ? `Lt.${r.lantai}` : r.lantai})</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {r.kondisi}{r.keterangan ? ` — ${r.keterangan}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Belum ada laporan patroli untuk hari ini.
              </div>
            )}
          </div>

        </div>
      )}

      {/* 2. PERSPEKTIF ANGGOTA PATROLI (PERSONAL TARGETS) */}
      {perspective === 'guard' && !isClient && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Guard Selector */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PILIH PETUGAS:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Ahmad Rafli', 'Candra Hermawan'].map(name => (
                <button
                  key={name}
                  onClick={() => setSelectedGuard(name)}
                  style={{
                    border: 'none',
                    background: selectedGuard === name ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                    color: selectedGuard === name ? '#ffffff' : 'var(--text-primary)',
                    padding: '0.4rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-cols-3">
            
            {/* Guard personal scorecard */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  background: 'rgba(59,130,246,0.1)', 
                  color: 'var(--color-primary)', 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Award size={28} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>{selectedGuard}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>{activeGuard.level}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Skor Keaktifan:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{activeGuard.points} Pts</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Kepatuhan Rute:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{activeGuard.shiftCompliance}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Selisih Scan:</span>
                  <span style={{ fontWeight: 700 }}>{activeGuard.avgScanInterval}</span>
                </div>
              </div>
            </div>

            {/* Shift target progress */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Target size={18} className="text-primary" /> Target Checkpoint Shift
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center', margin: 'auto 0' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                  {activeGuard.completedCheckpoints} <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>/ {activeGuard.targetCheckpoints}</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Checkpoint terselesaikan pada shift hari ini.
                </p>
                <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem' }}>
                  <div style={{ 
                    width: `${Math.min((activeGuard.completedCheckpoints / activeGuard.targetCheckpoints) * 100, 100)}%`, 
                    height: '100%', 
                    background: 'var(--color-primary)', 
                    borderRadius: '4px' 
                  }} />
                </div>
              </div>
            </div>

            {/* Badges Earned */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={18} className="text-primary" /> Lencana Pencapaian
              </h4>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', flex: 1, alignContent: 'center' }}>
                {activeGuard.badges.map(badge => (
                  <span 
                    key={badge} 
                    className="badge badge-success"
                    style={{ 
                      padding: '0.4rem 0.8rem', 
                      fontSize: '0.75rem',
                      background: 'rgba(16,185,129,0.1)',
                      color: 'var(--color-success)',
                      border: '1px solid rgba(16,185,129,0.2)'
                    }}
                  >
                    🏆 {badge}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
