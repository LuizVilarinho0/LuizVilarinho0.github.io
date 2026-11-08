import { copyFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { mockApi } from './scripts/mockApi';

/**
 * A pasta public/ é copiada inteira para dist/. Este plugin remove do build
 * os dados gerados durante os testes locais (cache, tokens, agendamentos demo),
 * mantendo só o .htaccess de proteção.
 */
function limparStorage(): Plugin {
  return {
    name: 'limpar-storage',
    apply: 'build',
    closeBundle() {
      const dir = join(fileURLToPath(new URL('.', import.meta.url)), 'dist', 'api', 'storage');
      try {
        for (const f of readdirSync(dir)) {
          if (f !== '.htaccess') rmSync(join(dir, f), { recursive: true, force: true });
        }
      } catch {
        /* pasta não existe: nada a fazer */
      }
    },
  };
}

/**
 * GitHub Pages não conhece as rotas do React: uma cópia do index.html como 404.html
 * faz /trabalhos, /agendar etc. abrirem direto. (Na Hostinger quem faz isso é o .htaccess.)
 */
function fallbackSpa(): Plugin {
  return {
    name: 'fallback-spa',
    apply: 'build',
    closeBundle() {
      const dist = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
      copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
    },
  };
}

/*
 * npm run dev      → API de demonstração em memória (não precisa de PHP)
 * npm run dev:php  → repassa /api para o PHP real (rode antes: npm run php)
 */
export default defineConfig(({ mode }) => ({
  plugins: [react(), limparStorage(), fallbackSpa(), ...(mode === 'demo' ? [mockApi()] : [])],
  server: {
    port: 5173,
    proxy: mode === 'demo' ? undefined : { '/api': { target: 'http://localhost:8000', changeOrigin: true } },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
}));
