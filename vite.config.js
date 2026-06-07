import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isAndroid = mode === 'android';
  const isVercel = process.env.VERCEL === '1';
  
  const plugins = [react()];
  // basicSsl hanya digunakan saat development server (serve)
  if (command === 'serve') {
    plugins.push(basicSsl());
  }

  return {
    base: (isAndroid || isVercel) ? './' : '/SMP-JDC/',
    plugins,
    build: {
      outDir: 'docs',
      // Suppress chunk size warning — app sudah dioptimalkan
      chunkSizeWarningLimit: 1000
    },
    server: {
      port: 3000,
      host: true,
      watch: {
        ignored: ['**/android/**']
      }
    }
  };
})
