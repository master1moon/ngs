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
      + '<div class="row g-3 mt-3">\n'
      + '  <div class="col-md-6">\n'
      + '    <div class="card"><div class="card-body">\n'
      + '      <h6>إجمالي المتوفر لكل باقة</h6>'
      + '      <div class="table-responsive mt-2">\n'
      + '        <table class="table table-sm align-middle"><thead><tr><th>الباقة</th><th>المتوفر</th></tr></thead><tbody id="invTable"></tbody></table>'
      + '      </div>'
      + '    </div></div>'
      + '  </div>\n'
      + '  <div class="col-md-6">\n'
      + '    <div class="card"><div class="card-body">\n'
      + '      <h6>حركات المخزون (إدخالات)</h6>'
      + '      <div class="table-responsive mt-2">\n'
      + '        <table class="table table-sm align-middle"><thead><tr><th>الباقة</th><th>الكمية</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody id="invRaw"></tbody></table>'
      + '      </div>'
      + '    </div></div>'
      + '  </div>\n'
      + '</div>';

    if ($dates && $dates.InventoryDate) $dates.InventoryDate.set('');
    document.getElementById('addInvBtn').addEventListener('click', onAdd);
    renderRows();
    renderRaw();
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

  function renderRaw(){
    const tb = document.getElementById('invRaw'); if (!tb) return; tb.innerHTML='';
    for (const i of ($state.inventory||[])){
      const pkg = ($state.packages||[]).find(p=> String(p.id)===String(i.packageId));
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="cell-pkg">${pkg?pkg.name:i.packageId}</td><td class="cell-qty">${Number(i.quantity||0).toLocaleString('en-US')}</td><td class="cell-date">${i.createdAt||''}</td><td><button class="btn btn-sm btn-outline-secondary me-1 edit">تعديل</button><button class="btn btn-sm btn-outline-danger" data-id="${i.id}">حذف</button></td>`;
      tr.querySelector('.edit').addEventListener('click', ()=> startEditRaw(tr, i));
      tr.querySelector('.btn-outline-danger').addEventListener('click', ()=> onDeleteRaw(i.id));
      tb.appendChild(tr);
    }
  }

  function startEditRaw(tr, i){
    tr.innerHTML = '';
    const tdPkg = document.createElement('td'); const sel = document.createElement('select'); sel.className='form-select'; sel.innerHTML = ($state.packages||[]).map(p=> `<option value="${p.id}" ${String(p.id)===String(i.packageId)?'selected':''}>${p.name}</option>`).join(''); tdPkg.appendChild(sel);
    const tdQty = document.createElement('td'); const inQty = document.createElement('input'); inQty.className='form-control'; inQty.value = Number(i.quantity||0); tdQty.appendChild(inQty);
    const tdDate = document.createElement('td'); const inDate = document.createElement('input'); inDate.type='date'; inDate.className='form-control'; inDate.value = i.createdAt||''; tdDate.appendChild(inDate);
    const tdAct = document.createElement('td'); const bSave=document.createElement('button'); bSave.className='btn btn-sm btn-primary me-1'; bSave.textContent='حفظ'; const bCancel=document.createElement('button'); bCancel.className='btn btn-sm btn-secondary'; bCancel.textContent='إلغاء'; tdAct.appendChild(bSave); tdAct.appendChild(bCancel);
    tr.appendChild(tdPkg); tr.appendChild(tdQty); tr.appendChild(tdDate); tr.appendChild(tdAct);
    bSave.addEventListener('click', ()=>{ const t = ($state.inventory||[]).find(x=> x.id===i.id); if (!t) return; t.packageId = sel.value; t.quantity = Number(String(inQty.value).replace(/,/g,''))||0; t.createdAt = ($dates?$dates.formatDateEn(inDate.value):inDate.value); $storage.save(); renderRaw(); renderRows(); document.dispatchEvent(new CustomEvent('state:changed')); });
    bCancel.addEventListener('click', renderRaw);
  }

  function onDeleteRaw(id){
    if (!confirm('حذف إدخال المخزون؟')) return;
    const entry = ($state.inventory||[]).find(x=> x.id===id);
    if (entry && window.$trash){ try{ $trash.push('inventory', entry); }catch(_){}}
    $state.inventory = ($state.inventory||[]).filter(x=> x.id!==id);
    $storage.save();
    renderRaw();
    renderRows();
    document.dispatchEvent(new CustomEvent('state:changed'));
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