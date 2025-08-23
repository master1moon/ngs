(function(){
  'use strict';
  const KEY = 'v2_trash';
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); }catch(_){ return []; } }
  function save(arr){ try{ localStorage.setItem(KEY, JSON.stringify(arr||[])); }catch(_){}}

  function push(section, item){ const t = load(); t.push({ id: 'trash_'+Date.now(), section, item, deletedAt: new Date().toISOString() }); save(t); }
  function all(){ return load(); }
  function purge(id){ const t = load().filter(x=> x.id!==id); save(t); }
  function restore(entry){ const t = load().filter(x=> x.id!==entry.id); save(t); try{ if (window.$restore) $restore(entry); }catch(_){}}

  window.$trash = { push, all, purge, restore };
})();