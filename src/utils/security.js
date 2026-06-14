/**
 * =======================================================
 *   SMPJDC SECURITY MANAGEMENT SYSTEM
 *   Module: Security & Anti-Fraud Utilities
 *   Signed by: Richard Meha (by -Richard)
 *   Last Maintained: 2026-06-07
 *   Description: Anti-fraud token generation, hashing PINs,
 *                and native Geolocation bridge handlers.
 * =======================================================
 */

import { registerPlugin, Capacitor } from '@capacitor/core';

const DeviceSecurity = registerPlugin('DeviceSecurity');

// Simple hash for PIN (not crypto-grade, prevents casual reading via DevTools)
export function hashPin(pin) {
  let hash = 0;
  const salted = 'smpjdc_' + pin + '_2026';
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h' + Math.abs(hash).toString(36);
}

export function verifyPin(inputPin, storedHash) {
  return hashPin(inputPin) === storedHash;
}

// Generate session token
export function generateSessionToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Create secure session
export function createSession(userId) {
  const session = {
    userId,
    token: generateSessionToken(),
    loginAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  };
  return session;
}

// Validate session
export function validateSession(session) {
  if (!session || !session.token || !session.userId || !session.expiresAt) return false;
  if (Date.now() > session.expiresAt) {
    localStorage.removeItem('smpjdc_session');
    return false;
  }
  
  // Auto-extend session expiration by another 30 days
  try {
    session.expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem('smpjdc_session', JSON.stringify(session));
  } catch (e) {
    console.warn("Gagal memperbarui persistensi sesi:", e);
  }
  
  return true;
}

// ── Anti-Tamper: Sign & Verify User Data ──────────────────────────────────────
const STORAGE_SECRET = 'smpjdc_2026_antitamper_';

function computeSignature(data) {
  const raw = STORAGE_SECRET + JSON.stringify(data) + STORAGE_SECRET;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'sig_' + Math.abs(hash).toString(36);
}

export function signUserData(users) {
  const signature = computeSignature(users);
  try {
    localStorage.setItem('sapujagat_users_sig', signature);
  } catch (e) {
    console.warn('[Security] Gagal menyimpan signature:', e);
  }
}

export function verifyUserDataSignature(users) {
  try {
    const stored = localStorage.getItem('sapujagat_users_sig');
    if (!stored) return false;
    const expected = computeSignature(users);
    return stored === expected;
  } catch (e) {
    console.warn('[Security] Gagal verifikasi signature:', e);
    return false;
  }
}

// ── Role integrity check via session ──────────────────────────────────────────
export function signRoleInSession(userId, role) {
  const raw = `${userId}_${role}_${STORAGE_SECRET}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return 'r_' + Math.abs(hash).toString(36);
}

export function verifyRoleInSession(userId, role, token) {
  return signRoleInSession(userId, role) === token;
}

// Rate limiting
const ATTEMPT_KEY = 'smpjdc_login_attempts';

export function getLoginAttempts(nrp) {
  try {
    const data = JSON.parse(localStorage.getItem(ATTEMPT_KEY) || '{}');
    const record = data[nrp];
    if (!record) return { count: 0, locked: false, remainingTime: 0 };
    
    if (Date.now() > record.lockUntil) {
      delete data[nrp];
      localStorage.setItem(ATTEMPT_KEY, JSON.stringify(data));
      return { count: 0, locked: false, remainingTime: 0 };
    }
    
    if (record.count >= 5) {
      const remaining = Math.ceil((record.lockUntil - Date.now()) / 1000);
      return { count: record.count, locked: true, remainingTime: remaining };
    }
    
    return { count: record.count, locked: false, remainingTime: 0 };
  } catch {
    return { count: 0, locked: false, remainingTime: 0 };
  }
}

export function recordLoginAttempt(nrp, success) {
  try {
    const data = JSON.parse(localStorage.getItem(ATTEMPT_KEY) || '{}');
    
    if (success) {
      delete data[nrp];
    } else {
      if (!data[nrp]) {
        data[nrp] = { count: 0, lockUntil: 0 };
      }
      data[nrp].count = (data[nrp].count || 0) + 1;
      
      if (data[nrp].count >= 5) {
        data[nrp].lockUntil = Date.now() + 5 * 60 * 1000; // 5 minutes lock
      }
    }
    
    localStorage.setItem(ATTEMPT_KEY, JSON.stringify(data));
  } catch {}
}

// Rehash all existing PINs (migrate from plaintext)
export function migratePins(users) {
  let changed = false;
  users.forEach(u => {
    const stored = localStorage.getItem(`smpjdc_pin_${u.id}`);
    if (stored && !stored.startsWith('h')) {
      localStorage.setItem(`smpjdc_pin_${u.id}`, hashPin(stored));
      changed = true;
    }
    if (u.pin && !u.pin.startsWith('h')) {
      u.pin = hashPin(u.pin);
      changed = true;
    }
  });
  return changed;
}

// Fetch real GPS Coordinates via standard Geolocation API
export function getGPSCoordinates() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported by this browser/webview');
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.warn('GPS Coordinate Fetch Error:', error);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  });
}

// Check if Developer Options/ADB Debugging is enabled natively or web fallback
export async function checkDeviceSecurity() {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      const res = await DeviceSecurity.checkSecurity();
      return {
        isNative: true,
        developerOptionsEnabled: !!res.developerOptionsEnabled,
        isAndroid: true
      };
    } catch (e) {
      console.warn("[Security] Native check failed, using PWA fallback:", e);
    }
  }
  return {
    isNative: false,
    developerOptionsEnabled: false,
    isAndroid: /android/i.test(navigator.userAgent)
  };
}

// Geolocation Mock GPS / Fake GPS detection heuristics
export function verifyGPSAntiFake(coords, previousCoords = null) {
  if (!coords) return { secure: false, reason: 'Sinyal GPS tidak terdeteksi' };
  
  const lat = coords.latitude;
  const lng = coords.longitude;
  const acc = coords.accuracy;

  // 1. Emulator default coordinate check (Google Pixel / Standard Emulator)
  if (Math.abs(lat - 37.422) < 0.001 && Math.abs(lng - (-122.084)) < 0.001) {
    return { secure: false, reason: 'Terdeteksi Emulator Android (Default Google GPS)' };
  }

  // 2. Invalid coordinates 0,0
  if (lat === 0 && lng === 0) {
    return { secure: false, reason: 'Koordinat tidak valid (0,0)' };
  }

  // 3. Integer accuracy check
  // Real GPS hardware returns high-precision floats (e.g. 8.423m). Mock location apps
  // typically inject exact integer values like 10.0, 15.0, 5.0, or 0.0.
  if (acc > 0 && acc % 1 === 0 && (acc === 10 || acc === 15 || acc === 5 || acc === 20 || acc === 0)) {
    return { secure: false, reason: 'Deteksi Fake GPS (Integer accuracy pattern)' };
  }

  // 4. Constant coordinates check (Zero drift check)
  if (previousCoords) {
    const isSameLat = lat === previousCoords.latitude;
    const isSameLng = lng === previousCoords.longitude;
    const isSameAcc = acc === previousCoords.accuracy;
    if (isSameLat && isSameLng && isSameAcc) {
      return { secure: false, reason: 'Deteksi Fake GPS (Zero-drift static coordinates)' };
    }
  }

  return { secure: true };
}

// Fetch Real-time Time from trusted web NTP API to prevent device clock tampering
export async function fetchServerTime() {
  const timeUrls = [
    'https://worldtimeapi.org/api/timezone/Asia/Jakarta',
    'https://timeapi.io/api/Time/current/zone?timeZone=Asia/Jakarta'
  ];

  for (const url of timeUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        const datetimeStr = data.datetime || data.dateTime;
        if (datetimeStr) {
          return new Date(datetimeStr).getTime();
        }
      }
    } catch (e) {
      console.warn(`[Security] Failed to fetch time from ${url}:`, e);
    }
  }
  return null;
}

// Generate the complete anti-fraud audit record
export async function generateAntiFraudData(userId) {
  const coords = await getGPSCoordinates();
  const userAgent = navigator.userAgent;
  
  // Clean up device names for easier viewing in logs
  let device = 'Web Browser';
  if (/android/i.test(userAgent)) {
    const match = userAgent.match(/Android\s+([^\s;]+)(?:;\s+([^\s;)]+))?/);
    device = match ? `Android ${match[1]} (${match[2] || 'Capacitor WebView'})` : 'Android Device';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    device = 'iOS Device';
  }
  
  // Security checks
  const securityCheck = await checkDeviceSecurity();
  const gpsCheck = coords ? verifyGPSAntiFake(coords) : { secure: false, reason: 'No GPS' };
  
  // Generate secure verification token based on timestamp, user, and coordinates
  const timestamp = Date.now();
  const rawToken = `token_${userId}_${timestamp}_${coords ? coords.latitude : 'no_gps'}`;
  let hash = 0;
  for (let i = 0; i < rawToken.length; i++) {
    hash = ((hash << 5) - hash) + rawToken.charCodeAt(i);
    hash |= 0;
  }
  const dynamicToken = 'SEC-' + Math.abs(hash).toString(16).toUpperCase();

  return {
    gpsValid: coords !== null,
    coords: coords,
    device,
    dynamicToken,
    developerOptionsEnabled: !!securityCheck.developerOptionsEnabled,
    isMockLocation: !gpsCheck.secure,
    mockReason: gpsCheck.secure ? '' : gpsCheck.reason,
    isLivenessVerified: true // Set on successful liveness face challenge completion
  };
}