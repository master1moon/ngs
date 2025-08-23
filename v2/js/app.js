(function(){
  'use strict';
  function emitChange(){ document.dispatchEvent(new CustomEvent('state:changed')); }

  document.addEventListener('DOMContentLoaded', function(){
    if (typeof $storage !== 'undefined') { $storage.load(); }
    document.querySelectorAll('input[type="date"]').forEach(inp=>{ inp.setAttribute('lang','en'); inp.style.direction='ltr'; inp.placeholder='YYYY-MM-DD'; });
    document.addEventListener('state:changed', function(){
      document.querySelectorAll('input[type="date"]').forEach(inp=>{ inp.setAttribute('lang','en'); inp.style.direction='ltr'; inp.placeholder='YYYY-MM-DD'; });
    });

    // import/export UI
    const bar = document.createElement('div'); bar.className='d-flex gap-2 my-3';
    bar.innerHTML = '<input type="file" id="importFile" accept="application/json" class="form-control" style="max-width:360px">'
                  + '<button id="btnImport" class="btn btn-outline-primary">استيراد JSON</button>'
                  + '<button id="btnExport" class="btn btn-outline-secondary">تصدير JSON</button>';
    const container = document.querySelector('.container-fluid'); if (container) container.insertBefore(bar, container.firstChild.nextSibling);

    document.getElementById('btnImport').addEventListener('click', async ()=>{
      const f = document.getElementById('importFile').files[0]; if (!f) { alert('اختر ملف JSON'); return; }
      const txt = await f.text();
      try {
        const obj = JSON.parse(txt);
        // map from v1 if needed
        const mapped = mapFromV1(obj);
        Object.assign($state, mapped);
        $storage.save(); emitChange();
        alert('تم الاستيراد بنجاح');
      } catch(e){ alert('ملف غير صالح'); }
    });
    document.getElementById('btnExport').addEventListener('click', ()=>{
      const blob = new Blob([JSON.stringify($state, null, 2)], {type:'application/json'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'backup_v2.json'; a.click();
    });

    // auto refresh on state changes
    document.addEventListener('state:changed', ()=>{ try{ $engine.recomputeAll(); }catch(_){}});
  });

  function mapFromV1(obj){
    if (!obj || typeof obj !== 'object') return { packages:[], inventory:[], stores:[], sales:[], payments:[], expenses:[] };
    function fd(x){ return ($dates && $dates.formatDateEn) ? $dates.formatDateEn(x) : (x||'').slice(0,10); }
    return {
      packages: (obj.packages||[]).map(p=>({ id: p.id||('pkg_'+Date.now()), name: p.name||'', retailPrice: Number(p.retailPrice)||0, createdAt: fd(p.createdAt) })),
      inventory: (obj.inventory||[]).map(i=>({ id: i.id||('inv_'+Date.now()), packageId: i.packageId||'', quantity: Number(i.quantity)||0, createdAt: fd(i.createdAt) })),
      stores: (obj.stores||[]).map(s=>({ id: s.id||('store_'+Date.now()), name: s.name||'', priceType: s.priceType||'retail', createdAt: fd(s.createdAt) })),
      sales: (obj.sales||[]).map(s=>({ id: s.id||('sale_'+Date.now()), storeId: s.storeId||'', total: Number(s.total|| (Number(s.quantity||0)*Number(s.pricePerUnit||0)))||0, date: fd(s.date) })),
      payments: (obj.payments||[]).map(p=>({ id: p.id||('pay_'+Date.now()), storeId: p.storeId||'', amount: Number(p.amount)||0, date: fd(p.date) })),
      expenses: (obj.expenses||[]).map(e=>({ id: e.id||('exp_'+Date.now()), type: e.type||'', amount: Number(e.amount)||0, date: fd(e.date) }))
    };
  }
})();