(function(){
  'use strict';
  const rootId = 'paymentsView';
  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    const storeOptions = ($state.stores||[]).map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">إضافة تسديد</h5>'
      + '<div class="row g-2 align-items-end">'
      + `  <div class="col-md-4"><select id="payStore" class="form-select"><option value="">اختر المحل</option>${storeOptions}</select></div>`
      + '  <div class="col-md-3"><input id="payAmount" class="form-control" placeholder="المبلغ"></div>'
      + '  <div class="col-md-3"><input id="payDate" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-2"><button id="addPayBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '</div></div>'
      + '<div class="table-responsive mt-3"><table class="table table-sm align-middle"><thead><tr><th>المحل</th><th>المبلغ</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody id="paymentsTable"></tbody></table></div>';
    document.getElementById('addPayBtn').addEventListener('click', onAdd);
    renderRows();
  }
  function renderRows(){
    const tb = document.getElementById('paymentsTable'); if (!tb) return; tb.innerHTML='';
    for (const p of ($state.payments||[])){
      const st = ($state.stores||[]).find(x=> String(x.id)===String(p.storeId));
      const tr = document.createElement('tr'); tr.innerHTML = `<td>${st?st.name:p.storeId}</td><td class="currency">${Number(p.amount||0).toLocaleString('en-US')}</td><td>${p.date||''}</td><td><button class=\"btn btn-sm btn-outline-secondary edit\">تعديل</button> <button class=\"btn btn-sm btn-outline-danger del\">حذف</button></td>`;
      tr.querySelector('.edit').addEventListener('click', ()=> startEdit(tr, p));
      tr.querySelector('.del').addEventListener('click', ()=> onDelete(p.id));
      tb.appendChild(tr);
    }
  }
  function startEdit(tr, p){
    tr.innerHTML='';
    const tdStore=document.createElement('td'); const sel=document.createElement('select'); sel.className='form-select'; sel.innerHTML = ($state.stores||[]).map(s=>`<option value=\"${s.id}\" ${String(s.id)===String(p.storeId)?'selected':''}>${s.name}</option>`).join(''); tdStore.appendChild(sel);
    const tdAmt=document.createElement('td'); const inAmt=document.createElement('input'); inAmt.className='form-control'; inAmt.value=Number(p.amount||0); tdAmt.appendChild(inAmt);
    const tdDate=document.createElement('td'); const inDate=document.createElement('input'); inDate.type='date'; inDate.className='form-control'; inDate.value=p.date||''; tdDate.appendChild(inDate);
    const tdAct=document.createElement('td'); const bSave=document.createElement('button'); bSave.className='btn btn-sm btn-primary me-1'; bSave.textContent='حفظ'; const bCancel=document.createElement('button'); bCancel.className='btn btn-sm btn-secondary'; bCancel.textContent='إلغاء'; tdAct.appendChild(bSave); tdAct.appendChild(bCancel);
    tr.appendChild(tdStore); tr.appendChild(tdAmt); tr.appendChild(tdDate); tr.appendChild(tdAct);
    bSave.addEventListener('click', ()=>{ const t=($state.payments||[]).find(x=> x.id===p.id); if (!t) return; t.storeId=sel.value; t.amount=Number(String(inAmt.value).replace(/,/g,''))||0; t.date=($dates?$dates.formatDateEn(inDate.value):inDate.value); $app.emitChange(); });
    bCancel.addEventListener('click', renderRows);
  }
  function onAdd(){
    const storeId = document.getElementById('payStore').value; const amount = Number((document.getElementById('payAmount').value||'').replace(/,/g,''))||0; const date = ($dates?$dates.formatDateEn(document.getElementById('payDate').value):document.getElementById('payDate').value) || ($dates?$dates.today():new Date().toISOString().slice(0,10));
    if (!storeId || amount<=0){ alert('أكمل البيانات'); return; }
    $state.payments.push({ id:'pay_'+Date.now(), storeId, amount, date }); document.getElementById('payAmount').value=''; document.getElementById('payDate').value=''; $app.emitChange();
  }
  function onDelete(id){ if (!confirm('حذف؟')) return; const p = ($state.payments||[]).find(x=> x.id===id); if (p){ ($state.trash||($state.trash=[])).push({ id:'trash_'+Date.now(), section:'payments', item:p, deletedAt:new Date().toISOString() }); } $state.payments = ($state.payments||[]).filter(x=> x.id!==id); $app.emitChange(); }
  window.$paymentsView = { render };
})();