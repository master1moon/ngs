(function(){
  'use strict';
  const rootId = 'packagesView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">إضافة باقة</h5>'
      + '<div class="row g-2">'
      + '  <div class="col-md-3"><input id="pkgName" class="form-control" placeholder="اسم الباقة"></div>'
      + '  <div class="col-md-3"><input id="pkgRetail" class="form-control" placeholder="سعر القطاعي"></div>'
      + '  <div class="col-md-3"><input id="packageDate" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-3"><button id="addPkgBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '</div></div>'
      + '<div class="table-responsive mt-3">'
      + '  <table class="table table-sm align-middle"><thead><tr><th>الاسم</th><th>السعر</th><th>التاريخ</th></tr></thead><tbody id="pkgTable"></tbody></table>'
      + '</div>';

    if (window.$dates && $dates.PackageDate) $dates.PackageDate.set('');
    document.getElementById('addPkgBtn').addEventListener('click', onAdd);
    renderRows();
  }

  function renderRows(){
    const tb = document.getElementById('pkgTable'); if (!tb) return; tb.innerHTML='';
    for (const p of window.$state.packages){
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>'+ (p.name||'') +'</td>'
                   + '<td class="currency">'+ Number(p.retailPrice||0).toLocaleString('en-US') +'</td>'
                   + '<td>'+ (p.createdAt||'') +'</td>';
      tb.appendChild(tr);
    }
  }

  function onAdd(){
    const name = document.getElementById('pkgName').value.trim();
    const retail = Number((document.getElementById('pkgRetail').value||'').replace(/,/g,''))||0;
    const date = (window.$dates && $dates.PackageDate) ? $dates.PackageDate.read() : document.getElementById('packageDate').value;
    if (!name){ alert('أدخل اسم الباقة'); return; }
    window.$state.packages.push({ id: 'pkg_'+Date.now(), name, retailPrice: retail, createdAt: date });
    window.$storage.save();
    document.getElementById('pkgName').value=''; document.getElementById('pkgRetail').value=''; if ($dates && $dates.PackageDate) $dates.PackageDate.set('');
    renderRows();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }

  document.addEventListener('DOMContentLoaded', render);
})();