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
      + '</div></div>'
      + '<div class="table-responsive mt-3">\n'
      + '  <table class="table table-sm align-middle"><thead><tr><th>النوع</th><th>المبلغ</th><th>التاريخ</th></tr></thead><tbody id="expensesTable"></tbody></table>'
      + '</div>';

    if ($dates && $dates.ExpenseDate) $dates.ExpenseDate.set('');
    document.getElementById('addExpenseBtn').addEventListener('click', onAdd);
    renderRows();
  }

  function renderRows(){
    const tb = document.getElementById('expensesTable'); if (!tb) return; tb.innerHTML='';
    for (const e of $state.expenses){
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>'+ (e.type||'') +'</td>'
                   + '<td class="currency">'+ Number(e.amount||0).toLocaleString('en-US') +'</td>'
                   + '<td>'+ (e.date||'') +'</td>';
      tb.appendChild(tr);
    }
  }

  function onAdd(){
    const type = document.getElementById('expenseType').value.trim();
    const amount = Number((document.getElementById('expenseAmount').value||'').replace(/,/g,''))||0;
    const date = ($dates && $dates.ExpenseDate) ? $dates.ExpenseDate.read() : document.getElementById('expenseDate').value;
    if (!type){ alert('أدخل نوع المصروف'); return; }
    $state.expenses.push({ id: 'exp_'+Date.now(), type, amount, date });
    $storage.save();
    document.getElementById('expenseType').value=''; document.getElementById('expenseAmount').value=''; if ($dates && $dates.ExpenseDate) $dates.ExpenseDate.set('');
    renderRows();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }

  document.addEventListener('DOMContentLoaded', render);
})();