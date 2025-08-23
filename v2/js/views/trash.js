(function(){
  'use strict';
  const rootId = 'trashView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    const items = ($trash && $trash.all) ? $trash.all() : [];
    root.innerHTML = ''+
      '<div class="table-responsive">\n'
      + '  <table class="table table-sm align-middle"><thead><tr><th>القسم</th><th>التاريخ</th><th>الإجراءات</th></tr></thead><tbody id="trashTable"></tbody></table>'
      + '</div>';
    const tb = document.getElementById('trashTable'); tb.innerHTML='';
    for (const e of items){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${e.section}</td><td>${(e.deletedAt||'').slice(0,10)}</td><td><button class="btn btn-sm btn-outline-success" data-id="${e.id}" data-act="restore">استعادة</button> <button class="btn btn-sm btn-outline-danger" data-id="${e.id}" data-act="purge">حذف نهائي</button></td>`;
      tr.querySelector('[data-act="restore"]').addEventListener('click', ()=> onRestore(e));
      tr.querySelector('[data-act="purge"]').addEventListener('click', ()=> onPurge(e.id));
      tb.appendChild(tr);
    }
  }

  function onRestore(entry){
    if (!confirm('استعادة العنصر؟')) return;
    try { $trash.restore(entry); } catch(_){ }
    render();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }
  function onPurge(id){
    if (!confirm('حذف نهائي؟')) return;
    try { $trash.purge(id); } catch(_){ }
    render();
  }

  // default restore logic per section
  window.$restore = function(entry){
    const { section, item } = entry || {};
    if (!section || !item) return;
    switch(section){
      case 'packages': $state.packages.push(item); break;
      case 'inventory': $state.inventory.push(item); break;
      case 'sales': $state.sales.push(item); break;
      case 'payments': $state.payments.push(item); break;
      case 'expenses': $state.expenses.push(item); break;
      case 'stores': $state.stores.push(item); break;
      case 'partners': $state.partners.push(item); break;
    }
    $storage.save();
  };

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('state:changed', render);
})();