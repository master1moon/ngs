(function(){
  'use strict';
  const rootId = 'reportsView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">التقارير</h5>'
      + '<div class="row g-2 align-items-end">'
      + '  <div class="col-md-3"><label class="form-label">من</label><input type="date" id="repFrom" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-3"><label class="form-label">إلى</label><input type="date" id="repTo" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-3"><button id="applyRange" class="btn btn-primary w-100">تطبيق</button></div>'
      + '  <div class="col-md-3 d-flex gap-2"><button id="exportJson" class="btn btn-outline-secondary w-100">تصدير JSON</button><button id="exportTxt" class="btn btn-outline-secondary w-100">تصدير TXT</button></div>'
      + '</div>'
      + '<div class="mt-3" id="repSummary"></div>'
      + '</div></div>'
      + '<div class="mt-3" id="repTables"></div>';

    // defaults
    const today = ($dates && $dates.today)? $dates.today(): (new Date()).toISOString().slice(0,10);
    const monthStart = (typeof moment!=='undefined') ? moment().startOf('month').format('YYYY-MM-DD') : today.slice(0,8)+'01';
    document.getElementById('repFrom').value = monthStart;
    document.getElementById('repTo').value = today;

    document.getElementById('applyRange').addEventListener('click', update);
    document.getElementById('exportJson').addEventListener('click', ()=> exportData('json'));
    document.getElementById('exportTxt').addEventListener('click', ()=> exportData('txt'));

    update();
  }

  function getRange(){
    const f = document.getElementById('repFrom').value;
    const t = document.getElementById('repTo').value;
    const fd = ($dates && $dates.formatDateEn) ? $dates.formatDateEn(f) : f;
    const td = ($dates && $dates.formatDateEn) ? $dates.formatDateEn(t) : t;
    return { from: fd, to: td };
  }

  function inRange(d, r){
    const x = ($dates && $dates.formatDateEn) ? $dates.formatDateEn(d) : d;
    return (!r.from || x>=r.from) && (!r.to || x<=r.to);
  }

  function update(){
    const r = getRange();
    const sales = ($state.sales||[]).filter(s=> inRange(s.date, r));
    const pays = ($state.payments||[]).filter(p=> inRange(p.date, r));
    const exps = ($state.expenses||[]).filter(e=> inRange(e.date, r));
    const totalSales = sales.reduce((a,s)=> a + (Number(s.total)||0), 0);
    const totalPays = pays.reduce((a,p)=> a + (Number(p.amount)||0), 0);
    const totalExps = exps.reduce((a,e)=> a + (Number(e.amount)||0), 0);
    const net = totalSales - totalPays - totalExps;

    // summary
    document.getElementById('repSummary').innerHTML = `\n      <div class="d-flex flex-wrap gap-2">\n        <div class="alert alert-secondary m-0">المبيعات: <b class="currency">${totalSales.toLocaleString('en-US')}</b></div>\n        <div class="alert alert-secondary m-0">التسديدات: <b class="currency">${totalPays.toLocaleString('en-US')}</b></div>\n        <div class="alert alert-secondary m-0">المصروفات: <b class="currency">${totalExps.toLocaleString('en-US')}</b></div>\n        <div class="alert ${net>=0?'alert-success':'alert-danger'} m-0">الصافي: <b class="currency">${net.toLocaleString('en-US')}</b></div>\n      </div>`;

    // tables
    const mapRow = (arr, cols)=> arr.map(o=> `<tr>${cols.map(c=> `<td>${o[c]??''}</td>`).join('')}</tr>`).join('');
    const salesRows = sales.map(s=> ({ store: (findStore(s.storeId)||s.storeId), pkg: (findPkg(s.packageId)||s.packageId), qty: s.quantity||0, total: Number(s.total||0).toLocaleString('en-US'), date: s.date||'' }));
    const paysRows = pays.map(p=> ({ store: (findStore(p.storeId)||p.storeId), amount: Number(p.amount||0).toLocaleString('en-US'), date: p.date||'' }));
    const expsRows = exps.map(e=> ({ type: e.type||'', amount: Number(e.amount||0).toLocaleString('en-US'), date: e.date||'' }));

    document.getElementById('repTables').innerHTML = ''+
      '<div class="row g-3">\n'
      + '  <div class="col-md-6"><div class="card"><div class="card-body">\n'
      + '    <h6>المبيعات</h6>'
      + '    <div class="table-responsive"><table class="table table-sm"><thead><tr><th>المحل</th><th>الباقة</th><th>الكمية</th><th>الإجمالي</th><th>التاريخ</th></tr></thead><tbody>' + mapRow(salesRows, ['store','pkg','qty','total','date']) + '</tbody></table></div>'
      + '  </div></div></div>'
      + '  <div class="col-md-6"><div class="card"><div class="card-body">\n'
      + '    <h6>التسديدات</h6>'
      + '    <div class="table-responsive"><table class="table table-sm"><thead><tr><th>المحل</th><th>المبلغ</th><th>التاريخ</th></tr></thead><tbody>' + mapRow(paysRows, ['store','amount','date']) + '</tbody></table></div>'
      + '  </div></div></div>'
      + '  <div class="col-12"><div class="card"><div class="card-body">\n'
      + '    <h6>المصروفات</h6>'
      + '    <div class="table-responsive"><table class="table table-sm"><thead><tr><th>النوع</th><th>المبلغ</th><th>التاريخ</th></tr></thead><tbody>' + mapRow(expsRows, ['type','amount','date']) + '</tbody></table></div>'
      + '  </div></div></div>'
      + '</div>';
  }

  function findStore(id){ const s = ($state.stores||[]).find(x=> String(x.id)===String(id)); return s ? s.name : null; }
  function findPkg(id){ const p = ($state.packages||[]).find(x=> String(x.id)===String(id)); return p ? p.name : null; }

  function exportData(fmt){
    const r = getRange();
    const data = {
      range: r,
      totals: {
        sales: ($state.sales||[]).filter(s=> inRange(s.date,r)).reduce((a,s)=> a + (Number(s.total)||0), 0),
        payments: ($state.payments||[]).filter(p=> inRange(p.date,r)).reduce((a,p)=> a + (Number(p.amount)||0), 0),
        expenses: ($state.expenses||[]).filter(e=> inRange(e.date,r)).reduce((a,e)=> a + (Number(e.amount)||0), 0)
      },
      sales: ($state.sales||[]).filter(s=> inRange(s.date,r)),
      payments: ($state.payments||[]).filter(p=> inRange(p.date,r)),
      expenses: ($state.expenses||[]).filter(e=> inRange(e.date,r))
    };
    if (fmt==='json'){
      const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'reports.json'; a.click();
    } else {
      let txt = `تقارير الفترة ${data.range.from||''} إلى ${data.range.to||''}\n`;
      txt += `المبيعات: ${data.totals.sales}\nالتسديدات: ${data.totals.payments}\nالمصروفات: ${data.totals.expenses}\n`;
      const blob = new Blob([txt], {type:'text/plain'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'reports.txt'; a.click();
    }
  }

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('state:changed', render);
})();