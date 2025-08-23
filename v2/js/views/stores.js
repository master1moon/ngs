(function(){
  'use strict';
  const rootId = 'storesView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">المحلات</h5>'
      + '<div class="row g-2">'
      + '  <div class="col-md-4"><input id="storeName" class="form-control" placeholder="اسم المحل"></div>'
      + '  <div class="col-md-4"><select id="storePriceType" class="form-select"><option value="retail">قطاعي</option><option value="wholesale">جملة</option><option value="distributor">موزع</option></select></div>'
      + '  <div class="col-md-4"><button id="addStoreBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '</div></div>'
      + '<div class="table-responsive mt-3">\n'
      + '  <table class="table table-sm align-middle"><thead><tr><th>الاسم</th><th>نوع السعر</th><th>الرصيد</th><th>إجراءات</th></tr></thead><tbody id="storesTable"></tbody></table>'
      + '</div>';
    document.getElementById('addStoreBtn').addEventListener('click', onAdd);
    renderRows();
  }

  function renderRows(){
    const tb = document.getElementById('storesTable'); if (!tb) return; tb.innerHTML='';
    for (const s of $state.stores){
      const bal = $engine.getStoreBalance(s.id);
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>'+ (s.name||'') +'</td>'
                   + '<td>'+ (s.priceType||'retail') +'</td>'
                   + '<td class="currency">'+ Number(bal||0).toLocaleString('en-US') +'</td>'
                   + '<td><button class="btn btn-sm btn-outline-danger" data-id="'+s.id+'">حذف</button></td>';
      tr.querySelector('button').addEventListener('click', ()=> onDelete(s.id));
      tb.appendChild(tr);
    }
  }

  function onAdd(){
    const name = document.getElementById('storeName').value.trim();
    const priceType = document.getElementById('storePriceType').value;
    if (!name){ alert('أدخل اسم المحل'); return; }
    $state.stores.push({ id: 'store_'+Date.now(), name, priceType, createdAt: ($dates?$dates.today():new Date().toISOString().slice(0,10)) });
    $storage.save();
    document.getElementById('storeName').value='';
    document.dispatchEvent(new CustomEvent('state:changed'));
    renderRows();
  }

  function onDelete(id){
    if (!confirm('حذف هذا المحل؟')) return;
    const referenced = ($state.sales||[]).some(x=> String(x.storeId)===String(id)) || ($state.payments||[]).some(x=> String(x.storeId)===String(id));
    if (referenced){ alert('لا يمكن حذف المحل لوجود مبيعات/تسديدات مرتبطة به'); return; }
    $state.stores = $state.stores.filter(x=> x.id!==id);
    $storage.save();
    renderRows();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('state:changed', render);
})();