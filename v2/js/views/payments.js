(function(){
  'use strict';
  const rootId = 'paymentsView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    const storeOptions = ($state.stores||[]).map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">إضافة تسديد</h5>'
      + '<div class="row g-2">'
      + `  <div class="col-md-3"><select id="paymentStore" class="form-select"><option value="">اختر المحل</option>${storeOptions}</select></div>`
      + '  <div class="col-md-3"><input id="paymentAmount" class="form-control" placeholder="المبلغ"></div>'
      + '  <div class="col-md-3"><input id="paymentDate" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-3"><button id="addPaymentBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '<div class="row mt-3"><div class="col-md-4"><input id="paymentSearch" class="form-control" placeholder="بحث في التسديدات"></div></div>'
      + '</div></div>'
      + '<div class="table-responsive mt-3">\n'
      + '  <table class="table table-sm align-middle"><thead><tr><th>المحل</th><th>المبلغ</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody id="paymentsTable"></tbody></table>'
      + '</div>';

    if ($dates && $dates.PaymentDate) $dates.PaymentDate.set('');
    document.getElementById('addPaymentBtn').addEventListener('click', onAdd);
    document.getElementById('paymentSearch').addEventListener('input', renderRows);
    renderRows();
  }

  function renderRows(){
    const q = (document.getElementById('paymentSearch')?.value||'').toLowerCase();
    const tb = document.getElementById('paymentsTable'); if (!tb) return; tb.innerHTML='';
    let arr = $state.payments||[];
    if (q) arr = arr.filter(p=> [p.storeId, String(p.amount||''), p.date||''].join(' ').toLowerCase().includes(q));
    for (const p of arr){
      const st = ($state.stores||[]).find(s=> String(s.id)===String(p.storeId));
      const tr = document.createElement('tr');
      tr.innerHTML = '<td class="cell-store">'+ (st?st.name:(p.storeId||'')) +'</td>'
                   + '<td class="cell-amount currency">'+ Number(p.amount||0).toLocaleString('en-US') +'</td>'
                   + '<td class="cell-date">'+ (p.date||'') +'</td>'
                   + '<td><button class="btn btn-sm btn-outline-secondary me-1 edit" data-id="'+p.id+'">تعديل</button><button class="btn btn-sm btn-outline-danger" data-id="'+p.id+'">حذف</button></td>';
      tr.querySelector('.edit').addEventListener('click', ()=> startEdit(tr, p));
      tr.querySelector('.btn-outline-danger').addEventListener('click', ()=> onDelete(p.id));
      tb.appendChild(tr);
    }
  }

  function startEdit(tr, p){
    tr.innerHTML = '';
    const tdStore = document.createElement('td'); const sel = document.createElement('select'); sel.className='form-select';
    sel.innerHTML = ($state.stores||[]).map(s=> `<option value="${s.id}" ${String(s.id)===String(p.storeId)?'selected':''}>${s.name}</option>`).join(''); tdStore.appendChild(sel);
    const tdAmount = document.createElement('td'); const inAmount = document.createElement('input'); inAmount.className='form-control'; inAmount.value = Number(p.amount||0); tdAmount.appendChild(inAmount);
    const tdDate = document.createElement('td'); const inDate = document.createElement('input'); inDate.type='date'; inDate.className='form-control'; inDate.value = p.date||''; tdDate.appendChild(inDate);
    const tdAct = document.createElement('td'); const bSave = document.createElement('button'); bSave.className='btn btn-sm btn-primary me-1'; bSave.textContent='حفظ'; const bCancel=document.createElement('button'); bCancel.className='btn btn-sm btn-secondary'; bCancel.textContent='إلغاء'; tdAct.appendChild(bSave); tdAct.appendChild(bCancel);
    tr.appendChild(tdStore); tr.appendChild(tdAmount); tr.appendChild(tdDate); tr.appendChild(tdAct);
    bSave.addEventListener('click', ()=>{
      const target = $state.payments.find(x=> x.id===p.id); if (!target) return;
      target.storeId = sel.value; target.amount = Number(String(inAmount.value).replace(/,/g,''))||0; target.date = ($dates?$dates.formatDateEn(inDate.value):inDate.value);
      $storage.save(); renderRows(); document.dispatchEvent(new CustomEvent('state:changed'));
    });
    bCancel.addEventListener('click', renderRows);
  }

  function onAdd(){
    const storeId = document.getElementById('paymentStore').value.trim();
    const amount = Number((document.getElementById('paymentAmount').value||'').replace(/,/g,''))||0;
    let date = ($dates && $dates.PaymentDate) ? $dates.PaymentDate.read() : document.getElementById('paymentDate').value; if (!date && $dates && $dates.today) date = $dates.today();
    if (!storeId){ alert('اختر المحل'); return; }
    $state.payments.push({ id: 'pay_'+Date.now(), storeId, amount, date });
    $storage.save();
    document.getElementById('paymentAmount').value=''; if ($dates && $dates.PaymentDate) $dates.PaymentDate.set('');
    document.dispatchEvent(new CustomEvent('state:changed'));
    renderRows();
  }

  function onDelete(id){
    if (!confirm('حذف هذا التسديد؟')) return;
    const p = $state.payments.find(x=> x.id===id);
    if (p && window.$trash){ try{ $trash.push('payments', p); }catch(_){}}
    $state.payments = $state.payments.filter(x=> x.id!==id);
    $storage.save();
    renderRows();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('state:changed', render);
})();