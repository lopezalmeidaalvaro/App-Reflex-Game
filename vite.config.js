import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Lógica de detección de entorno (Vercel vs GitHub Pages vs Local)
const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';

// Si es producción pero NO es Vercel, asumimos GitHub Pages. Si no, a la raíz.
const baseRoute = (isProduction && !isVercel) ? '/App-Reflex-Game/' : '/';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // CAMBIO VITAL: Ruta dinámica e inteligente
  base: baseRoute,
})