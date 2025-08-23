(function(){
  'use strict';
  if (typeof moment!=='undefined') moment.locale('ar');
  function toEnglishDigits(input){ if (input==null) return ''; return String(input).replace(/[\u0660-\u0669]/g,d=>String(d.charCodeAt(0)-0x0660)).replace(/[\u06F0-\u06F9]/g,d=>String(d.charCodeAt(0)-0x06F0)); }
  function formatDateEn(dateStr){ if (!dateStr) return ''; const raw = toEnglishDigits(dateStr).slice(0,10); try{ if (typeof moment!=='undefined'){ const m = moment(raw,[moment.ISO_8601,'YYYY-MM-DD','YYYY-M-D','DD/MM/YYYY','D/M/YYYY'],true); if (m.isValid()) return m.format('YYYY-MM-DD'); } }catch(_){ } let out=raw; if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(out)){ const n=raw.replace(/\D/g,''); if (n.length>=8) out = n.slice(0,4)+'-'+n.slice(4,6)+'-'+n.slice(6,8); } const parts = out.split('-'); if (parts.length===3){ const y=parts[0]; const m=('0'+parseInt(parts[1]||'0',10)).slice(-2); const d=('0'+parseInt(parts[2]||'0',10)).slice(-2); out = `${y}-${m}-${d}`; } return out; }
  function today(){ return (typeof moment!=='undefined') ? moment().format('YYYY-MM-DD') : new Date().toISOString().slice(0,10); }
  window.$dates = { toEnglishDigits, formatDateEn, today };
})();