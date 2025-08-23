(function(){
  'use strict';
  const rootId = 'trashView';
  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    const items = $state.trash||[];
    root.innerHTML = '<div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>القسم</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody id="trashTable"></tbody></table></div>';
    const tb = document.getElementById('trashTable'); tb.innerHTML='';
    for (const e of items){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${e.section}</td><td>${(e.deletedAt||'').slice(0,10)}</td><td><button class="btn btn-sm btn-outline-success restore">استعادة</button> <button class="btn btn-sm btn-outline-danger purge">حذف</button></td>`;
      tr.querySelector('.restore').addEventListener('click', ()=> onRestore(e));
      tr.querySelector('.purge').addEventListener('click', ()=> onPurge(e));
      tb.appendChild(tr);
    }
  }
  function onRestore(entry){ if (!confirm('استعادة؟')) return; try{ switch(entry.section){ case 'packages': $state.packages.push(entry.item); break; case 'inventory': $state.inventory.push(entry.item); break; case 'sales': $state.sales.push(entry.item); break; case 'payments': $state.payments.push(entry.item); break; case 'expenses': $state.expenses.push(entry.item); break; case 'stores': $state.stores.push(entry.item); break; } $state.trash = ($state.trash||[]).filter(x=> x!==entry); }catch(_){} $app.emitChange(); }
  function onPurge(entry){ if (!confirm('حذف نهائي؟')) return; $state.trash = ($state.trash||[]).filter(x=> x!==entry); $app.emitChange(); }
  window.$trashView = { render };
})();