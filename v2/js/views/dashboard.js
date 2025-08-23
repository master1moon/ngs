(function(){
  'use strict';
  const rootId = 'dashboardView';

  function render(){
    const root = document.getElementById(rootId); if (!root) return;
    const totalSales = ($state.sales||[]).reduce((a,s)=> a + (Number(s.total)||0), 0);
    const totalPays = ($state.payments||[]).reduce((a,p)=> a + (Number(p.amount)||0), 0);
    const totalExps = ($state.expenses||[]).reduce((a,e)=> a + (Number(e.amount)||0), 0);
    const net = totalSales - totalPays - totalExps;
    root.innerHTML = ''+
      '<div class="row g-3">\n'
      + `  <div class="col-md-3"><div class="card"><div class="card-body">المبيعات الكلية<br><b class="currency">${totalSales.toLocaleString('en-US')}</b></div></div></div>`
      + `  <div class="col-md-3"><div class="card"><div class="card-body">التسديدات الكلية<br><b class="currency">${totalPays.toLocaleString('en-US')}</b></div></div></div>`
      + `  <div class="col-md-3"><div class="card"><div class="card-body">المصروفات الكلية<br><b class="currency">${totalExps.toLocaleString('en-US')}</b></div></div></div>`
      + `  <div class="col-md-3"><div class="card"><div class="card-body">الصافي<br><b class="currency">${net.toLocaleString('en-US')}</b></div></div></div>`
      + '</div>';
  }

  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('state:changed', render);
})();