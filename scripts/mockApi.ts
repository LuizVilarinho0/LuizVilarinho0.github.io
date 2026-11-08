/**
 * API DE DEMONSTRAÇÃO (só no `npm run dev`)
 *
 * Imita o endpoint PHP de contato (public/api/contato.php) para você ver o site
 * funcionando sem instalar PHP. As mensagens aparecem no terminal. Nada aqui vai para o build.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

function json(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

async function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function mockApi(): Plugin {
  return {
    name: 'mock-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/')) return next();
        await new Promise((r) => setTimeout(r, 350));

        if (url.pathname === '/api/contato.php' && req.method === 'POST') {
          const b = await body(req);
          if (String(b.nome ?? '').trim().length < 2)
            return json(res, 422, { ok: false, codigo: 'validacao', erro: 'Informe seu nome.' });
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(b.email ?? '')))
            return json(res, 422, { ok: false, codigo: 'validacao', erro: 'Informe um e-mail válido.' });
          if (String(b.mensagem ?? '').trim().length < 10)
            return json(res, 422, { ok: false, codigo: 'validacao', erro: 'Escreva uma mensagem um pouco maior.' });
          console.log('\n[demo] nova mensagem de contato:', b);
          return json(res, 200, { ok: true, mensagem: 'Recebi sua mensagem e respondo o quanto antes. Obrigado pelo contato!' });
        }

        return json(res, 404, { ok: false, codigo: 'nao_encontrado', erro: 'Não encontrado.' });
      });
    },
  };
}
