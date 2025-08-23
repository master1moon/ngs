(function(){
  'use strict';
  const rootId = 'reportsView';
  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">التقارير</h5>'
      + '<div class="row g-2 align-items-end">'
      + '  <div class="col-md-3"><label class="form-label">من</label><input id="repFrom" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-3"><label class="form-label">إلى</label><input id="repTo" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-6 d-flex gap-2"><button id="applyRep" class="btn btn-primary">تطبيق</button><button id="expJson" class="btn btn-outline-secondary">تصدير JSON</button><button id="expXlsx" class="btn btn-outline-success">تصدير Excel</button><button id="expTxt" class="btn btn-outline-dark">تصدير TXT</button></div>'
      + '</div>'
      + '<div class="mt-3" id="repSummary"></div>'
      + '</div></div>'
      + '<div class="row g-3 mt-2">\n'
      + '  <div class="col-md-4"><div class="card"><div class="card-body"><h6>المبيعات</h6><div id="repSales" class="currency">0</div></div></div></div>'
      + '  <div class="col-md-4"><div class="card"><div class="card-body"><h6>التسديدات</h6><div id="repPays" class="currency">0</div></div></div></div>'
      + '  <div class="col-md-4"><div class="card"><div class="card-body"><h6>المصروفات</h6><div id="repExps" class="currency">0</div></div></div></div>'
      + '</div>';
    const today = ($dates?$dates.today():new Date().toISOString().slice(0,10)); const start = today.slice(0,8)+'01';
    document.getElementById('repFrom').value=start; document.getElementById('repTo').value=today;
    document.getElementById('applyRep').addEventListener('click', update);
    document.getElementById('expJson').addEventListener('click', ()=> exportData('json'));
    document.getElementById('expXlsx').addEventListener('click', ()=> exportData('xlsx'));
    document.getElementById('expTxt').addEventListener('click', ()=> exportData('txt'));
    update();
  }
  function getRange(){ const f=($dates?$dates.formatDateEn(document.getElementById('repFrom').value):document.getElementById('repFrom').value); const t=($dates?$dates.formatDateEn(document.getElementById('repTo').value):document.getElementById('repTo').value); return {from:f,to:t}; }
  function inRange(d,r){ const x=($dates?$dates.formatDateEn(d):d); return (!r.from||x>=r.from)&&(!r.to||x<=r.to); }
  function update(){
    const r = getRange();
    const sales = ($state.sales||[]).filter(s=> inRange(s.date,r));
    const pays = ($state.payments||[]).filter(p=> inRange(p.date,r));
    const exps = ($state.expenses||[]).filter(e=> inRange(e.date,r));
    const ts = sales.reduce((a,s)=> a + (Number(s.total)||0), 0);
    const tp = pays.reduce((a,p)=> a + (Number(p.amount)||0), 0);
    const te = exps.reduce((a,e)=> a + (Number(e.amount)||0), 0);
    document.getElementById('repSales').textContent = ts.toLocaleString('en-US');
    document.getElementById('repPays').textContent = tp.toLocaleString('en-US');
    document.getElementById('repExps').textContent = te.toLocaleString('en-US');
    document.getElementById('repSummary').innerHTML = `<div class="alert ${tp-te>=0?'alert-success':'alert-danger'}">الصافي: <b class="currency">${(tp-te).toLocaleString('en-US')}</b></div>`;
  }
  function exportData(fmt){ const r=getRange(); const data={ range:r, sales:($state.sales||[]).filter(s=> inRange(s.date,r)), payments:($state.payments||[]).filter(p=> inRange(p.date,r)), expenses:($state.expenses||[]).filter(e=> inRange(e.date,r)) };
    if (fmt==='json'){ const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='reports_v1r.json'; a.click(); }
    else if (fmt==='txt'){ let txt = `تقارير ${r.from||''} إلى ${r.to||''}\n`; txt += `المبيعات: ${data.sales.reduce((a,s)=>a+(s.total||0),0)}\nالتسديدات: ${data.payments.reduce((a,p)=>a+(p.amount||0),0)}\nالمصروفات: ${data.expenses.reduce((a,e)=>a+(e.amount||0),0)}\n`; const blob=new Blob([txt],{type:'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='reports_v1r.txt'; a.click(); }
    else if (fmt==='xlsx'){ const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.sales), 'Sales'); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.payments), 'Payments'); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.expenses), 'Expenses'); XLSX.writeFile(wb, `reports_${(r.from||'')}_${(r.to||'')}.xlsx`); }
  }
  window.$reportsView = { render };
})();