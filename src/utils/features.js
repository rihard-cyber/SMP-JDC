/**
 * =======================================================
 *   SMPJDC FEATURE FLAGS
 * -------------------------------------------------------
 *   Modul presensi & absensi disembunyikan sementara dari
 *   seluruh dashboard. Semua kode & data tetap dipertahankan
 *   (hide, bukan delete) agar mudah diaktifkan kembali.
 *
 *   Cara mengaktifkan kembali:
 *   ubah PRESENSI_ABSENSI_ENABLED menjadi true.
 * =======================================================
 */

export const PRESENSI_ABSENSI_ENABLED = false;

const PATROL_ROLES = ['Danru', 'Wadanru', 'Anggota'];

/**
 * Mengembalikan tab yang aman saat modul presensi/absensi
 * disembunyikan. Tab selain 'absensi' dikembalikan apa adanya.
 */
export const resolveSafeTab = (tab, jabatan) => {
  if (PRESENSI_ABSENSI_ENABLED || tab !== 'absensi') return tab;
  return PATROL_ROLES.includes(jabatan) ? 'guard-simulator' : 'dashboard';
};

export default { PRESENSI_ABSENSI_ENABLED, resolveSafeTab };
