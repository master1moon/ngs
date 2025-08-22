// رقمية: تحويل الأرقام العربية/الفارسية إلى إنجليزية - محسّنة
function toEnglishDigits(input) {
  try {
    if (input === null || input === undefined) return '';
    return String(input)
      .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
      .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06F0));
  } catch (error) {
    console.error('خطأ في تحويل الأرقام:', error);
    return String(input || '');
  }
}

// تنسيق الأرقام بفواصل إنجليزية دائمًا - محسّن
function formatNumber(num) {
  try {
    if (num === null || num === undefined) return '';
    const n = Number(toEnglishDigits(num)) || 0;
    return n.toLocaleString('en-US');
  } catch (error) {
    console.error('خطأ في تنسيق الرقم:', error);
    return String(num || '');
  }
}

// تحليل الأرقام المنسقة مع دعم الأرقام العربية - محسّن
function parseFormattedNumber(str) {
  try {
    if (!str) return 0;
    const eng = toEnglishDigits(str);
    const result = parseFloat(eng.replace(/,/g, '')) || 0;
    return isNaN(result) ? 0 : result;
  } catch (error) {
    console.error('خطأ في تحليل الرقم المنسق:', error);
    return 0;
  }
}

// تنسيق التاريخ إلى YYYY-MM-DD بأرقام إنجليزية دائمًا - محسّن
function formatDateEn(dateStr) {
  try {
    if (!dateStr) return '';
    const raw = toEnglishDigits(dateStr).slice(0, 10);
    
    if (typeof moment !== 'undefined') {
      const m = moment(raw, [moment.ISO_8601, 'YYYY-MM-DD', 'YYYY-M-D', 'DD/MM/YYYY', 'D/M/YYYY'], true);
      if (m.isValid()) return m.format('YYYY-MM-DD');
    }
    
    // fallback: simple cleanup
    const m = /^\d{4}-\d{1,2}-\d{1,2}$/.test(raw) ? raw : raw.replace(/\D/g, '').replace(/(\d{4})(\d{2})(\d{2}).*/, '$1-$2-$3');
    return m;
  } catch (error) {
    console.error('خطأ في تنسيق التاريخ:', error);
    return '';
  }
}

// تطبيق تنسيق الأرقام على جميع حقول الإدخال ذات الصنف formatted-input - محسّن
function setupFormattedInputs() {
  try {
    const inputs = document.querySelectorAll('.formatted-input');
    if (!inputs || inputs.length === 0) return;
    
    inputs.forEach(input => {
      if (!input || input.dataset._formatted) return; // تجنب التكرار
      
      input.dataset._formatted = 'true';
      
      input.addEventListener('focus', function () {
        try {
          this.value = toEnglishDigits(this.value).replace(/,/g, '');
        } catch (error) {
          console.error('خطأ في معالجة focus:', error);
        }
      });

      input.addEventListener('input', function () {
        try {
          const original = this.value;
          const caret = this.selectionStart || 0;
          let plain = toEnglishDigits(original);
          const isNegative = /^-/.test(plain);
          plain = plain.replace(/[^0-9.]/g, '');
          const parts = plain.split('.');
          if (parts.length > 2) {
            plain = parts[0] + '.' + parts.slice(1).join('');
          }
          const leftText = toEnglishDigits(original.slice(0, caret));
          const leftDigitsCount = (leftText.match(/[0-9]/g) || []).length;
          let numberPart = parts[0];
          numberPart = numberPart.replace(/^0+(\d)/, '$1');
          const formattedInt = Number(numberPart || 0).toLocaleString('en-US');
          const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
          const formatted = (isNegative ? '-' : '') + formattedInt + decimalPart;
          if (formatted !== this.value) this.value = formatted;
          let newCaret = 0, seenDigits = 0;
          const val = this.value;
          for (let i = 0; i < val.length; i++) {
            if (/[0-9]/.test(val[i])) {
              seenDigits++;
              if (seenDigits >= leftDigitsCount) { newCaret = i + 1; break; }
            } else if (val[i] === '.' && leftText.includes('.')) {
              const leftDotIndex = leftText.indexOf('.');
              const digitsBeforeDot = (leftText.slice(0, leftDotIndex).match(/[0-9]/g) || []).length;
              if (leftDigitsCount === digitsBeforeDot) { newCaret = i + 1; break; }
            }
          }
          if (!newCaret) newCaret = this.value.length;
          this.setSelectionRange(newCaret, newCaret);
        } catch (error) {
          console.error('خطأ في معالجة input:', error);
        }
      });

      input.addEventListener('blur', function () {
        try {
          const num = parseFormattedNumber(this.value);
          this.value = num ? formatNumber(num) : '';
        } catch (error) {
          console.error('خطأ في معالجة blur:', error);
        }
      });
    });
  } catch (error) {
    console.error('خطأ في إعداد حقول الإدخال المنسقة:', error);
  }
}

// إشعارات بسيطة في أسفل الصفحة - محسّنة
function showNotification(message, type) {
  try {
    if (!message || typeof message !== 'string') {
      console.warn('رسالة إشعار غير صحيحة:', message);
      return;
    }
    
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (!notification || !notificationText) {
      console.warn('عناصر الإشعار غير موجودة');
      return;
    }
    
    // تعقيم الرسالة
    const sanitizedMessage = window.escapeHtml ? window.escapeHtml(message) : message;
    
    notificationText.textContent = sanitizedMessage;
    notification.className = `notification ${type || 'info'} show`;
    
    // إخفاء الإشعار بعد 3 ثوانٍ
    setTimeout(() => { 
      try {
        notification.className = 'notification'; 
      } catch (error) {
        console.error('خطأ في إخفاء الإشعار:', error);
      }
    }, 3000);
  } catch (error) {
    console.error('خطأ في عرض الإشعار:', error);
    // fallback بسيط
    alert(message);
  }
}

// دالة موحدة للتنقل بين الأقسام وتفعيل الرابط النشط - محسّنة
function switchSection(targetSection, labelText) {
  try {
    if (!targetSection) {
      console.warn('قسم الهدف غير محدد');
      return;
    }
    
    // إزالة الفئة النشطة من جميع الروابط
    const allLinks = document.querySelectorAll('.sidebar .nav-link, #mobileDrawer .nav-link');
    allLinks.forEach(l => {
      try {
        l.classList.remove('active');
      } catch (error) {
        console.error('خطأ في إزالة الفئة النشطة:', error);
      }
    });
    
    // إضافة الفئة النشطة للرابط المحدد
    allLinks.forEach(l => { 
      try {
        if (l.getAttribute('data-section') === targetSection) l.classList.add('active'); 
      } catch (error) {
        console.error('خطأ في إضافة الفئة النشطة:', error);
      }
    });
    
    // إخفاء جميع الأقسام
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => { 
      try {
        s.style.display = 'none'; 
        s.classList.remove('show'); 
      } catch (error) {
        console.error('خطأ في إخفاء القسم:', error);
      }
    });
    
    // إظهار القسم المحدد
    const sectionEl = document.getElementById(targetSection);
    if (sectionEl) { 
      try {
        sectionEl.style.display = 'block'; 
        setTimeout(() => sectionEl.classList.add('show'), 10); 
      } catch (error) {
        console.error('خطأ في إظهار القسم:', error);
      }
    } else {
      console.warn('القسم غير موجود:', targetSection);
    }
    
    // تحديث العنوان
    const titleEl = document.querySelector('.page-title');
    if (titleEl) {
      try {
        const title = labelText || (document.querySelector(`.sidebar .nav-link[data-section="${targetSection}"]`)?.textContent.trim() || '');
        titleEl.textContent = title;
      } catch (error) {
        console.error('خطأ في تحديث العنوان:', error);
      }
    }
    
    // تشغيل الدوال الخاصة بالأقسام
    if (targetSection === 'reports') {
      try {
        if (typeof generatePartnerReports === 'function') generatePartnerReports();
      } catch (error) {
        console.error('خطأ في تشغيل تقارير الشركاء:', error);
      }
    }
    
    if (targetSection === 'trash') {
      try {
        if (typeof renderTrashTable === 'function') setTimeout(() => renderTrashTable(), 100);
      } catch (error) {
        console.error('خطأ في تشغيل سلة المحذوفات:', error);
      }
    }
  } catch (error) {
    console.error('خطأ في تبديل القسم:', error);
  }
}

// ضمان إظهار القسم الافتراضي حتى لو فشل تهيئة أخرى - محسّن
document.addEventListener('DOMContentLoaded', function () {
  try {
    const currentVisible = document.querySelector('.section:not([style*="display: none"])') || document.getElementById('dashboard');
    if (currentVisible && !currentVisible.classList.contains('show')) {
      currentVisible.classList.add('show');
    }
  } catch (error) {
    console.error('خطأ في إظهار القسم الافتراضي:', error);
  }
});

// إجبار حقول التاريخ على الإنجليزية وترتيب LTR - محسّن
document.addEventListener('DOMContentLoaded', function(){
  try {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(inp => {
      try {
        inp.setAttribute('lang', 'en');
        inp.style.direction = 'ltr';
        inp.placeholder = 'YYYY-MM-DD';
        
        // عند الإدخال/التغيير: طبيعـة التاريخ إلى أرقام إنجليزية وصيغة موحّدة
        const normalize = () => { 
          try {
            if (inp.value) inp.value = formatDateEn(inp.value); 
          } catch (error) {
            console.error('خطأ في تطبيع التاريخ:', error);
          }
        };
        inp.addEventListener('change', normalize);
        inp.addEventListener('blur', normalize);
      } catch (error) {
        console.error('خطأ في إعداد حقل التاريخ:', error);
      }
    });
  } catch (error) {
    console.error('خطأ في إعداد حقول التاريخ:', error);
  }
});

// درج الجوال المخصص (مؤجل حتى اكتمال DOM) - محسّن
document.addEventListener('DOMContentLoaded', function () {
  try {
    const toggleBtn = document.getElementById('mobileSidebarToggle');
    const closeBtn = document.getElementById('drawerClose');

    function openDrawer() {
      try {
        const drawer = document.getElementById('mobileDrawer');
        const backdrop = document.getElementById('drawerBackdrop');
        if (drawer) drawer.classList.add('open');
        if (backdrop) backdrop.classList.add('show');
        document.body.classList.add('drawer-open');
      } catch (error) {
        console.error('خطأ في فتح الدرج:', error);
      }
    }
    
    function closeDrawer() {
      try {
        const drawer = document.getElementById('mobileDrawer');
        const backdrop = document.getElementById('drawerBackdrop');
        if (drawer) drawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('show');
        document.body.classList.remove('drawer-open');
      } catch (error) {
        console.error('خطأ في إغلاق الدرج:', error);
      }
    }

    if (toggleBtn) {
      ['click', 'touchend'].forEach(ev => {
        toggleBtn.addEventListener(ev, function (e) { 
          try {
            e.preventDefault(); 
            openDrawer(); 
          } catch (error) {
            console.error('خطأ في معالجة حدث الدرج:', error);
          }
        });
      });
    }

    const backdrop = document.getElementById('drawerBackdrop');
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    const drawer = document.getElementById('mobileDrawer');
    if (drawer) {
      drawer.addEventListener('click', function (e) {
        try {
          const link = e.target.closest('a.nav-link');
          if (!link) return;
          closeDrawer();
          const targetSection = link.getAttribute('data-section');
          switchSection(targetSection, link.textContent.trim());
        } catch (error) {
          console.error('خطأ في معالجة النقر على الرابط:', error);
        }
      });
    }

    document.addEventListener('keydown', function (e) { 
      try {
        if (e.key === 'Escape') closeDrawer(); 
      } catch (error) {
        console.error('خطأ في معالجة مفتاح Escape:', error);
      }
    });
    
    window.addEventListener('resize', function () { 
      try {
        if (window.innerWidth >= 769) closeDrawer(); 
      } catch (error) {
        console.error('خطأ في معالجة تغيير الحجم:', error);
      }
    });
  } catch (error) {
    console.error('خطأ في إعداد درج الجوال:', error);
  }
});

// دالة مساعدة لتعيين النص بأمان - محسّنة
function setTextSafe(el, text) { 
  try {
    if (el && text !== undefined && text !== null) {
      el.textContent = String(text);
    }
  } catch (error) {
    console.error('خطأ في تعيين النص:', error);
  }
}

// دالة للتحقق من صحة البيانات - جديدة
function validateData(data) {
  try {
    if (!data || typeof data !== 'object') return false;
    
    const requiredKeys = ['packages', 'inventory', 'stores', 'expenses', 'sales', 'payments', 'trash'];
    
    for (const key of requiredKeys) {
      if (!(key in data) || !Array.isArray(data[key])) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في التحقق من صحة البيانات:', error);
    return false;
  }
}

// دالة لتنظيف البيانات - جديدة
function sanitizeData(data) {
  try {
    if (!validateData(data)) {
      console.warn('البيانات غير صحيحة، سيتم إنشاء بيانات جديدة');
      return {
        packages: [],
        inventory: [],
        stores: [],
        expenses: [],
        sales: [],
        payments: [],
        trash: []
      };
    }
    
    // تنظيف كل مصفوفة
    const cleaned = {};
    for (const key in data) {
      if (Array.isArray(data[key])) {
        cleaned[key] = data[key].filter(item => item && typeof item === 'object');
      }
    }
    
    return cleaned;
  } catch (error) {
    console.error('خطأ في تنظيف البيانات:', error);
    return {
      packages: [],
      inventory: [],
      stores: [],
      expenses: [],
      sales: [],
      payments: [],
      trash: []
    };
  }
}

// تصدير الدوال للنطاق العام
if (typeof window !== 'undefined') {
  try {
    window.toEnglishDigits = toEnglishDigits;
    window.formatNumber = formatNumber;
    window.parseFormattedNumber = parseFormattedNumber;
    window.formatDateEn = formatDateEn;
    window.showNotification = showNotification;
    window.switchSection = switchSection;
    window.setTextSafe = setTextSafe;
    window.validateData = validateData;
    window.sanitizeData = sanitizeData;
  } catch (error) {
    console.error('خطأ في تصدير الدوال:', error);
  }
}