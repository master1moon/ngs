(function(){
  'use strict';
  const rootId = 'salesView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">إضافة بيع</h5>'
      + '<div class="row g-2">'
      + '  <div class="col-md-3"><input id="saleStore" class="form-control" placeholder="معرّف المحل"></div>'
      + '  <div class="col-md-3"><input id="saleAmount" class="form-control" placeholder="المبلغ"></div>'
      + '  <div class="col-md-3"><input id="saleDate" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-3"><button id="addSaleBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '</div></div>'
      + '<div class="table-responsive mt-3">\n'
      + '  <table class="table table-sm align-middle"><thead><tr><th>المحل</th><th>المبلغ</th><th>التاريخ</th></tr></thead><tbody id="salesTable"></tbody></table>'
      + '</div>';

    if ($dates && $dates.SaleDate) $dates.SaleDate.set('');
    document.getElementById('addSaleBtn').addEventListener('click', onAdd);
    renderRows();
  }

  function renderRows(){
    const tb = document.getElementById('salesTable'); if (!tb) return; tb.innerHTML='';
    for (const s of $state.sales){
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>'+ (s.storeId||'') +'</td>'
                   + '<td class="currency">'+ Number(s.total||0).toLocaleString('en-US') +'</td>'
                   + '<td>'+ (s.date||'') +'</td>';
      tb.appendChild(tr);
    }
  }

  function onAdd(){
    const storeId = document.getElementById('saleStore').value.trim();
    const total = Number((document.getElementById('saleAmount').value||'').replace(/,/g,''))||0;
    const date = ($dates && $dates.SaleDate) ? $dates.SaleDate.read() : document.getElementById('saleDate').value;
    if (!storeId){ alert('أدخل معرّف المحل'); return; }
    $state.sales.push({ id: 'sale_'+Date.now(), storeId, total, date });
    $storage.save();
    document.getElementById('saleStore').value=''; document.getElementById('saleAmount').value=''; if ($dates && $dates.SaleDate) $dates.SaleDate.set('');
    renderRows();
  }

  document.addEventListener('DOMContentLoaded', render);
})();