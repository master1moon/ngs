(function(){
  'use strict';
  function formatDateEn(d){ try{ return $dates.formatDateEn(d); }catch(_){ return (d||'').slice(0,10); } }

  function getStoreBalance(storeId){
    const sales = ($state.sales||[]).filter(s=> String(s.storeId)===String(storeId));
    const pays = ($state.payments||[]).filter(p=> String(p.storeId)===String(storeId));
    const totalSales = sales.reduce((a,s)=> a + (Number(s.total)||0), 0);
    const totalPays = pays.reduce((a,p)=> a + (Number(p.amount)||0), 0);
    return totalSales - totalPays;
  }

  function getInventory(packageId){
    return ($state.inventory||[]).filter(i=> String(i.packageId)===String(packageId)).reduce((a,i)=> a + (Number(i.quantity)||0), 0);
  }

  function canDeduct(packageId, qty){ return getInventory(packageId) >= (Number(qty)||0); }

  function deductInventory(packageId, qty){
    let remaining = Number(qty)||0; if (remaining<=0) return true;
    for (const i of $state.inventory){
      if (String(i.packageId)!==String(packageId)) continue;
      const available = Number(i.quantity)||0; if (available<=0) continue;
      const take = Math.min(available, remaining);
      i.quantity = available - take;
      remaining -= take;
      if (remaining<=0) break;
    }
    return remaining<=0;
  }

  function addInventory(packageId, qty, date){
    $state.inventory.push({ id: 'inv_'+Date.now(), packageId, quantity: Number(qty)||0, createdAt: formatDateEn(date)||$dates.today() });
  }

  function recomputeAll(){
    // placeholder for future derived caches (monthly summaries, etc.)
    // we keep pure reads for now
  }

  window.$engine = { getStoreBalance, getInventory, canDeduct, deductInventory, addInventory, recomputeAll };
})();