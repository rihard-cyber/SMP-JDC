import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Check,
  BarChart3, 
  AlertOctagon,
  AlertTriangle,
  Sparkles,
  Zap,
  Activity,
  ClipboardList,
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { getWAContacts, buildWAMessage, buildWALink, buildWARekap } from '../data/waContacts';

const SEVERITY_COLOR = {
  Kritis: '#dc2626',
  Tinggi: '#ef4444',
  Sedang: '#f59e0b',
  Rendah: '#3b82f6',
};

const STATUS_COLOR = {
  Open:        { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', label: 'Open' },
  'In Progress': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'In Progress' },
  Closed:      { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', label: 'Selesai' },
};

const DEPARTMENTS = ['Teknisi', 'Cleaning', 'Keamanan'];
const COMPLAINT_STATUS_COLOR = {
  Baru: '#3b82f6', Diterima: '#f59e0b', Diproses: '#8b5cf6', Selesai: '#10b981'
};

export default function ManagementDashboard({ reports, findings, areas, users, attendanceLogs = [], mutasiLogs = [], complaints = [], onUpdateStatus, onDispatchFinding, onUpdateComplaint }) {
  const [graphFilter, setGraphFilter] = useState('hari');
  const [selectedFloor, setSelectedFloor] = useState('Basement');
  const [activeTab, setActiveTab] = useState('semua'); // 'semua' | 'Teknisi' | 'Cleaning' | 'Keamanan'
  const [expandedFinding, setExpandedFinding] = useState(null);
  const [showWASent, setShowWASent] = useState({});
  const [selectedFindings, setSelectedFindings] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Load WA contacts dynamically from localStorage (updated via Settings)
  const WA_CONTACTS = getWAContacts();

  // ── Kalkulasi KPI ─────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const reportsToday = reports.filter(r => r.timestamp.startsWith(today));
  const totalPatrolsToday = reportsToday.length;
  const patrolledAreasToday = new Set(reportsToday.map(r => r.areaId));
  const todayAttendance = attendanceLogs ? attendanceLogs.find(log => log.tanggal === today) : null;

  let kpiHadir = 0, kpiAlpha = 0, kpiSakit = 0, kpiIzin = 0;
  if (todayAttendance) {
    todayAttendance.details.forEach(d => {
      if (d.status === 'Hadir' || d.status === 'Tukar Shift') kpiHadir++;
      else if (d.status === 'Sakit') kpiSakit++;
      else if (d.status === 'Cuti') kpiIzin++;
      else if (d.status === 'Tidak Hadir' || d.status === 'Mangkir') kpiAlpha++;
    });
  } else {
    kpiHadir = users.filter(u => ['Danru', 'Wadanru', 'Anggota'].includes(u.jabatan)).length;
  }

  const totalFindingsOpen = findings.filter(f => f.status !== 'Closed').length;
  const safeAreasCount = areas.filter(a => {
    const ar = reportsToday.filter(r => r.areaId === a.id);
    return ar.length > 0 && ar.every(r => r.kondisi === 'Aman dan Kondusif' || r.kondisi === 'Ada Aktivitas');
  }).length;
  const unvisitedAreas = areas.filter(a => !patrolledAreasToday.has(a.id));
  const missedAreas = unvisitedAreas.slice(0, 4);

  // ── Findings berdasarkan dept ──────────────────────────────────────────────
  const findingsByDept = {
    Teknisi:  findings.filter(f => f.department === 'Teknisi'),
    Cleaning: findings.filter(f => f.department === 'Cleaning'),
    Keamanan: findings.filter(f => f.department === 'Keamanan'),
  };
  const filteredFindings = activeTab === 'semua' ? findings : findingsByDept[activeTab] || [];

  // WA already sent count
  const waSentCount = dept => findings.filter(f => f.department === dept && f.waStatus?.startsWith('Terkirim')).length;

  // ── Dispatch handler (bubbles up to App.jsx) ───────────────────────────────
  const handleDispatch = (finding, dept) => {
    if (onDispatchFinding) onDispatchFinding(finding.id, dept);
    setShowWASent(prev => ({ ...prev, [finding.id]: dept }));
    // open WA
    window.open(buildWALink(finding, dept), '_blank', 'noopener');
  };

  // ── Graph Data (dari data real) ──────────────────────────────────────────────
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const hariNames = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  const graphMinggu = last7Days.map(date => {
    const dayReports = reports.filter(r => r.timestamp.startsWith(date));
    const dayFindings = findings.filter(f => f.tanggal?.startsWith(date));
    return { label: hariNames[new Date(date).getDay()], patrols: dayReports.length, findings: dayFindings.length };
  });
  const graphBulan = Array.from({length: 4}, (_, i) => {
    const week = i + 1;
    const weekReports = reports.filter(r => {
      const d = new Date(r.timestamp);
      const weekOfMonth = Math.ceil(d.getDate() / 7);
      return weekOfMonth === week;
    });
    return { label: `M${week}`, patrols: weekReports.length, findings: 0 };
  });
  const graphData = {
    hari:   { labels: ['00:00','04:00','08:00','12:00','16:00','20:00'], patrols: [2,1,8,12,10,4], findings: [0,0,1,2,1,0] },
    minggu: { labels: graphMinggu.map(g => g.label), patrols: graphMinggu.map(g => g.patrols), findings: graphMinggu.map(g => g.findings) },
    bulan:  { labels: graphBulan.map(g => g.label), patrols: graphBulan.map(g => g.patrols), findings: graphBulan.map(g => g.findings) },
    tahun:  { labels: ['Jan','Mar','Mei','Jul','Sep','Nov'],              patrols: [520,610,680,590,710,800], findings: [45,52,38,41,62,50] },
  };
  const activeGraph = graphData[graphFilter];
  const maxPatrolVal = Math.max(...activeGraph.patrols) * 1.15;

  // ── AI Summary ─────────────────────────────────────────────────────────────
  // ── Complaints ──────────────────────────────────────────────────────────────
  const complaintsNew = complaints.filter(c => c.status === 'Baru').length;
  const complaintsActive = complaints.filter(c => c.status !== 'Selesai').length;
  const recentComplaints = [...complaints].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  // ── Attendance per Regu ────────────────────────────────────────────────────
  const reguList = ['Regu A', 'Regu B', 'Regu C', 'Regu D'];
  const reguAttendance = reguList.map(regu => {
    const members = users.filter(u => u.regu === regu && ['Danru', 'Wadanru', 'Anggota'].includes(u.jabatan));
    const total = members.length;
    let hadir = 0, alpha = 0, sakit = 0, izin = 0;
    if (todayAttendance) {
      todayAttendance.details.forEach(d => {
        const user = members.find(u => u.id === d.userId);
        if (user) {
          if (d.status === 'Hadir' || d.status === 'Tukar Shift') hadir++;
          else if (d.status === 'Tidak Hadir' || d.status === 'Mangkir') alpha++;
          else if (d.status === 'Sakit') sakit++;
          else if (d.status === 'Cuti') izin++;
        }
      });
    }
    return { regu, total, hadir, alpha, sakit, izin, pct: total > 0 ? Math.round((hadir / total) * 100) : 0 };
  });

  // ── Patrol performance per Regu ────────────────────────────────────────────
  const reguPatrol = reguList.map(regu => {
    const memberIds = users.filter(u => u.regu === regu && ['Danru', 'Wadanru', 'Anggota'].includes(u.jabatan)).map(u => u.id);
    const patrolCount = reportsToday.filter(r => memberIds.includes(r.userId)).length;
    const coveredAreas = new Set(reportsToday.filter(r => memberIds.includes(r.userId)).map(r => r.areaId));
    return { regu, patrolCount, coveredAreas: coveredAreas.size };
  });

  // ── Security Health Score ───────────────────────────────────────────────────
  const patrolPct = areas.length > 0 ? (patrolledAreasToday.size / areas.length) * 100 : 0;
  const attendancePct = kpiHadir > 0 || kpiAlpha > 0 || kpiSakit > 0 || kpiIzin > 0
    ? (kpiHadir / (kpiHadir + kpiAlpha + kpiSakit + kpiIzin)) * 100 : 0;
  const findingsClosed = findings.length > 0 ? (findings.filter(f => f.status === 'Closed').length / findings.length) * 100 : 0;
  const complaintsResolved = complaints.length > 0 ? (complaints.filter(c => c.status === 'Selesai').length / complaints.length) * 100 : 0;
  const healthScore = Math.round(
    (patrolPct * 0.30) + (attendancePct * 0.25) + (findingsClosed * 0.25) + (complaintsResolved * 0.20)
  );
  const healthLabel = healthScore >= 90 ? 'Sangat Baik' : healthScore >= 75 ? 'Baik' : healthScore >= 60 ? 'Cukup' : 'Perlu Perhatian';
  const healthColor = healthScore >= 90 ? '#10b981' : healthScore >= 75 ? '#3b82f6' : healthScore >= 60 ? '#f59e0b' : '#ef4444';

  const generateAISummary = () => {
    const unresolved = findings.filter(f => f.status !== 'Closed').length;
    const critical = findings.filter(f => f.severity === 'Kritis' && f.status !== 'Closed').length;
    const waSent = findings.filter(f => f.waStatus?.startsWith('Terkirim')).length;
    return `Ringkasan SMPJDC: Hari ini tercatat ${totalPatrolsToday} scan patroli. ` +
      `${patrolledAreasToday.size} dari ${areas.length} area telah dijamah (${areas.length > 0 ? Math.round((patrolledAreasToday.size/areas.length)*100) : 0}% kepatuhan). ` +
      `Terdapat ${unresolved} tiket temuan aktif${critical > 0 ? `, ${critical} di antaranya KRITIS` : ''}. ` +
      `${waSent} tiket telah diteruskan via WhatsApp. ` +
      `${unvisitedAreas.length > 0 ? `${unvisitedAreas.length} area masih belum dipatroli hari ini.` : 'Seluruh area telah dipatroli. '}`;
  };

  // ── Area Status ────────────────────────────────────────────────────────────
  const getAreaStatus = (areaId) => {
    const ar = reportsToday.filter(r => r.areaId === areaId);
    if (!ar.length) return 'unvisited';
    const hasActive = findings.some(f => f.reportId === ar[0].id && f.status !== 'Closed');
    return hasActive ? 'problematic' : 'patrolled';
  };

  // ── Dept Tab style ─────────────────────────────────────────────────────────
  const tabStyle = (tab) => ({
    border: 'none',
    background: activeTab === tab ? (tab === 'semua' ? 'rgba(99,102,241,0.2)' : `${WA_CONTACTS[tab]?.color || '#6366f1'}22`) : 'transparent',
    color: activeTab === tab ? (tab === 'semua' ? '#818cf8' : WA_CONTACTS[tab]?.color) : 'var(--text-secondary)',
    padding: '0.45rem 1rem', fontSize: '0.82rem', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
    borderBottom: activeTab === tab ? `2px solid ${tab === 'semua' ? '#818cf8' : WA_CONTACTS[tab]?.color}` : '2px solid transparent'
  });

  return (
    <div className="management-dashboard-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ── 1. KPI PATROLI ────────────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem', fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600 }}>
          <Activity size={16}/> KPI PATROLI HARI INI
        </div>
        <div className="grid-cols-4">
          {[
            { label:'Total Scan',       val: totalPatrolsToday,                   color: 'var(--color-primary)' },
            { label:'Sudah Dipatroli',  val: patrolledAreasToday.size,            color: 'var(--color-success)' },
            { label:'Belum Dipatroli',  val: areas.length - patrolledAreasToday.size, color: 'var(--color-danger)' },
            { label:'% Kepatuhan',      val: `${areas.length > 0 ? Math.round((patrolledAreasToday.size/areas.length)*100) : 0}%`, color:'var(--color-primary)' },
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <p className="kpi-label">{k.label}</p>
              <h3 className="kpi-value" style={{ color: k.color }}>{k.val}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* ── 1B. SECURITY HEALTH SCORE ─────────────────────────────────────── */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.5rem',
        background: `linear-gradient(135deg, ${healthColor}15 0%, ${healthColor}08 100%)`,
        border: `1px solid ${healthColor}30`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: `conic-gradient(${healthColor} ${healthScore * 3.6}deg, rgba(0,0,0,0.08) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: healthColor }}>{healthScore}</span>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: healthColor }}>Security Health Score</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                Status: <strong style={{ color: healthColor }}>{healthLabel}</strong> — 
                Patroli {Math.round(patrolPct)}% • 
                Absensi {Math.round(attendancePct)}% • 
                Temuan {Math.round(findingsClosed)}% • 
                Komplain {Math.round(complaintsResolved)}%
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={() => {
              const text = `🛡 *SECURITY HEALTH SCORE SMPJDC*\n━━━━━━━━━━━━━━━━━━\nSkor Kesehatan: ${healthScore}/100 (${healthLabel})\n\n📊 Patroli: ${Math.round(patrolPct)}% (${patrolledAreasToday.size}/${areas.length} area)\n👥 Absensi: ${Math.round(attendancePct)}%\n🔍 Temuan Selesai: ${Math.round(findingsClosed)}%\n📩 Komplain Selesai: ${Math.round(complaintsResolved)}%\n━━━━━━━━━━━━━━━━━━\n_Sistem Manajemen Keamanan JDC_`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
            }} style={{
              padding: '0.35rem 0.6rem', fontSize: '0.65rem', borderRadius: '6px', fontWeight: 700,
              border: '1px solid #25D366', background: 'rgba(37,211,102,0.1)', color: '#25D366',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-sans)'
            }}>
              <Send size={11}/> Share WA
            </button>
            <button onClick={() => {
              const el = document.querySelector('.management-dashboard-wrap');
              if (!el) return;
              const text = Array.from(el.querySelectorAll('h3, h4, p, span, strong')).map(e => e.textContent).join(' | ');
              navigator.clipboard?.writeText(
                `🛡 LAPORAN RINGKASAN SMPJDC\n${new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}\n\nSkor Kesehatan: ${healthScore}/100 (${healthLabel})\nPatroli: ${patrolledAreasToday.size}/${areas.length} area\nHadir: ${kpiHadir} personil\nTemuan Terbuka: ${totalFindingsOpen}\nKomplain Baru: ${complaintsNew}`
              );
            }} style={{
              padding: '0.35rem 0.6rem', fontSize: '0.65rem', borderRadius: '6px', fontWeight: 700,
              border: '1px solid var(--border-glass)', background: 'transparent', color: 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-sans)'
            }}>
              <ClipboardList size={11}/> Salin
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. KPI TEMUAN BY SEVERITY ─────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem', fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600 }}>
          <AlertTriangle size={16}/> KPI TEMUAN (By Severity)
        </div>
        <div className="grid-cols-4">
          {[
            { label:'Critical', sev:'Kritis', color:'#dc2626' },
            { label:'High',     sev:'Tinggi', color:'#ef4444' },
            { label:'Medium',   sev:'Sedang', color:'#f59e0b' },
            { label:'Low',      sev:'Rendah', color:'#3b82f6' },
          ].map(k => (
            <div key={k.label} className="kpi-card" style={{ borderLeft:`3px solid ${k.color}` }}>
              <p className="kpi-label">{k.label}</p>
              <h3 className="kpi-value" style={{ color: k.color }}>{findings.filter(f=>f.severity===k.sev).length}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. KPI PERSONIL HARI INI ──────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding:'1.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem', fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600 }}>
          <Users size={16}/> KPI PERSONIL HARI INI
          {todayAttendance && <span className="badge badge-info" style={{ fontSize:'0.6rem', marginLeft:'auto' }}>Regu: {todayAttendance.regu} | Shift: {todayAttendance.shift}</span>}
        </div>
        <div className="grid-cols-4">
          {[
            { label:'Hadir',  val: kpiHadir, color:'var(--color-success)' },
            { label:'Alpha',  val: kpiAlpha, color:'#ef4444' },
            { label:'Sakit',  val: kpiSakit, color:'#f59e0b' },
            { label:'Izin',   val: kpiIzin,  color:'#3b82f6' },
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <p className="kpi-label">{k.label}</p>
              <h3 className="kpi-value" style={{ color: k.color }}>{k.val}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. STATUS DISPOSISI + WA SUMMARY CARDS ────────────────────────── */}
      <div className="glass-panel" style={{ padding:'1.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem', fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600 }}>
          <MessageCircle size={16}/> DISPOSISI TEMUAN & STATUS KIRIM WHATSAPP
        </div>
        <div className="grid-cols-3">
          {Object.entries(WA_CONTACTS).map(([dept, info]) => {
            const total    = findingsByDept[dept].length;
            const open     = findingsByDept[dept].filter(f => f.status !== 'Closed').length;
            const sent     = waSentCount(dept);
            const pct      = total > 0 ? Math.round((sent/total)*100) : 0;
            return (
              <div key={dept} className="kpi-card" style={{ borderLeft:`3px solid ${info.color}`, background:`${info.color}08` }}>
                <p className="kpi-label" style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.82rem', fontWeight:700 }}>
                  {info.emoji} {dept} <span style={{ marginLeft:'auto', fontWeight:400, fontSize:'0.7rem', color:'var(--text-muted)' }}>{info.nama}</span>
                </p>
                <h3 className="kpi-value" style={{ color: info.color, fontSize:'1.9rem', margin:'0.3rem 0' }}>
                  {total} <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:500 }}>Tiket</span>
                </h3>
                <div style={{ fontSize:'0.75rem', display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-secondary)' }}>Aktif / Open:</span>
                    <strong style={{ color: open > 0 ? '#ef4444' : 'var(--color-success)' }}>{open}</strong>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-secondary)' }}>Sudah Kirim WA:</span>
                    <strong style={{ color:'var(--color-success)' }}>{sent} ({pct}%)</strong>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height:'4px', borderRadius:'99px', background:'rgba(0,0,0,0.08)', marginTop:'0.25rem', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background: info.color, borderRadius:'99px', transition:'width 0.5s' }}/>
                  </div>
                  {/* Quick send to dept head */}
                  {open > 0 && (
                    <button
                      onClick={() => {
                        // Open WA ke kepala dept dengan summary semua tiket open
                        const openItems = findingsByDept[dept].filter(f => f.status !== 'Closed');
                        const summaryMsg = 
                          `*${info.emoji} REKAP TIKET OPEN - SMPJDC*\n` +
                          `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                          `Yth. ${info.nama},\n\n` +
                          `Berikut tiket aktif yang perlu ditindaklanjuti:\n\n` +
                          openItems.map((f,i) =>
                            `${i+1}. [${f.severity||'Rendah'}] ${f.kategori}\n   📍 ${f.area}\n   📋 ${f.detail}\n`
                          ).join('\n') +
                          `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                          `Total: ${openItems.length} tiket aktif\n_Sistem Manajemen Keamanan JDC_`;
                        window.open(`https://api.whatsapp.com/send?phone=${info.nomor}&text=${encodeURIComponent(summaryMsg)}`, '_blank', 'noopener');
                      }}
                      style={{
                        marginTop:'0.5rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem',
                        background: `${info.color}22`, color: info.color, border:`1px solid ${info.color}44`,
                        borderRadius:'6px', padding:'0.35rem 0.5rem', fontSize:'0.72rem', fontWeight:700,
                        cursor:'pointer', width:'100%', transition:'all 0.2s'
                      }}
                    >
                      <Send size={11}/> Kirim Rekap ke {dept === 'Teknisi' ? 'Ka. Teknik' : dept === 'Cleaning' ? 'Ka. Cleaning' : 'Ka. Security'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. TABEL TEMUAN + KIRIM WA PER TEMUAN ────────────────────────── */}
      <div className="glass-panel finding-section-panel" style={{ padding:'1.5rem' }}>
        {/* Header + Filter Tabs + Bulk Forward */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem', marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
            <h3 style={{ fontSize:'1.05rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <ClipboardList size={18} className="text-primary"/> Daftar Tiket Temuan & Disposisi WA
            </h3>
            {selectedFindings.length > 0 && (
              <div style={{ display:'flex', gap:'0.3rem', alignItems:'center' }}>
                <span style={{ fontSize:'0.7rem', color:'var(--text-secondary)', fontWeight:600 }}>{selectedFindings.length} dipilih</span>
                {Object.entries(WA_CONTACTS).filter(([dept]) => dept !== 'semua').map(([dept, info]) => (
                  <button key={dept} onClick={() => {
                    selectedFindings.forEach((id, idx) => {
                      const f = findings.find(fi => fi.id === id);
                      if (f && onDispatchFinding) onDispatchFinding(id, dept);
                      if (f) {
                        setTimeout(() => window.open(buildWALink(f, dept), '_blank', 'noopener'), idx * 300);
                      }
                    });
                    setSelectedFindings([]);
                  }} style={{
                    padding:'0.25rem 0.5rem', fontSize:'0.6rem', borderRadius:'6px', fontWeight:700,
                    border:`1px solid ${info.color}44`, background:`${info.color}12`, color: info.color,
                    cursor:'pointer', display:'flex', alignItems:'center', gap:'0.2rem', fontFamily:'var(--font-sans)'
                  }}>
                    <Send size={9}/> Forward {selectedFindings.length} ke {dept}
                  </button>
                ))}
                <button onClick={() => setSelectedFindings([])} style={{
                  padding:'0.25rem 0.4rem', fontSize:'0.6rem', borderRadius:'6px', fontWeight:600,
                  border:'1px solid var(--border-glass)', background:'transparent', color:'var(--text-muted)',
                  cursor:'pointer', fontFamily:'var(--font-sans)'
                }}>Batal</button>
              </div>
            )}
          </div>
          <div className="filter-tabs-wrap">
            <div style={{ display:'flex', gap:'0.25rem', background:'var(--bg-primary)', padding:'0.25rem', borderRadius:'10px' }}>
              {['semua', 'Teknisi', 'Cleaning', 'Keamanan'].map(tab => (
                <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>
                  {tab === 'semua' ? '🗂 Semua' : `${WA_CONTACTS[tab]?.emoji} ${tab}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredFindings.length === 0 ? (
          <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>
            <CheckCircle2 size={40} style={{ opacity:0.4, marginBottom:'0.75rem' }}/>
            <p style={{ fontSize:'0.9rem' }}>Tidak ada tiket temuan{activeTab !== 'semua' ? ` untuk departemen ${activeTab}` : ''} saat ini.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {/* Select All Row */}
            {filteredFindings.length > 1 && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.25rem 0.5rem', fontSize:'0.68rem', color:'var(--text-muted)' }}>
                <div onClick={() => {
                  if (selectedFindings.length === filteredFindings.length) {
                    setSelectedFindings([]);
                  } else {
                    setSelectedFindings(filteredFindings.map(f => f.id));
                  }
                }} style={{
                  width:'16px', height:'16px', borderRadius:'4px', flexShrink:0, cursor:'pointer',
                  border: `2px solid ${selectedFindings.length === filteredFindings.length ? 'var(--color-primary)' : 'var(--border-glass)'}`,
                  background: selectedFindings.length === filteredFindings.length ? 'var(--color-primary)' : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s'
                }}>
                  {selectedFindings.length === filteredFindings.length && <Check size={10} color="white" strokeWidth={3}/>}
                </div>
                <span>Pilih semua ({filteredFindings.length} tiket)</span>
              </div>
            )}
            {filteredFindings.map(finding => {
              const dept     = finding.department || 'Keamanan';
              const contact  = WA_CONTACTS[dept] || WA_CONTACTS.Keamanan;
              const statusCfg = STATUS_COLOR[finding.status] || STATUS_COLOR['Open'];
              const sevColor = SEVERITY_COLOR[finding.severity] || '#3b82f6';
              const isExpanded = expandedFinding === finding.id;
              const waAlreadySent = finding.waStatus?.startsWith('Terkirim');

              return (
                <div
                  key={finding.id}
                  className="finding-ticket"
                  style={{
                    borderColor: waAlreadySent ? 'rgba(16,185,129,0.2)' : undefined,
                    borderLeft: `4px solid ${contact.color}`,
                    background: waAlreadySent ? 'rgba(16,185,129,0.03)' : undefined
                  }}
                >
                  {/* Row Header */}
                  <div
                    className="finding-ticket-header"
                    onClick={(e) => {
                      if (e.target.closest('.finding-checkbox')) return;
                      setExpandedFinding(isExpanded ? null : finding.id);
                    }}
                  >
                    {/* Checkbox for bulk select */}
                    <div className="finding-checkbox" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFindings(prev =>
                        prev.includes(finding.id) ? prev.filter(id => id !== finding.id) : [...prev, finding.id]
                      );
                    }} style={{
                      width:'18px', height:'18px', borderRadius:'4px', flexShrink:0,
                      border: `2px solid ${selectedFindings.includes(finding.id) ? 'var(--color-primary)' : 'var(--border-glass)'}`,
                      background: selectedFindings.includes(finding.id) ? 'var(--color-primary)' : 'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                      transition:'all 0.15s'
                    }}>
                      {selectedFindings.includes(finding.id) && <Check size={12} color="white" strokeWidth={3}/>}
                    </div>

                    {/* Dept Badge */}
                    <span className="finding-ticket-badge" style={{ color: contact.color, background:`${contact.color}18` }}>
                      {contact.emoji} {dept}
                    </span>

                    {/* ID */}
                    <span className="finding-ticket-id">
                      #{String(finding.id).slice(-6)}
                    </span>

                    {/* Kategori */}
                    <span className="finding-ticket-category">
                      {finding.kategori}
                    </span>

                    {/* Meta badges */}
                    <div className="finding-ticket-meta">
                      {/* Severity */}
                      <span style={{ fontSize:'0.7rem', fontWeight:700, color: sevColor, background:`${sevColor}18`, padding:'0.2rem 0.5rem', borderRadius:'99px', whiteSpace:'nowrap' }}>
                        {finding.severity || 'Rendah'}
                      </span>
                      {/* Status */}
                      <span style={{ fontSize:'0.7rem', fontWeight:700, color: statusCfg.color, background: statusCfg.bg, padding:'0.2rem 0.6rem', borderRadius:'99px', whiteSpace:'nowrap' }}>
                        {statusCfg.label}
                      </span>
                      {/* WA Status */}
                      {waAlreadySent ? (
                        <span style={{ fontSize:'0.7rem', color:'#10b981', display:'flex', alignItems:'center', gap:'0.2rem', whiteSpace:'nowrap' }}>
                          <CheckCircle2 size={12}/> Terkirim
                        </span>
                      ) : (
                        <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>Belum dikirim</span>
                      )}
                      {/* Expand icon */}
                      <span style={{ color:'var(--text-muted)', display:'flex', alignItems:'center' }}>
                        {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <div style={{ borderTop:'1px solid var(--border-glass)', padding:'1rem 1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
                      
                      {/* Detail */}
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem' }}>
                        <div style={{ flex:2, minWidth:'160px' }}>
                          <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>DETAIL KEJADIAN</p>
                          <p style={{ fontSize:'0.88rem', lineHeight:1.6, wordBreak:'break-word' }}>"{finding.detail}"</p>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', fontSize:'0.78rem', color:'var(--text-secondary)', minWidth:'120px' }}>
                          <div><strong>Pelapor:</strong> {finding.pelapor}</div>
                          <div><strong>Tanggal:</strong> {new Date(finding.tanggal).toLocaleString('id-ID')}</div>
                          <div><strong>Dept:</strong> {contact.emoji} {dept}</div>
                          {finding.waSentAt && <div style={{ color:'#10b981' }}><strong>Terkirim:</strong> {finding.waSentAt}</div>}
                        </div>
                      </div>

                      {/* Foto jika ada */}
                      {finding.foto && (
                        <div>
                          <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:'0.35rem' }}>FOTO BUKTI</p>
                          <img src={finding.foto} alt="Foto Temuan" style={{ maxWidth:'180px', borderRadius:'8px', border:'1px solid var(--border-glass)' }}/>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.6rem', alignItems:'center' }}>

                        {/* Status Update */}
                        <div style={{ display:'flex', gap:'0.4rem' }}>
                          {['Open','In Progress','Closed'].map(s => (
                            <button
                              key={s}
                              onClick={() => onUpdateStatus && onUpdateStatus(finding.id, s)}
                              style={{
                                padding:'0.3rem 0.7rem', fontSize:'0.72rem', borderRadius:'6px',
                                border: finding.status === s ? `1.5px solid ${STATUS_COLOR[s]?.color}` : '1px solid var(--border-glass)',
                                background: finding.status === s ? STATUS_COLOR[s]?.bg : 'transparent',
                                color: finding.status === s ? STATUS_COLOR[s]?.color : 'var(--text-secondary)',
                                cursor:'pointer', fontWeight: finding.status === s ? 700 : 400,
                                transition:'all 0.15s'
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>

                        <div style={{ flex:1 }}/>

                        {/* Dispatch ke dept lain */}
                        <div style={{ display:'flex', gap:'0.4rem' }}>
                          {Object.keys(WA_CONTACTS).filter(d => d !== dept).map(d => (
                            <button
                              key={d}
                              onClick={() => handleDispatch({ ...finding, department: d }, d)}
                              style={{
                                padding:'0.3rem 0.65rem', fontSize:'0.72rem', borderRadius:'6px',
                                border:`1px solid ${WA_CONTACTS[d].color}44`,
                                background:`${WA_CONTACTS[d].color}12`,
                                color: WA_CONTACTS[d].color,
                                cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:'0.3rem',
                                transition:'all 0.15s'
                              }}
                            >
                              <Send size={10}/> Forward ke {d}
                            </button>
                          ))}
                        </div>

                        {/* Kirim WA ke dept yang sesuai */}
                        <button
                          onClick={() => handleDispatch(finding, dept)}
                          style={{
                            padding:'0.45rem 1rem', fontSize:'0.8rem', borderRadius:'8px',
                            border:`1.5px solid ${waAlreadySent ? 'rgba(16,185,129,0.4)' : contact.color}`,
                            background: waAlreadySent ? 'rgba(16,185,129,0.15)' : `${contact.color}22`,
                            color: waAlreadySent ? '#10b981' : contact.color,
                            cursor:'pointer', fontWeight:700,
                            display:'flex', alignItems:'center', gap:'0.4rem',
                            transition:'all 0.2s'
                          }}
                        >
                          {waAlreadySent ? (
                            <><CheckCircle2 size={14}/> Kirim Ulang WA ({dept})</>
                          ) : (
                            <><MessageCircle size={14}/> Kirim WA → {contact.nama.split(' ').slice(0,2).join(' ')}</>
                          )}
                        </button>
                      </div>

                      {/* Preview pesan WA */}
                      <details style={{ fontSize:'0.75rem' }}>
                        <summary style={{ cursor:'pointer', color:'var(--text-muted)', userSelect:'none', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                          <ExternalLink size={11}/> Preview isi pesan WA yang akan dikirim
                        </summary>
                        <pre style={{
                          marginTop:'0.5rem', padding:'0.75rem', borderRadius:'8px',
                          background:'rgba(0,0,0,0.2)', color:'var(--text-secondary)',
                          whiteSpace:'pre-wrap', wordBreak:'break-word', fontSize:'0.72rem',
                          lineHeight:1.6, fontFamily:'monospace',
                          border:'1px solid var(--border-glass)'
                        }}>
                          {buildWAMessage(finding, dept)}
                        </pre>
                      </details>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 6. REAL-TIME MONITORING + HEATMAP ────────────────────────────── */}
      <div className="grid-cols-3">

        {/* Real-time feed */}
        <div className="glass-panel" style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ fontSize:'1.05rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <Clock size={18} className="text-primary"/> Monitoring Real-Time
            </h3>
            <span className="badge badge-info pulse-primary">Live</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem', flex:1, overflowY:'auto', maxHeight:'380px' }}>
            {reports.slice(0,8).map(report => (
              <div key={report.id} style={{
                padding:'0.75rem', borderRadius:'8px',
                borderLeft:`3px solid ${
                  report.kondisi === 'Aman dan Kondusif' ? 'var(--color-success)' :
                  report.kondisi === 'Ada Aktivitas' || report.kondisi === 'Renovasi' ? 'var(--color-warning)' : 'var(--color-danger)'
                }`
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-muted)' }}>
                  <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{report.userName}</span>
                  <span style={{ fontWeight:600 }}>
                    {new Date(report.timestamp).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' })} WIB
                  </span>
                </div>
                <p style={{ fontSize:'0.8rem', marginTop:'0.2rem', fontWeight:500 }}>
                  Scan: <span style={{ color:'var(--color-primary)' }}>{report.titik}</span>
                  {' '}({['1','2','3','4','5','6'].includes(report.lantai) ? `Lantai ${report.lantai}` : report.lantai})
                </p>
                <div style={{ display:'flex', gap:'0.3rem', alignItems:'center', marginTop:'0.15rem' }}>
                  <span style={{ fontSize:'0.72rem', color:'var(--text-secondary)' }}>
                    {report.keterangan || report.kondisi}
                  </span>
                  {report.kondisi !== 'Aman dan Kondusif' && report.kondisi !== 'Ada Aktivitas' && (
                    <span className="badge" style={{
                      background: report.severity === 'Kritis' ? 'rgba(220,38,38,0.2)' : report.severity === 'Tinggi' ? 'rgba(239,68,68,0.2)' : report.severity === 'Sedang' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                      color: SEVERITY_COLOR[report.severity] || '#3b82f6',
                      fontSize:'0.6rem', padding:'0.05rem 0.25rem'
                    }}>
                      {report.severity || 'Rendah'}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <div style={{ textAlign:'center', color:'var(--text-muted)', padding:'2rem', fontSize:'0.85rem' }}>
                Belum ada data patroli hari ini.
              </div>
            )}
          </div>
        </div>

        {/* Heatmap Patroli */}
        <div className="glass-panel grid-span-2" style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
            <h3 style={{ fontSize:'1.05rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <MapPin size={18} className="text-primary"/> Heatmap Patroli Gedung
            </h3>
            <div style={{ display:'flex', background:'var(--bg-primary)', padding:'0.25rem', borderRadius:'8px', overflowX:'auto', maxWidth:'100%', gap:'2px', whiteSpace:'nowrap' }}>
              {['Basement','1','2','3','4','5','6','Halaman Depan','Halaman Samping Kanan','Pos 00','R. Teknik','Halaman Belakang','Halaman Samping Kiri'].map(floor => (
                <button key={floor} onClick={() => setSelectedFloor(floor)} style={{
                  border:'none', background: selectedFloor===floor ? 'var(--bg-tertiary)' : 'transparent',
                  color: selectedFloor===floor ? 'var(--color-primary)' : 'var(--text-secondary)',
                  padding:'0.35rem 0.75rem', fontSize:'0.8rem', borderRadius:'6px', cursor:'pointer',
                  fontWeight:600, transition:'all 0.2s', flexShrink:0
                }}>
                  {['1','2','3','4','5','6'].includes(floor) ? `Lt. ${floor}` : floor}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-responsive" style={{ flex:1, alignItems:'center', width:'100%' }}>
            <div style={{ flex:2, background:'rgba(0,0,0,0.2)', padding:'1.5rem', borderRadius:'10px', border:'1px solid var(--border-glass)' }}>
              <div className="grid-cols-4" style={{ gap:'0.75rem' }}>
                {areas.filter(a => a.lantai === selectedFloor).map(area => {
                  const status = getAreaStatus(area.id);
                  let colorClass = '#ef4444';
                  let statusText = 'Belum Dipatroli';
                  if (status === 'patrolled') { colorClass = '#10b981'; statusText = 'Aman / Sudah Dipatroli'; }
                  else if (status === 'problematic') { colorClass = '#f59e0b'; statusText = 'Ada Temuan / Masalah'; }
                  return (
                    <div key={area.id} className="heatmap-cell" style={{
                      background:`${colorClass}1A`, border:`2px solid ${colorClass}`,
                      color: colorClass, height:'75px', display:'flex', flexDirection:'column',
                      justifyContent:'center', alignItems:'center', borderRadius:'8px',
                      textAlign:'center', padding:'0.25rem'
                    }}>
                      <span style={{ fontSize:'0.75rem', fontWeight:800 }}>{area.zona}</span>
                      <span style={{ fontSize:'0.6rem', opacity:0.8, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%' }}>{area.titik}</span>
                      <div className="tooltip"><strong>{area.titik}</strong>{`Status: ${statusText}\nZona: ${area.zona}`}</div>
                    </div>
                  );
                })}
                {areas.filter(a => a.lantai === selectedFloor).length === 0 && (
                  <div style={{ gridColumn:'span 4', textAlign:'center', color:'var(--text-muted)', padding:'2rem' }}>
                    Tidak ada area yang terdaftar di lantai ini.
                  </div>
                )}
              </div>
            </div>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="glass-panel" style={{ padding:'0.75rem', display:'flex', flexDirection:'column', gap:'0.5rem', background:'transparent' }}>
                <h5 style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>Keterangan Warna</h5>
                {[['#10b981','Sudah Dipatroli (Aman)'],['#f59e0b','Ada Masalah / Temuan'],['#ef4444','Belum Dikunjungi']].map(([c,l]) => (
                  <div key={l} style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.8rem' }}>
                    <div style={{ width:'12px', height:'12px', borderRadius:'3px', background:c }}/><span>{l}</span>
                  </div>
                ))}
              </div>
              <div className="glass-panel" style={{ padding:'0.75rem', fontSize:'0.8rem', background:'transparent' }}>
                <p style={{ fontWeight:600, marginBottom:'0.25rem' }}>Informasi Lantai {['1','2','3','4','5','6'].includes(selectedFloor) ? `Lt. ${selectedFloor}` : selectedFloor}</p>
                {[
                  ['Total Titik', areas.filter(a => a.lantai === selectedFloor).length, null],
                  ['Selesai Patroli', areas.filter(a => a.lantai === selectedFloor && getAreaStatus(a.id) !== 'unvisited').length, 'var(--color-success)'],
                ].map(([l,v,c]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid var(--border-glass)', padding:'0.2rem 0' }}>
                    <span>{l}:</span><span style={{ fontWeight:700, color: c||'inherit' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. CHARTS + MISSED ZONES ──────────────────────────────────────── */}
      <div className="grid-cols-3">

        {/* SVG Chart */}
        <div className="glass-panel grid-span-2" style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
            <h3 style={{ fontSize:'1.05rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <BarChart3 size={18} className="text-primary"/> Statistik Trend Patroli vs Temuan
            </h3>
            <div style={{ display:'flex', background:'var(--bg-primary)', padding:'0.25rem', borderRadius:'8px' }}>
              {['hari','minggu','bulan','tahun'].map(opt => (
                <button key={opt} onClick={() => setGraphFilter(opt)} style={{
                  border:'none', background: graphFilter===opt ? 'var(--bg-tertiary)' : 'transparent',
                  color: graphFilter===opt ? 'var(--color-primary)' : 'var(--text-secondary)',
                  padding:'0.35rem 0.75rem', fontSize:'0.8rem', borderRadius:'6px',
                  cursor:'pointer', fontWeight:600, transition:'all 0.2s', textTransform:'capitalize'
                }}>
                  {opt === 'hari' ? 'Hari ini' : opt}
                </button>
              ))}
            </div>
          </div>
          <div style={{ position:'relative', height:'220px', width:'100%', padding:'1rem 0' }}>
            <svg viewBox="0 0 600 200" style={{ width:'100%', height:'100%' }}>
              {[20,70,120,170].map(y => <line key={y} x1="40" y1={y} x2="580" y2={y} stroke="var(--border-glass)" strokeWidth="1"/>)}
              {activeGraph.patrols.map((val, idx) => {
                const x = 70 + idx * (500 / (activeGraph.labels.length - 1 || 1));
                const bh = (val/maxPatrolVal)*140;
                const y = 170 - bh;
                return (
                  <g key={idx}>
                    <rect x={x-10} y={y} width="20" height={bh} fill="url(#patrolGradient)" rx="4"/>
                    <text x={x} y="190" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">{activeGraph.labels[idx]}</text>
                    <text x={x} y={y-5} fill="var(--text-primary)" fontSize="9" fontWeight="bold" textAnchor="middle">{val}</text>
                  </g>
                );
              })}
              {(() => {
                const points = activeGraph.findings.map((val,idx) => {
                  const x = 70 + idx * (500 / (activeGraph.labels.length-1||1));
                  const y = 170 - (val/(maxPatrolVal/2))*140;
                  return `${x},${y}`;
                }).join(' ');
                return (
                  <>
                    <polyline fill="none" stroke="var(--color-danger)" strokeWidth="3" points={points} style={{ filter:'drop-shadow(0px 3px 3px var(--color-danger-glow))' }}/>
                    {activeGraph.findings.map((val,idx) => {
                      const x = 70 + idx * (500/(activeGraph.labels.length-1||1));
                      const y = 170 - (val/(maxPatrolVal/2))*140;
                      return <circle key={idx} cx={x} cy={y} r="4" fill="var(--color-danger)" stroke="white" strokeWidth="1.5"/>;
                    })}
                  </>
                );
              })()}
              <defs>
                <linearGradient id="patrolGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.3"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div style={{ display:'flex', gap:'1.5rem', justifyContent:'center', fontSize:'0.85rem' }}>
            {[['var(--color-primary)','rect','Realisasi Patroli'],['var(--color-danger)','line','Jumlah Temuan/Kendala']].map(([c,t,l])=>(
              <div key={l} style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <div style={{ width:'15px', height: t==='rect'?'15px':'3px', borderRadius: t==='rect'?'3px':'0', background:c }}/>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Missed Zones */}
        <div className="glass-panel" style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <h3 style={{ fontSize:'1.05rem', display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--color-danger)' }}>
            <AlertOctagon size={18}/> Zona Belum Terjamah
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem', flex:1 }}>
            {missedAreas.map(area => (
              <div key={area.id} className="glass-panel" style={{
                padding:'0.8rem', background:'rgba(239,68,68,0.03)', border:'1px solid rgba(239,68,68,0.15)',
                display:'flex', justifyContent:'space-between', alignItems:'center'
              }}>
                <div>
                  <h4 style={{ fontSize:'0.85rem', fontWeight:700 }}>{area.titik}</h4>
                  <p style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:'0.1rem' }}>
                    {area.gedung} - Lantai {area.lantai} ({area.zona})
                  </p>
                </div>
                <span className="badge badge-danger">Belum</span>
              </div>
            ))}
            {missedAreas.length === 0 && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, color:'var(--text-muted)' }}>
                <CheckCircle size={32} color="var(--color-success)" style={{ marginBottom:'0.5rem' }}/>
                <p style={{ fontSize:'0.85rem', textAlign:'center' }}>Hebat! Seluruh area telah dipatroli hari ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 8. MUTASI TERBARU ──────────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={18} className="text-primary" /> Mutasi Penjagaan Terbaru
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mutasiLogs.length} catatan</span>
        </div>
        {mutasiLogs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {mutasiLogs.slice(0, 4).map((log, idx) => (
              <div key={log.id || idx} style={{
                padding: '0.7rem 0.85rem', borderRadius: '8px',
                background: 'rgba(59,130,246,0.03)', border: '1px solid var(--border-glass)',
                borderLeft: `3px solid ${
                  log.kategori === 'Emergency' ? '#ef4444' :
                  log.kategori === 'Kehilangan' ? '#f59e0b' :
                  log.kategori === 'Kerusakan' ? '#f97316' :
                  log.kategori === 'Gangguan' ? '#8b5cf6' : '#3b82f6'
                }`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.pelapor || '-'}</span>
                  <span className="badge" style={{
                    fontSize: '0.6rem', padding: '0.1rem 0.4rem',
                    background: log.kategori === 'Emergency' ? 'rgba(239,68,68,0.15)' :
                               log.kategori === 'Kehilangan' ? 'rgba(245,158,11,0.15)' :
                               log.kategori === 'Kerusakan' ? 'rgba(249,115,22,0.15)' :
                               log.kategori === 'Gangguan' ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.15)',
                    color: log.kategori === 'Emergency' ? '#ef4444' :
                           log.kategori === 'Kehilangan' ? '#f59e0b' :
                           log.kategori === 'Kerusakan' ? '#f97316' :
                           log.kategori === 'Gangguan' ? '#8b5cf6' : '#3b82f6'
                  }}>{log.kategori || 'Informasi'}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {log.uraian || log.deskripsi || '-'}
                </p>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {log.jamLaporan || log.jamKejadian || '-'} • {log.lokasi || log.pos || '-'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Belum ada catatan mutasi penjagaan.
          </div>
        )}
      </div>

      {/* ── 9. AI SUMMARY CARD ────────────────────────────────────────────── */}
      <div className="glass-panel" style={{
        padding:'1.5rem',
        background:'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.08) 100%)',
        border:'1px solid rgba(59,130,246,0.2)'
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <Sparkles size={20} style={{ color:'#60a5fa' }}/>
            <h4 style={{ fontSize:'1.05rem', fontWeight:800 }}>AI Security Summary - SMPJDC</h4>
          </div>
          <span style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.05em', color:'#60a5fa', fontWeight:700, display:'flex', alignItems:'center', gap:'0.2rem' }}>
            <Zap size={10}/> Auto-Generated
          </span>
        </div>
        <p style={{ fontSize:'0.9rem', color:'var(--text-primary)', lineHeight:'1.6', fontStyle:'italic' }}>
          "{generateAISummary()}"
        </p>
      </div>

      {/* ── 10. RINGKASAN KOMPLAIN MASUK ───────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageCircle size={18} className="text-primary"/>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Ringkasan Komplain Masuk</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#3b82f6', fontWeight: 700 }}>Baru: {complaintsNew}</span>
            <span style={{ color: '#8b5cf6', fontWeight: 700 }}>Aktif: {complaintsActive}</span>
            <span style={{ color: 'var(--text-muted)' }}>Total: {complaints.length}</span>
          </div>
        </div>

        {recentComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <CheckCircle2 size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }}/>
            <p>Belum ada komplain masuk.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentComplaints.map(c => {
              const sc = COMPLAINT_STATUS_COLOR[c.status] || '#6b7280';
              return (
                <div key={c.id} style={{
                  padding: '0.65rem 0.85rem', borderRadius: '8px',
                  borderLeft: `3px solid ${sc}`,
                  background: c.status === 'Baru' ? 'rgba(59,130,246,0.04)' : 'rgba(0,0,0,0.02)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem'
                }}>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-primary)' }}>{c.ticketId}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                      <span style={{
                        fontSize: '0.55rem', padding: '0.1rem 0.4rem', borderRadius: '99px', fontWeight: 700,
                        background: `${sc}20`, color: sc
                      }}>{c.status}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{c.tenant} • {c.floor}</span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                    {c.status !== 'Selesai' && DEPARTMENTS.map(d => {
                      const contact = WA_CONTACTS[d] || WA_CONTACTS.Keamanan;
                      const waMsg = encodeURIComponent(
                        `*📋 KOMPLAIN MASUK - SMPJDC*\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `${contact.emoji} *Disposisi ke: ${contact.nama}*\n\n` +
                        `🆔 *Tiket:* ${c.ticketId}\n` +
                        `📌 *Kategori:* ${c.category}\n` +
                        `👤 *Pelapor:* ${c.name}\n` +
                        `🏢 *Tenant:* ${c.tenant} • Lt.${c.floor}\n` +
                        `📝 *Deskripsi:* ${c.description}\n\n` +
                        `⚡ *Mohon segera ditindaklanjuti!*\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `_Sistem Manajemen Keamanan JDC_`
                      );
                      return (
                      <button key={d} onClick={() => {
                        onUpdateComplaint && onUpdateComplaint(c.id, {
                          department: d, status: 'Diproses',
                          history: [...(c.history || []), { status: 'Diproses', timestamp: new Date().toISOString(), note: `Didisposisikan ke ${d} dari Dashboard` }],
                          waStatus: `Terkirim (${d})`,
                          waSentAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
                          updatedAt: new Date().toISOString()
                        });
                        window.open(`https://api.whatsapp.com/send?phone=${contact.nomor}&text=${waMsg}`, '_blank', 'noopener');
                      }} style={{
                        padding: '0.25rem 0.5rem', fontSize: '0.6rem', borderRadius: '6px', fontWeight: 700,
                        border: '1px solid var(--border-glass)', cursor: 'pointer',
                        background: 'transparent', color: 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', gap: '0.2rem', fontFamily: 'var(--font-sans)'
                      }}>
                        <Send size={9}/> {d}
                      </button>
                      );
                    })}
                    <button onClick={() => onUpdateComplaint && onUpdateComplaint(c.id, {
                      status: 'Selesai',
                      history: [...(c.history || []), { status: 'Selesai', timestamp: new Date().toISOString(), note: 'Ditandai selesai dari Dashboard' }],
                      updatedAt: new Date().toISOString()
                    })} style={{
                      padding: '0.25rem 0.45rem', fontSize: '0.6rem', borderRadius: '6px', fontWeight: 700,
                      border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer',
                      background: 'rgba(16,185,129,0.08)', color: '#10b981'
                    }}>
                      <CheckCircle2 size={9}/> Selesai
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 11. KEPATUHAN & KINERJA PER REGU ───────────────────────────────── */}
      <div className="grid-cols-2">
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <Users size={16}/> KEHADIRAN PER REGU HARI INI
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {reguAttendance.map(r => (
              <div key={r.regu}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 700 }}>{r.regu}</span>
                  <span style={{ color: r.pct >= 80 ? 'var(--color-success)' : r.pct >= 60 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>
                    {r.hadir}/{r.total} ({r.pct}%)
                  </span>
                </div>
                <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.pct}%`, borderRadius: '99px', transition: 'width 0.5s',
                    background: r.pct >= 80 ? 'var(--color-success)' : r.pct >= 60 ? '#f59e0b' : '#ef4444' }}/>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {r.alpha > 0 && <span>Alpha: {r.alpha}</span>}
                  {r.sakit > 0 && <span>Sakit: {r.sakit}</span>}
                  {r.izin > 0 && <span>Izin: {r.izin}</span>}
                </div>
              </div>
            ))}
            {reguAttendance.every(r => r.total === 0) && (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Belum ada data absensi per regu.
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <Activity size={16}/> AKTIVITAS PATROLI PER REGU
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {reguPatrol.map(r => {
              const maxPatrol = Math.max(...reguPatrol.map(x => x.patrolCount), 1);
              const pct = Math.round((r.patrolCount / maxPatrol) * 100);
              return (
                <div key={r.regu}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700 }}>{r.regu}</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                      {r.patrolCount} scan • {r.coveredAreas} area
                    </span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: '99px',
                      background: 'linear-gradient(90deg, #3b82f6, #6366f1)', transition: 'width 0.5s' }}/>
                  </div>
                </div>
              );
            })}
            {reguPatrol.every(r => r.patrolCount === 0) && (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Belum ada data patroli hari ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 12. TARGET COMPLIANCE ──────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <CheckCircle size={16}/> TARGET KEPATUHAN PATROLI
        </div>
        {(() => {
          const totalAreas = areas.length;
          const patrolled = patrolledAreasToday.size;
          const pct = totalAreas > 0 ? Math.round((patrolled / totalAreas) * 100) : 0;
          const target = 90;
          const remaining = totalAreas - patrolled;
          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: pct >= target ? 'var(--color-success)' : pct >= 70 ? '#f59e0b' : '#ef4444' }}>
                    {pct}%
                  </h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {patrolled} dari {totalAreas} area telah dipatroli
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target: {target}%</span>
                  {remaining > 0 && <p style={{ color: '#ef4444', fontWeight: 700, marginTop: '0.15rem' }}>{remaining} area tersisa</p>}
                  {remaining === 0 && <p style={{ color: 'var(--color-success)', fontWeight: 700, marginTop: '0.15rem' }}>✓ Target tercapai!</p>}
                </div>
              </div>
              <div style={{ height: '10px', borderRadius: '99px', background: 'rgba(0,0,0,0.08)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: '99px', transition: 'width 1s',
                  background: pct >= target ? 'var(--color-success)' : pct >= 70 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : '#ef4444' }}/>
                {/* Target marker */}
                <div style={{ position: 'absolute', left: `${target}%`, top: 0, width: '2px', height: '100%', background: 'rgba(255,255,255,0.5)' }}/>
              </div>
            </div>
          );
        })()}
      </div>

    </div>
  );
}
