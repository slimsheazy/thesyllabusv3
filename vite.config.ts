import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0'
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            // Core framework
            'react-vendor': ['react', 'react-dom'],

            // State management
            'state': ['zustand'],

            // UI components (removed - using emojis)
            // 'icons': ['lucide-react'],

            // Heavy libraries - split individually
            'astrology-core': ['astronomy-engine', '@swisseph/browser'],
            'astrology-extra': ['@astrologer/astro-core', '@pipedream/astrology_api', 'natalengine'],

            // Maps
            'maps': ['leaflet', 'react-leaflet'],

            // AI services
            'ai': ['@google/genai'],

            // Data files (lazy loaded)
            'sabian-data': ['./data/sabianData', './data/sabianInterpretations'],

            // Tools that are heavy
            'heavy-tools': [
              './components/AstroMapTool',
              './components/BirthChartTool',
              './components/SabianSymbolsTool'
            ]
          }
        }
      }
    }
  };
});
