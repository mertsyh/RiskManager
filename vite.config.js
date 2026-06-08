import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/RiskManager/' // Bunu ekledik. Başındaki ve sonundaki eğik çizgilere dikkat et.
})