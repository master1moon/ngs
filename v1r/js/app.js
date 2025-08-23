(function(){
  'use strict';
  function emitChange(){ document.dispatchEvent(new CustomEvent('state:changed')); }
  document.addEventListener('DOMContentLoaded', function(){
    try{ $storage.load(); }catch(_){ }
    try{ if (document.querySelectorAll('input[type="date"]').length){ document.querySelectorAll('input[type="date"]').forEach(inp=>{ inp.setAttribute('lang','en'); inp.style.direction='ltr'; inp.placeholder='YYYY-MM-DD'; }); } }catch(_){ }
    try{ if (window.$packagesView && $packagesView.render) $packagesView.render(); }catch(_){ }
    try{ if (window.$trashView && $trashView.render) $trashView.render(); }catch(_){ }
  });
  document.addEventListener('state:changed', function(){ try{ $storage.save(); }catch(_){ } try{ if (window.$packagesView && $packagesView.render) $packagesView.render(); }catch(_){ } try{ if (window.$trashView && $trashView.render) $trashView.render(); }catch(_){ } });
  window.$app = { emitChange };
})();