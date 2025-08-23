(function(){
  'use strict';
  const rootId = 'paymentsView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">إضافة تسديد</h5>'
      + '<div class="row g-2">'
      + '  <div class="col-md-3"><input id="paymentStore" class="form-control" placeholder="معرّف المحل"></div>'
      + '  <div class="col-md-3"><input id="paymentAmount" class="form-control" placeholder="المبلغ"></div>'
      + '  <div class="col-md-3"><input id="paymentDate" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-3"><button id="addPaymentBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '</div></div>'
      + '<div class="table-responsive mt-3">\n'
      + '  <table class="table table-sm align-middle"><thead><tr><th>المحل</th><th>المبلغ</th><th>التاريخ</th></tr></thead><tbody id="paymentsTable"></tbody></table>'
      + '</div>';

    if ($dates && $dates.PaymentDate) $dates.PaymentDate.set('');
    document.getElementById('addPaymentBtn').addEventListener('click', onAdd);
    renderRows();
  }

  function renderRows(){
    const tb = document.getElementById('paymentsTable'); if (!tb) return; tb.innerHTML='';
    for (const p of $state.payments){
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>'+ (p.storeId||'') +'</td>'
                   + '<td class="currency">'+ Number(p.amount||0).toLocaleString('en-US') +'</td>'
                   + '<td>'+ (p.date||'') +'</td>';
      tb.appendChild(tr);
    }
  }

  function onAdd(){
    const storeId = document.getElementById('paymentStore').value.trim();
    const amount = Number((document.getElementById('paymentAmount').value||'').replace(/,/g,''))||0;
    const date = ($dates && $dates.PaymentDate) ? $dates.PaymentDate.read() : document.getElementById('paymentDate').value;
    if (!storeId){ alert('أدخل معرّف المحل'); return; }
    $state.payments.push({ id: 'pay_'+Date.now(), storeId, amount, date });
    $storage.save();
    document.getElementById('paymentStore').value=''; document.getElementById('paymentAmount').value=''; if ($dates && $dates.PaymentDate) $dates.PaymentDate.set('');
    renderRows();
  }

  document.addEventListener('DOMContentLoaded', render);
})();