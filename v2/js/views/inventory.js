(function(){
  'use strict';
  const rootId = 'inventoryView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    const pkgOptions = ($state.packages||[]).map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">إضافة للمخزون</h5>'
      + '<div class="row g-2">'
      + `  <div class="col-md-4"><select id="invPackage" class="form-select"><option value="">اختر الباقة</option>${pkgOptions}</select></div>`
      + '  <div class="col-md-3"><input id="invQty" class="form-control" placeholder="الكمية"></div>'
      + '  <div class="col-md-3"><input id="inventoryDate" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-2"><button id="addInvBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '</div></div>'
      + '<div class="table-responsive mt-3">\n'
      + '  <table class="table table-sm align-middle"><thead><tr><th>الباقة</th><th>المتوفر</th></tr></thead><tbody id="invTable"></tbody></table>'
      + '</div>';

    if ($dates && $dates.InventoryDate) $dates.InventoryDate.set('');
    document.getElementById('addInvBtn').addEventListener('click', onAdd);
    renderRows();
  }

  function renderRows(){
    const tb = document.getElementById('invTable'); if (!tb) return; tb.innerHTML='';
    let lowThreshold = 200; try{ const s = JSON.parse(localStorage.getItem('v2_settings')||'{}'); if (s && s.lowStock) lowThreshold = Number(s.lowStock)||200; }catch(_){ }
    for (const p of $state.packages){
      const qty = $engine.getInventory(p.id);
      const tr = document.createElement('tr');
      const low = qty < lowThreshold; // threshold
      tr.innerHTML = `<td>${p.name}</td><td ${low? 'class="text-danger"':''}>${qty.toLocaleString('en-US')}</td>`;
      tb.appendChild(tr);
    }
  }

  function onAdd(){
    const pkg = document.getElementById('invPackage').value;
    const qty = Number((document.getElementById('invQty').value||'').replace(/,/g,''))||0;
    const date = ($dates && $dates.InventoryDate) ? $dates.InventoryDate.read() : document.getElementById('inventoryDate').value;
    if (!pkg || qty<=0){ alert('اختر الباقة وأدخل كمية صحيحة'); return; }
    $engine.addInventory(pkg, qty, date);
    $storage.save();
    document.getElementById('invQty').value=''; if ($dates && $dates.InventoryDate) $dates.InventoryDate.set('');
    renderRows();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('state:changed', render);
})();