(function(){
  'use strict';
  const rootId = 'settingsView';
  const KEY = 'v2_settings';

  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||'{}'); }catch(_){ return {}; } }
  function save(s){ try{ localStorage.setItem(KEY, JSON.stringify(s||{})); }catch(_){}}

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    const s = load();
    const low = Number(s.lowStock||200)||200;
    root.innerHTML = ''+
      '<div class="card"><div class="card-body">\n'
      + '<h5 class="card-title mb-3">الإعدادات</h5>'
      + '<div class="row g-2">'
      + `  <div class="col-md-4"><label class="form-label">حد تنبيه نقص المخزون</label><input id="lowStock" class="form-control" value="${low}"></div>`
      + '  <div class="col-md-3"><button id="saveSettings" class="btn btn-primary w-100">حفظ</button></div>'
      + '</div>'
      + '</div></div>';
    document.getElementById('saveSettings').addEventListener('click', ()=>{
      const v = Number((document.getElementById('lowStock').value||'').replace(/,/g,''))||0;
      const ns = { lowStock: v>0?v:200 };
      save(ns);
      document.dispatchEvent(new CustomEvent('state:changed'));
      alert('تم الحفظ');
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();