(function(){
  'use strict';
  const rootId = 'inventoryView';
  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    const pkgOptions = ($state.packages||[]).map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">إضافة للمخزون</h5>'
      + '<div class="row g-2 align-items-end">'
      + `  <div class="col-md-4"><select id="invPackage" class="form-select"><option value="">اختر الباقة</option>${pkgOptions}</select></div>`
      + '  <div class="col-md-3"><input id="invQty" class="form-control" placeholder="الكمية"></div>'
      + '  <div class="col-md-3"><input id="invDate" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-2"><button id="addInvBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '</div></div>'
      + '<div class="row g-3 mt-3">\n'
      + '  <div class="col-md-6"><div class="card"><div class="card-body"><h6>إجمالي المتوفر لكل باقة</h6><div class="table-responsive mt-2"><table class="table table-sm align-middle"><thead><tr><th>الباقة</th><th>المتوفر</th></tr></thead><tbody id="invTotals"></tbody></table></div></div></div></div>'
      + '  <div class="col-md-6"><div class="card"><div class="card-body"><h6>إدخالات المخزون</h6><div class="table-responsive mt-2"><table class="table table-sm align-middle"><thead><tr><th>الباقة</th><th>الكمية</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody id="invRaw"></tbody></table></div></div></div></div>'
      + '</div>';
    document.getElementById('addInvBtn').addEventListener('click', onAdd);
    renderTotals(); renderRaw();
  }
  function renderTotals(){
    const tb = document.getElementById('invTotals'); if (!tb) return; tb.innerHTML='';
    for (const p of ($state.packages||[])){
      const qty = $engine.getInventory(p.id);
      const tr = document.createElement('tr'); tr.innerHTML = `<td>${p.name}</td><td>${qty.toLocaleString('en-US')}</td>`; tb.appendChild(tr);
    }
  }
  function renderRaw(){
    const tb = document.getElementById('invRaw'); if (!tb) return; tb.innerHTML='';
    for (const i of ($state.inventory||[])){
      const pkg = ($state.packages||[]).find(p=> String(p.id)===String(i.packageId));
      const tr = document.createElement('tr'); tr.innerHTML = `<td>${pkg?pkg.name:i.packageId}</td><td>${Number(i.quantity||0).toLocaleString('en-US')}</td><td>${i.createdAt||''}</td><td><button class="btn btn-sm btn-outline-secondary edit">تعديل</button> <button class="btn btn-sm btn-outline-danger del">حذف</button></td>`;
      tr.querySelector('.edit').addEventListener('click', ()=> startEdit(tr, i));
      tr.querySelector('.del').addEventListener('click', ()=> onDelete(i.id));
      tb.appendChild(tr);
    }
  }
  function startEdit(tr, i){
    tr.innerHTML='';
    const tdPkg=document.createElement('td'); const sel=document.createElement('select'); sel.className='form-select'; sel.innerHTML=($state.packages||[]).map(p=>`<option value="${p.id}" ${String(p.id)===String(i.packageId)?'selected':''}>${p.name}</option>`).join(''); tdPkg.appendChild(sel);
    const tdQty=document.createElement('td'); const inQty=document.createElement('input'); inQty.className='form-control'; inQty.value=Number(i.quantity||0); tdQty.appendChild(inQty);
    const tdDate=document.createElement('td'); const inDate=document.createElement('input'); inDate.type='date'; inDate.className='form-control'; inDate.value=i.createdAt||''; tdDate.appendChild(inDate);
    const tdAct=document.createElement('td'); const bSave=document.createElement('button'); bSave.className='btn btn-sm btn-primary me-1'; bSave.textContent='حفظ'; const bCancel=document.createElement('button'); bCancel.className='btn btn-sm btn-secondary'; bCancel.textContent='إلغاء'; tdAct.appendChild(bSave); tdAct.appendChild(bCancel);
    tr.appendChild(tdPkg); tr.appendChild(tdQty); tr.appendChild(tdDate); tr.appendChild(tdAct);
    bSave.addEventListener('click', ()=>{ const t=($state.inventory||[]).find(x=> x.id===i.id); if (!t) return; t.packageId=sel.value; t.quantity=$dates.parseNumber(inQty.value); t.createdAt=($dates?$dates.formatDateEn(inDate.value):inDate.value); $app.emitChange(); });
    bCancel.addEventListener('click', renderRaw);
  }
  function onAdd(){
    const pkg = document.getElementById('invPackage').value; const qty = $dates.parseNumber(document.getElementById('invQty').value); const date = ($dates?$dates.formatDateEn(document.getElementById('invDate').value):document.getElementById('invDate').value) || ($dates?$dates.today():new Date().toISOString().slice(0,10));
    if (!pkg || qty<=0){ alert('اختر الباقة وأدخل كمية صحيحة'); return; }
    $engine.addInventory(pkg, qty, date); $app.emitChange(); document.getElementById('invQty').value=''; document.getElementById('invDate').value='';
    renderTotals();
  }
  function onDelete(id){ if (!confirm('حذف إدخال؟')) return; const x = ($state.inventory||[]).find(e=> e.id===id); if (x) { ($state.trash||($state.trash=[])).push({ id:'trash_'+Date.now(), section:'inventory', item:x, deletedAt:new Date().toISOString() }); } $state.inventory = ($state.inventory||[]).filter(e=> e.id!==id); $app.emitChange(); }
  window.$inventoryView = { render };
})();