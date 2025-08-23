(function(){
  'use strict';
  const rootId = 'expensesView';
  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">إضافة مصروف</h5>'
      + '<div class="row g-2 align-items-end">'
      + '  <div class="col-md-4"><input id="expType" class="form-control" placeholder="النوع"></div>'
      + '  <div class="col-md-3"><input id="expAmount" class="form-control" placeholder="المبلغ"></div>'
      + '  <div class="col-md-3"><input id="expDate" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-2"><button id="addExpBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '</div></div>'
      + '<div class="table-responsive mt-3"><table class="table table-sm align-middle"><thead><tr><th>النوع</th><th>المبلغ</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody id="expensesTable"></tbody></table></div>';
    document.getElementById('addExpBtn').addEventListener('click', onAdd);
    renderRows();
  }
  function renderRows(){
    const tb = document.getElementById('expensesTable'); if (!tb) return; tb.innerHTML='';
    for (const e of ($state.expenses||[])){
      const tr = document.createElement('tr'); tr.innerHTML = `<td>${e.type||''}</td><td class="currency">${Number(e.amount||0).toLocaleString('en-US')}</td><td>${e.date||''}</td><td><button class=\"btn btn-sm btn-outline-secondary edit\">تعديل</button> <button class=\"btn btn-sm btn-outline-danger del\">حذف</button></td>`;
      tr.querySelector('.edit').addEventListener('click', ()=> startEdit(tr, e));
      tr.querySelector('.del').addEventListener('click', ()=> onDelete(e.id));
      tb.appendChild(tr);
    }
  }
  function startEdit(tr, e){
    tr.innerHTML='';
    const tdType=document.createElement('td'); const inType=document.createElement('input'); inType.className='form-control'; inType.value=e.type||''; tdType.appendChild(inType);
    const tdAmt=document.createElement('td'); const inAmt=document.createElement('input'); inAmt.className='form-control'; inAmt.value=Number(e.amount||0); tdAmt.appendChild(inAmt);
    const tdDate=document.createElement('td'); const inDate=document.createElement('input'); inDate.type='date'; inDate.className='form-control'; inDate.value=e.date||''; tdDate.appendChild(inDate);
    const tdAct=document.createElement('td'); const bSave=document.createElement('button'); bSave.className='btn btn-sm btn-primary me-1'; bSave.textContent='حفظ'; const bCancel=document.createElement('button'); bCancel.className='btn btn-sm btn-secondary'; bCancel.textContent='إلغاء'; tdAct.appendChild(bSave); tdAct.appendChild(bCancel);
    tr.appendChild(tdType); tr.appendChild(tdAmt); tr.appendChild(tdDate); tr.appendChild(tdAct);
    bSave.addEventListener('click', ()=>{ const t=($state.expenses||[]).find(x=> x.id===e.id); if (!t) return; t.type=inType.value.trim(); t.amount=Number(String(inAmt.value).replace(/,/g,''))||0; t.date=($dates?$dates.formatDateEn(inDate.value):inDate.value); $app.emitChange(); });
    bCancel.addEventListener('click', renderRows);
  }
  function onAdd(){
    const type = document.getElementById('expType').value.trim(); const amount = Number((document.getElementById('expAmount').value||'').replace(/,/g,''))||0; const date = ($dates?$dates.formatDateEn(document.getElementById('expDate').value):document.getElementById('expDate').value) || ($dates?$dates.today():new Date().toISOString().slice(0,10));
    if (!type || amount<=0){ alert('أكمل البيانات'); return; }
    $state.expenses.push({ id:'exp_'+Date.now(), type, amount, date }); document.getElementById('expType').value=''; document.getElementById('expAmount').value=''; document.getElementById('expDate').value=''; $app.emitChange();
  }
  function onDelete(id){ if (!confirm('حذف؟')) return; const e = ($state.expenses||[]).find(x=> x.id===id); if (e){ ($state.trash||($state.trash=[])).push({ id:'trash_'+Date.now(), section:'expenses', item:e, deletedAt:new Date().toISOString() }); } $state.expenses = ($state.expenses||[]).filter(x=> x.id!==id); $app.emitChange(); }
  window.$expensesView = { render };
})();