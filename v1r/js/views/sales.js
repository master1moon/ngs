(function(){
  'use strict';
  const rootId = 'salesView';
  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    const storeOptions = ($state.stores||[]).map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
    const pkgOptions = ($state.packages||[]).map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">إضافة بيع</h5>'
      + '<div class="row g-2 align-items-end">'
      + `  <div class="col-md-3"><select id="saleStore" class="form-select"><option value="">اختر المحل</option>${storeOptions}</select></div>`
      + `  <div class="col-md-3"><select id="salePackage" class="form-select"><option value="">اختر الباقة</option>${pkgOptions}</select></div>`
      + '  <div class="col-md-2"><input id="saleQty" class="form-control" placeholder="الكمية"></div>'
      + '  <div class="col-md-2"><input id="saleDate" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-2"><button id="addSaleBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '</div></div>'
      + '<div class="table-responsive mt-3"><table class="table table-sm align-middle"><thead><tr><th>المحل</th><th>الباقة</th><th>الكمية</th><th>الإجمالي</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody id="salesTable"></tbody></table></div>';
    document.getElementById('addSaleBtn').addEventListener('click', onAdd);
    renderRows();
  }
  function priceForStore(pkg, storeId){ const st = ($state.stores||[]).find(s=> String(s.id)===String(storeId)); if (!pkg||!st) return 0; switch (st.priceType||'retail'){ case 'wholesale': return Number(pkg.wholesalePrice)||0; case 'distributor': return Number(pkg.distributorPrice)||0; default: return Number(pkg.retailPrice)||0; } }
  function renderRows(){
    const tb = document.getElementById('salesTable'); if (!tb) return; tb.innerHTML='';
    for (const s of ($state.sales||[])){
      const st = ($state.stores||[]).find(x=> String(x.id)===String(s.storeId));
      const pkg = ($state.packages||[]).find(x=> String(x.id)===String(s.packageId));
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${st?st.name:s.storeId}</td><td>${pkg?pkg.name:s.packageId}</td><td>${s.quantity||0}</td><td class="currency">${Number(s.total||0).toLocaleString('en-US')}</td><td>${s.date||''}</td><td><button class="btn btn-sm btn-outline-secondary edit">تعديل</button> <button class="btn btn-sm btn-outline-danger del">حذف</button></td>`;
      tr.querySelector('.edit').addEventListener('click', ()=> startEdit(tr, s));
      tr.querySelector('.del').addEventListener('click', ()=> onDelete(s.id));
      tb.appendChild(tr);
    }
  }
  function startEdit(tr, s){
    tr.innerHTML='';
    const tdStore=document.createElement('td'); const selStore=document.createElement('select'); selStore.className='form-select'; selStore.innerHTML = ($state.stores||[]).map(st=>`<option value="${st.id}" ${String(st.id)===String(s.storeId)?'selected':''}>${st.name}</option>`).join(''); tdStore.appendChild(selStore);
    const tdPkg=document.createElement('td'); const selPkg=document.createElement('select'); selPkg.className='form-select'; selPkg.innerHTML = ($state.packages||[]).map(p=>`<option value="${p.id}" ${String(p.id)===String(s.packageId)?'selected':''}>${p.name}</option>`).join(''); tdPkg.appendChild(selPkg);
    const tdQty=document.createElement('td'); const inQty=document.createElement('input'); inQty.className='form-control'; inQty.value=Number(s.quantity||0); tdQty.appendChild(inQty);
    const tdTotal=document.createElement('td'); tdTotal.className='currency'; tdTotal.textContent = Number(s.total||0).toLocaleString('en-US');
    const tdDate=document.createElement('td'); const inDate=document.createElement('input'); inDate.type='date'; inDate.className='form-control'; inDate.value=s.date||''; tdDate.appendChild(inDate);
    const tdAct=document.createElement('td'); const bSave=document.createElement('button'); bSave.className='btn btn-sm btn-primary me-1'; bSave.textContent='حفظ'; const bCancel=document.createElement('button'); bCancel.className='btn btn-sm btn-secondary'; bCancel.textContent='إلغاء'; tdAct.appendChild(bSave); tdAct.appendChild(bCancel);
    tr.appendChild(tdStore); tr.appendChild(tdPkg); tr.appendChild(tdQty); tr.appendChild(tdTotal); tr.appendChild(tdDate); tr.appendChild(tdAct);
    function recalc(){ const pkg = ($state.packages||[]).find(p=> String(p.id)===String(selPkg.value)); const unit = priceForStore(pkg, selStore.value); const q = Number(String(inQty.value).replace(/,/g,''))||0; tdTotal.textContent = (unit*q).toLocaleString('en-US'); }
    selStore.addEventListener('change', recalc); selPkg.addEventListener('change', recalc); inQty.addEventListener('input', recalc);
    bSave.addEventListener('click', ()=>{
      const target = ($state.sales||[]).find(x=> x.id===s.id); if (!target) return;
      // return old
      if (s.packageId && s.quantity){ $engine.addInventory(s.packageId, s.quantity, s.date); }
      const newPkg = selPkg.value; const newStore = selStore.value; const newQty = Number(String(inQty.value).replace(/,/g,''))||0; const newDate = ($dates?$dates.formatDateEn(inDate.value):inDate.value);
      if (newQty<=0){ alert('كمية غير صحيحة'); return; }
      if (!$engine.canDeduct(newPkg, newQty)){ alert('الكمية غير متوفرة'); return; }
      $engine.deductInventory(newPkg, newQty);
      const pkgObj = ($state.packages||[]).find(p=> String(p.id)===String(newPkg)); const unit = priceForStore(pkgObj, newStore); const total = unit*newQty;
      target.storeId=newStore; target.packageId=newPkg; target.quantity=newQty; target.date=newDate; target.total=total; $app.emitChange();
    });
    bCancel.addEventListener('click', renderRows);
  }
  function onAdd(){
    const storeId = document.getElementById('saleStore').value; const packageId = document.getElementById('salePackage').value; const qty = Number((document.getElementById('saleQty').value||'').replace(/,/g,''))||0; const date = ($dates?$dates.formatDateEn(document.getElementById('saleDate').value):document.getElementById('saleDate').value) || ($dates?$dates.today():new Date().toISOString().slice(0,10));
    if (!storeId || !packageId || qty<=0){ alert('أكمل البيانات'); return; }
    const pkg = ($state.packages||[]).find(p=> String(p.id)===String(packageId)); const unit = priceForStore(pkg, storeId); const total = unit*qty;
    if (!$engine.canDeduct(packageId, qty)){ alert('الكمية غير متوفرة'); return; }
    $engine.deductInventory(packageId, qty);
    $state.sales.push({ id:'sale_'+Date.now(), storeId, packageId, quantity:qty, total, date });
    document.getElementById('saleQty').value=''; document.getElementById('saleDate').value='';
    $app.emitChange();
  }
  function onDelete(id){ if (!confirm('حذف؟')) return; const s = ($state.sales||[]).find(x=> x.id===id); if (s){ $engine.addInventory(s.packageId, s.quantity, s.date); ($state.trash||($state.trash=[])).push({ id:'trash_'+Date.now(), section:'sales', item:s, deletedAt:new Date().toISOString() }); } $state.sales = ($state.sales||[]).filter(x=> x.id!==id); $app.emitChange(); }
  window.$salesView = { render };
})();