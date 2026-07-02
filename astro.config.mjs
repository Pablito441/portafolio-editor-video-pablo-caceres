// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // URL pública del sitio en Vercel (necesaria para que la miniatura de los
  // enlaces —Open Graph— apunte a una imagen absoluta en WhatsApp / X / etc.).
  site: 'https://kcrs-editor-filmmaker.vercel.app',
  integrations: [react()],
  vite: {
    optimizeDeps: {
      // Pre-empaqueta framer-motion al arrancar el server, en lugar de hacerlo
      // "on-demand" en la primera visita (eso causaba el retardo del Hero, que
      // queda invisible con opacity:0 hasta que hidrata la island de React).
      include: ['framer-motion', 'react', 'react-dom'],
    },
  },
});