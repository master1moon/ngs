(function(){
  'use strict';
  function getInventory(packageId){ return ($state.inventory||[]).filter(i=> String(i.packageId)===String(packageId)).reduce((a,i)=> a + (Number(i.quantity)||0), 0); }
  function canDeduct(packageId, qty){ return getInventory(packageId) >= (Number(qty)||0); }
  function deductInventory(packageId, qty){ let remaining = Number(qty)||0; for (const i of $state.inventory){ if (String(i.packageId)!==String(packageId)) continue; const avail = Number(i.quantity)||0; if (avail<=0) continue; const take = Math.min(avail, remaining); i.quantity = avail - take; remaining -= take; if (remaining<=0) break; } return remaining<=0; }
  function addInventory(packageId, qty, date){ $state.inventory.push({ id:'inv_'+Date.now(), packageId, quantity: Number(qty)||0, createdAt: ($dates?$dates.formatDateEn(date):date)||$dates.today() }); }
  window.$engine = { getInventory, canDeduct, deductInventory, addInventory };
})();