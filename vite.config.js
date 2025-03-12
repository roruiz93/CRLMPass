import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      //external: ['@tauri-apps/api/tauri','@tauri-apps/api/fs', '@tauri-apps/api/event']
     // external:[]
     external: ["@tauri-apps/api"],
    }
  }
});