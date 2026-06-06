# SMPJDC — SISTEM MANAJEMEN KEAMANAN JAKARTA DESIGN CENTER

---

## 1. GAMBARAN UMUM APLIKASI

**SMPJDC** adalah sistem manajemen keamanan terintegrasi berbasis web yang dirancang khusus untuk **Satuan Pengaman Jakarta Design Center (SMP JDC)**. Aplikasi ini menggantikan sistem manual (buku catatan, laporan kertas, grup WhatsApp) dengan platform digital yang **real-time, terstruktur, dan dapat diakses dari mana saja**.

### Siapa yang menggunakan?
| Role | Tugas |
|------|-------|
| **Anggota / Danru / Wadanru** | Scan patroli, lapor temuan, catat mutasi shift |
| **SPV / Manajemen** | Pantau real-time, disposisi temuan, rekap laporan |
| **Admin Super** | Kelola user, backup data, master area |
| **Tenant / Pelanggan** | Kirim komplain via QR Code (tanpa login) |
| **Guest Viewer** | Lihat dashboard target & SLA |

---

## 2. SPESIFIKASI TEKNIS

### Arsitektur
```
┌─────────────────────────────────────────────────┐
│                   CLIENT                          │
│  React 18 + Vite 5 (Single Page Application)     │
│  Lucide Icons · CSS3 Animations · Glassmorphism  │
├─────────────────────────────────────────────────┤
│                  SERVICE LAYER                    │
│  Firebase SDK v12 (Web)                          │
│   ├─ Firestore Database (NoSQL)                  │
│   ├─ Firebase Analytics                          │
│   └─ Firebase Hosting (opsional)                 │
├─────────────────────────────────────────────────┤
│                  STORAGE                          │
│  🔹 localStorage (cache offline)                 │
│  🔹 Firestore Cloud (sinkronisasi real-time)     │
│  🔹 JSON Export/Import (backup manual)           │
├─────────────────────────────────────────────────┤
│                  DEPLOY                           │
│  Vercel (hosting) · Android (via Capacitor)      │
└─────────────────────────────────────────────────┘
```

### Tech Stack Lengkap

| Layer | Teknologi | Versi | Fungsi |
|-------|-----------|-------|--------|
| **Frontend** | React | 18.3.1 | UI komponen & state management |
| **Bundler** | Vite | 5.4.21 | Build cepat, HMR, optimasi |
| **CSS** | Vanilla CSS | - | Glassmorphism, animasi HUD cyber |
| **Ikon** | Lucide React | 0.395 | Ikon konsisten & ringan |
| **Database** | Firebase Firestore | 12.14 | NoSQL cloud, real-time listener |
| **Sync** | Firebase SDK | 12.14 | Snapshot real-time complaints |
| **Analytics** | Firebase Analytics | 12.14 | Tracking usage & engagement |
| **Mobile** | Capacitor | 6.0 | Wrapper Android native |
| **Auth** | PIN-based (hashed) | - | Login offline tanpa cloud |
| **Backup** | JSON Export/Import | - | Full data portability |
| **Hosting** | Vercel | - | Deploy otomatis via Git |

### Data Flow
```
User Input → State React → localStorage (immediate)
                         → Firebase Firestore (async, background)
                         → Real-time subscription → UI update
```

---

## 3. FITUR-FITUR UTAMA

### A. Manajemen Patroli
- **Scan QR Code** — Setiap titik patroli punya QR code unik
- **Input Manual** — Cari titik patroli jika QR rusak
- **Kategori Kondisi** — Aman, Ada Aktivitas, Renovasi, + 20+ jenis temuan
- **Severity Level** — Kritis, Tinggi, Sedang, Rendah
- **Foto Bukti** — Capture & upload langsung dari HP
- **Riwayat Patroli** — Semua scan terekam dengan timestamp

### B. Manajemen Temuan & Disposisi
- **Tiket Otomatis** — Setiap temuan langsung jadi tiket
- **Disposisi ke Departemen** — Teknisi, Cleaning, atau Keamanan
- **Kirim WA Otomatis** — Notifikasi ke kepala departemen via WhatsApp API
- **Tracking Status** — Open → In Progress → Closed
- **Rekap via WA** — Kirim semua tiket open ke atasan dengan 1 klik

### C. Absensi & Plotting Regu
- **Input Kehadiran** — Hadir, Sakit, Izin, Cuti, Mangkir
- **Plotting Shift** — Plotting anggota ke pos jaga
- **Regu A & B** — Manajemen 2 regu shift

### D. Dashboard Manajemen
- **KPI Patroli** — Jumlah scan, area terjamah, % kepatuhan
- **KPI Temuan** — By severity (Critical/High/Medium/Low)
- **KPI Personil** — Kehadiran harian
- **Heatmap Gedung** — Visualisasi per lantai
- **Chart Trend** — Patroli vs Temuan (Hari/Minggu/Bulan/Tahun)
- **AI Security Summary** — Ringkasan otomatis kondisi keamanan

### E. Komplain Tenant (Public)
- **QR Code** — Tenant scan QR di area publik → buka form
- **Form Public** — Tanpa login, langsung kirim komplain
- **Tracking Tiket** — Tenant bisa lacak status komplain
- **Real-time Sync** — Admin langsung terima via Firestore

### F. Backup & Restore
- **Export JSON** — Semua data dalam 1 file
- **Import JSON** — Restore penuh
- **Firebase Sync** — Data aman di cloud

### G. Mutasi Penjagaan
- **Catatan Serah Terima** — Antar shift
- **Kategori** — Informasi, Emergency, Kehilangan, Kerusakan, Gangguan
- **Riwayat Lengkap** — Semua mutasi tercatat

### H. Master Data
- **Area & QR** — 26 titik patroli + generator QR massal
- **User Management** — Tambah/hapus/edit personil
- **WA Contacts** — Konfigurasi nomor tujuan disposisi

---

## 4. KEUNTUNGAN MENGGUNAKAN SMPJDC

### Untuk Perusahaan / Manajemen
| Sebelum (Manual) | Sesudah (SMPJDC) |
|------------------|-------------------|
| Laporan kertas, mudah hilang | Data digital aman di cloud + local |
| Rekap manual butuh waktu berjam-jam | Dashboard KPI real-time, 1 klik |
| Temuan tidak tertrack dengan baik | Setiap temuan jadi tiket bernomor |
| Disposisi lewat WA manual | Kirim WA otomatis ke departemen |
| Tidak tahu kepatuhan patroli | % kepatuhan & heatmap langsung terlihat |
| Backup repot | Export/Import JSON + Firebase cloud |

### Untuk Petugas Lapangan
| Sebelum | Sesudah |
|---------|---------|
| Isi buku patroli, rawan salah | Scan QR, input di HP |
| Lapor temuan harus ke pos | Langsung dari titik patroli |
| Catat mutasi di buku | Input digital, tidak perlu antri |
| Lupa titik mana sudah dipatroli | App tunjukkin riwayat |

### Untuk Tenant
- **Kirim komplain tanpa login** — scan QR aja
- **Lacak status tiket** — transparan
- **Respon lebih cepat** — langsung ke departemen terkait

### Keamanan Data
- **Offline-first** — Data tetap jalan walau internet mati
- **Dual storage** — localStorage + Firebase Firestore
- **Backup mandiri** — Export kapan saja

---

## 5. RENCANA PENGEMBANGAN KE DEPAN (ROADMAP)

### Tahap 1 — ✅ Sudah Berjalan (Current)
- [x] Patroli scan QR + input manual
- [x] Temuan & disposisi via WhatsApp
- [x] Dashboard KPI & Heatmap
- [x] Komplain tenant via QR publik
- [x] Absensi & plotting regu
- [x] Mutasi penjagaan digital
- [x] Backup & restore JSON
- [x] Dual theme (Dark/Light)

### Tahap 2 — 🚀 Short Term (1-3 Bulan)
- [ ] **Firebase Authentication** — Login via email/google
- [ ] **Firebase Storage** — Upload foto ke cloud (bukan base64)
- [ ] **Role-based access** — Perketat akses per halaman
- [ ] **Push Notification** — Notifikasi komplain baru ke admin
- [ ] **Export PDF** — Generate laporan PDF dari data patroli
- [ ] **Multi-gedung** — Dukungan lebih dari 1 gedung

### Tahap 3 — 📈 Medium Term (3-6 Bulan)
- [ ] **API Publik** — Integrasi dengan sistem lain
- [ ] **Analytics Dashboard** — Tren bulanan, prediksi temuan
- [ ] **SLA Monitoring** — Otomatis hitung response time
- [ ] **GPS Tracking** — Verifikasi lokasi patroli via GPS
- [ ] **Face Recognition** — Absensi via wajah (Android)
- [ ] **iOS Version** — Capacitor build untuk iOS

### Tahap 4 — 🌟 Long Term (6-12 Bulan)
- [ ] **AI Predictive** — Prediksi area rawan temuan
- [ ] **Auto-reporting** — Generate laporan bulanan otomatis
- [ ] **Barcode/RFID** — Support hardware scanner
- [ ] **Integrasi CCTV** — Link feed CCTV per titik patroli
- [ ] **Mobile App Native** — Android/iOS native (dari Capacitor)

---

## 6. ANALISA DAMPAK & EFISIENSI

### Penghematan Waktu (Estimasi)
| Aktivitas | Manual | SMPJDC | Hemat |
|-----------|--------|--------|-------|
| Rekap patroli harian | 60 menit | 2 menit | **97%** |
| Disposisi temuan | 30 menit | 1 menit | **97%** |
| Cari laporan lama | 15 menit | 10 detik | **99%** |
| Backup data | 60 menit | 1 menit | **98%** |
| Laporan bulanan | 4 jam | 15 menit | **94%** |

### Pengurangan Resiko
- ✅ **Hilang dokumen** — Data digital, backup ganda
- ✅ **Human error rekap** — Otomatis & real-time
- ✅ **Keterlambatan disposisi** — WA otomatis langsung
- ✅ **Temuan tidak tertindak** — Tracking status tiket
- ✅ **Patroli fiktif** — Heatmap buktikan area terjamah

---

## 7. ARSITEKTUR DATA

### Firebase Firestore — Collection `complaints`
```
complaints/
  ├── {firebaseId}/
  │   ├── id: string
  │   ├── ticketId: string (CMP-YYYYMMDD-xxx)
  │   ├── name: string
  │   ├── phone: string
  │   ├── floor: string
  │   ├── tenant: string
  │   ├── category: string
  │   ├── description: string
  │   ├── photos: string[] (base64)
  │   ├── status: string (Baru|Diterima|Diproses|Selesai)
  │   ├── department: string
  │   ├── createdAt: timestamp
  │   ├── updatedAt: string
  │   ├── history: [{status, timestamp, note}]
  │   ├── firebaseSavedAt: timestamp
  │   └── waStatus: string
```

### LocalStorage — 7 Key Utama
| Key | Fungsi |
|-----|--------|
| `sapujagat_users` | Data personil & user |
| `sapujagat_areas` | Master area & QR code |
| `sapujagat_reports` | Log patroli harian |
| `sapujagat_findings` | Tiket temuan & disposisi |
| `smpjdc_mutasi_logs` | Catatan mutasi shift |
| `smpjdc_attendance_logs` | Absensi harian |
| `smpjdc_complaints` | Komplain tenant |

---

## 8. KONTAK & DUKUNGAN

**Developer:** Richard Meha (@RichardMeha)  
**Aplikasi:** https://app-smpjdc.vercel.app (contoh)  
**Teknologi:** React 18 · Vite 5 · Firebase · Capacitor · Vercel  
**Lisensi:** Proprietary — SMP JDC

---

> *"SMPJDC mengubah cara kerja keamanan dari manual ke digital — lebih cepat, lebih transparan, lebih akuntabel."*
