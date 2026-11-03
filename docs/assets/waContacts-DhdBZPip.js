const i="smpjdc_wa_contacts",e={Teknisi:{nama:"Kepala Teknisi (Engineering)",nomor:"6281234567890",emoji:"🛠️",color:"#3b82f6"},Cleaning:{nama:"Kepala Cleaning Service",nomor:"6281112223334",emoji:"🧹",color:"#7c3aed"},Keamanan:{nama:"Kepala Security / Danru",nomor:"6289876543210",emoji:"🛡️",color:"#f59e0b"}};function s(){try{const n=localStorage.getItem(i);if(!n)return{...e};const a=JSON.parse(n);return{Teknisi:{...e.Teknisi,...a.Teknisi},Cleaning:{...e.Cleaning,...a.Cleaning},Keamanan:{...e.Keamanan,...a.Keamanan}}}catch{return{...e}}}function m(n){localStorage.setItem(i,JSON.stringify(n))}function c(n,a,r){const t=s()[a]||e.Keamanan,o=new Date().toLocaleString("id-ID",{dateStyle:"full",timeStyle:"short"});return`*📋 LAPORAN TEMUAN - SMPJDC*
━━━━━━━━━━━━━━━━━━━━━━━━━━
${t.emoji} *Disposisi ke: ${t.nama}*

🆔 *ID Tiket:* \`${n.id}\`
📌 *Kategori:* ${n.kategori}
📍 *Lokasi:* ${n.area}
⚠️ *Tingkat:* ${n.severity||"Rendah"}
🕐 *Waktu Temuan:* ${new Date(n.tanggal).toLocaleString("id-ID")} WIB
👮 *Dilaporkan oleh:* ${n.pelapor}

📝 *Keterangan:*
"${n.detail}"

⚡ *Mohon segera ditindaklanjuti!*
━━━━━━━━━━━━━━━━━━━━━━━━━━
_Sistem Manajemen Keamanan JDC_
_Dikirim: ${o}_`}function l(n,a,r){const t=s()[a]||e.Keamanan,o=c(n,a);return`https://api.whatsapp.com/send?phone=${t.nomor}&text=${encodeURIComponent(o)}`}export{l as b,s as g,m as s};
