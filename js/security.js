// دوال الأمان والحماية من XSS - محسّنة ومحدثة
(function() {
    'use strict';

    // تعقيم النص لمنع XSS - محسّن
    function escapeHtml(text) {
        if (text == null || text === undefined) return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        
        return String(text).replace(/[&<>"'`=\/]/g, function(m) { return map[m]; });
    }

    // تعقيم السمات HTML - محسّن
    function escapeAttribute(attr) {
        if (attr == null || attr === undefined) return '';
        return String(attr).replace(/[&<>"'`=\/]/g, function(m) {
            return '&#' + m.charCodeAt(0) + ';';
        });
    }

    // إنشاء عنصر DOM بطريقة آمنة - محسّن
    function createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // التحقق من صحة اسم العنصر
        const validTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'ul', 'ol', 'li', 'a', 'button', 'input', 'select', 'option', 'label', 'form', 'img', 'br', 'hr', 'strong', 'em', 'b', 'i', 'small', 'code', 'pre'];
        if (!validTags.includes(tag.toLowerCase())) {
            console.warn('Tag غير آمن:', tag);
            return document.createElement('div');
        }
        
        // إضافة السمات بطريقة آمنة
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'className') {
                element.className = escapeAttribute(value);
            } else if (key === 'textContent') {
                element.textContent = value; // textContent آمن تلقائياً
            } else if (key === 'innerHTML' && attributes.trusted === true) {
                // السماح بـ innerHTML فقط إذا كان موثوقاً صراحة
                element.innerHTML = sanitizeHtml(value);
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, escapeAttribute(value));
            } else if (key === 'href' && typeof value === 'string') {
                // التحقق من صحة الروابط
                if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('mailto:') || value.startsWith('tel:') || value.startsWith('#')) {
                    element.setAttribute(key, escapeAttribute(value));
                } else {
                    console.warn('رابط غير آمن:', value);
                }
            } else if (key === 'src' && typeof value === 'string') {
                // التحقق من صحة مصادر الصور
                if (value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('./') || value.startsWith('/')) {
                    element.setAttribute(key, escapeAttribute(value));
                } else {
                    console.warn('مصدر صورة غير آمن:', value);
                }
            } else if (key !== 'trusted') {
                element.setAttribute(key, escapeAttribute(value));
            }
        }
        
        // إضافة الأطفال
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    // تعقيم HTML من المستخدم (للمحتوى الغني) - محسّن
    function sanitizeHtml(html) {
        if (!html || typeof html !== 'string') return '';
        
        // قائمة العناصر المسموح بها - محدودة للغاية
        const allowedTags = ['b', 'i', 'em', 'strong', 'span', 'br', 'p', 'div', 'small'];
        const allowedAttributes = ['class', 'id', 'style'];
        
        // إنشاء مستند مؤقت
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // تنظيف جميع العناصر
        const allElements = temp.getElementsByTagName('*');
        for (let i = allElements.length - 1; i >= 0; i--) {
            const element = allElements[i];
            
            // إزالة العناصر غير المسموح بها
            if (!allowedTags.includes(element.tagName.toLowerCase())) {
                element.parentNode.removeChild(element);
                continue;
            }
            
            // إزالة السمات غير المسموح بها
            const attributes = element.attributes;
            for (let j = attributes.length - 1; j >= 0; j--) {
                const attr = attributes[j];
                if (!allowedAttributes.includes(attr.name.toLowerCase())) {
                    element.removeAttribute(attr.name);
                } else if (attr.name.toLowerCase() === 'style') {
                    // تنظيف CSS
                    const cleanStyle = sanitizeCSS(attr.value);
                    if (cleanStyle) {
                        element.setAttribute('style', cleanStyle);
                    } else {
                        element.removeAttribute('style');
                    }
                }
            }
            
            // إزالة أي محتوى JavaScript
            if (element.innerHTML.includes('javascript:') || 
                element.innerHTML.includes('onclick') || 
                element.innerHTML.includes('onload') ||
                element.innerHTML.includes('onerror')) {
                element.innerHTML = escapeHtml(element.innerHTML);
            }
        }
        
        return temp.innerHTML;
    }

    // تنظيف CSS - جديد
    function sanitizeCSS(css) {
        if (!css || typeof css !== 'string') return '';
        
        // إزالة أي محتوى خطير
        const dangerousPatterns = [
            /javascript:/gi,
            /expression\s*\(/gi,
            /url\s*\(\s*['"]?\s*javascript:/gi,
            /eval\s*\(/gi,
            /import\s*\(/gi
        ];
        
        let cleanCSS = css;
        dangerousPatterns.forEach(pattern => {
            cleanCSS = cleanCSS.replace(pattern, '');
        });
        
        return cleanCSS;
    }

    // دالة مساعدة لإنشاء جدول آمن - محسّنة
    function createSafeTableRow(data) {
        const tr = document.createElement('tr');
        
        data.forEach(cellData => {
            const td = document.createElement('td');
            
            if (typeof cellData === 'object' && cellData !== null) {
                if (cellData.html && cellData.trusted) {
                    // محتوى موثوق (مثل الأزرار)
                    td.innerHTML = sanitizeHtml(cellData.html);
                } else if (cellData.element) {
                    // عنصر DOM
                    td.appendChild(cellData.element);
                } else {
                    // كائن عادي
                    td.textContent = JSON.stringify(cellData);
                }
            } else {
                // نص عادي
                td.textContent = cellData || '';
            }
            
            tr.appendChild(td);
        });
        
        return tr;
    }

    // دالة لتعقيم البيانات قبل العرض - محسّنة
    function sanitizeData(data) {
        if (Array.isArray(data)) {
            return data.map(item => sanitizeData(item));
        } else if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = sanitizeData(value);
            }
            return sanitized;
        } else if (typeof data === 'string') {
            return escapeHtml(data);
        }
        return data;
    }

    // دالة لإنشاء محتوى آمن من template - محسّنة
    function safeTemplate(strings, ...values) {
        let result = strings[0];
        
        for (let i = 0; i < values.length; i++) {
            result += escapeHtml(values[i]) + strings[i + 1];
        }
        
        return result;
    }

    // دالة لتحديث محتوى العنصر بطريقة آمنة - محسّنة
    function safeSetContent(element, content, isHtml = false) {
        if (!element) return;
        
        if (isHtml && typeof content === 'string') {
            // تعقيم HTML أولاً
            element.innerHTML = sanitizeHtml(content);
        } else if (content instanceof Node) {
            element.innerHTML = '';
            element.appendChild(content);
        } else {
            // استخدام textContent للنص العادي
            element.textContent = content || '';
        }
    }

    // دالة لإنشاء خيارات select بطريقة آمنة - محسّنة
    function createSafeOptions(selectElement, options, selectedValue = null) {
        if (!selectElement) return;
        
        selectElement.innerHTML = '';
        
        if (!Array.isArray(options)) {
            console.warn('options يجب أن تكون مصفوفة');
            return;
        }
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = escapeAttribute(option.value || option.id || '');
            optionElement.textContent = option.text || option.name || option.value || '';
            
            if (selectedValue !== null && optionElement.value === String(selectedValue)) {
                optionElement.selected = true;
            }
            
            selectElement.appendChild(optionElement);
        });
    }

    // دالة للتحقق من صحة المدخلات - محسّنة
    function validateInput(input, type = 'text') {
        if (input == null || input === undefined) return false;
        
        const validators = {
            text: /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s\-\.،,]+$/,
            number: /^\d+(\.\d+)?$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            date: /^\d{4}-\d{2}-\d{2}$/,
            phone: /^[\d\s\-\+\(\)]+$/,
            url: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
            id: /^[a-zA-Z0-9_-]+$/
        };
        
        const validator = validators[type] || validators.text;
        return validator.test(String(input));
    }

    // دالة للتحقق من صحة البيانات - جديدة
    function validateDataStructure(data) {
        if (!data || typeof data !== 'object') return false;
        
        const requiredKeys = ['packages', 'inventory', 'stores', 'expenses', 'sales', 'payments', 'trash'];
        
        for (const key of requiredKeys) {
            if (!(key in data) || !Array.isArray(data[key])) {
                return false;
            }
        }
        
        return true;
    }

    // Content Security Policy محسّن
    function addSecurityHeaders() {
        try {
            // إضافة CSP
            const cspMeta = document.createElement('meta');
            cspMeta.httpEquiv = 'Content-Security-Policy';
            cspMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';";
            
            // إضافة X-XSS-Protection
            const xssProtection = document.createElement('meta');
            xssProtection.httpEquiv = 'X-XSS-Protection';
            xssProtection.content = '1; mode=block';
            
            // إضافة X-Content-Type-Options
            const contentTypeOptions = document.createElement('meta');
            contentTypeOptions.httpEquiv = 'X-Content-Type-Options';
            contentTypeOptions.content = 'nosniff';
            
            // إضافة X-Frame-Options
            const frameOptions = document.createElement('meta');
            frameOptions.httpEquiv = 'X-Frame-Options';
            frameOptions.content = 'DENY';
            
            // إضافة Referrer-Policy
            const referrerPolicy = document.createElement('meta');
            referrerPolicy.name = 'referrer';
            referrerPolicy.content = 'strict-origin-when-cross-origin';
            
            const head = document.head || document.getElementsByTagName('head')[0];
            head.appendChild(cspMeta);
            head.appendChild(xssProtection);
            head.appendChild(contentTypeOptions);
            head.appendChild(frameOptions);
            head.appendChild(referrerPolicy);
        } catch (error) {
            console.warn('فشل في إضافة رؤوس الأمان:', error);
        }
    }

    // دالة لفحص الأمان - جديدة
    function securityAudit() {
        const issues = [];
        
        // فحص استخدام innerHTML
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.innerHTML.includes('innerHTML')) {
                issues.push('استخدام innerHTML في script tag');
            }
        });
        
        // فحص الروابط الخارجية
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.startsWith('javascript:') || href.includes('data:text/html'))) {
                issues.push('رابط خطير: ' + href);
            }
        });
        
        // فحص الصور
        const images = document.querySelectorAll('img[src]');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src && src.startsWith('javascript:')) {
                issues.push('مصدر صورة خطير: ' + src);
            }
        });
        
        if (issues.length > 0) {
            console.warn('مشاكل أمنية مكتشفة:', issues);
            return false;
        }
        
        return true;
    }

    // تصدير الدوال للاستخدام العام
    if (typeof window !== 'undefined') {
        window.SecurityUtils = {
            escapeHtml,
            escapeAttribute,
            createElement,
            sanitizeHtml,
            sanitizeCSS,
            createSafeTableRow,
            sanitizeData,
            safeTemplate,
            safeSetContent,
            createSafeOptions,
            validateInput,
            validateDataStructure,
            addSecurityHeaders,
            securityAudit
        };
        
        // اختصارات للاستخدام السريع
        window.escapeHtml = escapeHtml;
        window.safeSetContent = safeSetContent;
        window.createSafeTableRow = createSafeTableRow;
        window.createSafeOptions = createSafeOptions;
        window.validateInput = validateInput;
    }

    // تطبيق إعدادات الأمان عند التحميل
    document.addEventListener('DOMContentLoaded', function() {
        try {
            addSecurityHeaders();
            securityAudit();
        } catch (error) {
            console.warn('فشل في تطبيق إعدادات الأمان:', error);
        }
    });

})();