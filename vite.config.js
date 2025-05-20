import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Estas dos líneas convierten __dirname para ES Modules (Vite usa esto)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
     
    }),
    quasar({
      sassVariables: 'src/quasar-variables.sass' // asegurate de que este archivo exista, aunque esté vacío
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src') // te permite usar imports como "@/components/TuComponente.vue"
    }
  },
  build: {
    rollupOptions: {
      external: ['@tauri-apps/api'], // evita que lo empaquete, Tauri lo gestiona
    }
  }
});
