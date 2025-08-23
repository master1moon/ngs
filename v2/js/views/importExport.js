(function(){
  'use strict';
  const rootId = 'importExportView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">الاستيراد والتصدير</h5>'
      + '<div class="row g-2 align-items-end">'
      + '  <div class="col-md-4"><label class="form-label">نوع البيانات</label><select id="ieType" class="form-select"><option value="all">جميع البيانات</option><option value="packages">الباقات</option><option value="inventory">المخزون</option><option value="sales">المبيعات</option><option value="stores">المحلات</option><option value="payments">التسديدات</option><option value="expenses">المصروفات</option><option value="partners">الشركاء</option></select></div>'
      + '  <div class="col-md-4"><label class="form-label">الصيغة</label><select id="ieFormat" class="form-select"><option value="json">JSON</option><option value="excel">Excel</option><option value="txt">TXT</option></select></div>'
      + '  <div class="col-md-4"><button id="btnIEExport" class="btn btn-success w-100">تصدير</button></div>'
      + '</div>'
      + '<div class="row g-2 align-items-end mt-2">'
      + '  <div class="col-md-3"><label class="form-label">من</label><input type="date" id="ieFrom" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-3"><label class="form-label">إلى</label><input type="date" id="ieTo" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-6 d-flex gap-2"><input type="file" id="ieFile" class="form-control" accept="application/json"><button id="btnIEImport" class="btn btn-primary">استيراد JSON</button></div>'
      + '</div>'
      + '</div></div>';

    if ($dates){ $dates.SaleDate?.set(''); }
    document.getElementById('btnIEExport').addEventListener('click', onExport);
    document.getElementById('btnIEImport').addEventListener('click', onImport);
  }

  function getRange(){
    const f = document.getElementById('ieFrom').value; const t = document.getElementById('ieTo').value;
    const fd = ($dates&&$dates.formatDateEn)? $dates.formatDateEn(f): f; const td = ($dates&&$dates.formatDateEn)? $dates.formatDateEn(t): t; return {from:fd, to:td};
  }
  function inRange(d, r){ const x = ($dates&&$dates.formatDateEn)? $dates.formatDateEn(d): d; return (!r.from||x>=r.from)&&(!r.to||x<=r.to); }

  function onExport(){
    const type = document.getElementById('ieType').value; const fmt = document.getElementById('ieFormat').value; const r = getRange();
    const all = JSON.parse(JSON.stringify($state||{}));
    function filterArr(arr, key){ if (!r.from && !r.to) return arr; return (arr||[]).filter(x=> inRange(x[key], r)); }
    const dataByType = {
      packages: all.packages||[],
      inventory: filterArr(all.inventory||[], 'createdAt'),
      stores: all.stores||[],
      sales: filterArr(all.sales||[], 'date'),
      payments: filterArr(all.payments||[], 'date'),
      expenses: filterArr(all.expenses||[], 'date'),
      partners: all.partners||[]
    };
    if (fmt==='json'){
      const out = (type==='all') ? all : dataByType[type]||[];
      const blob = new Blob([JSON.stringify(out,null,2)], {type:'application/json'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (type==='all'?'backup_all':'export_'+type)+'.json'; a.click();
      return;
    }
    if (fmt==='txt'){
      if (type==='all'){ alert('صيغة TXT تدعم نوعًا واحدًا في كل مرة'); return; }
      const arr = dataByType[type]||[]; const lines = arr.map(x=> JSON.stringify(x));
      const blob = new Blob([lines.join('\n')], {type:'text/plain'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'export_'+type+'.txt'; a.click(); return;
    }
    if (fmt==='excel'){
      const wb = XLSX.utils.book_new();
      if (type==='all'){
        Object.entries(dataByType).forEach(([k, arr])=>{ const ws = XLSX.utils.json_to_sheet(arr); XLSX.utils.book_append_sheet(wb, ws, k.substring(0,31)); });
        XLSX.writeFile(wb, 'export_all.xlsx');
      } else {
        const ws = XLSX.utils.json_to_sheet(dataByType[type]||[]); XLSX.utils.book_append_sheet(wb, ws, type.substring(0,31)); XLSX.writeFile(wb, 'export_'+type+'.xlsx');
      }
    }
  }

  async function onImport(){
    const file = document.getElementById('ieFile').files[0]; if (!file){ alert('اختر ملف JSON'); return; }
    const txt = await file.text();
    try{
      const obj = JSON.parse(txt);
      const mapped = mapFromV1(obj);
      Object.assign($state, mapped);
      $storage.save();
      document.dispatchEvent(new CustomEvent('state:changed'));
      alert('تم الاستيراد');
    }catch(_){ alert('ملف غير صالح'); }
  }

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('state:changed', render);
})();