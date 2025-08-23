(function(){
  'use strict';
  const rootId = 'expensesView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">إضافة مصروف</h5>'
      + '<div class="row g-2">'
      + '  <div class="col-md-3"><input id="expenseType" class="form-control" placeholder="النوع"></div>'
      + '  <div class="col-md-3"><input id="expenseAmount" class="form-control" placeholder="المبلغ"></div>'
      + '  <div class="col-md-3"><input id="expenseDate" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-3"><button id="addExpenseBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '<div class="row mt-3"><div class="col-md-4"><input id="expenseSearch" class="form-control" placeholder="بحث في المصروفات"></div></div>'
      + '</div></div>'
      + '<div class="table-responsive mt-3">\n'
      + '  <table class="table table-sm align-middle"><thead><tr><th>النوع</th><th>المبلغ</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody id="expensesTable"></tbody></table>'
      + '</div>';

    if ($dates && $dates.ExpenseDate) $dates.ExpenseDate.set('');
    document.getElementById('addExpenseBtn').addEventListener('click', onAdd);
    document.getElementById('expenseSearch').addEventListener('input', renderRows);
    renderRows();
  }

  function renderRows(){
    const tb = document.getElementById('expensesTable'); if (!tb) return; tb.innerHTML='';
    const q = (document.getElementById('expenseSearch')?.value||'').toLowerCase();
    let arr = $state.expenses||[];
    if (q) arr = arr.filter(e=> [e.type||'', String(e.amount||''), e.date||''].join(' ').toLowerCase().includes(q));
    for (const e of arr){
      const tr = document.createElement('tr');
      tr.innerHTML = '<td class="cell-type">'+ (e.type||'') +'</td>'
                   + '<td class="cell-amount currency">'+ Number(e.amount||0).toLocaleString('en-US') +'</td>'
                   + '<td class="cell-date">'+ (e.date||'') +'</td>'
                   + '<td><button class="btn btn-sm btn-outline-danger" data-id="'+e.id+'">حذف</button></td>';
      tr.querySelector('button').addEventListener('click', ()=> onDelete(e.id));
      tr.querySelector('.cell-type').addEventListener('dblclick', ()=> startEdit(tr, e));
      tr.querySelector('.cell-amount').addEventListener('dblclick', ()=> startEdit(tr, e));
      tr.querySelector('.cell-date').addEventListener('dblclick', ()=> startEdit(tr, e));
      tb.appendChild(tr);
    }
  }

  function startEdit(tr, e){
    tr.innerHTML = '';
    const tdType = document.createElement('td'); const inType = document.createElement('input'); inType.className='form-control'; inType.value = e.type||''; tdType.appendChild(inType);
    const tdAmount = document.createElement('td'); const inAmount = document.createElement('input'); inAmount.className='form-control'; inAmount.value = Number(e.amount||0); tdAmount.appendChild(inAmount);
    const tdDate = document.createElement('td'); const inDate = document.createElement('input'); inDate.type='date'; inDate.className='form-control'; inDate.value = e.date||''; tdDate.appendChild(inDate);
    const tdAct = document.createElement('td'); const bSave = document.createElement('button'); bSave.className='btn btn-sm btn-primary me-1'; bSave.textContent='حفظ'; const bCancel = document.createElement('button'); bCancel.className='btn btn-sm btn-secondary'; bCancel.textContent='إلغاء'; tdAct.appendChild(bSave); tdAct.appendChild(bCancel);
    tr.appendChild(tdType); tr.appendChild(tdAmount); tr.appendChild(tdDate); tr.appendChild(tdAct);
    bSave.addEventListener('click', ()=>{
      const ne = $state.expenses.find(x=> x.id===e.id); if (!ne) return;
      ne.type = inType.value.trim(); ne.amount = Number(String(inAmount.value).replace(/,/g,''))||0; ne.date = ($dates?$dates.formatDateEn(inDate.value):inDate.value);
      $storage.save(); renderRows(); document.dispatchEvent(new CustomEvent('state:changed'));
    });
    bCancel.addEventListener('click', renderRows);
  }

  function onAdd(){
    const type = document.getElementById('expenseType').value.trim();
    const amount = Number((document.getElementById('expenseAmount').value||'').replace(/,/g,''))||0;
    let date = ($dates && $dates.ExpenseDate) ? $dates.ExpenseDate.read() : document.getElementById('expenseDate').value; if (!date && $dates && $dates.today) date = $dates.today();
    if (!type){ alert('أدخل نوع المصروف'); return; }
    $state.expenses.push({ id: 'exp_'+Date.now(), type, amount, date });
    $storage.save();
    document.getElementById('expenseType').value=''; document.getElementById('expenseAmount').value=''; if ($dates && $dates.ExpenseDate) $dates.ExpenseDate.set('');
    renderRows();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }

  function onDelete(id){
    if (!confirm('حذف هذا المصروف؟')) return;
    const e = $state.expenses.find(x=> x.id===id);
    if (e && window.$trash){ try{ $trash.push('expenses', e); }catch(_){}}
    $state.expenses = $state.expenses.filter(x=> x.id!==id);
    $storage.save();
    renderRows();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }

  document.addEventListener('DOMContentLoaded', render);
})();