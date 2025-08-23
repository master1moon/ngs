(function(){
  'use strict';
  const KEY = 'networkCardsDataV2';

  function load(){
    try {
      const txt = localStorage.getItem(KEY);
      if (!txt) return;
      const obj = JSON.parse(txt);
      Object.assign(window.$state, obj);
    } catch(_){/* ignore */}
  }
  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(window.$state)); } catch(_){/* ignore */}
  }

  async function migrateFromV1(){
    try {
      const v1 = localStorage.getItem('networkCardsData');
      if (!v1) return;
      const obj = JSON.parse(v1);
      if (obj && typeof obj === 'object') {
        Object.assign(window.$state, {
          packages: obj.packages||[], inventory: obj.inventory||[], stores: obj.stores||[],
          sales: obj.sales||[], payments: obj.payments||[], expenses: obj.expenses||[]
        });
        save();
      }
    } catch(_){/* ignore */}
  }

  window.$storage = { load, save, migrateFromV1 };
})();