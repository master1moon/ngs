(function(){
  'use strict';
  const rootId = 'salesView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    const pkgOptions = ($state.packages||[]).map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
    const storeOptions = ($state.stores||[]).map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">إضافة بيع</h5>'
      + '<div class="row g-2 align-items-end">'
      + `  <div class="col-md-3"><label class="form-label">المحل</label><select id="saleStore" class="form-select"><option value="">اختر المحل</option>${storeOptions}</select></div>`
      + `  <div class="col-md-3"><label class="form-label">الباقة</label><select id="salePackage" class="form-select"><option value="">اختر الباقة</option>${pkgOptions}</select></div>`
      + '  <div class="col-md-2"><label class="form-label">الكمية</label><input id="saleQty" class="form-control" placeholder="0"></div>'
      + '  <div class="col-md-2"><label class="form-label">التاريخ</label><input id="saleDate" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-2"><button id="addSaleBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '<div class="form-text mt-2" id="saleHint"></div>'
      + '</div></div>'
      + '<div class="row mt-3"><div class="col-md-4"><input id="saleSearch" class="form-control" placeholder="بحث في المبيعات"></div></div>'
      + '<div class="table-responsive mt-3">\n'
      + '  <table class="table table-sm align-middle"><thead><tr><th>المحل</th><th>الباقة</th><th>الكمية</th><th>الإجمالي</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody id="salesTable"></tbody></table>'}
      + '</div>';

    if ($dates && $dates.SaleDate) $dates.SaleDate.set('');
    document.getElementById('salePackage').addEventListener('change', updateHint);
    document.getElementById('saleStore').addEventListener('change', updateHint);
    document.getElementById('saleQty').addEventListener('input', updateHint);
    document.getElementById('addSaleBtn').addEventListener('click', onAdd);
    document.getElementById('saleSearch').addEventListener('input', renderRows);
    renderRows();
  }

  function priceForStore(pkg, storeId){
    const store = ($state.stores||[]).find(s=> String(s.id)===String(storeId));
    if (!pkg || !store) return 0;
    switch (store.priceType||'retail'){
      case 'wholesale': return Number(pkg.wholesalePrice)||0;
      case 'distributor': return Number(pkg.distributorPrice)||0;
      default: return Number(pkg.retailPrice)||0;
    }
  }

  function updateHint(){
    const pkgId = document.getElementById('salePackage').value;
    const storeId = document.getElementById('saleStore').value;
    const qty = Number((document.getElementById('saleQty').value||'').replace(/,/g,''))||0;
    const hint = document.getElementById('saleHint');
    const pkg = ($state.packages||[]).find(p=> String(p.id)===String(pkgId));
    if (!pkg || !storeId || !qty){ hint.textContent=''; return; }
    const unit = priceForStore(pkg, storeId);
    const total = unit * qty;
    const available = $engine.getInventory(pkgId);
    let text = `السعر للوحدة: ${unit.toLocaleString('en-US')} | الإجمالي: ${total.toLocaleString('en-US')} | المتوفر: ${available.toLocaleString('en-US')}`;
    if (available < qty) text += ' — الكمية غير متوفرة!';
    hint.textContent = text;
  }

  function renderRows(){
    const tb = document.getElementById('salesTable'); if (!tb) return; tb.innerHTML='';
    const q = (document.getElementById('saleSearch')?.value||'').toLowerCase();
    let arr = $state.sales||[];
    if (q) arr = arr.filter(s=> [s.storeId, s.packageId, String(s.quantity||''), String(s.total||''), s.date||''].join(' ').toLowerCase().includes(q));
    for (const s of arr){
      const pkg = ($state.packages||[]).find(p=> String(p.id)===String(s.packageId));
      const store = ($state.stores||[]).find(st=> String(st.id)===String(s.storeId));
      const tr = document.createElement('tr');
      tr.innerHTML = '<td class="cell-store">'+ (store?store.name:(s.storeId||'')) +'</td>'
                   + '<td class="cell-pkg">'+ (pkg?pkg.name:(s.packageId||'')) +'</td>'
                   + '<td class="cell-qty">'+ (s.quantity||0) +'</td>'
                   + '<td class="cell-total currency">'+ Number(s.total||0).toLocaleString('en-US') +'</td>'
                   + '<td class="cell-date">'+ (s.date||'') +'</td>'
                   + '<td><button class="btn btn-sm btn-outline-secondary me-1 edit">تعديل</button><button class="btn btn-sm btn-outline-danger" data-id="'+s.id+'">حذف</button></td>';
      tr.querySelector('.edit').addEventListener('click', ()=> startEdit(tr, s));
      tr.querySelector('.btn-outline-danger').addEventListener('click', ()=> onDelete(s.id));
      tb.appendChild(tr);
    }
  }

  function startEdit(tr, s){
    tr.innerHTML='';
    const tdStore = document.createElement('td'); const selStore=document.createElement('select'); selStore.className='form-select'; selStore.innerHTML = ($state.stores||[]).map(st=> `<option value="${st.id}" ${String(st.id)===String(s.storeId)?'selected':''}>${st.name}</option>`).join(''); tdStore.appendChild(selStore);
    const tdPkg = document.createElement('td'); const selPkg=document.createElement('select'); selPkg.className='form-select'; selPkg.innerHTML = ($state.packages||[]).map(p=> `<option value="${p.id}" ${String(p.id)===String(s.packageId)?'selected':''}>${p.name}</option>`).join(''); tdPkg.appendChild(selPkg);
    const tdQty = document.createElement('td'); const inQty=document.createElement('input'); inQty.className='form-control'; inQty.value=Number(s.quantity||0); tdQty.appendChild(inQty);
    const tdTotal = document.createElement('td'); tdTotal.className='currency'; tdTotal.textContent = Number(s.total||0).toLocaleString('en-US');
    const tdDate = document.createElement('td'); const inDate=document.createElement('input'); inDate.type='date'; inDate.className='form-control'; inDate.value = s.date||''; tdDate.appendChild(inDate);
    const tdAct = document.createElement('td'); const bSave=document.createElement('button'); bSave.className='btn btn-sm btn-primary me-1'; bSave.textContent='حفظ'; const bCancel=document.createElement('button'); bCancel.className='btn btn-sm btn-secondary'; bCancel.textContent='إلغاء'; tdAct.appendChild(bSave); tdAct.appendChild(bCancel);
    tr.appendChild(tdStore); tr.appendChild(tdPkg); tr.appendChild(tdQty); tr.appendChild(tdTotal); tr.appendChild(tdDate); tr.appendChild(tdAct);

    function recalc(){
      const pkg = ($state.packages||[]).find(p=> String(p.id)===String(selPkg.value));
      const unit = priceForStore(pkg, selStore.value); const qty = Number(String(inQty.value).replace(/,/g,''))||0; tdTotal.textContent = (unit*qty).toLocaleString('en-US');
    }
    selStore.addEventListener('change', recalc); selPkg.addEventListener('change', recalc); inQty.addEventListener('input', recalc);

    bSave.addEventListener('click', ()=>{
      const target = $state.sales.find(x=> x.id===s.id); if (!target) return;
      // return old qty to inventory
      if (s.packageId && s.quantity){ $engine.addInventory(s.packageId, s.quantity, s.date); }
      // compute new
      const newPkg = selPkg.value; const newStore = selStore.value; const newQty = Number(String(inQty.value).replace(/,/g,''))||0; const newDate = ($dates?$dates.formatDateEn(inDate.value):inDate.value);
      if (newQty<=0){ alert('كمية غير صحيحة'); return; }
      // deduct new if available
      if (!$engine.canDeduct(newPkg, newQty)){ alert('الكمية غير متوفرة في المخزون'); return; }
      $engine.deductInventory(newPkg, newQty);
      const pkgObj = ($state.packages||[]).find(p=> String(p.id)===String(newPkg)); const unit = priceForStore(pkgObj, newStore); const newTotal = unit * newQty;
      target.storeId = newStore; target.packageId = newPkg; target.quantity = newQty; target.date = newDate; target.total = newTotal;
      $storage.save(); renderRows(); render(); document.dispatchEvent(new CustomEvent('state:changed'));
    });
    bCancel.addEventListener('click', renderRows);
  }

  function onAdd(){
    const storeId = document.getElementById('saleStore').value.trim();
    const packageId = document.getElementById('salePackage').value.trim();
    const qty = Number((document.getElementById('saleQty').value||'').replace(/,/g,''))||0;
    let date = ($dates && $dates.SaleDate) ? $dates.SaleDate.read() : document.getElementById('saleDate').value; if (!date && $dates && $dates.today) date = $dates.today();
    if (!storeId || !packageId || qty<=0){ alert('اختر المحل والباقة وأدخل كمية صحيحة'); return; }
    const pkg = ($state.packages||[]).find(p=> String(p.id)===String(packageId));
    const unit = priceForStore(pkg, storeId);
    const total = unit * qty;
    if (!$engine.canDeduct(packageId, qty)){ alert('الكمية غير متوفرة في المخزون'); return; }
    $engine.deductInventory(packageId, qty);
    $state.sales.push({ id: 'sale_'+Date.now(), storeId, packageId, quantity: qty, total, date });
    $storage.save();
    document.getElementById('saleQty').value=''; if ($dates && $dates.SaleDate) $dates.SaleDate.set('');
    renderRows();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }

  function onDelete(id){
    if (!confirm('حذف هذا البيع؟')) return;
    const s = $state.sales.find(x=> x.id===id);
    if (s && window.$trash){ try{ $trash.push('sales', s); }catch(_){}}
    if (s && s.packageId && s.quantity){ $engine.addInventory(s.packageId, s.quantity, s.date); }
    $state.sales = $state.sales.filter(x=> x.id!==id);
    $storage.save();
    renderRows();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('state:changed', render);
})();