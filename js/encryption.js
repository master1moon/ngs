// مكتبة تشفير البيانات الحساسة - محسّنة ومحدثة
(function() {
    'use strict';

    // مفتاح التشفير المحسّن - أكثر تعقيداً وأماناً
    const ENCRYPTION_KEY_BASE = 'NC-2024-SEC-KEY-' + window.location.hostname + '-' + navigator.userAgent.slice(0, 20);
    
    // إنشاء مفتاح مشتق محسّن بناءً على بيانات المستخدم
    function deriveKey(salt = '') {
        const baseKey = ENCRYPTION_KEY_BASE + salt + new Date().toDateString();
        let hash = 0;
        
        // خوارزمية hash محسّنة
        for (let i = 0; i < baseKey.length; i++) {
            const char = baseKey.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // تحويل إلى 32-bit integer
        }
        
        // إضافة تعقيد إضافي
        const timeComponent = Date.now() % 1000000;
        const randomComponent = Math.random().toString(36).substring(2, 15);
        
        return Math.abs(hash).toString(36) + timeComponent.toString(36) + randomComponent;
    }

    // تشفير محسّن باستخدام XOR متعدد الطبقات وBase64
    function enhancedEncrypt(text, key) {
        if (!text || text === '') return '';
        
        try {
            let result = text;
            
            // طبقة أولى: XOR مع المفتاح
            let encrypted = '';
            for (let i = 0; i < result.length; i++) {
                const charCode = result.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                encrypted += String.fromCharCode(charCode);
            }
            
            // طبقة ثانية: عكس النص
            encrypted = encrypted.split('').reverse().join('');
            
            // طبقة ثالثة: XOR إضافي مع مفتاح مشتق
            const secondaryKey = deriveKey('secondary');
            let finalEncrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                const charCode = encrypted.charCodeAt(i) ^ secondaryKey.charCodeAt(i % secondaryKey.length);
                finalEncrypted += String.fromCharCode(charCode);
            }
            
            // تحويل إلى Base64 مع إضافة توقيع
            const signature = deriveKey('signature').slice(0, 8);
            const dataToEncode = signature + finalEncrypted;
            
            return btoa(unescape(encodeURIComponent(dataToEncode)));
        } catch (e) {
            console.error('خطأ في التشفير المحسّن:', e);
            return text; // إرجاع النص الأصلي في حالة الفشل
        }
    }

    // فك التشفير المحسّن
    function enhancedDecrypt(encryptedText, key) {
        if (!encryptedText || encryptedText === '') return '';
        
        try {
            // فك Base64 أولاً
            const decoded = decodeURIComponent(escape(atob(encryptedText)));
            
            // التحقق من التوقيع
            const signature = decoded.slice(0, 8);
            const expectedSignature = deriveKey('signature').slice(0, 8);
            
            if (signature !== expectedSignature) {
                console.warn('تحذير: توقيع التشفير غير صحيح');
                return encryptedText;
            }
            
            const encrypted = decoded.slice(8);
            
            // فك الطبقة الثالثة: XOR مع المفتاح الثانوي
            const secondaryKey = deriveKey('secondary');
            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                const charCode = encrypted.charCodeAt(i) ^ secondaryKey.charCodeAt(i % secondaryKey.length);
                decrypted += String.fromCharCode(charCode);
            }
            
            // فك الطبقة الثانية: عكس النص
            decrypted = decrypted.split('').reverse().join('');
            
            // فك الطبقة الأولى: XOR مع المفتاح الأساسي
            let result = '';
            for (let i = 0; i < decrypted.length; i++) {
                const charCode = decrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode);
            }
            
            return result;
        } catch (e) {
            console.error('خطأ في فك التشفير المحسّن:', e);
            return encryptedText; // إرجاع النص المشفر في حالة الفشل
        }
    }

    // تشفير كائن كامل محسّن
    function encryptObject(obj, fieldsToEncrypt = []) {
        if (!obj || typeof obj !== 'object') return obj;
        
        const key = deriveKey(new Date().toDateString());
        const encrypted = JSON.parse(JSON.stringify(obj)); // نسخة عميقة
        
        // قائمة الحقول الحساسة الافتراضية - موسعة
        const sensitiveFields = [
            'price', 'amount', 'total', 'balance',
            'retailPrice', 'wholesalePrice', 'distributorPrice',
            'cost', 'profit', 'debt', 'payment',
            'salary', 'income', 'expense',
            'token', 'password', 'secret', 'key',
            'credit', 'debit', 'revenue', 'loss',
            'commission', 'discount', 'tax', 'fee',
            ...fieldsToEncrypt
        ];
        
        function encryptFields(item) {
            if (!item || typeof item !== 'object') return;
            
            for (const field of Object.keys(item)) {
                // تشفير الحقول الحساسة
                if (sensitiveFields.some(sf => field.toLowerCase().includes(sf.toLowerCase()))) {
                    if (typeof item[field] === 'string' || typeof item[field] === 'number') {
                        item[field] = enhancedEncrypt(String(item[field]), key);
                        item[`_${field}_encrypted`] = true;
                        item[`_${field}_version`] = '2.0'; // إصدار التشفير
                    }
                }
                
                // معالجة الكائنات والمصفوفات المتداخلة
                if (typeof item[field] === 'object' && item[field] !== null) {
                    if (Array.isArray(item[field])) {
                        item[field].forEach(encryptFields);
                    } else {
                        encryptFields(item[field]);
                    }
                }
            }
        }
        
        if (Array.isArray(encrypted)) {
            encrypted.forEach(encryptFields);
        } else {
            encryptFields(encrypted);
        }
        
        return encrypted;
    }

    // فك تشفير كائن محسّن
    function decryptObject(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        
        const key = deriveKey(new Date().toDateString());
        const decrypted = JSON.parse(JSON.stringify(obj)); // نسخة عميقة
        
        function decryptFields(item) {
            if (!item || typeof item !== 'object') return;
            
            for (const field of Object.keys(item)) {
                // فك تشفير الحقول المشفرة
                if (item[`_${field}_encrypted`] === true) {
                    try {
                        const version = item[`_${field}_version`] || '1.0';
                        
                        if (version === '2.0') {
                            item[field] = enhancedDecrypt(item[field], key);
                        } else {
                            // دعم الإصدار القديم
                            item[field] = simpleDecrypt(item[field], key);
                        }
                        
                        // محاولة تحويل إلى رقم إذا كان رقماً
                        const numValue = Number(item[field]);
                        if (!isNaN(numValue) && item[field] !== '') {
                            item[field] = numValue;
                        }
                        
                        delete item[`_${field}_encrypted`];
                        delete item[`_${field}_version`];
                    } catch (e) {
                        console.error(`خطأ في فك تشفير ${field}:`, e);
                    }
                }
                
                // معالجة الكائنات والمصفوفات المتداخلة
                if (typeof item[field] === 'object' && item[field] !== null) {
                    if (Array.isArray(item[field])) {
                        item[field].forEach(decryptFields);
                    } else {
                        decryptFields(item[field]);
                    }
                }
            }
        }
        
        if (Array.isArray(decrypted)) {
            decrypted.forEach(decryptFields);
        } else {
            decryptFields(decrypted);
        }
        
        return decrypted;
    }

    // التشفير البسيط للتوافق مع الإصدارات القديمة
    function simpleEncrypt(text, key) {
        if (!text) return '';
        
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }
        
        try {
            return btoa(unescape(encodeURIComponent(result)));
        } catch (e) {
            console.error('خطأ في التشفير البسيط:', e);
            return text;
        }
    }

    // فك التشفير البسيط للتوافق مع الإصدارات القديمة
    function simpleDecrypt(encryptedText, key) {
        if (!encryptedText) return '';
        
        try {
            const decoded = decodeURIComponent(escape(atob(encryptedText)));
            
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode);
            }
            
            return result;
        } catch (e) {
            console.error('خطأ في فك التشفير البسيط:', e);
            return encryptedText;
        }
    }

    // حفظ بيانات مشفرة في localStorage محسّن
    function saveEncrypted(key, data) {
        try {
            const encrypted = encryptObject(data);
            const jsonString = JSON.stringify(encrypted);
            
            // إضافة توقيع محسّن للتحقق من سلامة البيانات
            const signature = deriveKey(jsonString);
            const timestamp = new Date().toISOString();
            const version = '2.0';
            
            const dataWithSignature = {
                data: encrypted,
                signature: signature,
                timestamp: timestamp,
                version: version,
                checksum: simpleChecksum(jsonString)
            };
            
            localStorage.setItem(key, JSON.stringify(dataWithSignature));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ البيانات المشفرة:', error);
            return false;
        }
    }

    // قراءة بيانات مشفرة من localStorage محسّن
    function loadEncrypted(key) {
        try {
            const stored = localStorage.getItem(key);
            if (!stored) return null;
            
            const parsed = JSON.parse(stored);
            
            // التحقق من التوقيع
            const expectedSignature = deriveKey(JSON.stringify(parsed.data));
            if (parsed.signature !== expectedSignature) {
                console.warn('تحذير: البيانات قد تكون معدلة!');
                return null;
            }
            
            // التحقق من checksum
            if (parsed.checksum !== simpleChecksum(JSON.stringify(parsed.data))) {
                console.warn('تحذير: البيانات تالفة!');
                return null;
            }
            
            // فك التشفير
            return decryptObject(parsed.data);
        } catch (error) {
            console.error('خطأ في قراءة البيانات المشفرة:', error);
            return null;
        }
    }

    // دالة checksum بسيطة للتحقق من سلامة البيانات
    function simpleChecksum(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return Math.abs(hash).toString(36);
    }

    // تشفير قيمة واحدة محسّن
    function encryptValue(value) {
        const key = deriveKey(new Date().toDateString());
        return enhancedEncrypt(String(value), key);
    }

    // فك تشفير قيمة واحدة محسّن
    function decryptValue(encryptedValue) {
        const key = deriveKey(new Date().toDateString());
        const decrypted = enhancedDecrypt(encryptedValue, key);
        
        // محاولة تحويل إلى رقم إذا كان رقماً
        const numValue = Number(decrypted);
        if (!isNaN(numValue) && decrypted !== '') {
            return numValue;
        }
        
        return decrypted;
    }

    // التحقق من دعم التشفير في المتصفح محسّن
    function isEncryptionSupported() {
        try {
            // اختبار btoa و atob
            const test = 'test';
            const encoded = btoa(test);
            const decoded = atob(encoded);
            
            // اختبار التشفير المحسّن
            const key = deriveKey('test');
            const encrypted = enhancedEncrypt(test, key);
            const decrypted = enhancedDecrypt(encrypted, key);
            
            return decoded === test && decrypted === test;
        } catch (e) {
            console.error('التشفير غير مدعوم:', e);
            return false;
        }
    }

    // ترحيل البيانات الموجودة إلى تشفير محسّن
    function migrateExistingData() {
        try {
            const existingData = localStorage.getItem('networkCardsData');
            if (existingData && !existingData.includes('"_encrypted"')) {
                // البيانات غير مشفرة، قم بتشفيرها
                const parsed = JSON.parse(existingData);
                saveEncrypted('networkCardsData', parsed);
                console.log('تم ترحيل البيانات إلى التشفير المحسّن بنجاح');
            } else if (existingData && existingData.includes('"_encrypted"') && !existingData.includes('"version":"2.0"')) {
                // البيانات مشفرة بالإصدار القديم، قم بترحيلها
                const parsed = JSON.parse(existingData);
                const decrypted = decryptObject(parsed.data);
                saveEncrypted('networkCardsData', decrypted);
                console.log('تم ترحيل البيانات إلى الإصدار الجديد بنجاح');
            }
        } catch (error) {
            console.error('خطأ في ترحيل البيانات:', error);
        }
    }

    // دالة لفحص سلامة البيانات المشفرة
    function verifyEncryptedData(key) {
        try {
            const stored = localStorage.getItem(key);
            if (!stored) return false;
            
            const parsed = JSON.parse(stored);
            
            // التحقق من وجود جميع الحقول المطلوبة
            if (!parsed.data || !parsed.signature || !parsed.timestamp || !parsed.version) {
                return false;
            }
            
            // التحقق من التوقيع
            const expectedSignature = deriveKey(JSON.stringify(parsed.data));
            if (parsed.signature !== expectedSignature) {
                return false;
            }
            
            // التحقق من checksum
            if (parsed.checksum !== simpleChecksum(JSON.stringify(parsed.data))) {
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('خطأ في فحص سلامة البيانات:', error);
            return false;
        }
    }

    // تصدير الدوال
    if (typeof window !== 'undefined') {
        window.DataEncryption = {
            encrypt: enhancedEncrypt,
            decrypt: enhancedDecrypt,
            encryptObject,
            decryptObject,
            saveEncrypted,
            loadEncrypted,
            encryptValue,
            decryptValue,
            isEncryptionSupported,
            migrateExistingData,
            verifyEncryptedData,
            // دوال التوافق مع الإصدارات القديمة
            simpleEncrypt,
            simpleDecrypt
        };
        
        // اختصارات سريعة
        window.$encrypt = {
            save: saveEncrypted,
            load: loadEncrypted,
            value: encryptValue,
            decrypt: decryptValue,
            verify: verifyEncryptedData
        };
    }

    // التحقق من دعم التشفير عند التحميل
    document.addEventListener('DOMContentLoaded', function() {
        if (!isEncryptionSupported()) {
            console.warn('تحذير: المتصفح لا يدعم التشفير الكامل');
        } else {
            // ترحيل البيانات الموجودة
            migrateExistingData();
            
            // فحص سلامة البيانات المشفرة
            if (!verifyEncryptedData('networkCardsData')) {
                console.warn('تحذير: البيانات المشفرة قد تكون تالفة');
            }
        }
    });

})();