(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded', function(){
    if (typeof $storage !== 'undefined') { $storage.load(); }
    // enforce LTR for date fields and placeholders
    document.querySelectorAll('input[type="date"]').forEach(inp=>{ inp.setAttribute('lang','en'); inp.style.direction='ltr'; inp.placeholder='YYYY-MM-DD'; });
  });
})();