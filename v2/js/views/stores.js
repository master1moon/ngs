(function(){
  'use strict';
  const rootId = 'storesView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">المحلات</h5>'
      + '<div class="row g-2">'
      + '  <div class="col-md-4"><input id="storeName" class="form-control" placeholder="اسم المحل"></div>'
      + '  <div class="col-md-4"><select id="storePriceType" class="form-select"><option value="retail">قطاعي</option><option value="wholesale">جملة</option><option value="distributor">موزع</option></select></div>'
      + '  <div class="col-md-4"><button id="addStoreBtn" class="btn btn-primary w-100">إضافة</button></div>'
      + '</div>'
      + '</div></div>'
      + '<div class="row mt-2"><div class="col-md-4 ms-auto"><input id="storeSearch" class="form-control" placeholder="بحث في المحلات"></div></div>'
      + '<div class="table-responsive mt-3">\n'
      + '  <table class="table table-sm align-middle"><thead><tr><th>الاسم</th><th>نوع السعر</th><th>الرصيد</th><th>إجراءات</th></tr></thead><tbody id="storesTable"></tbody></table>'
      + '</div>';
    document.getElementById('addStoreBtn').addEventListener('click', onAdd);
    document.getElementById('storeSearch').addEventListener('input', renderRows);
    renderRows();
  }

  function renderRows(){
    const tb = document.getElementById('storesTable'); if (!tb) return; tb.innerHTML='';
    const q = (document.getElementById('storeSearch')?.value||'').toLowerCase();
    let list = $state.stores||[];
    if (q) list = list.filter(s=> [s.name||'', s.priceType||'', String($engine.getStoreBalance(s.id)||0)].join(' ').toLowerCase().includes(q));
    for (const s of list){
      const bal = $engine.getStoreBalance(s.id);
      const tr = document.createElement('tr');
      tr.innerHTML = '<td class="cell-name">'+ (s.name||'') +'</td>'
                   + '<td class="cell-priceType">'+ (s.priceType||'retail') +'</td>'
                   + '<td class="currency">'+ Number(bal||0).toLocaleString('en-US') +'</td>'
                   + '<td><button class="btn btn-sm btn-outline-secondary me-1 edit">تعديل</button><button class="btn btn-sm btn-outline-danger" data-id="'+s.id+'">حذف</button></td>';
      tr.querySelector('.edit').addEventListener('click', ()=> startEdit(tr, s));
      tr.querySelector('.btn-outline-danger').addEventListener('click', ()=> onDelete(s.id));
      tb.appendChild(tr);
    }
  }

  function startEdit(tr, s){
    tr.innerHTML = '';
    const tdName = document.createElement('td'); const inName = document.createElement('input'); inName.className='form-control'; inName.value = s.name||''; tdName.appendChild(inName);
    const tdType = document.createElement('td'); const sel = document.createElement('select'); sel.className='form-select'; sel.innerHTML = '<option value="retail">قطاعي</option><option value="wholesale">جملة</option><option value="distributor">موزع</option>'; sel.value = s.priceType||'retail'; tdType.appendChild(sel);
    const tdBal = document.createElement('td'); tdBal.className='currency'; tdBal.textContent = Number($engine.getStoreBalance(s.id)||0).toLocaleString('en-US');
    const tdAct = document.createElement('td'); const bSave=document.createElement('button'); bSave.className='btn btn-sm btn-primary me-1'; bSave.textContent='حفظ'; const bCancel=document.createElement('button'); bCancel.className='btn btn-sm btn-secondary'; bCancel.textContent='إلغاء'; tdAct.appendChild(bSave); tdAct.appendChild(bCancel);
    tr.appendChild(tdName); tr.appendChild(tdType); tr.appendChild(tdBal); tr.appendChild(tdAct);
    bSave.addEventListener('click', ()=>{ const t = $state.stores.find(x=> x.id===s.id); if (!t) return; t.name = inName.value.trim(); t.priceType = sel.value; $storage.save(); renderRows(); document.dispatchEvent(new CustomEvent('state:changed')); });
    bCancel.addEventListener('click', renderRows);
  }

  function onAdd(){
    const name = document.getElementById('storeName').value.trim();
    const priceType = document.getElementById('storePriceType').value;
    if (!name){ alert('أدخل اسم المحل'); return; }
    $state.stores.push({ id: 'store_'+Date.now(), name, priceType, createdAt: ($dates?$dates.today():new Date().toISOString().slice(0,10)) });
    $storage.save();
    document.getElementById('storeName').value='';
    document.dispatchEvent(new CustomEvent('state:changed'));
    renderRows();
  }

  function onDelete(id){
    if (!confirm('حذف هذا المحل؟')) return;
    const referenced = ($state.sales||[]).some(x=> String(x.storeId)===String(id)) || ($state.payments||[]).some(x=> String(x.storeId)===String(id));
    if (referenced){ alert('لا يمكن حذف المحل لوجود مبيعات/تسديدات مرتبطة به'); return; }
    const st = $state.stores.find(x=> x.id===id);
    if (st && window.$trash){ try{ $trash.push('stores', st); }catch(_){}}
    $state.stores = $state.stores.filter(x=> x.id!==id);
    $storage.save();
    renderRows();
    document.dispatchEvent(new CustomEvent('state:changed'));
  }

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('state:changed', render);
})();