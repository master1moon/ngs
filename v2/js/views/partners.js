(function(){
  'use strict';
  const rootId = 'partnersView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">الشركاء</h5>'
      + '<div class="row g-2">'
      + '  <div class="col-md-4"><input id="partnerName" class="form-control" placeholder="اسم الشريك"></div>'
      + '  <div class="col-md-3"><input id="partnerWeight" class="form-control" placeholder="الوزن (نسبة أو نقاط)"></div>'
      + '  <div class="col-md-3"><button id="addPartnerBtn" class="btn btn-primary w-100">إضافة شريك</button></div>'
      + '</div>'
      + '<div class="table-responsive mt-3"><table class="table table-sm"><thead><tr><th>الشريك</th><th>الوزن</th><th>إجراءات</th></tr></thead><tbody id="partnersList"></tbody></table></div>'
      + '</div></div>'
      + '<div class="card mt-3"><div class="card-body">\n'
      + '<h6 class="mb-2">توزيع الأرباح حسب الفترة</h6>'
      + '<div class="row g-2 align-items-end">'
      + '  <div class="col-md-3"><label class="form-label">من</label><input type="date" id="prFrom" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-3"><label class="form-label">إلى</label><input type="date" id="prTo" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-3 d-flex gap-2"><button id="applySplit" class="btn btn-primary w-100">حساب</button><button id="exportPartners" class="btn btn-outline-secondary w-100">تصدير JSON</button><button id="printPartners" class="btn btn-outline-dark w-100">طباعة</button></div>'
      + '</div>'
      + '<div class="mt-3" id="partnersSummary"></div>'
      + '<div class="table-responsive mt-2"><table class="table table-sm"><thead><tr><th>الشريك</th><th>الوزن</th><th>النصيب</th></tr></thead><tbody id="partnersTable"></tbody></table></div>'
      + '</div></div>';

    document.getElementById('addPartnerBtn').addEventListener('click', onAdd);
    document.getElementById('applySplit').addEventListener('click', updateSplit);
    document.getElementById('exportPartners').addEventListener('click', exportJson);
    document.getElementById('printPartners').addEventListener('click', printPartners);

    const today = ($dates && $dates.today)? $dates.today(): (new Date()).toISOString().slice(0,10);
    const monthStart = (typeof moment!=='undefined') ? moment().startOf('month').format('YYYY-MM-DD') : today.slice(0,8)+'01';
    document.getElementById('prFrom').value = monthStart;
    document.getElementById('prTo').value = today;

    renderList();
    updateSplit();
  }

  function renderList(){
    const tb = document.getElementById('partnersList'); if (!tb) return; tb.innerHTML='';
    for (const p of ($state.partners||[])){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${p.name}</td><td>${p.weight}</td><td><button class="btn btn-sm btn-outline-danger" data-id="${p.id}">حذف</button></td>`;
      tr.querySelector('button').addEventListener('click', ()=> onDelete(p.id));
      tb.appendChild(tr);
    }
  }

  function onAdd(){
    const name = document.getElementById('partnerName').value.trim();
    const weight = Number((document.getElementById('partnerWeight').value||'').replace(/,/g,''))||0;
    if (!name || weight<=0){ alert('أدخل اسم ووزن صحيح'); return; }
    $state.partners.push({ id: 'pr_'+Date.now(), name, weight });
    $storage.save();
    document.getElementById('partnerName').value=''; document.getElementById('partnerWeight').value='';
    document.dispatchEvent(new CustomEvent('state:changed'));
    updateSplit();
  }

  function onDelete(id){
    if (!confirm('حذف هذا الشريك؟')) return;
    $state.partners = ($state.partners||[]).filter(x=> x.id!==id);
    $storage.save();
    renderList();
    updateSplit();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }

  function getRange(){
    const f = document.getElementById('prFrom').value; const t = document.getElementById('prTo').value;
    const fd = ($dates && $dates.formatDateEn) ? $dates.formatDateEn(f) : f;
    const td = ($dates && $dates.formatDateEn) ? $dates.formatDateEn(t) : t;
    return { from: fd, to: td };
  }
  function inRange(d, r){ const x = ($dates && $dates.formatDateEn) ? $dates.formatDateEn(d) : d; return (!r.from||x>=r.from)&&(!r.to||x<=r.to); }

  function updateSplit(){
    const r = getRange();
    const sales = ($state.sales||[]).filter(s=> inRange(s.date, r));
    const pays = ($state.payments||[]).filter(p=> inRange(p.date, r));
    const exps = ($state.expenses||[]).filter(e=> inRange(e.date, r));
    const totalSales = sales.reduce((a,s)=> a + (Number(s.total)||0), 0);
    const totalPays = pays.reduce((a,p)=> a + (Number(p.amount)||0), 0);
    const totalExps = exps.reduce((a,e)=> a + (Number(e.amount)||0), 0);
    const net = totalSales - totalPays - totalExps;
    const weights = ($state.partners||[]).map(p=> Number(p.weight)||0);
    const sumW = weights.reduce((a,x)=> a + x, 0) || 1;
    const rows = ($state.partners||[]).map(p=> ({ name: p.name, weight: p.weight, share: net * ((Number(p.weight)||0)/sumW) }));

    document.getElementById('partnersSummary').innerHTML = `الصافي للفترة: <b class="currency">${net.toLocaleString('en-US')}</b> | مجموع الأوزان: ${sumW}`;
    const tb = document.getElementById('partnersTable');
    tb.innerHTML = rows.map(r=> `<tr><td>${r.name}</td><td>${r.weight}</td><td class="currency">${r.share.toLocaleString('en-US')}</td></tr>`).join('');
  }

  function exportJson(){
    const r = getRange();
    const data = { range: r, partners: $state.partners||[], split: Array.from(document.querySelectorAll('#partnersTable tbody tr')).map(tr => ({ name: tr.children[0].textContent, weight: tr.children[1].textContent, share: tr.children[2].textContent })) };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'partners_split.json'; a.click();
  }

  function printPartners(){
    const r = getRange();
    const w = window.open('', '_blank');
    w.document.write('<html dir="rtl" lang="ar"><head><title>طباعة توزيع الشركاء</title><style>body{font-family:Arial;padding:16px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:6px;text-align:right}</style></head><body>');
    w.document.write('<h3>توزيع الشركاء '+(r.from||'')+' إلى '+(r.to||'')+'</h3>');
    w.document.write('<div>'+document.getElementById('partnersSummary').innerHTML+'</div>');
    w.document.write('<div>'+document.querySelector('#partnersView .table-responsive').innerHTML+'</div>');
    w.document.write('</body></html>');
    w.document.close(); w.focus(); w.print();
  }

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('state:changed', render);
})();