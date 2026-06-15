import React, { useState } from 'react';
import { Shield, User, Lock, Eye, EyeOff, Smartphone, Building, Clock, Loader } from 'lucide-react';
import { hashPin, verifyPin, createSession, getLoginAttempts, recordLoginAttempt, signRoleInSession, signUserData } from '../utils/security';

export default function LoginPage({ users: usersProp = [], onLogin, onSetup, hasUsers, firebaseUsersLoaded = true }) {
  const [nrp, setNrp] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [setupMode, setSetupMode] = useState(!hasUsers);
  const [setupNama, setSetupNama] = useState('');
  const [setupNrp, setSetupNrp] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [setupConfirmPin, setSetupConfirmPin] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!nrp.trim() || !pin.trim()) {
      setError('NRP dan PIN harus diisi');
      return;
    }

    const attempts = getLoginAttempts(nrp.trim());
    if (attempts.locked) {
      const menit = Math.floor(attempts.remainingTime / 60);
      const detik = attempts.remainingTime % 60;
      setError(`Terlalu banyak percobaan. Coba lagi ${menit}m ${detik}d lagi.`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const lsUsers = JSON.parse(localStorage.getItem('sapujagat_users') || '[]');
      const allUsers = usersProp.length > 0 ? usersProp : lsUsers;
      const user = allUsers.find(u => u.nrp === nrp.trim()) || lsUsers.find(u => u.nrp === nrp.trim());
      
      if (!user) {
        recordLoginAttempt(nrp.trim(), false);
        setError('NRP tidak ditemukan');
        setLoading(false);
        return;
      }

      let storedPin = localStorage.getItem(`smpjdc_pin_${user.id}`);
      if (!storedPin) {
        const defaultHash = hashPin(user.nrp.slice(-4));
        if (verifyPin(pin, defaultHash)) {
          storedPin = defaultHash;
          localStorage.setItem(`smpjdc_pin_${user.id}`, defaultHash);
        }
      }
      if (!storedPin || !verifyPin(pin, storedPin)) {
        recordLoginAttempt(nrp.trim(), false);
        setError('PIN salah');
        setLoading(false);
        return;
      }

      recordLoginAttempt(nrp.trim(), true);
      const session = createSession(user.id);
      session.roleToken = signRoleInSession(user.id, user.jabatan);
      localStorage.setItem('smpjdc_session', JSON.stringify(session));
      onLogin(user);
      setLoading(false);
    }, 600);
  };

  const handleSetup = (e) => {
    e.preventDefault();
    setError('');

    if (!setupNama.trim() || !setupNrp.trim() || !setupPin.trim()) {
      setError('Semua field harus diisi');
      return;
    }
    if (setupPin.length < 6) {
      setError('PIN minimal 6 karakter');
      return;
    }
    if (!/[A-Za-z]/.test(setupPin) || !/\d/.test(setupPin)) {
      setError('PIN harus mengandung huruf dan angka');
      return;
    }
    if (setupPin !== setupConfirmPin) {
      setError('PIN tidak cocok');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const hashed = hashPin(setupPin);
      const newUser = {
        id: 1,
        nama: setupNama.trim(),
        nrp: setupNrp.trim(),
        jabatan: 'Admin Super',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60'
      };
      
      localStorage.setItem('sapujagat_users', JSON.stringify([newUser]));
      signUserData([newUser]);
      localStorage.setItem(`smpjdc_pin_${newUser.id}`, hashed);
      const session = createSession(newUser.id);
      session.roleToken = signRoleInSession(newUser.id, newUser.jabatan);
      localStorage.setItem('smpjdc_session', JSON.stringify(session));
      
      onSetup(newUser);
      setLoading(false);
    }, 600);
  };

  // Show loading while Firebase syncs user data or authenticating user
  if (!firebaseUsersLoaded || loading) {
    const isSync = !firebaseUsersLoaded;
    return (
      <div className="splash-screen cyber-screen">
        <div className="cyber-corner corner-tl"></div>
        <div className="cyber-corner corner-tr"></div>
        <div className="cyber-corner corner-bl"></div>
        <div className="cyber-corner corner-br"></div>
        <div className="cyber-grid"></div>
        <div className="cyber-scanline"></div>
        <div className="cyber-hud-container">
          <div className="hud-ring ring-outer"></div>
          <div className="hud-ring ring-middle"></div>
          <div className="hud-ring ring-inner"></div>
          <div className="hud-ring ring-dashed"></div>
          <div className="splash-logo-container">
            <img src="logo.png" alt="SMPJDC" className="splash-logo cyber-logo logo-3d-spin" />
          </div>
        </div>
        <div className="cyber-progress-container">
          <div className="cyber-progress-header">
            <span className="progress-label">{isSync ? 'CORE SYSTEM LOAD' : 'AUTHENTICATING PROFILE'}</span>
            <span className="progress-percent">{isSync ? 'SYNCHRONIZING...' : 'SECURE CONTEXT'}</span>
          </div>
          <div className="cyber-progress-bar">
            <div className="cyber-progress-fill" style={{ width: '75%', animation: 'pulse 1.5s infinite' }}></div>
          </div>
        </div>
        <div className="cyber-console">
          <div className="console-header">
            <span className="console-title">{isSync ? '[SYSTEM CLOUD SYNC]' : '[SECURE ACCESS VERIFICATION]'}</span>
            <span className="console-status blink">{isSync ? 'CONNECTING DATABASE' : 'VERIFYING CREDENTIALS'}</span>
          </div>
          <div className="console-body">
            {isSync ? (
              <>
                <p className="console-line">&gt;&gt; FETCHING USER REGISTRY FROM FIREBASE...</p>
                <p className="console-line">&gt;&gt; CONFIGURING OFFLINE SESSION HANDLERS...</p>
                <p className="console-line">&gt;&gt; STABILIZING CRYPTO PRIVILEGES...</p>
                <p className="console-line">&gt;&gt; CENTRAL NETWORK LINK ACTIVE ... OK</p>
              </>
            ) : (
              <>
                <p className="console-line">&gt;&gt; COMPILING CLIENT CRYPTO SIGNATURES...</p>
                <p className="console-line">&gt;&gt; MATCHING REGISTERED SECURITY NRP...</p>
                <p className="console-line">&gt;&gt; STABILIZING TOKEN SESSION KEYS...</p>
                <p className="console-line">&gt;&gt; PIN COMPONENT AUTHENTICATION ACTIVE... OK</p>
              </>
            )}
          </div>
        </div>
        <div className="splash-footer cyber-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', width: '100%', maxWidth: '420px', padding: '0 1rem' }}>
          <div className="ornamental-watermark" style={{ margin: '0 auto', opacity: 0.95, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', width: '100%' }}>
            <span className="ornament-symbol" style={{ fontSize: '0.65rem', color: 'var(--color-primary)', opacity: 0.8, whiteSpace: 'nowrap' }}>✧═════•❁❀❁•═════✧</span>
            <span className="watermark-text" style={{ fontFamily: "'Great Vibes', 'Brush Script MT', cursive", fontSize: '1.25rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              Developer Richard Meha
            </span>
            <span className="ornament-symbol" style={{ fontSize: '0.65rem', color: 'var(--color-primary)', opacity: 0.8, whiteSpace: 'nowrap' }}>✧═════•❁❀❁•═════✧</span>
          </div>
          <span style={{ fontSize: '0.62rem', color: '#c7d2fe', letterSpacing: '0.12em', marginTop: '0.2rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
            ★ JDC SECURITY CORE ARCHITECT ★
          </span>
        </div>
      </div>
    );
  }

  if (setupMode && !hasUsers) {
    return (
      <div className="login-page">
        <div className="login-bg-animation">
          <div className="login-grid"></div>
          <div className="login-scanline"></div>
        </div>
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo-ring">
                <img src="logo.png" alt="SMPJDC" className="login-logo logo-3d" />
              </div>
              <h1 className="login-title">Setup Awal SMPJDC</h1>
              <p className="login-subtitle">Buat akun Admin Super untuk memulai</p>
            </div>

            <form onSubmit={handleSetup} className="login-form">
              {error && <div className="login-error">{error}</div>}

              <div className="login-field">
                <label>Nama Lengkap</label>
                <div className="login-input-wrap">
                  <User size={18} />
                  <input
                    type="text"
                    value={setupNama}
                    onChange={(e) => setSetupNama(e.target.value)}
                    placeholder="Contoh: Richard Meha"
                    autoFocus
                  />
                </div>
              </div>

              <div className="login-field">
                <label>NRP / ID</label>
                <div className="login-input-wrap">
                  <Smartphone size={18} />
                  <input
                    type="text"
                    value={setupNrp}
                    onChange={(e) => setSetupNrp(e.target.value)}
                    placeholder="Contoh: 99999"
                  />
                </div>
              </div>

              <div className="login-field">
                <label>PIN (min. 6 karakter, huruf + angka)</label>
                <div className="login-input-wrap">
                  <Lock size={18} />
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={setupPin}
                    onChange={(e) => setSetupPin(e.target.value)}
                    placeholder="****"
                    maxLength={12}
                  />
                  <button type="button" className="login-toggle-pin" onClick={() => setShowPin(!showPin)}>
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="login-field">
                <label>Konfirmasi PIN</label>
                <div className="login-input-wrap">
                  <Lock size={18} />
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={setupConfirmPin}
                    onChange={(e) => setSetupConfirmPin(e.target.value)}
                    placeholder="****"
                    maxLength={12}
                  />
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Memproses...' : 'Buat Akun & Mulai'}
              </button>
            </form>

            <div className="login-footer-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                <Building size={12} /> SMPJDC - SISTEM MANAGEMENT KEAMANAN JDC
              </p>
              <div className="ornamental-watermark" style={{ margin: '0.2rem auto 0', width: '100%', maxWidth: '340px' }}>
                <span className="ornament-symbol" style={{ fontSize: '0.65rem', color: 'var(--color-primary)', opacity: 0.75, whiteSpace: 'nowrap' }}>✧═════•❁❀❁•═════✧</span>
                <span className="watermark-text" style={{ fontSize: '0.95rem', fontFamily: "'Great Vibes', 'Brush Script MT', cursive" }}>Developer Richard Meha</span>
                <span className="ornament-symbol" style={{ fontSize: '0.65rem', color: 'var(--color-primary)', opacity: 0.75, whiteSpace: 'nowrap' }}>✧═════•❁❀❁•═════✧</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-bg-animation">
        <div className="login-grid"></div>
        <div className="login-scanline"></div>
      </div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo-ring">
              <img src="logo.png" alt="SMPJDC" className="login-logo logo-3d" />
            </div>
            <h1 className="login-title">SMPJDC</h1>
            <p className="login-subtitle">SISTEM MANAGEMENT KEAMANAN JDC</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="login-error">{error}</div>}

            <div className="login-field">
              <label>NRP</label>
              <div className="login-input-wrap">
                <Smartphone size={18} />
                <input
                  type="text"
                  value={nrp}
                  onChange={(e) => setNrp(e.target.value)}
                  placeholder="Masukkan NRP"
                  autoFocus
                />
              </div>
            </div>

            <div className="login-field">
              <label>PIN</label>
              <div className="login-input-wrap">
                <Lock size={18} />
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Masukkan PIN"
                  maxLength={12}
                />
                <button type="button" className="login-toggle-pin" onClick={() => setShowPin(!showPin)}>
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </form>

          <div className="login-security-badge">
            <Shield size={14} />
            <span>Aman & Terenkripsi</span>
          </div>

          <div className="login-footer-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem' }}>
              <Building size={12} /> SMPJDC - SISTEM MANAGEMENT KEAMANAN JDC
            </p>
            <div className="ornamental-watermark" style={{ margin: '0.2rem auto 0', width: '100%', maxWidth: '340px' }}>
              <span className="ornament-symbol" style={{ fontSize: '0.65rem', color: 'var(--color-primary)', opacity: 0.75, whiteSpace: 'nowrap' }}>✧═════•❁❀❁•═════✧</span>
              <span className="watermark-text" style={{ fontSize: '0.95rem', fontFamily: "'Great Vibes', 'Brush Script MT', cursive" }}>Developer Richard Meha</span>
              <span className="ornament-symbol" style={{ fontSize: '0.65rem', color: 'var(--color-primary)', opacity: 0.75, whiteSpace: 'nowrap' }}>✧═════•❁❀❁•═════✧</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}