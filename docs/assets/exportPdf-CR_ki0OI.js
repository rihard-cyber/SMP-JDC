const y="SMPJDC - Jakarta Design Center",w=["JANUARI","FEBRUARI","MARET","APRIL","MEI","JUNI","JULI","AGUSTUS","SEPTEMBER","OKTOBER","NOVEMBER","DESEMBER"],o=t=>String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"),$=t=>{if(!t)return"-";const e=new Date(t);return Number.isNaN(e.getTime())?String(t):`${String(e.getDate()).padStart(2,"0")} ${w[e.getMonth()]} ${e.getFullYear()}`},v=t=>{if(!t)return"-";const e=new Date(t);return Number.isNaN(e.getTime())?String(t):`${e.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})} WIB, ${$(e)}`},z=(t=new Date)=>{const e=new Date(t);return Number.isNaN(e.getTime())?new Date().toISOString().slice(0,10):e.toISOString().slice(0,10)},k=t=>Array.isArray(t)?t.find(Boolean)||"":t||"",A=t=>!t||typeof t!="object"?"":Object.entries(t).map(([e,a])=>`${e.replace(/[A-Z]/g,i=>"-"+i.toLowerCase())}:${a}`).join(";"),N=t=>t&&typeof t=="object"&&!Array.isArray(t)&&("image"in t||"images"in t),j=t=>{if(t&&typeof t=="object"&&!Array.isArray(t)){const e=t.className?` class="${o(t.className)}"`:"",a=t.style?` style="${o(A(t.style))}"`:"",i=t.text??"";if(N(t)){const l=Array.isArray(t.images)?t.images.filter(Boolean):[],c=t.image||k(t.images),s=l.length>1?l:c?[c]:[],r=s.length>1,p=s.length?`<div class="photo-stack${r?" photo-stack-multi":""}">${s.map(g=>`<div class="photo-box photo-box-has${r?" photo-box-sm":""}"><img src="${o(g)}" alt="Foto" /></div>`).join("")}</div>`:'<div class="photo-box photo-box-empty"><span class="photo-na">-</span></div>',d=i!==""&&i!==null&&i!==void 0?`<div class="photo-caption">${o(i)}</div>`:"";return`<td class="cell cell-photo${e}"${a}>${p}${d}</td>`}const m=i!==""&&i!==null&&i!==void 0?`<div>${o(i)}</div>`:"";return`<td class="cell${e}"${a}>${m||"-"}</td>`}return`<td class="cell">${o(t===""||t===null||t===void 0?"-":t)}</td>`},D=(t=[])=>{const e=t.filter(a=>a&&a.label);return e.length?`
    <div class="meta-grid">
      ${e.map(a=>`
        <div class="meta-item">
          <span>${o(a.label)}</span>
          <strong>${o(a.value??"-")}</strong>
        </div>
      `).join("")}
    </div>
  `:""};function E({title:t,subtitle:e=y,columns:a,rows:i,fileName:f="laporan-smpjdc",orientation:m="landscape",meta:l=[],emptyText:c="Tidak ada data untuk dicetak.",footer:s="Dicetak dari Sistem Management Keamanan JDC"}){if(typeof window>"u")return!1;const r=window.open("","_blank","width=1400,height=900");if(!r||r.closed||typeof r.closed>"u")return!1;const p=Array.isArray(a)?a:[],d=Array.isArray(i)?i:[],g=p.map(n=>n.width?`<col style="width:${o(n.width)}" />`:"<col />").join(""),h=d.length?d.map((n,S)=>{const b=Array.isArray(n)?n:n.cells;return`<tr${n!=null&&n.className?` class="${o(n.className)}"`:""}>${(b||[]).map(j).join("")}</tr>`}).join(""):`<tr><td class="empty" colspan="${p.length||1}">${o(c)}</td></tr>`,x=v(new Date),u=`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="color-scheme" content="only light" />
        <meta name="supported-color-schemes" content="light" />
        <title>${o(f)}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
        <style>
          :root { color-scheme: only light; supported-color-schemes: light; }
          html { background: #ffffff !important; color-scheme: only light; }
          @page { size: A4 ${m}; margin: 8mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #000 !important;
            background: #ffffff !important;
            font-family: Arial, Helvetica, sans-serif;
            color-scheme: only light;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            forced-color-adjust: none;
          }
          .report-page { width: 100%; background: #fff !important; position: relative; z-index: 1; }
          .paper-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 0;
            pointer-events: none;
          }
          .report-title {
            text-align: center;
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 3px;
            line-height: 1.2;
            color: #000 !important;
          }
          .report-subtitle {
            text-align: center;
            font-size: 10px;
            font-weight: 700;
            color: #555 !important;
            margin-bottom: 8px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 4px;
            margin: 0 0 7px;
          }
          .meta-item {
            border: 1px solid #777;
            padding: 4px 6px;
            min-height: 28px;
          }
          .meta-item span {
            display: block;
            font-size: 7px;
            font-weight: 700;
            color: #555;
            text-transform: uppercase;
          }
          .meta-item strong {
            display: block;
            font-size: 9px;
            margin-top: 1px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            border: 1px solid #000;
          }
          th {
            background: #0070c0;
            color: #fff;
            border: 1px solid #000;
            padding: 6px 4px;
            font-size: 8px;
            line-height: 1.15;
            text-align: center;
            font-weight: 700;
            text-transform: uppercase;
          }
          td {
            background: #fff !important;
            color: #000 !important;
            border: 1px solid #000;
            padding: 5px 4px;
            font-size: 8px;
            line-height: 1.35;
            text-align: center;
            vertical-align: middle;
            word-break: break-word;
            white-space: pre-wrap;
          }
          tbody tr:nth-child(even) td { background: #f7f7f7 !important; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .mono { font-family: Consolas, 'Courier New', monospace; }
          .status-done { font-weight: 700; }
          .cell-photo { vertical-align: middle; }
          .photo-box {
            width: 100%;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .photo-box-has img {
            max-width: 100%;
            max-height: 68px;
            width: auto;
            height: auto;
            object-fit: contain;
            border: 1px solid #555;
            display: block;
          }
          .photo-stack {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
          }
          .photo-stack-multi { gap: 3px; }
          .photo-box-sm {
            height: 46px;
          }
          .photo-box-sm.photo-box-has img {
            max-height: 44px;
            max-width: 100%;
          }
          .photo-box-empty {
            color: #999;
            font-size: 8px;
          }
          .photo-na { font-style: italic; }
          .photo-caption { font-size: 7px; color: #666; margin-top: 1px; }
          .empty {
            padding: 22px;
            font-size: 11px;
            color: #555;
          }
          .print-footer {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-top: 7px;
            font-size: 8px;
            color: #555;
          }
          .developer-watermark {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-top: 15px;
            margin-bottom: 5px;
            opacity: 0.85;
          }
          .developer-watermark .ornament {
            color: #0070c0;
            font-size: 10px;
            font-weight: bold;
            user-select: none;
          }
          .developer-watermark .watermark-text {
            font-family: 'Great Vibes', 'Brush Script MT', cursive;
            font-size: 16px;
            color: #000;
            font-weight: 500;
            white-space: nowrap;
          }
          @media print {
            html, body {
              margin: 0;
              background: #ffffff !important;
              color: #000 !important;
            }
            .report-page { background: #ffffff !important; }
            td, .empty, .meta-item { background-color: #ffffff !important; }
            tbody tr:nth-child(even) td { background-color: #f7f7f7 !important; }
            thead { display: table-header-group; }
            tr { break-inside: avoid; page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <img class="paper-bg" alt="" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1'%20height='1'%3E%3Crect%20width='1'%20height='1'%20fill='white'/%3E%3C/svg%3E" />
        <main class="report-page">
          <h1 class="report-title">${o(t)}</h1>
          <div class="report-subtitle">${o(e)}</div>
          ${D(l)}
          <table>
            <colgroup>${g}</colgroup>
            <thead>
              <tr>${p.map(n=>`<th>${o(n.header||n)}</th>`).join("")}</tr>
            </thead>
            <tbody>${h}</tbody>
          </table>
          <div class="developer-watermark">
            <span class="ornament">✧══════════•❁❀❁•══════════✧</span>
            <span class="watermark-text">Developer Richard Meha</span>
            <span class="ornament">✧══════════•❁❀❁•══════════✧</span>
          </div>
          <div class="print-footer">
            <span>${o(s)}</span>
            <span>Generated: ${o(x)}</span>
          </div>
        </main>
        <script>
          window.onload = function () {
            setTimeout(function () { window.print(); }, 450);
          };
        <\/script>
      </body>
    </html>
  `;return r.document.write(u),r.document.close(),!0}export{z as a,$ as b,E as e,v as f,k as g};
