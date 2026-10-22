import{c as B,r as c,j as e,_ as A,X as W,Q as $,$ as E,L as M,F as K,Z as L,M as O,T as U,i as F,P as G,a as _,m as H,n as J,o as q,p as Q}from"./index-BWn5NVF-.js";/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y=B("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);function V({isOpen:f,onClose:b,complaintUrl:C,qrApiUrl:m}){const[g,d]=c.useState("light"),[x,o]=c.useState("a4"),[y,v]=c.useState(()=>localStorage.getItem("smpjdc_poster_hotline")||"Security & Helpdesk: (021) 5304747 / WhatsApp JDC"),[u,T]=c.useState(()=>localStorage.getItem("smpjdc_poster_bldg")||"JAKARTA DESIGN CENTER");if(!f)return null;const j=()=>{const i=g==="dark",p=window.open("","_blank","width=900,height=1200");if(!p){alert("Mohon izinkan pop-up di browser untuk mencetak poster.");return}const S=`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Poster Pengaduan Publik - ${u}</title>
        <style>
          @page {
            size: ${x==="a5"?"A5 portrait":"A4 portrait"};
            margin: 0;
          }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            background: ${i?"#081021":"#ffffff"};
            color: ${i?"#f8fafc":"#0f172a"};
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100vw;
            height: 100vh;
          }
          .poster-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 32px 36px;
            background: ${i?"linear-gradient(180deg, #09132b 0%, #060b17 100%)":"linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"};
            position: relative;
            border: ${i?"2px solid #1e293b":"none"};
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid ${i?"#1e3a8a":"#e2e8f0"};
            padding-bottom: 16px;
          }
          .brand {
            display: flex;
            flex-direction: column;
          }
          .brand-title {
            font-size: 26px;
            font-weight: 900;
            letter-spacing: 2px;
            color: ${i?"#38bdf8":"#0369a1"};
            text-transform: uppercase;
            margin: 0;
          }
          .brand-sub {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            color: ${i?"#94a3b8":"#64748b"};
            margin-top: 2px;
            text-transform: uppercase;
          }
          .badge-live {
            background: ${i?"rgba(56, 189, 248, 0.15)":"#e0f2fe"};
            border: 1px solid ${i?"#0284c7":"#bae6fd"};
            color: ${i?"#38bdf8":"#0369a1"};
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .hero-section {
            text-align: center;
            margin-top: 10px;
          }
          .hero-title {
            font-size: 32px;
            font-weight: 900;
            line-height: 1.15;
            margin: 0 0 8px 0;
            color: ${i?"#ffffff":"#0f172a"};
            letter-spacing: -0.5px;
          }
          .hero-title span {
            color: ${i?"#38bdf8":"#0284c7"};
          }
          .hero-desc {
            font-size: 13.5px;
            color: ${i?"#94a3b8":"#475569"};
            max-width: 80%;
            margin: 0 auto;
            line-height: 1.45;
          }
          .qr-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 16px 0;
          }
          .qr-frame {
            background: #ffffff;
            padding: 16px;
            border-radius: 20px;
            box-shadow: ${i?"0 15px 35px rgba(0,0,0,0.6)":"0 12px 30px rgba(0,0,0,0.08)"};
            border: 3px solid ${i?"#38bdf8":"#0284c7"};
            text-align: center;
          }
          .qr-img {
            width: 220px;
            height: 220px;
            display: block;
          }
          .qr-caption {
            margin-top: 10px;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 1.5px;
            color: #0f172a;
            text-transform: uppercase;
          }
          .qr-subtext {
            font-size: 10px;
            color: #64748b;
            margin-top: 2px;
          }
          .steps-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin: 10px 0;
          }
          .step-card {
            background: ${i?"rgba(255,255,255,0.04)":"#f8fafc"};
            border: 1px solid ${i?"#1e293b":"#e2e8f0"};
            border-radius: 12px;
            padding: 12px 10px;
            text-align: center;
          }
          .step-num {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #0284c7;
            color: #ffffff;
            font-size: 12px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 6px auto;
          }
          .step-title {
            font-size: 12px;
            font-weight: 800;
            color: ${i?"#f1f5f9":"#1e293b"};
            margin-bottom: 3px;
          }
          .step-desc {
            font-size: 9.5px;
            color: ${i?"#94a3b8":"#64748b"};
            line-height: 1.35;
          }
          .category-pills {
            display: flex;
            justify-content: center;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 6px;
          }
          .pill {
            background: ${i?"#0f172a":"#f1f5f9"};
            border: 1px solid ${i?"#334155":"#cbd5e1"};
            color: ${i?"#cbd5e1":"#334155"};
            font-size: 9.5px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 6px;
          }
          .footer-section {
            border-top: 2px solid ${i?"#1e3a8a":"#e2e8f0"};
            padding-top: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer-info {
            font-size: 10px;
            color: ${i?"#94a3b8":"#64748b"};
            line-height: 1.4;
          }
          .footer-strong {
            font-weight: 800;
            color: ${i?"#f8fafc":"#0f172a"};
          }
          .footer-badge {
            text-align: right;
            font-size: 9px;
            color: ${i?"#64748b":"#94a3b8"};
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="poster-container">
          <div class="header">
            <div class="brand">
              <h1 class="brand-title">${u}</h1>
              <div class="brand-sub">Building Management & Security Support</div>
            </div>
            <div class="badge-live">Layanan Pengaduan Cepat</div>
          </div>

          <div class="hero-section">
            <h2 class="hero-title">Ada Masukan & Keluhan? <br><span>Scan & Kami Tuntaskan Segera</span></h2>
            <p class="hero-desc">
              Sampaikan kendala fasilitas, kebersihan, keamanan, atau kenyamanan di lingkungan gedung tanpa perlu login akun.
            </p>
          </div>

          <div class="qr-wrapper">
            <div class="qr-frame">
              <img src="${m}" class="qr-img" alt="QR Code Komplain" />
              <div class="qr-caption">Arahkan Kamera HP di Sini</div>
              <div class="qr-subtext">Otomatis membuka Form Tiket Publik JDC</div>
            </div>
          </div>

          <div class="steps-grid">
            <div class="step-card">
              <div class="step-num">1</div>
              <div class="step-title">Scan Barcode</div>
              <div class="step-desc">Gunakan kamera smartphone tanpa unduh aplikasi baru.</div>
            </div>
            <div class="step-card">
              <div class="step-num">2</div>
              <div class="step-title">Isi Kendala & Foto</div>
              <div class="step-desc">Tulis lokasi lantai & keluhan. Lampirkan foto bila diperlukan.</div>
            </div>
            <div class="step-card">
              <div class="step-num">3</div>
              <div class="step-title">Respon Petugas</div>
              <div class="step-desc">Tim Engineering, Kebersihan, atau Keamanan langsung merapat.</div>
            </div>
          </div>

          <div style="text-align:center;">
            <div style="font-size: 10px; font-weight: 700; color:${i?"#64748b":"#94a3b8"}; margin-bottom: 4px; text-transform:uppercase; letter-spacing:0.8px;">
              Layanan Penanganan Meliputi:
            </div>
            <div class="category-pills">
              <div class="pill">❄️ AC & Kelistrikan</div>
              <div class="pill">🧹 Kebersihan & Toilet</div>
              <div class="pill">🛡️ Keamanan & Satpam</div>
              <div class="pill">🚗 Parkir & Akses Lift</div>
              <div class="pill">💡 Fasilitas Tenant</div>
            </div>
          </div>

          <div class="footer-section">
            <div class="footer-info">
              <div class="footer-strong">${y}</div>
              <div>Gedung Jakarta Design Center (JDC) • Layanan Siaga 24 Jam</div>
            </div>
            <div class="footer-badge">
              <div>SISTEM TIKET RESMI</div>
              <div>SMP-JDC SYSTEM</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        <\/script>
      </body>
      </html>
    `;p.document.open(),p.document.write(S),p.document.close()},s=g==="dark";return e.jsx("div",{style:{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"},children:e.jsxs("div",{style:{background:"var(--bg-glass-card, #0f172a)",border:"1px solid var(--border-glass, rgba(255,255,255,0.1))",borderRadius:"16px",width:"100%",maxWidth:"850px",maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 25px 50px -12px rgba(0,0,0,0.7)",overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"1rem 1.25rem",borderBottom:"1px solid var(--border-glass, rgba(255,255,255,0.1))",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,255,255,0.02)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.6rem"},children:[e.jsx("div",{style:{background:"linear-gradient(135deg, #0284c7, #38bdf8)",color:"#fff",padding:"0.45rem",borderRadius:"8px",display:"flex",alignItems:"center"},children:e.jsx(A,{size:18})}),e.jsxs("div",{children:[e.jsx("h3",{style:{margin:0,fontSize:"1rem",fontWeight:800,color:"var(--text-primary)"},children:"Desain Poster & Standee Akrilik Komplain JDC"}),e.jsx("p",{style:{margin:0,fontSize:"0.72rem",color:"var(--text-muted)"},children:"Siap cetak format A4/A5 untuk dipajang di Lobby, Meja Resepsionis, Koridor Tenant & Area Publik"})]})]}),e.jsx("button",{onClick:b,className:"btn-icon",style:{borderRadius:"50%",padding:"0.4rem"},children:e.jsx(W,{size:18})})]}),e.jsxs("div",{style:{display:"flex",flex:1,overflow:"hidden",flexDirection:window.innerWidth<768?"column":"row"},children:[e.jsxs("div",{style:{width:window.innerWidth<768?"100%":"300px",borderRight:"1px solid var(--border-glass, rgba(255,255,255,0.1))",padding:"1rem",overflowY:"auto",background:"rgba(0,0,0,0.15)"},children:[e.jsxs("div",{style:{marginBottom:"1rem"},children:[e.jsx("label",{style:{fontSize:"0.68rem",fontWeight:800,color:"var(--text-secondary)",display:"block",marginBottom:"0.4rem"},children:"PILIH TEMA POSTER"}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.4rem"},children:[e.jsx("button",{type:"button",onClick:()=>d("light"),style:{padding:"0.5rem",borderRadius:"8px",border:g==="light"?"2px solid #0284c7":"1px solid var(--border-glass)",background:g==="light"?"#ffffff":"rgba(255,255,255,0.05)",color:g==="light"?"#0f172a":"var(--text-secondary)",fontWeight:700,fontSize:"0.72rem",cursor:"pointer"},children:"📄 Light (Kertas/A4)"}),e.jsx("button",{type:"button",onClick:()=>d("dark"),style:{padding:"0.5rem",borderRadius:"8px",border:g==="dark"?"2px solid #38bdf8":"1px solid var(--border-glass)",background:g==="dark"?"#081021":"rgba(255,255,255,0.05)",color:g==="dark"?"#38bdf8":"var(--text-secondary)",fontWeight:700,fontSize:"0.72rem",cursor:"pointer"},children:"🌌 Navy Gold (Akrilik)"})]})]}),e.jsxs("div",{style:{marginBottom:"1rem"},children:[e.jsx("label",{style:{fontSize:"0.68rem",fontWeight:800,color:"var(--text-secondary)",display:"block",marginBottom:"0.4rem"},children:"UKURAN KERTAS"}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.4rem"},children:[e.jsx("button",{type:"button",onClick:()=>o("a4"),style:{padding:"0.45rem",borderRadius:"8px",border:x==="a4"?"2px solid #0284c7":"1px solid var(--border-glass)",background:x==="a4"?"rgba(2, 132, 199, 0.15)":"transparent",color:x==="a4"?"#38bdf8":"var(--text-secondary)",fontWeight:700,fontSize:"0.72rem"},children:"A4 (Dinding/Papan)"}),e.jsx("button",{type:"button",onClick:()=>o("a5"),style:{padding:"0.45rem",borderRadius:"8px",border:x==="a5"?"2px solid #0284c7":"1px solid var(--border-glass)",background:x==="a5"?"rgba(2, 132, 199, 0.15)":"transparent",color:x==="a5"?"#38bdf8":"var(--text-secondary)",fontWeight:700,fontSize:"0.72rem"},children:"A5 (Standee Meja)"})]})]}),e.jsxs("div",{style:{marginBottom:"1rem"},children:[e.jsx("label",{style:{fontSize:"0.68rem",fontWeight:800,color:"var(--text-secondary)",display:"block",marginBottom:"0.35rem"},children:"NAMA GEDUNG"}),e.jsx("input",{type:"text",value:u,onChange:i=>{T(i.target.value),localStorage.setItem("smpjdc_poster_bldg",i.target.value)},className:"modern-input",style:{fontSize:"0.75rem",width:"100%",padding:"0.4rem 0.6rem"}})]}),e.jsxs("div",{style:{marginBottom:"1.25rem"},children:[e.jsx("label",{style:{fontSize:"0.68rem",fontWeight:800,color:"var(--text-secondary)",display:"block",marginBottom:"0.35rem"},children:"INFO KONTAK / HELPDESK FOOTER"}),e.jsx("input",{type:"text",value:y,onChange:i=>{v(i.target.value),localStorage.setItem("smpjdc_poster_hotline",i.target.value)},className:"modern-input",style:{fontSize:"0.75rem",width:"100%",padding:"0.4rem 0.6rem"}})]}),e.jsxs("div",{style:{background:"rgba(56, 189, 248, 0.08)",border:"1px solid rgba(56, 189, 248, 0.25)",borderRadius:"8px",padding:"0.65rem",fontSize:"0.68rem",color:"var(--text-secondary)",lineHeight:"1.45",marginBottom:"1rem"},children:["💡 ",e.jsx("strong",{children:"Tips Cetak:"})," Gunakan opsi kertas tebal / Art Paper 260gr atau masukkan ke dalam bingkai standing akrilik transparan (A4/A5) agar terlihat mewah di meja resepsionis atau lift."]}),e.jsxs("button",{onClick:j,className:"btn-primary",style:{width:"100%",padding:"0.65rem 1rem",fontSize:"0.82rem",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:"0.4rem"},children:[e.jsx(A,{size:16})," Cetak / Unduh PDF Poster"]})]}),e.jsx("div",{style:{flex:1,overflowY:"auto",padding:"1.25rem",display:"flex",justifyContent:"center",alignItems:"flex-start",background:"rgba(0,0,0,0.4)"},children:e.jsxs("div",{style:{width:"100%",maxWidth:"440px",aspectRatio:"1 / 1.414",background:s?"linear-gradient(180deg, #09132b 0%, #060b17 100%)":"#ffffff",color:s?"#f8fafc":"#0f172a",borderRadius:"12px",boxShadow:"0 20px 40px rgba(0,0,0,0.5)",padding:"1.25rem",display:"flex",flexDirection:"column",justifyContent:"space-between",border:s?"2px solid #1e3a8a":"1px solid #e2e8f0",position:"relative"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`2px solid ${s?"#1e3a8a":"#e2e8f0"}`,paddingBottom:"0.5rem"},children:[e.jsxs("div",{children:[e.jsx("h4",{style:{margin:0,fontSize:"0.95rem",fontWeight:900,letterSpacing:"1px",color:s?"#38bdf8":"#0284c7"},children:u}),e.jsx("p",{style:{margin:0,fontSize:"0.55rem",fontWeight:700,color:s?"#94a3b8":"#64748b"},children:"BUILDING MANAGEMENT & SECURITY"})]}),e.jsx("div",{style:{background:s?"rgba(56, 189, 248, 0.15)":"#e0f2fe",color:s?"#38bdf8":"#0369a1",border:`1px solid ${s?"#0284c7":"#bae6fd"}`,borderRadius:"999px",padding:"0.2rem 0.5rem",fontSize:"0.55rem",fontWeight:800},children:"Layanan Cepat"})]}),e.jsxs("div",{style:{textAlign:"center",margin:"0.5rem 0"},children:[e.jsxs("h3",{style:{margin:"0 0 0.2rem 0",fontSize:"1.05rem",fontWeight:900,lineHeight:1.2},children:["Ada Masukan & Keluhan? ",e.jsx("br",{}),e.jsx("span",{style:{color:s?"#38bdf8":"#0284c7"},children:"Scan & Kami Tuntaskan Segera"})]}),e.jsx("p",{style:{margin:0,fontSize:"0.62rem",color:s?"#94a3b8":"#64748b",lineHeight:1.3},children:"Sampaikan kendala fasilitas, AC, kebersihan, atau keamanan tanpa perlu login akun."})]}),e.jsx("div",{style:{textAlign:"center",margin:"0.25rem 0"},children:e.jsxs("div",{style:{background:"#ffffff",padding:"0.6rem",borderRadius:"12px",display:"inline-block",border:`2px solid ${s?"#38bdf8":"#0284c7"}`,boxShadow:"0 6px 15px rgba(0,0,0,0.1)"},children:[e.jsx("img",{src:m,alt:"QR Code",style:{width:"130px",height:"130px",display:"block"}}),e.jsx("div",{style:{marginTop:"0.3rem",fontSize:"0.62rem",fontWeight:900,color:"#0f172a",letterSpacing:"0.8px"},children:"ARAHKAN KAMERA HP"}),e.jsx("div",{style:{fontSize:"0.48rem",color:"#64748b"},children:"Buka Form Pengaduan JDC"})]})}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"0.4rem",margin:"0.4rem 0"},children:[e.jsxs("div",{style:{background:s?"rgba(255,255,255,0.03)":"#f8fafc",padding:"0.4rem 0.2rem",borderRadius:"6px",textAlign:"center",border:`1px solid ${s?"#1e293b":"#e2e8f0"}`},children:[e.jsx("div",{style:{width:"18px",height:"18px",borderRadius:"50%",background:"#0284c7",color:"#fff",fontSize:"0.55rem",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 0.2rem auto"},children:"1"}),e.jsx("div",{style:{fontSize:"0.55rem",fontWeight:800},children:"Scan Barcode"}),e.jsx("div",{style:{fontSize:"0.45rem",color:s?"#94a3b8":"#64748b"},children:"Buka kamera HP"})]}),e.jsxs("div",{style:{background:s?"rgba(255,255,255,0.03)":"#f8fafc",padding:"0.4rem 0.2rem",borderRadius:"6px",textAlign:"center",border:`1px solid ${s?"#1e293b":"#e2e8f0"}`},children:[e.jsx("div",{style:{width:"18px",height:"18px",borderRadius:"50%",background:"#0284c7",color:"#fff",fontSize:"0.55rem",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 0.2rem auto"},children:"2"}),e.jsx("div",{style:{fontSize:"0.55rem",fontWeight:800},children:"Isi Keluhan"}),e.jsx("div",{style:{fontSize:"0.45rem",color:s?"#94a3b8":"#64748b"},children:"Tulis lantai & foto"})]}),e.jsxs("div",{style:{background:s?"rgba(255,255,255,0.03)":"#f8fafc",padding:"0.4rem 0.2rem",borderRadius:"6px",textAlign:"center",border:`1px solid ${s?"#1e293b":"#e2e8f0"}`},children:[e.jsx("div",{style:{width:"18px",height:"18px",borderRadius:"50%",background:"#0284c7",color:"#fff",fontSize:"0.55rem",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 0.2rem auto"},children:"3"}),e.jsx("div",{style:{fontSize:"0.55rem",fontWeight:800},children:"Respon Cepat"}),e.jsx("div",{style:{fontSize:"0.45rem",color:s?"#94a3b8":"#64748b"},children:"Tim sigap tangani"})]})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"center",gap:"0.25rem",flexWrap:"wrap",margin:"0.2rem 0"},children:[e.jsx("span",{style:{fontSize:"0.48rem",background:s?"#0f172a":"#f1f5f9",border:`1px solid ${s?"#334155":"#cbd5e1"}`,padding:"0.15rem 0.35rem",borderRadius:"4px"},children:"❄️ AC & Fasilitas"}),e.jsx("span",{style:{fontSize:"0.48rem",background:s?"#0f172a":"#f1f5f9",border:`1px solid ${s?"#334155":"#cbd5e1"}`,padding:"0.15rem 0.35rem",borderRadius:"4px"},children:"🧹 Kebersihan"}),e.jsx("span",{style:{fontSize:"0.48rem",background:s?"#0f172a":"#f1f5f9",border:`1px solid ${s?"#334155":"#cbd5e1"}`,padding:"0.15rem 0.35rem",borderRadius:"4px"},children:"🛡️ Keamanan"}),e.jsx("span",{style:{fontSize:"0.48rem",background:s?"#0f172a":"#f1f5f9",border:`1px solid ${s?"#334155":"#cbd5e1"}`,padding:"0.15rem 0.35rem",borderRadius:"4px"},children:"🚗 Parkir & Lift"})]}),e.jsxs("div",{style:{borderTop:`1px solid ${s?"#1e3a8a":"#e2e8f0"}`,paddingTop:"0.4rem",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"0.55rem",fontWeight:800},children:y}),e.jsx("div",{style:{fontSize:"0.48rem",color:s?"#94a3b8":"#64748b"},children:"Gedung Jakarta Design Center (JDC)"})]}),e.jsx("div",{style:{fontSize:"0.48rem",fontWeight:700,color:s?"#38bdf8":"#0284c7"},children:"SISTEM RESMI JDC"})]})]})})]})]})})}const X=["Teknisi","Cleaning","Keamanan"],Z=["Baru","Diterima","Diproses","Selesai"];function te({complaints:f=[],onUpdateComplaint:b,onDeleteComplaint:C}){const[m,g]=c.useState("all"),[d,x]=c.useState(""),[o,y]=c.useState(null),[v,u]=c.useState(!1),[T,j]=c.useState(!1),[s,i]=c.useState(!1),[p,S]=c.useState(()=>{const t=localStorage.getItem("smpjdc_custom_complaint_url");if(t)return t;const r=typeof window<"u"?window.location.origin:"",l=typeof window<"u"?window.location.pathname:"";return r.includes("localhost")||r.includes("127.0.0.1")||r.includes("::1")||r.startsWith("file:")?"https://rihard-cyber.github.io/SMP-JDC/":r+l}),k=p+(p.includes("?")?"&":"?")+"complaint",I=`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(k)}`,D=p.includes("localhost")||p.includes("127.0.0.1")||p.includes("::1"),h=t=>({Baru:"#3b82f6",Diterima:"#f59e0b",Diproses:"#8b5cf6",Selesai:"#10b981"})[t]||"#6b7280",w=f.filter(t=>!(m!=="all"&&t.status!==m||d&&!t.ticketId.toLowerCase().includes(d.toLowerCase())&&!t.name.toLowerCase().includes(d.toLowerCase())&&!t.tenant.toLowerCase().includes(d.toLowerCase())&&!(t.location||"").toLowerCase().includes(d.toLowerCase())&&!(t.phone||"").toLowerCase().includes(d.toLowerCase()))).sort((t,r)=>new Date(r.createdAt)-new Date(t.createdAt)),z={all:f.length,Baru:f.filter(t=>t.status==="Baru").length,Diproses:f.filter(t=>t.status==="Diproses"||t.status==="Diterima").length,Selesai:f.filter(t=>t.status==="Selesai").length},R=(t,r)=>{const l=f.find(n=>n.id===t);if(!l)return;const a=[...l.history||[],{status:r,timestamp:new Date().toISOString(),note:`Status diubah ke ${r}`}];b(t,{status:r,history:a,updatedAt:new Date().toISOString()})},N=(t,r)=>{const l=f.find(n=>n.id===t);if(!l)return;const a=[...l.history||[],{status:"Diproses",timestamp:new Date().toISOString(),note:`Didisposisikan ke ${r}`}];b(t,{department:r,status:"Diproses",history:a,waStatus:`Terkirim (${r})`,waSentAt:new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})+" WIB",updatedAt:new Date().toISOString()})},P=()=>{H({title:"Tiketing Komplain / Pengaduan Tenant, Pengunjung",fileName:`tiket-komplain-smpjdc-${Q()}`,meta:[{label:"Filter Status",value:m==="all"?"Semua":m},{label:"Pencarian",value:d||"-"},{label:"Total Data",value:w.length},{label:"Sumber",value:"Komplain Tenant"}],columns:[{header:"NO",width:"4%"},{header:"JAM/TGGL KOMPLEN",width:"11%"},{header:"NAMA LENGKAP",width:"9%"},{header:"NO TELEPON",width:"9%"},{header:"NAMA TENANT/SORUM/PENGUNJUNG",width:"13%"},{header:"LOKASI",width:"8%"},{header:"KATEGORI KOMPLAIN",width:"10%"},{header:"DESKRIPSI KOMPLAIN",width:"15%"},{header:"FOTO",width:"9%"},{header:"STATUS (OPOSISI)",width:"8%"},{header:"KETERANGAN",width:"8%"}],rows:w.map((r,l)=>{var a;return[l+1,J(r.createdAt||r.tanggal||new Date),r.name||"-",r.phone||"-",r.tenant||"-",r.location||r.floor||"-",r.category||"-",{text:r.description||"-",className:"text-left"},{image:q(r.photos),text:(a=r.photos)!=null&&a.length?`${r.photos.length} foto`:"-"},r.status==="Selesai"?`SELESAI (${r.department?String(r.department).toUpperCase():"MANAGEMENT"})`:r.status==="Diproses"||r.status==="Diterima"?`DIPROSES (${r.department?String(r.department).toUpperCase():"MANAGEMENT"})`:`DITERIMA (${r.department?String(r.department).toUpperCase():"MANAGEMENT"})`,r.remarks||(r.status==="Selesai"?"DONE":r.waStatus||"-")]})})||alert("Popup export PDF diblokir browser. Izinkan popup untuk aplikasi ini.")};return e.jsxs("div",{children:[e.jsx("div",{className:"complaint-stats-grid",style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"0.75rem",marginBottom:"1.25rem"},children:[{label:"Total",value:z.all,color:"#3b82f6"},{label:"Baru",value:z.Baru,color:"#3b82f6"},{label:"Diproses",value:z.Diproses,color:"#8b5cf6"},{label:"Selesai",value:z.Selesai,color:"#10b981"}].map(t=>e.jsxs("div",{className:"glass-panel",style:{padding:"0.75rem",textAlign:"center"},children:[e.jsx("p",{style:{fontSize:"0.6rem",color:"var(--text-secondary)",fontWeight:600,marginBottom:"0.15rem"},children:t.label}),e.jsx("p",{style:{fontSize:"1.4rem",fontWeight:800,color:t.color},children:t.value})]},t.label))}),e.jsxs("div",{style:{marginBottom:"1rem",display:"flex",gap:"0.5rem",flexWrap:"wrap"},children:[e.jsxs("button",{onClick:()=>u(!v),className:"btn-secondary",style:{padding:"0.45rem 0.75rem",fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.35rem"},children:[e.jsx($,{size:14})," ",v?"Tutup Master QR":"QR Code Form Komplain"]}),e.jsxs("button",{onClick:()=>j(!0),className:"btn-primary",style:{padding:"0.45rem 0.85rem",fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.4rem",fontWeight:700},children:[e.jsx(A,{size:14})," Desain Poster / Standee Akrilik"]})]}),e.jsx("div",{children:v&&e.jsxs("div",{className:"glass-panel",style:{marginBottom:"1rem",padding:"1.25rem",textAlign:"center"},children:[D&&e.jsxs("div",{style:{background:"rgba(239, 68, 68, 0.1)",border:"1px dashed rgba(239, 68, 68, 0.4)",color:"#ef4444",padding:"0.6rem 0.8rem",borderRadius:"8px",fontSize:"0.72rem",marginBottom:"0.85rem",textAlign:"left",lineHeight:"1.4"},children:[e.jsx("strong",{children:"⚠️ Peringatan Host Localhost:"})," URL komplain saat ini mengarah ke ",e.jsx("code",{children:"localhost"})," (kemungkinan karena dijalankan di Android/Simulator). Jika dicetak/discan oleh tenant menggunakan handphone mereka, halaman tidak akan bisa dibuka. Silakan sesuaikan ",e.jsx("strong",{children:"URL Base Website Publik"})," di bawah agar mengarah ke domain hosting online Anda (seperti Github Pages atau Vercel)."]}),e.jsx("p",{style:{fontSize:"0.72rem",color:"var(--text-secondary)",marginBottom:"0.75rem",fontWeight:600},children:"SCAN QR CODE UNTUK MEMBUKA FORM KOMPLAIN"}),e.jsx("img",{src:I,alt:"QR Code Komplain",style:{width:180,height:180,borderRadius:"8px",border:"1px solid var(--border-glass)",marginBottom:"0.75rem"}}),e.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)",wordBreak:"break-all",marginBottom:"0.5rem"},children:e.jsx("code",{children:k})}),e.jsxs("div",{style:{display:"flex",gap:"0.5rem",justifyContent:"center",marginBottom:"1rem"},children:[e.jsxs("button",{onClick:()=>{var t;(t=navigator.clipboard)==null||t.writeText(k),i(!0),setTimeout(()=>i(!1),2e3)},className:"btn-secondary",style:{padding:"0.35rem 0.65rem",fontSize:"0.7rem",display:"flex",alignItems:"center",gap:"0.25rem"},children:[e.jsx(Y,{size:12})," ",s?"Tersalin!":"Salin Link"]}),e.jsxs("a",{href:I,download:"smpjdc-complaint-qr.png",className:"btn-secondary",style:{padding:"0.35rem 0.65rem",fontSize:"0.7rem",display:"inline-flex",alignItems:"center",gap:"0.25rem",textDecoration:"none"},children:[e.jsx(E,{size:12})," Download QR"]})]}),e.jsxs("div",{style:{padding:"0.75rem",border:"1px solid var(--border-glass)",borderRadius:"8px",background:"rgba(255,255,255,0.02)",textAlign:"left"},children:[e.jsx("label",{style:{fontSize:"0.68rem",color:"var(--text-secondary)",fontWeight:700,display:"block",marginBottom:"0.35rem"},children:"URL BASE WEBSITE PUBLIK (Untuk QR Code)"}),e.jsxs("div",{style:{display:"flex",gap:"0.5rem"},children:[e.jsx("input",{type:"text",value:p,onChange:t=>{const r=t.target.value;S(r),localStorage.setItem("smpjdc_custom_complaint_url",r)},placeholder:"https://rihard-cyber.github.io/SMP-JDC/",className:"modern-input",style:{flex:1,fontSize:"0.75rem",padding:"0.35rem 0.5rem"}}),e.jsx("button",{type:"button",onClick:()=>{const t="https://rihard-cyber.github.io/SMP-JDC/";S(t),localStorage.setItem("smpjdc_custom_complaint_url",t)},className:"btn-secondary",style:{padding:"0.35rem 0.65rem",fontSize:"0.7rem",whiteSpace:"nowrap"},children:"Reset Default"})]}),e.jsxs("p",{style:{fontSize:"0.62rem",color:"var(--text-muted)",marginTop:"0.35rem"},children:["* Tautan komplain di atas akan otomatis disesuaikan dan diakhiri dengan ",e.jsx("code",{children:"?complaint"})]})]})]})}),e.jsxs("div",{style:{display:"flex",gap:"0.5rem",marginBottom:"1rem",flexWrap:"wrap",alignItems:"center"},children:[e.jsxs("div",{style:{position:"relative",flex:"1 1 140px",minWidth:120},children:[e.jsx(M,{size:14,style:{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)"}}),e.jsx("input",{type:"text",value:d,onChange:t=>x(t.target.value),placeholder:"Cari tiket/nama/tenant...",className:"modern-input",style:{paddingLeft:"2rem",fontSize:"0.78rem"}})]}),e.jsx("div",{className:"filter-tabs-wrap",children:e.jsx("div",{style:{display:"flex",gap:"0.3rem",flexWrap:"wrap"},children:["all","Baru","Diterima","Diproses","Selesai"].map(t=>e.jsx("button",{onClick:()=>g(t),style:{padding:"0.35rem 0.6rem",borderRadius:"6px",fontSize:"0.68rem",fontWeight:700,border:`1.5px solid ${m===t?"var(--color-primary)":"var(--border-glass)"}`,background:m===t?"rgba(59,130,246,0.12)":"transparent",color:m===t?"var(--color-primary)":"var(--text-secondary)",cursor:"pointer",fontFamily:"var(--font-sans)"},children:t==="all"?"Semua":t},t))})}),e.jsxs("button",{onClick:P,className:"btn-primary",style:{padding:"0.35rem 0.6rem",fontSize:"0.68rem",display:"flex",alignItems:"center",gap:"0.25rem"},children:[e.jsx(A,{size:12})," Export PDF"]})]}),w.length===0?e.jsxs("div",{className:"empty-state",style:{padding:"3rem 1rem",textAlign:"center"},children:[e.jsx(K,{size:40,style:{opacity:.2,marginBottom:"0.75rem",color:"var(--text-muted)"}}),e.jsx("p",{style:{fontSize:"0.85rem",color:"var(--text-muted)"},children:"Belum ada komplain masuk."})]}):e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:w.map(t=>{var r,l;return e.jsxs("div",{className:"glass-panel",style:{padding:"0.75rem",transition:"var(--transition-smooth)",borderLeft:`3px solid ${h(t.status)}`,background:(o==null?void 0:o.id)===t.id?"rgba(59,130,246,0.05)":void 0},children:[e.jsxs("div",{onClick:()=>y((o==null?void 0:o.id)===t.id?null:t),style:{cursor:"pointer",display:"flex",flexDirection:"column",gap:"0.25rem"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.25rem"},children:[e.jsxs("div",{children:[e.jsx("span",{style:{fontSize:"0.8rem",fontWeight:800,letterSpacing:"0.02em",color:"var(--color-primary)"},children:t.ticketId}),e.jsx("span",{style:{marginLeft:"0.5rem",fontSize:"0.7rem",fontWeight:700},children:t.name})]}),e.jsx("span",{style:{fontSize:"0.6rem",padding:"0.12rem 0.5rem",borderRadius:"20px",fontWeight:700,whiteSpace:"nowrap",background:`${h(t.status)}20`,color:h(t.status)},children:t.status})]}),e.jsxs("div",{style:{display:"flex",gap:"0.75rem",fontSize:"0.68rem",color:"var(--text-secondary)",flexWrap:"wrap"},children:[e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"0.2rem"},children:[e.jsx(L,{size:10})," ",t.tenant]}),e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"0.2rem"},children:[e.jsx(O,{size:10})," ",t.location||t.floor]}),e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"0.2rem"},children:[e.jsx(U,{size:10})," ",t.category]}),e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"0.2rem"},children:[e.jsx(F,{size:10})," ",new Date(t.createdAt).toLocaleDateString("id-ID",{dateStyle:"short"})]})]}),e.jsx("p",{style:{fontSize:"0.75rem",color:"var(--text-primary)",marginTop:"0.3rem"},children:t.description}),t.department&&e.jsxs("div",{style:{fontSize:"0.65rem",color:"var(--color-primary)",fontWeight:600,marginTop:"0.2rem"},children:["Disposisi: ",t.department]})]}),(o==null?void 0:o.id)===t.id&&e.jsxs("div",{onClick:a=>a.stopPropagation(),style:{marginTop:"0.75rem",paddingTop:"0.75rem",borderTop:"1px solid var(--border-glass)"},children:[((r=t.photos)==null?void 0:r.length)>0&&e.jsxs("div",{style:{marginBottom:"0.75rem"},children:[e.jsx("p",{style:{fontSize:"0.65rem",color:"var(--text-secondary)",fontWeight:600,marginBottom:"0.3rem"},children:"FOTO BUKTI"}),e.jsx("div",{style:{display:"flex",gap:"0.4rem",flexWrap:"wrap"},children:t.photos.map((a,n)=>e.jsx("a",{href:a,target:"_blank",rel:"noreferrer",children:e.jsx("img",{src:a,alt:"",style:{width:70,height:70,objectFit:"cover",borderRadius:"6px",border:"1px solid var(--border-glass)"}})},n))})]}),t.phone&&e.jsxs("div",{style:{marginBottom:"0.75rem",display:"flex",alignItems:"center",gap:"0.4rem",fontSize:"0.72rem"},children:[e.jsx(G,{size:12,style:{color:"var(--color-success)"}}),e.jsx("a",{href:`https://wa.me/${t.phone.replace(/[^0-9]/g,"")}`,target:"_blank",rel:"noreferrer",style:{color:"var(--color-success)",fontWeight:600},children:t.phone})]}),e.jsxs("div",{style:{marginBottom:"0.75rem"},children:[e.jsx("p",{style:{fontSize:"0.65rem",color:"var(--text-secondary)",fontWeight:600,marginBottom:"0.3rem"},children:"KETERANGAN ADMIN / HASIL AKHIR"}),e.jsx("textarea",{defaultValue:t.remarks||"",onBlur:a=>{const n=a.target.value.trim();n!==(t.remarks||"")&&b(t.id,{remarks:n,updatedAt:new Date().toISOString()})},placeholder:"Contoh: DONE / Sudah ditindaklanjuti / Menunggu konfirmasi",className:"modern-input",style:{minHeight:"58px",height:"58px",resize:"vertical",fontSize:"0.75rem",padding:"0.5rem"}})]}),((l=t.history)==null?void 0:l.length)>0&&e.jsxs("div",{style:{marginBottom:"0.75rem"},children:[e.jsx("p",{style:{fontSize:"0.65rem",color:"var(--text-secondary)",fontWeight:600,marginBottom:"0.3rem"},children:"RIWAYAT STATUS"}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.3rem"},children:t.history.map((a,n)=>e.jsxs("div",{style:{display:"flex",gap:"0.5rem",alignItems:"flex-start"},children:[e.jsx("div",{style:{width:8,height:8,borderRadius:"50%",background:h(a.status),marginTop:3,flexShrink:0}}),e.jsxs("div",{style:{fontSize:"0.68rem"},children:[e.jsx("span",{style:{fontWeight:700,color:h(a.status)},children:a.status}),e.jsx("span",{style:{color:"var(--text-muted)",marginLeft:"0.4rem"},children:new Date(a.timestamp).toLocaleString("id-ID",{dateStyle:"short",timeStyle:"short"})}),a.note&&e.jsx("p",{style:{color:"var(--text-secondary)",fontSize:"0.65rem"},children:a.note})]})]},n))})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:[e.jsxs("div",{children:[e.jsx("p",{style:{fontSize:"0.65rem",color:"var(--text-secondary)",fontWeight:600,marginBottom:"0.3rem"},children:"UBAH STATUS"}),e.jsx("div",{style:{display:"flex",gap:"0.3rem",flexWrap:"wrap"},children:Z.filter(a=>a!==t.status).map(a=>e.jsx("button",{onClick:n=>{n.stopPropagation(),R(t.id,a)},style:{padding:"0.35rem 0.6rem",borderRadius:"6px",fontSize:"0.65rem",fontWeight:700,minHeight:"40px",border:`1.5px solid ${h(a)}`,background:`${h(a)}15`,color:h(a),cursor:"pointer",fontFamily:"var(--font-sans)",touchAction:"manipulation"},children:a},a))})]}),t.status!=="Selesai"&&e.jsxs("div",{children:[e.jsx("p",{style:{fontSize:"0.65rem",color:"var(--text-secondary)",fontWeight:600,marginBottom:"0.3rem"},children:"DISPOSISI KE"}),e.jsx("div",{style:{display:"flex",gap:"0.3rem",flexWrap:"wrap"},children:X.map(a=>e.jsxs("button",{onClick:n=>{n.stopPropagation(),N(t.id,a)},style:{padding:"0.4rem 0.7rem",borderRadius:"8px",fontSize:"0.7rem",fontWeight:700,minHeight:"44px",border:`1.5px solid ${t.department===a?"var(--color-success)":"var(--border-glass)"}`,background:t.department===a?"rgba(16,185,129,0.1)":"transparent",color:t.department===a?"var(--color-success)":"var(--text-secondary)",cursor:"pointer",fontFamily:"var(--font-sans)",display:"flex",alignItems:"center",gap:"0.2rem",touchAction:"manipulation"},children:[e.jsx(_,{size:12})," ",a]},a))})]}),C&&e.jsx("div",{style:{marginTop:"0.5rem",borderTop:"1px solid var(--border-glass)",paddingTop:"0.5rem"},children:e.jsx("button",{onClick:a=>{a.stopPropagation(),C(t.id)},style:{padding:"0.35rem 0.65rem",borderRadius:"6px",fontSize:"0.7rem",fontWeight:700,border:"1.5px solid rgba(239,68,68,0.3)",background:"rgba(239,68,68,0.08)",color:"#ef4444",cursor:"pointer",fontFamily:"var(--font-sans)",display:"flex",alignItems:"center",gap:"0.25rem"},children:"Hapus Tiket Komplain"})})]})]})]},t.id)})}),e.jsx(V,{isOpen:T,onClose:()=>j(!1),complaintUrl:k,qrApiUrl:I})]})}export{te as default};
