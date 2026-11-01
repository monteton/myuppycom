// Mirrors GitHub Pages URL handling on Cloudflare: "/" -> index.html, "/products" -> products.html, files as-is.
export default {
  async fetch(request, env) {
    let res = await env.ASSETS.fetch(request);
    if (res.status !== 404) return res;
    const url = new URL(request.url);
    const p = url.pathname;
    const tries = p.endsWith('/') ? [p + 'index.html'] : [p + '.html', p + '/index.html'];
    for (const t of tries) {
      const r = await env.ASSETS.fetch(new Request(new URL(t, url), request));
      if (r.status === 200) return r;
    }
    return res;
  }
};
