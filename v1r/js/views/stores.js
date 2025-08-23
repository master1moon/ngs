(function(){
  'use strict';
  const rootId = 'storesView';
  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">المحلات</h5>'
      + '<div class="row g-2 align-items-end">'
      + '  <div class="col-md-4"><input id="storeName" class="form-control" placeholder="اسم المحل"></div>'
      + '  <div class="col-md-3"><select id="storePriceType" class="form-select"><option value="retail">قطاعي</option><option value="wholesale">جملة</option><option value="distributor">موزع</option></select></div>'
      + '  <div class="col-md-3"><input id="storeDate" type="date" class="form-control" placeholder="YYYY-MM-DD"></div>'
      + '  <div class="col-md-2"><button id="addStoreBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '</div></div>'
      + '<div class="table-responsive mt-3"><table class="table table-sm align-middle"><thead><tr><th>الاسم</th><th>نوع السعر</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody id="storesTable"></tbody></table></div>';
    document.getElementById('addStoreBtn').addEventListener('click', onAdd);
    renderRows();
  }
  function renderRows(){
    const tb = document.getElementById('storesTable'); if (!tb) return; tb.innerHTML='';
    for (const s of ($state.stores||[])){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="cell-name">${s.name||''}</td><td>${s.priceType||'retail'}</td><td>${s.createdAt||''}</td><td><button class="btn btn-sm btn-outline-secondary me-1 edit">تعديل</button><button class="btn btn-sm btn-outline-danger">حذف</button></td>`;
      tr.querySelector('.edit').addEventListener('click', ()=> startEdit(tr, s));
      tr.querySelector('.btn-outline-danger').addEventListener('click', ()=> onDelete(s.id));
      tb.appendChild(tr);
    }
  }
  function startEdit(tr, s){
    tr.innerHTML='';
    const tdName=document.createElement('td'); const inName=document.createElement('input'); inName.className='form-control'; inName.value=s.name||''; tdName.appendChild(inName);
    const tdType=document.createElement('td'); const sel=document.createElement('select'); sel.className='form-select'; sel.innerHTML='<option value="retail">قطاعي</option><option value="wholesale">جملة</option><option value="distributor">موزع</option>'; sel.value=s.priceType||'retail'; tdType.appendChild(sel);
    const tdDate=document.createElement('td'); const inDate=document.createElement('input'); inDate.type='date'; inDate.className='form-control'; inDate.value=s.createdAt||''; tdDate.appendChild(inDate);
    const tdAct=document.createElement('td'); const bSave=document.createElement('button'); bSave.className='btn btn-sm btn-primary me-1'; bSave.textContent='حفظ'; const bCancel=document.createElement('button'); bCancel.className='btn btn-sm btn-secondary'; bCancel.textContent='إلغاء'; tdAct.appendChild(bSave); tdAct.appendChild(bCancel);
    tr.appendChild(tdName); tr.appendChild(tdType); tr.appendChild(tdDate); tr.appendChild(tdAct);
    bSave.addEventListener('click', ()=>{ const t=($state.stores||[]).find(x=> x.id===s.id); if (!t) return; t.name=inName.value.trim(); t.priceType=sel.value; t.createdAt=($dates?$dates.formatDateEn(inDate.value):inDate.value); $app.emitChange(); });
    bCancel.addEventListener('click', renderRows);
  }
  function onAdd(){
    const name = document.getElementById('storeName').value.trim();
    const priceType = document.getElementById('storePriceType').value;
    const date = ($dates?$dates.formatDateEn(document.getElementById('storeDate').value):document.getElementById('storeDate').value) || ($dates?$dates.today():new Date().toISOString().slice(0,10));
    if (!name){ alert('أدخل اسم المحل'); return; }
    $state.stores.push({ id:'store_'+Date.now(), name, priceType, createdAt:date });
    document.getElementById('storeName').value=''; document.getElementById('storeDate').value='';
    $app.emitChange();
  }
  function onDelete(id){
    if (!confirm('حذف هذا المحل؟')) return;
    const usedInSales = ($state.sales||[]).some(e=> String(e.storeId)===String(id));
    const usedInPays = ($state.payments||[]).some(e=> String(e.storeId)===String(id));
    if (usedInSales || usedInPays){ alert('لا يمكن حذف المحل لوجود ارتباطات في المبيعات أو التسديدات'); return; }
    const s = ($state.stores||[]).find(x=> x.id===id);
    if (s){ ($state.trash||($state.trash=[])).push({ id:'trash_'+Date.now(), section:'stores', item:s, deletedAt:new Date().toISOString() }); }
    $state.stores = ($state.stores||[]).filter(x=> x.id!==id);
    $app.emitChange();
  }
  window.$storesView = { render };
})();