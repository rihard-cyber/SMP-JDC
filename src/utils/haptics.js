import { Capacitor } from '@capacitor/core';

let Haptics = null;
try {
  Haptics = Capacitor.isNativePlatform() ? require('@capacitor/haptics').Haptics : null;
} catch (_) {}

export const hapticLight = async () => {
  if (!Haptics) return;
  try { await Haptics.impact({ style: 'Light' }); } catch (_) {}
};

export const hapticMedium = async () => {
  if (!Haptics) return;
  try { await Haptics.impact({ style: 'Medium' }); } catch (_) {}
};

export const hapticHeavy = async () => {
  if (!Haptics) return;
  try { await Haptics.impact({ style: 'Heavy' }); } catch (_) {}
};

export const hapticSuccess = async () => {
  if (!Haptics) return;
  try { await Haptics.notification({ type: 'Success' }); } catch (_) {}
};

export const hapticWarning = async () => {
  if (!Haptics) return;
  try { await Haptics.notification({ type: 'Warning' }); } catch (_) {}
};

export const hapticError = async () => {
  if (!Haptics) return;
  try { await Haptics.notification({ type: 'Error' }); } catch (_) {}
};
