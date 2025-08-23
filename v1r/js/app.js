(function(){
  'use strict';
  function emitChange(){ document.dispatchEvent(new CustomEvent('state:changed')); }
  function applyLTR(){ try{ document.querySelectorAll('input[type="date"]').forEach(inp=>{ inp.setAttribute('lang','en'); inp.style.direction='ltr'; if(!inp.placeholder) inp.placeholder='YYYY-MM-DD'; }); }catch(_){ }
  }
  function renderAll(){
    try{ if (window.$packagesView && $packagesView.render) $packagesView.render(); }catch(_){ }
    try{ if (window.$storesView && $storesView.render) $storesView.render(); }catch(_){ }
    try{ if (window.$inventoryView && $inventoryView.render) $inventoryView.render(); }catch(_){ }
    try{ if (window.$salesView && $salesView.render) $salesView.render(); }catch(_){ }
    try{ if (window.$paymentsView && $paymentsView.render) $paymentsView.render(); }catch(_){ }
    try{ if (window.$expensesView && $expensesView.render) $expensesView.render(); }catch(_){ }
    try{ if (window.$reportsView && $reportsView.render) $reportsView.render(); }catch(_){ }
    try{ if (window.$trashView && $trashView.render) $trashView.render(); }catch(_){ }
    applyLTR();
  }
  document.addEventListener('DOMContentLoaded', function(){
    try{ $storage.load(); }catch(_){ }
    renderAll();
    document.addEventListener('shown.bs.tab', function(evt){
      try{
        const target = evt.target && evt.target.getAttribute('data-bs-target');
        if (!target) return;
        if (target === '#tab-packages' && window.$packagesView && $packagesView.render) $packagesView.render();
        else if (target === '#tab-stores' && window.$storesView && $storesView.render) $storesView.render();
        else if (target === '#tab-inventory' && window.$inventoryView && $inventoryView.render) $inventoryView.render();
        else if (target === '#tab-sales' && window.$salesView && $salesView.render) $salesView.render();
        else if (target === '#tab-payments' && window.$paymentsView && $paymentsView.render) $paymentsView.render();
        else if (target === '#tab-expenses' && window.$expensesView && $expensesView.render) $expensesView.render();
        else if (target === '#tab-reports' && window.$reportsView && $reportsView.render) $reportsView.render();
        else if (target === '#tab-trash' && window.$trashView && $trashView.render) $trashView.render();
        applyLTR();
      }catch(_){ }
    });
  });
  document.addEventListener('state:changed', function(){ try{ $storage.save(); }catch(_){ } renderAll(); });
  window.$app = { emitChange };
})();