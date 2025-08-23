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
      + '<div class="table-responsive mt-3">\n'
      + '  <table class="table table-sm align-middle"><thead><tr><th>المحل</th><th>الباقة</th><th>الكمية</th><th>الإجمالي</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody id="salesTable"></tbody></table>'}
      + '</div>';

    if ($dates && $dates.SaleDate) $dates.SaleDate.set('');
    document.getElementById('salePackage').addEventListener('change', updateHint);
    document.getElementById('saleStore').addEventListener('change', updateHint);
    document.getElementById('saleQty').addEventListener('input', updateHint);
    document.getElementById('addSaleBtn').addEventListener('click', onAdd);
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
    for (const s of $state.sales){
      const pkg = ($state.packages||[]).find(p=> String(p.id)===String(s.packageId));
      const store = ($state.stores||[]).find(st=> String(st.id)===String(s.storeId));
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>'+ (store?store.name:(s.storeId||'')) +'</td>'
                   + '<td>'+ (pkg?pkg.name:(s.packageId||'')) +'</td>'
                   + '<td>'+ (s.quantity||0) +'</td>'
                   + '<td class="currency">'+ Number(s.total||0).toLocaleString('en-US') +'</td>'
                   + '<td>'+ (s.date||'') +'</td>'
                   + '<td><button class="btn btn-sm btn-outline-danger" data-id="'+s.id+'">حذف</button></td>';
      tr.querySelector('button').addEventListener('click', ()=> onDelete(s.id));
      tb.appendChild(tr);
    }
  }

  function onAdd(){
    const storeId = document.getElementById('saleStore').value.trim();
    const packageId = document.getElementById('salePackage').value.trim();
    const qty = Number((document.getElementById('saleQty').value||'').replace(/,/g,''))||0;
    const date = ($dates && $dates.SaleDate) ? $dates.SaleDate.read() : document.getElementById('saleDate').value;
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
    if (s && s.packageId && s.quantity){ $engine.addInventory(s.packageId, s.quantity, s.date); }
    $state.sales = $state.sales.filter(x=> x.id!==id);
    $storage.save();
    renderRows();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('state:changed', render);
})();