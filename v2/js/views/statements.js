(function(){
  'use strict';
  const rootId = 'statementsView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    const storeOptions = ($state.stores||[]).map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">كشف حساب محل</h5>'
      + '<div class="row g-2 align-items-end">'
      + `  <div class="col-md-3"><label class="form-label">المحل</label><select id="stStore" class="form-select"><option value="">اختر المحل</option>${storeOptions}</select></div>`
      + '  <div class="col-md-3"><label class="form-label">من</label><input type="date" id="stFrom" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-3"><label class="form-label">إلى</label><input type="date" id="stTo" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-3 d-flex gap-2"><button id="stApply" class="btn btn-primary w-100">تطبيق</button><button id="stExport" class="btn btn-outline-secondary w-100">تصدير TXT</button><button id="stPrint" class="btn btn-outline-dark w-100">طباعة</button></div>'
      + '</div>'
      + '<div class="mt-3" id="stSummary"></div>'
      + '</div></div>'
      + '<div class="table-responsive mt-3">\n'
      + '  <table class="table table-sm align-middle"><thead><tr><th>النوع</th><th>المبلغ</th><th>التاريخ</th></tr></thead><tbody id="stTable"></tbody></table>'
      + '</div>';

    const today = ($dates && $dates.today)? $dates.today(): (new Date()).toISOString().slice(0,10);
    const monthStart = (typeof moment!=='undefined') ? moment().startOf('month').format('YYYY-MM-DD') : today.slice(0,8)+'01';
    document.getElementById('stFrom').value = monthStart;
    document.getElementById('stTo').value = today;

    document.getElementById('stApply').addEventListener('click', update);
    document.getElementById('stExport').addEventListener('click', exportTxt);
    document.getElementById('stPrint').addEventListener('click', printStatement);

    update();
  }

  function getRange(){
    const f = document.getElementById('stFrom').value; const t = document.getElementById('stTo').value;
    const fd = ($dates && $dates.formatDateEn) ? $dates.formatDateEn(f) : f;
    const td = ($dates && $dates.formatDateEn) ? $dates.formatDateEn(t) : t;
    return { from: fd, to: td };
  }
  function inRange(d, r){ const x = ($dates && $dates.formatDateEn) ? $dates.formatDateEn(d) : d; return (!r.from||x>=r.from)&&(!r.to||x<=r.to); }

  function update(){
    const storeId = document.getElementById('stStore').value;
    const r = getRange();
    const sales = ($state.sales||[]).filter(s=> String(s.storeId)===String(storeId) && inRange(s.date, r));
    const pays = ($state.payments||[]).filter(p=> String(p.storeId)===String(storeId) && inRange(p.date, r));
    const rows = [];
    for (const s of sales){ rows.push({ type:'بيع', amount: Number(s.total)||0, date: s.date||'' }); }
    for (const p of pays){ rows.push({ type:'تسديد', amount: -1*(Number(p.amount)||0), date: p.date||'' }); }
    rows.sort((a,b)=> String(a.date).localeCompare(String(b.date)));
    const total = rows.reduce((a,x)=> a + (x.amount||0), 0);

    document.getElementById('stSummary').innerHTML = `الرصيد ضمن الفترة: <b class="currency">${total.toLocaleString('en-US')}</b>`;
    const tb = document.getElementById('stTable'); tb.innerHTML = rows.map(r=> `<tr><td>${r.type}</td><td class="currency">${(r.amount||0).toLocaleString('en-US')}</td><td>${r.date}</td></tr>`).join('');
  }

  function exportTxt(){
    const storeId = document.getElementById('stStore').value; const store = ($state.stores||[]).find(s=> String(s.id)===String(storeId));
    const r = getRange();
    const sales = ($state.sales||[]).filter(s=> String(s.storeId)===String(storeId) && inRange(s.date, r));
    const pays = ($state.payments||[]).filter(p=> String(p.storeId)===String(storeId) && inRange(p.date, r));
    const lines = [];
    lines.push(`كشف حساب: ${store?store.name:storeId}`);
    lines.push(`الفترة: ${r.from||''} إلى ${r.to||''}`);
    for (const s of sales){ lines.push(`بيع\t${s.total}\t${s.date||''}`); }
    for (const p of pays){ lines.push(`تسديد\t-${p.amount}\t${p.date||''}`); }
    const txt = lines.join('\n');
    const blob = new Blob([txt], {type:'text/plain'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'statement.txt'; a.click();
  }

  function printStatement(){
    const r = getRange();
    const w = window.open('', '_blank');
    w.document.write('<html dir="rtl" lang="ar"><head><title>طباعة كشف حساب</title><style>body{font-family:Arial;padding:16px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:6px;text-align:right}</style></head><body>');
    w.document.write('<h3>كشف حساب</h3>');
    w.document.write('<div>'+document.getElementById('stSummary').innerHTML+'</div>');
    w.document.write('<div>'+document.querySelector('#statementsView .table-responsive').innerHTML+'</div>');
    w.document.write('</body></html>');
    w.document.close(); w.focus(); w.print();
  }

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('state:changed', render);
})();