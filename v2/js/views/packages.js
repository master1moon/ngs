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
      + '  <div class="col-md-3"><input id="pkgWholesale" class="form-control" placeholder="سعر الجملة"></div>'
      + '  <div class="col-md-3"><input id="pkgDistributor" class="form-control" placeholder="سعر الموزع"></div>'
      + '</div>'
      + '<div class="row g-2 mt-2">'
      + '  <div class="col-md-3"><input id="packageDate" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-3"><button id="addPkgBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '  <div class="col-md-6 text-end"><input id="pkgSearch" class="form-control" placeholder="بحث في الباقات"></div>'
      + '</div>'
      + '</div></div>'
      + '<div class="table-responsive mt-3">'
      + '  <table class="table table-sm align-middle"><thead><tr><th>الاسم</th><th>قطاعي</th><th>جملة</th><th>موزع</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody id="pkgTable"></tbody></table>'
      + '</div>';

    if (window.$dates && $dates.PackageDate) $dates.PackageDate.set('');
    document.getElementById('addPkgBtn').addEventListener('click', onAdd);
    document.getElementById('pkgSearch').addEventListener('input', renderRows);
    renderRows();
  }

  function renderRows(){
    const tb = document.getElementById('pkgTable'); if (!tb) return; tb.innerHTML='';
    const q = (document.getElementById('pkgSearch')?.value||'').toLowerCase();
    let list = window.$state.packages||[];
    if (q) list = list.filter(p=> [p.name||'', String(p.retailPrice||''), String(p.wholesalePrice||''), String(p.distributorPrice||''), p.createdAt||''].join(' ').toLowerCase().includes(q));
    for (const p of list){
      const tr = document.createElement('tr');
      tr.innerHTML = '<td class="cell-name">'+ (p.name||'') +'</td>'
                   + '<td class="cell-retail currency">'+ Number(p.retailPrice||0).toLocaleString('en-US') +'</td>'
                   + '<td class="cell-wholesale currency">'+ Number(p.wholesalePrice||0).toLocaleString('en-US') +'</td>'
                   + '<td class="cell-distributor currency">'+ Number(p.distributorPrice||0).toLocaleString('en-US') +'</td>'
                   + '<td class="cell-date">'+ (p.createdAt||'') +'</td>'
                   + '<td><button class="btn btn-sm btn-outline-secondary me-1 edit">تعديل</button><button class="btn btn-sm btn-outline-danger" data-id="'+p.id+'">حذف</button></td>';
      tr.querySelector('.edit').addEventListener('click', ()=> startEdit(tr, p));
      tr.querySelector('.btn-outline-danger').addEventListener('click', ()=> onDelete(p.id));
      tb.appendChild(tr);
    }
  }

  function startEdit(tr, p){
    tr.innerHTML = '';
    const tdName = document.createElement('td'); const inName = document.createElement('input'); inName.className='form-control'; inName.value = p.name||''; tdName.appendChild(inName);
    const tdRetail = document.createElement('td'); const inRetail = document.createElement('input'); inRetail.className='form-control'; inRetail.value = Number(p.retailPrice||0); tdRetail.appendChild(inRetail);
    const tdWholesale = document.createElement('td'); const inWholesale = document.createElement('input'); inWholesale.className='form-control'; inWholesale.value = Number(p.wholesalePrice||0); tdWholesale.appendChild(inWholesale);
    const tdDistributor = document.createElement('td'); const inDistributor = document.createElement('input'); inDistributor.className='form-control'; inDistributor.value = Number(p.distributorPrice||0); tdDistributor.appendChild(inDistributor);
    const tdDate = document.createElement('td'); const inDate = document.createElement('input'); inDate.type='date'; inDate.className='form-control'; inDate.value = p.createdAt||''; tdDate.appendChild(inDate);
    const tdAct = document.createElement('td'); const bSave=document.createElement('button'); bSave.className='btn btn-sm btn-primary me-1'; bSave.textContent='حفظ'; const bCancel=document.createElement('button'); bCancel.className='btn btn-sm btn-secondary'; bCancel.textContent='إلغاء'; tdAct.appendChild(bSave); tdAct.appendChild(bCancel);
    tr.appendChild(tdName); tr.appendChild(tdRetail); tr.appendChild(tdWholesale); tr.appendChild(tdDistributor); tr.appendChild(tdDate); tr.appendChild(tdAct);
    bSave.addEventListener('click', ()=>{
      const target = $state.packages.find(x=> x.id===p.id); if (!target) return;
      target.name = inName.value.trim(); target.retailPrice = Number(String(inRetail.value).replace(/,/g,''))||0; target.wholesalePrice = Number(String(inWholesale.value).replace(/,/g,''))||0; target.distributorPrice = Number(String(inDistributor.value).replace(/,/g,''))||0; target.createdAt = ($dates?$dates.formatDateEn(inDate.value):inDate.value);
      $storage.save(); renderRows(); document.dispatchEvent(new CustomEvent('state:changed'));
    });
    bCancel.addEventListener('click', renderRows);
  }

  function onAdd(){
    const name = document.getElementById('pkgName').value.trim();
    const retail = Number((document.getElementById('pkgRetail').value||'').replace(/,/g,''))||0;
    const wholesale = Number((document.getElementById('pkgWholesale').value||'').replace(/,/g,''))||0;
    const distributor = Number((document.getElementById('pkgDistributor').value||'').replace(/,/g,''))||0;
    let date = (window.$dates && $dates.PackageDate) ? $dates.PackageDate.read() : document.getElementById('packageDate').value; if (!date && $dates && $dates.today) date = $dates.today();
    if (!name){ alert('أدخل اسم الباقة'); return; }
    window.$state.packages.push({ id: 'pkg_'+Date.now(), name, retailPrice: retail, wholesalePrice: wholesale, distributorPrice: distributor, createdAt: date });
    window.$storage.save();
    document.getElementById('pkgName').value=''; document.getElementById('pkgRetail').value=''; document.getElementById('pkgWholesale').value=''; document.getElementById('pkgDistributor').value=''; if ($dates && $dates.PackageDate) $dates.PackageDate.set('');
    renderRows();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }

  function onDelete(id){
    if (!confirm('حذف هذه الباقة؟')) return;
    const pkg = ($state.packages||[]).find(x=> x.id===id);
    const referenced = ($state.inventory||[]).some(i=> String(i.packageId)===String(id)) || ($state.sales||[]).some(s=> String(s.packageId)===String(id));
    if (referenced){ alert('لا يمكن حذف الباقة لوجود سجلات مرتبطة بها'); return; }
    if (pkg && window.$trash) { try{ $trash.push('packages', pkg); }catch(_){}}
    window.$state.packages = window.$state.packages.filter(x=> x.id!==id);
    window.$storage.save();
    renderRows();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }

  document.addEventListener('DOMContentLoaded', render);
})();