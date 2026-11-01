// Relais SunuCrypto (Cloudflare Worker) : cache CoinGecko + flux RSS, avec CORS restreint.
// Déploiement : voir les instructions dans la conversation.

const ALLOWED_ORIGINS = [
  'https://d0oks.github.io',
  // Ajoute ici ton futur domaine, par ex. 'https://sunucrypto.fr'
];
const RSS_HOSTS = ['airdrops.io', 'www.coindesk.com', 'coindesk.com', 'cointelegraph.com'];
const CG_BASE = 'https://api.coingecko.com/api/v3';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function ttlFor(path) {
  if (path.includes('market_chart')) return 600;
  if (path.startsWith('/global')) return 120;
  if (path.startsWith('/coins/markets')) return 60;
  return 120;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'GET') return new Response('Méthode non permise', { status: 405, headers: cors });
    // Un navigateur depuis un autre site est refusé ; curl (sans Origin) reste possible pour tester.
    if (origin && !ALLOWED_ORIGINS.includes(origin)) return new Response('Origine refusée', { status: 403, headers: cors });

    // /cg/<chemin CoinGecko>  ->  https://api.coingecko.com/api/v3/<chemin>
    if (url.pathname.startsWith('/cg/')) {
      const path = url.pathname.slice(3);
      if (!/^\/[a-z0-9_\-\/.]+$/i.test(path) || path.includes('..')) return new Response('Chemin invalide', { status: 400, headers: cors });
      const ttl = ttlFor(path);
      const headers = { accept: 'application/json' };
      if (env && env.COINGECKO_KEY) headers['x-cg-demo-api-key'] = env.COINGECKO_KEY;
      const up = await fetch(CG_BASE + path + url.search, { headers, cf: { cacheTtl: ttl, cacheEverything: true } });
      return new Response(up.body, {
        status: up.status,
        headers: { ...cors, 'Content-Type': up.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'public, max-age=' + ttl },
      });
    }

    // /rss?url=<flux autorisé>
    if (url.pathname === '/rss') {
      let target;
      try { target = new URL(url.searchParams.get('url') || ''); } catch (e) { return new Response('URL invalide', { status: 400, headers: cors }); }
      if (target.protocol !== 'https:' || !RSS_HOSTS.includes(target.hostname)) return new Response('Flux non autorisé', { status: 403, headers: cors });
      const up = await fetch(target.toString(), {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SunuCryptoRelay/1.0)', accept: 'application/rss+xml, application/xml, text/xml, */*' },
        cf: { cacheTtl: 300, cacheEverything: true },
      });
      return new Response(up.body, {
        status: up.status,
        headers: { ...cors, 'Content-Type': up.headers.get('Content-Type') || 'application/xml', 'Cache-Control': 'public, max-age=300' },
      });
    }

    return new Response('SunuCrypto relay OK', { status: 200, headers: cors });
  },
};
