(function(){
  'use strict';
  if (typeof moment !== 'undefined') moment.locale('ar');

  function toEnglishDigits(input){
    if (input === null || input === undefined) return '';
    return String(input)
      .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
      .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06F0));
  }
  function formatDateEn(dateStr){
    if (!dateStr) return '';
    const raw = toEnglishDigits(dateStr).slice(0, 10);
    try {
      if (typeof moment !== 'undefined'){
        const m = moment(raw, [moment.ISO_8601, 'YYYY-MM-DD', 'YYYY-M-D', 'DD/MM/YYYY', 'D/M/YYYY'], true);
        if (m.isValid()) return m.format('YYYY-MM-DD');
      }
    } catch(_){}
    const n = raw.replace(/\D/g,'');
    if (n.length >= 8) return n.slice(0,4)+'-'+n.slice(4,6)+'-'+n.slice(6,8);
    return raw;
  }
  function today(){ return (typeof moment!=='undefined') ? moment().format('YYYY-MM-DD') : new Date().toISOString().slice(0,10); }

  function makeFieldApi(id){
    return {
      set(value){ const el = document.getElementById(id); if (el) el.value = value ? formatDateEn(value) : ''; },
      read(){ const el = document.getElementById(id); return el ? formatDateEn(el.value) : ''; },
      defaultToday(){ const el = document.getElementById(id); if (el && !el.value) el.value = today(); }
    };
  }

  const SaleDate = makeFieldApi('saleDate');
  const PaymentDate = makeFieldApi('paymentDate');
  const ExpenseDate = makeFieldApi('expenseDate');
  const StoreDate = makeFieldApi('storeDate');
  const InventoryDate = makeFieldApi('inventoryDate');
  const PackageDate = makeFieldApi('packageDate');

  window.$dates = {
    toEnglishDigits, formatDateEn, today,
    SaleDate, PaymentDate, ExpenseDate, StoreDate, InventoryDate, PackageDate
  };
})();