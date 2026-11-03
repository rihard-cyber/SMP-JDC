/**
 * =======================================================
 *   SMPJDC SECURITY MANAGEMENT SYSTEM
 *   Module: Native Torch / Flashlight Bridge
 *   Description: Menyalakan flash kamera belakang lewat plugin
 *                native Android (CameraManager) sebagai fallback
 *                ketika WebView tidak mendukung constraint torch.
 * =======================================================
 */

import { Capacitor, registerPlugin } from '@capacitor/core';

const NativeTorch = registerPlugin('Torch');

export function isNativeTorchSupported() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

/**
 * Menyalakan / mematikan flash native Android.
 * @param {boolean} on
 * @returns {Promise<boolean>} true jika perintah berhasil dijalankan.
 */
export async function setNativeTorch(on) {
  if (!isNativeTorchSupported()) return false;

  try {
    if (on) {
      const result = await NativeTorch.enable();
      return result?.enabled !== false;
    }
    await NativeTorch.disable();
    return true;
  } catch (e) {
    console.warn('[Torch] Native torch gagal:', e?.message || e);
    return false;
  }
}
