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
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
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
  return true;
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