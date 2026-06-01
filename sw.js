const CACHE='triboltec-v29';
const ASSETS=['/manifest.json',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  if(e.request.url.includes('firebaseio.com')) return;
  // index.html sempre da rede (nunca cache) para garantir código atualizado
  if(e.request.url.endsWith('/') || e.request.url.endsWith('/index.html') || e.request.url.endsWith('.triboltec.com.br')){
    e.respondWith(fetch(e.request).catch(()=>caches.match('/index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{
    const net=fetch(e.request).then(res=>{
      if(res&&res.status===200&&e.request.method==='GET')
        caches.open(CACHE).then(c=>c.put(e.request,res.clone()));
      return res;
    }).catch(()=>cached);
    return cached||net;
  }));
});
