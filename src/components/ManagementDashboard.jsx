import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  BarChart3, 
  Eye, 
  AlertOctagon,
  Sparkles,
  Zap,
  AlertTriangle
} from 'lucide-react';

export default function ManagementDashboard({ reports, findings, areas, users, onUpdateStatus }) {
  const [graphFilter, setGraphFilter] = useState('hari'); // 'hari' | 'minggu' | 'bulan' | 'tahun'
  const [selectedFloor, setSelectedFloor] = useState('7'); // B1, 1-7, Outdoor
  
  // 1. Calculations for Statistics
  const today = new Date().toISOString().split('T')[0];
  const reportsToday = reports.filter(r => r.timestamp.startsWith(today));
  
  const totalPatrolsToday = reportsToday.length;
  const totalFindingsToday = findings.filter(f => f.tanggal.startsWith(today)).length;
  
  const totalIncidents = findings.filter(f => f.kategori === 'Orang Mencurigakan' || f.kategori === 'Temuan Lain').length;
  
  // Total safe areas is computed from areas that have at least one report today with condition 'Aman dan Kondusif'
  const patrolledAreasToday = new Set(reportsToday.map(r => r.areaId));
  const safeAreasCount = areas.filter(a => {
    const areaReports = reportsToday.filter(r => r.areaId === a.id);
    return areaReports.length > 0 && areaReports.every(r => r.kondisi === 'Aman dan Kondusif' || r.kondisi === 'Ada Aktivitas');
  }).length;
  
  const problematicAreasCount = findings.filter(f => f.status !== 'Closed').length;

  // Real-Time Active Patrol Feed (latest 5 reports)
  const latestReports = reports.slice(0, 5);

  // Missing / Unvisited Zones Today
  const unvisitedAreas = areas.filter(a => !patrolledAreasToday.has(a.id));
  
  // Overdue/Missed Zones (e.g. B1 areas or areas not visited for hours)
  const missedAreas = unvisitedAreas.slice(0, 4);

  // 2. Custom Responsive SVG Graph Data
  const graphData = {
    hari: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      patrols: [2, 1, 8, 12, 10, 4],
      findings: [0, 0, 1, 2, 1, 0],
    },
    minggu: {
      labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
      patrols: [28, 32, 40, 35, 45, 18, 12],
      findings: [2, 3, 5, 2, 4, 1, 0],
    },
    bulan: {
      labels: ['M1', 'M2', 'M3', 'M4'],
      patrols: [120, 145, 130, 155],
      findings: [12, 18, 8, 10],
    },
    tahun: {
      labels: ['Jan', 'Mar', 'Mei', 'Jul', 'Sep', 'Nov'],
      patrols: [520, 610, 680, 590, 710, 800],
      findings: [45, 52, 38, 41, 62, 50],
    }
  };

  const activeGraph = graphData[graphFilter];
  const maxPatrolVal = Math.max(...activeGraph.patrols) * 1.15;

  // 3. AI Summary Generator
  const generateAISummary = () => {
    const unresolved = findings.filter(f => f.status !== 'Closed').length;
    const critical = findings.filter(f => (f.kategori === 'CCTV Bermasalah' || f.kategori === 'Orang Mencurigakan') && f.status !== 'Closed').length;
    
    return `Morning Summary (JDC): Hari ini total patroli tercatat ${totalPatrolsToday} kali. Terdapat ${unresolved} temuan aktif, including ${critical} kendala keamanan kritikal (CCTV/Insiden). Seluruh checkpoint Lantai 7 telah dipatroli, namun Basement B1 menyisakan ${unvisitedAreas.filter(a => a.lantai === 'B1').length} zona belum diperiksa. Direkomendasikan patroli tambahan di area Parkir Motor.`;
  };

  // 4. Heatmap helper: status of an area
  const getAreaStatus = (areaId) => {
    const areaReports = reportsToday.filter(r => r.areaId === areaId);
    if (areaReports.length === 0) return 'unvisited'; // Red
    const hasActiveFinding = findings.some(f => f.reportId === areaReports[0].id && f.status !== 'Closed');
    if (hasActiveFinding) return 'problematic'; // Yellow/Orange
    return 'patrolled'; // Green
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. TOP STATS CARDS */}
      <div className="grid-cols-5">
        
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL PATROLI HARI INI</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>{totalPatrolsToday} <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 500 }}>+12%</span></h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL TEMUAN</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>{totalFindingsToday}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
            <AlertOctagon size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL INSIDEN</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>{totalIncidents}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AREA AMAN</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>{safeAreasCount}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AREA BERMASALAH</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--color-danger)' }}>{problematicAreasCount}</h3>
          </div>
        </div>

      </div>

      {/* 2. REAL-TIME MONITORING & HEATMAP PATROLI */}
      <div className="grid-cols-3">
        
        {/* Real-time feed */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} className="text-primary" /> Monitoring Real-Time
            </h3>
            <span className="badge badge-info pulse-primary">Live</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto', maxHeight: '380px' }}>
            {latestReports.map((report, idx) => (
              <div 
                key={report.id} 
                style={{ 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  background: 'rgba(255,255,255,0.02)',
                  borderLeft: `3px solid ${
                    report.kondisi === 'Aman dan Kondusif' ? 'var(--color-success)' :
                    report.kondisi === 'Ada Aktivitas' || report.kondisi === 'Renovasi' ? 'var(--color-warning)' : 'var(--color-danger)'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{report.userName}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                      {report.offlineSync && (
                        <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--color-warning)', fontSize: '0.55rem', padding: '0.1rem 0.3rem' }}>
                          🔄 Sync
                        </span>
                      )}
                      <span style={{ fontWeight: 600 }}>{new Date(report.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {new Date(report.timestamp).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 500 }}>
                  Scan: <span style={{ color: 'var(--color-primary)' }}>{report.titik}</span> ({report.lantai !== 'Outdoor' ? `Lantai ${report.lantai}` : 'Area Luar'})
                </p>
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {report.keterangan || report.kondisi}
                  </span>
                  {report.kondisi !== 'Aman dan Kondusif' && report.kondisi !== 'Ada Aktivitas' && report.kondisi !== 'Renovasi' && (
                    <span className="badge" style={{ 
                      background: report.severity === 'Tinggi' ? 'rgba(239,68,68,0.2)' : report.severity === 'Sedang' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                      color: report.severity === 'Tinggi' ? 'var(--color-danger)' : report.severity === 'Sedang' ? 'var(--color-warning)' : 'var(--color-primary)',
                      fontSize: '0.6rem',
                      padding: '0.05rem 0.25rem'
                    }}>
                      {report.severity || 'Rendah'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Patroli */}
        <div className="glass-panel grid-span-2" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} className="text-primary" /> Heatmap Patroli Gedung
            </h3>
            
            {/* Floor switcher tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: '8px', overflowX: 'auto', maxWidth: '100%', gap: '2px', whiteSpace: 'nowrap' }}>
              {['B1', '1', '2', '3', '4', '5', '6', '7', 'Outdoor'].map(floor => (
                <button
                  key={floor}
                  onClick={() => setSelectedFloor(floor)}
                  style={{
                    border: 'none',
                    background: selectedFloor === floor ? 'var(--bg-tertiary)' : 'transparent',
                    color: selectedFloor === floor ? 'var(--color-primary)' : 'var(--text-secondary)',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  {floor === 'Outdoor' ? 'Luar' : `Lt. ${floor}`}
                </button>
              ))}
            </div>
          </div>

          {/* Render floor layout map preview */}
          <div className="flex-responsive" style={{ flex: 1, alignItems: 'center', width: '100%' }}>
            <div style={{ flex: 2, background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
              <div className="grid-cols-4" style={{ gap: '0.75rem' }}>
                {areas.filter(a => a.lantai === selectedFloor).map(area => {
                  const status = getAreaStatus(area.id);
                  let colorClass = '#ef4444'; // default unvisited (Red)
                  let statusText = 'Belum Dipatroli';
                  if (status === 'patrolled') {
                    colorClass = '#10b981'; // Green
                    statusText = 'Aman / Sudah Dipatroli';
                  } else if (status === 'problematic') {
                    colorClass = '#f59e0b'; // Yellow/Orange
                    statusText = 'Ada Temuan / Masalah';
                  }

                  return (
                    <div 
                      key={area.id}
                      className="heatmap-cell"
                      style={{ 
                        background: `${colorClass}1A`, 
                        border: `2px solid ${colorClass}`,
                        color: colorClass,
                        height: '75px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '8px',
                        textAlign: 'center',
                        padding: '0.25rem'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{area.zona}</span>
                      <span style={{ fontSize: '0.6rem', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{area.titik}</span>
                      <div className="tooltip">
                        <strong>{area.titik}</strong>
                        {`Status: ${statusText}\nZona: ${area.zona}`}
                      </div>
                    </div>
                  );
                })}

                {areas.filter(a => a.lantai === selectedFloor).length === 0 && (
                  <div style={{ gridColumn: 'span 4', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    Tidak ada area yang terdaftar di lantai ini.
                  </div>
                )}
              </div>
            </div>

            {/* Heatmap Legend & Details */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-panel" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'transparent' }}>
                <h5 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Keterangan Warna</h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }} />
                  <span>Sudah Dipatroli (Aman)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b' }} />
                  <span>Ada Masalah / Temuan</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef4444' }} />
                  <span>Belum Dikunjungi</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '0.75rem', fontSize: '0.8rem', background: 'transparent' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Informasi Lantai {selectedFloor === 'Outdoor' ? 'Luar' : selectedFloor}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0.2rem 0' }}>
                  <span>Total Titik:</span>
                  <span style={{ fontWeight: 700 }}>{areas.filter(a => a.lantai === selectedFloor).length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                  <span>Selesai Patroli:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                    {areas.filter(a => a.lantai === selectedFloor && getAreaStatus(a.id) !== 'unvisited').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. DYNAMIC CHARTS & MISSED ZONES FEED */}
      <div className="grid-cols-3">
        
        {/* Custom SVG Performance Graph */}
        <div className="glass-panel grid-span-2" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} className="text-primary" /> Statistik Trend Patroli vs Temuan
            </h3>

            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: '8px' }}>
              {['hari', 'minggu', 'bulan', 'tahun'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setGraphFilter(opt)}
                  style={{
                    border: 'none',
                    background: graphFilter === opt ? 'var(--bg-tertiary)' : 'transparent',
                    color: graphFilter === opt ? 'var(--color-primary)' : 'var(--text-secondary)',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  {opt === 'hari' ? 'Hari ini' : opt}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line/Bar Chart Design */}
          <div style={{ position: 'relative', height: '220px', width: '100%', padding: '1rem 0' }}>
            <svg viewBox="0 0 600 200" style={{ width: '100%', height: '100%' }}>
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="40" y1="70" x2="580" y2="70" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="40" y1="170" x2="580" y2="170" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

              {/* Draw Patrol Bars */}
              {activeGraph.patrols.map((val, idx) => {
                const x = 70 + idx * (500 / (activeGraph.labels.length - 1 || 1));
                const barHeight = (val / maxPatrolVal) * 140;
                const y = 170 - barHeight;
                return (
                  <g key={`patrol-${idx}`}>
                    {/* Bar */}
                    <rect 
                      x={x - 10} 
                      y={y} 
                      width="20" 
                      height={barHeight} 
                      fill="url(#patrolGradient)" 
                      rx="4"
                    />
                    {/* Label */}
                    <text 
                      x={x} 
                      y="190" 
                      fill="var(--text-secondary)" 
                      fontSize="9" 
                      textAnchor="middle"
                    >
                      {activeGraph.labels[idx]}
                    </text>
                    {/* Bar value tooltip */}
                    <text 
                      x={x} 
                      y={y - 5} 
                      fill="var(--text-primary)" 
                      fontSize="9" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Draw Finding Line */}
              {(() => {
                const points = activeGraph.findings.map((val, idx) => {
                  const x = 70 + idx * (500 / (activeGraph.labels.length - 1 || 1));
                  // Scale findings differently (e.g. 5x zoom to make it visible next to patrols)
                  const y = 170 - (val / (maxPatrolVal / 2)) * 140;
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <>
                    <polyline
                      fill="none"
                      stroke="var(--color-danger)"
                      strokeWidth="3"
                      points={points}
                      style={{ filter: 'drop-shadow(0px 3px 3px var(--color-danger-glow))' }}
                    />
                    {/* Dots */}
                    {activeGraph.findings.map((val, idx) => {
                      const x = 70 + idx * (500 / (activeGraph.labels.length - 1 || 1));
                      const y = 170 - (val / (maxPatrolVal / 2)) * 140;
                      return (
                        <circle
                          key={`dot-${idx}`}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="var(--color-danger)"
                          stroke="white"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                  </>
                );
              })()}

              {/* Gradients */}
              <defs>
                <linearGradient id="patrolGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Graph Legend */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '15px', height: '15px', borderRadius: '3px', background: 'var(--color-primary)' }} />
              <span>Realisasi Patroli</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '15px', height: '3px', background: 'var(--color-danger)' }} />
              <span>Jumlah Temuan/Kendala</span>
            </div>
          </div>
        </div>

        {/* Missed / Overdue Zones Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)' }}>
            <AlertOctagon size={18} /> Zona Belum Terjamah / Terlewat
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
            {missedAreas.map(area => (
              <div 
                key={area.id} 
                className="glass-panel" 
                style={{ 
                  padding: '0.8rem', 
                  background: 'rgba(239, 68, 68, 0.03)', 
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{area.titik}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                    {area.gedung} - Lantai {area.lantai} ({area.zona})
                  </p>
                </div>
                <span className="badge badge-danger">Belum</span>
              </div>
            ))}

            {missedAreas.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
                <CheckCircle size={32} color="var(--color-success)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem', textAlign: 'center' }}>Hebat! Seluruh area telah dipatroli hari ini.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. PREMIUM AI SUMMARY CARD */}
      <div className="glass-panel" style={{ 
        padding: '1.5rem', 
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: '#60a5fa' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>AI Security Summary - Sapujagat</h4>
          </div>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#60a5fa', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Zap size={10} /> Auto-Generated
          </span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6', fontStyle: 'italic' }}>
          "{generateAISummary()}"
        </p>
      </div>

    </div>
  );
}
