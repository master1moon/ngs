(function(){
  'use strict';
  const rootId = 'packagesView';
  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">إضافة باقة</h5>'
      + '<div class="row g-2 align-items-end">'
      + '  <div class="col-md-3"><input id="pkgName" class="form-control" placeholder="اسم الباقة"></div>'
      + '  <div class="col-md-2"><input id="pkgRetail" class="form-control" placeholder="سعر القطاعي"></div>'
      + '  <div class="col-md-2"><input id="pkgWholesale" class="form-control" placeholder="سعر الجملة"></div>'
      + '  <div class="col-md-2"><input id="pkgDistributor" class="form-control" placeholder="سعر الموزع"></div>'
      + '  <div class="col-md-2"><input id="packageDate" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-1"><button id="addPkgBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '</div></div>'
      + '<div class="table-responsive mt-3">\n'
      + '  <table class="table table-sm align-middle"><thead><tr><th>الاسم</th><th>قطاعي</th><th>جملة</th><th>موزع</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody id="pkgTable"></tbody></table>'
      + '</div>';
    document.getElementById('addPkgBtn').addEventListener('click', onAdd);
    renderRows();
  }
  function renderRows(){
    const tb = document.getElementById('pkgTable'); if (!tb) return; tb.innerHTML='';
    for (const p of ($state.packages||[])){
      const tr = document.createElement('tr');
      tr.innerHTML = '<td class="cell-name">'+(p.name||'')+'</td>'
                   + '<td class="currency">'+ Number(p.retailPrice||0).toLocaleString('en-US') +'</td>'
                   + '<td class="currency">'+ Number(p.wholesalePrice||0).toLocaleString('en-US') +'</td>'
                   + '<td class="currency">'+ Number(p.distributorPrice||0).toLocaleString('en-US') +'</td>'
                   + '<td>'+ (p.createdAt||'') +'</td>'
                   + '<td><button class="btn btn-sm btn-outline-secondary me-1 edit">تعديل</button><button class="btn btn-sm btn-outline-danger" data-id="'+p.id+'">حذف</button></td>';
      tr.querySelector('.edit').addEventListener('click', ()=> startEdit(tr, p));
      tr.querySelector('.btn-outline-danger').addEventListener('click', ()=> onDelete(p.id));
      tb.appendChild(tr);
    }
  }
  function startEdit(tr, p){
    tr.innerHTML='';
    const tdName=document.createElement('td'); const inName=document.createElement('input'); inName.className='form-control'; inName.value=p.name||''; tdName.appendChild(inName);
    const tdRetail=document.createElement('td'); const inRetail=document.createElement('input'); inRetail.className='form-control'; inRetail.value=Number(p.retailPrice||0); tdRetail.appendChild(inRetail);
    const tdWh=document.createElement('td'); const inWh=document.createElement('input'); inWh.className='form-control'; inWh.value=Number(p.wholesalePrice||0); tdWh.appendChild(inWh);
    const tdDist=document.createElement('td'); const inDist=document.createElement('input'); inDist.className='form-control'; inDist.value=Number(p.distributorPrice||0); tdDist.appendChild(inDist);
    const tdDate=document.createElement('td'); const inDate=document.createElement('input'); inDate.type='date'; inDate.className='form-control'; inDate.value=p.createdAt||''; tdDate.appendChild(inDate);
    const tdAct=document.createElement('td'); const bSave=document.createElement('button'); bSave.className='btn btn-sm btn-primary me-1'; bSave.textContent='حفظ'; const bCancel=document.createElement('button'); bCancel.className='btn btn-sm btn-secondary'; bCancel.textContent='إلغاء'; tdAct.appendChild(bSave); tdAct.appendChild(bCancel);
    tr.appendChild(tdName); tr.appendChild(tdRetail); tr.appendChild(tdWh); tr.appendChild(tdDist); tr.appendChild(tdDate); tr.appendChild(tdAct);
    bSave.addEventListener('click', ()=>{ const t=($state.packages||[]).find(x=> x.id===p.id); if (!t) return; t.name=inName.value.trim(); t.retailPrice=Number(String(inRetail.value).replace(/,/g,''))||0; t.wholesalePrice=Number(String(inWh.value).replace(/,/g,''))||0; t.distributorPrice=Number(String(inDist.value).replace(/,/g,''))||0; t.createdAt = ($dates?$dates.formatDateEn(inDate.value):inDate.value); $app.emitChange(); });
    bCancel.addEventListener('click', renderRows);
  }
  function onAdd(){
    const name = document.getElementById('pkgName').value.trim();
    const retail = Number((document.getElementById('pkgRetail').value||'').replace(/,/g,''))||0;
    const wh = Number((document.getElementById('pkgWholesale').value||'').replace(/,/g,''))||0;
    const dist = Number((document.getElementById('pkgDistributor').value||'').replace(/,/g,''))||0;
    const date = ($dates?$dates.formatDateEn(document.getElementById('packageDate').value):document.getElementById('packageDate').value) || ($dates?$dates.today():new Date().toISOString().slice(0,10));
    if (!name){ alert('أدخل اسم الباقة'); return; }
    $state.packages.push({ id:'pkg_'+Date.now(), name, retailPrice:retail, wholesalePrice:wh, distributorPrice:dist, createdAt:date });
    document.getElementById('pkgName').value=''; document.getElementById('pkgRetail').value=''; document.getElementById('pkgWholesale').value=''; document.getElementById('pkgDistributor').value=''; document.getElementById('packageDate').value='';
    $app.emitChange();
  }
  function onDelete(id){ if (!confirm('حذف هذه الباقة؟')) return; $state.packages = ($state.packages||[]).filter(x=> x.id!==id); $app.emitChange(); }
  window.$packagesView = { render };
})();