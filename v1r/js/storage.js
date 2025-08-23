(function(){
  'use strict';
  const KEY = 'networkCardsData_v1r';
  function load(){ try{ const txt = localStorage.getItem(KEY); if (!txt) return; const obj = JSON.parse(txt); Object.assign($state, obj||{}); }catch(_){}}
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify($state)); }catch(_){}}
  window.$storage = { load, save };
})();