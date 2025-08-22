// مكتبة إدارة التخزين المحسّنة - مع معالجة شاملة للأخطاء
(function() {
    'use strict';

    // دالة للتحقق من دعم localStorage
    function isLocalStorageSupported() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage غير مدعوم:', e);
            return false;
        }
    }

    // دالة للحفظ الآمن مع معالجة الأخطاء
    function safeSetItem(key, value) {
        try {
            if (!isLocalStorageSupported()) {
                console.warn('localStorage غير مدعوم، سيتم استخدام الذاكرة المؤقتة');
                return false;
            }

            if (!key || typeof key !== 'string') {
                console.error('مفتاح غير صحيح:', key);
                return false;
            }

            // التحقق من حجم البيانات
            const dataSize = JSON.stringify(value).length;
            const maxSize = 5 * 1024 * 1024; // 5MB
            
            if (dataSize > maxSize) {
                console.error('حجم البيانات كبير جداً:', dataSize, 'bytes');
                return false;
            }

            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            
            // محاولة تنظيف الذاكرة
            try {
                if (localStorage.length > 100) {
                    const keys = Object.keys(localStorage);
                    for (let i = 0; i < 10; i++) {
                        if (keys[i] && !keys[i].startsWith('networkCards')) {
                            localStorage.removeItem(keys[i]);
                        }
                    }
                    // إعادة المحاولة
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                }
            } catch (cleanupError) {
                console.error('فشل في تنظيف الذاكرة:', cleanupError);
            }
            
            return false;
        }
    }

    // دالة للقراءة الآمنة مع معالجة الأخطاء
    function safeGetItem(key) {
        try {
            if (!isLocalStorageSupported()) {
                console.warn('localStorage غير مدعوم');
                return null;
            }

            if (!key || typeof key !== 'string') {
                console.error('مفتاح غير صحيح:', key);
                return null;
            }

            const item = localStorage.getItem(key);
            if (item === null) {
                return null;
            }

            return JSON.parse(item);
        } catch (error) {
            console.error('خطأ في قراءة البيانات:', error);
            
            // محاولة استرداد البيانات التالفة
            try {
                const rawItem = localStorage.getItem(key);
                if (rawItem) {
                    // محاولة إصلاح JSON تالف
                    const fixedItem = rawItem.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
                    return JSON.parse(fixedItem);
                }
            } catch (recoveryError) {
                console.error('فشل في استرداد البيانات التالفة:', recoveryError);
                
                // حذف البيانات التالفة
                try {
                    localStorage.removeItem(key);
                } catch (removeError) {
                    console.error('فشل في حذف البيانات التالفة:', removeError);
                }
            }
            
            return null;
        }
    }

    // دالة لحذف البيانات الآمن
    function safeRemoveItem(key) {
        try {
            if (!isLocalStorageSupported()) {
                return false;
            }

            if (!key || typeof key !== 'string') {
                console.error('مفتاح غير صحيح:', key);
                return false;
            }

            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('خطأ في حذف البيانات:', error);
            return false;
        }
    }

    // دالة لمسح جميع البيانات
    function safeClear() {
        try {
            if (!isLocalStorageSupported()) {
                return false;
            }

            // حفظ نسخة احتياطية قبل المسح
            const backup = {};
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('networkCards')) {
                    backup[key] = localStorage.getItem(key);
                }
            });

            localStorage.clear();

            // استعادة النسخة الاحتياطية
            Object.keys(backup).forEach(key => {
                localStorage.setItem(key, backup[key]);
            });

            return true;
        } catch (error) {
            console.error('خطأ في مسح البيانات:', error);
            return false;
        }
    }

    // دالة للحصول على معلومات التخزين
    function getStorageInfo() {
        try {
            if (!isLocalStorageSupported()) {
                return {
                    supported: false,
                    totalSize: 0,
                    usedSize: 0,
                    availableSize: 0,
                    itemCount: 0
                };
            }

            const keys = Object.keys(localStorage);
            let totalSize = 0;
            let usedSize = 0;

            keys.forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    const itemSize = new Blob([item]).size;
                    totalSize += itemSize;
                    if (key.startsWith('networkCards')) {
                        usedSize += itemSize;
                    }
                }
            });

            return {
                supported: true,
                totalSize: totalSize,
                usedSize: usedSize,
                availableSize: 5 * 1024 * 1024 - totalSize, // 5MB limit
                itemCount: keys.length
            };
        } catch (error) {
            console.error('خطأ في الحصول على معلومات التخزين:', error);
            return {
                supported: false,
                totalSize: 0,
                usedSize: 0,
                availableSize: 0,
                itemCount: 0
            };
        }
    }

    // دالة لإنشاء نسخة احتياطية
    function createBackup() {
        try {
            if (!isLocalStorageSupported()) {
                return null;
            }

            const backup = {};
            const keys = Object.keys(localStorage);
            
            keys.forEach(key => {
                if (key.startsWith('networkCards')) {
                    backup[key] = localStorage.getItem(key);
                }
            });

            backup.timestamp = new Date().toISOString();
            backup.version = '2.0';

            return backup;
        } catch (error) {
            console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
            return null;
        }
    }

    // دالة لاستعادة النسخة الاحتياطية
    function restoreBackup(backup) {
        try {
            if (!backup || typeof backup !== 'object') {
                throw new Error('نسخة احتياطية غير صحيحة');
            }

            if (!isLocalStorageSupported()) {
                throw new Error('localStorage غير مدعوم');
            }

            // حذف البيانات الحالية
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('networkCards')) {
                    localStorage.removeItem(key);
                }
            });

            // استعادة البيانات
            Object.keys(backup).forEach(key => {
                if (key !== 'timestamp' && key !== 'version' && key.startsWith('networkCards')) {
                    localStorage.setItem(key, backup[key]);
                }
            });

            return true;
        } catch (error) {
            console.error('خطأ في استعادة النسخة الاحتياطية:', error);
            return false;
        }
    }

    // دالة لتنظيف البيانات القديمة
    function cleanupOldData() {
        try {
            if (!isLocalStorageSupported()) {
                return false;
            }

            const keys = Object.keys(localStorage);
            let cleanedCount = 0;

            keys.forEach(key => {
                // حذف البيانات التي لا تبدأ بـ networkCards
                if (!key.startsWith('networkCards')) {
                    try {
                        localStorage.removeItem(key);
                        cleanedCount++;
                    } catch (error) {
                        console.warn('فشل في حذف المفتاح:', key, error);
                    }
                }
            });

            console.log('تم تنظيف', cleanedCount, 'عنصر من التخزين');
            return true;
        } catch (error) {
            console.error('خطأ في تنظيف البيانات القديمة:', error);
            return false;
        }
    }

    // دالة للتحقق من سلامة البيانات
    function validateStoredData() {
        try {
            if (!isLocalStorageSupported()) {
                return { valid: false, errors: ['localStorage غير مدعوم'] };
            }

            const errors = [];
            const keys = Object.keys(localStorage);

            keys.forEach(key => {
                if (key.startsWith('networkCards')) {
                    try {
                        const item = localStorage.getItem(key);
                        if (item) {
                            JSON.parse(item);
                        }
                    } catch (error) {
                        errors.push(`بيانات تالفة في المفتاح: ${key}`);
                    }
                }
            });

            return {
                valid: errors.length === 0,
                errors: errors,
                totalKeys: keys.length,
                networkCardsKeys: keys.filter(k => k.startsWith('networkCards')).length
            };
        } catch (error) {
            console.error('خطأ في التحقق من سلامة البيانات:', error);
            return { valid: false, errors: [error.message] };
        }
    }

    // دالة لتصدير البيانات
    function exportData() {
        try {
            if (!isLocalStorageSupported()) {
                return null;
            }

            const exportData = {};
            const keys = Object.keys(localStorage);

            keys.forEach(key => {
                if (key.startsWith('networkCards')) {
                    try {
                        const item = localStorage.getItem(key);
                        if (item) {
                            exportData[key] = JSON.parse(item);
                        }
                    } catch (error) {
                        console.warn('فشل في تصدير المفتاح:', key, error);
                    }
                }
            });

            exportData.exportInfo = {
                timestamp: new Date().toISOString(),
                version: '2.0',
                totalKeys: Object.keys(exportData).length
            };

            return exportData;
        } catch (error) {
            console.error('خطأ في تصدير البيانات:', error);
            return null;
        }
    }

    // دالة لاستيراد البيانات
    function importData(importData) {
        try {
            if (!importData || typeof importData !== 'object') {
                throw new Error('بيانات الاستيراد غير صحيحة');
            }

            if (!isLocalStorageSupported()) {
                throw new Error('localStorage غير مدعوم');
            }

            let importedCount = 0;

            Object.keys(importData).forEach(key => {
                if (key !== 'exportInfo' && key.startsWith('networkCards')) {
                    try {
                        const value = importData[key];
                        localStorage.setItem(key, JSON.stringify(value));
                        importedCount++;
                    } catch (error) {
                        console.warn('فشل في استيراد المفتاح:', key, error);
                    }
                }
            });

            console.log('تم استيراد', importedCount, 'عنصر');
            return importedCount;
        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            return 0;
        }
    }

    // تصدير الدوال
    if (typeof window !== 'undefined') {
        window.StorageManager = {
            isSupported: isLocalStorageSupported,
            setItem: safeSetItem,
            getItem: safeGetItem,
            removeItem: safeRemoveItem,
            clear: safeClear,
            getInfo: getStorageInfo,
            createBackup: createBackup,
            restoreBackup: restoreBackup,
            cleanup: cleanupOldData,
            validate: validateStoredData,
            export: exportData,
            import: importData
        };

        // اختصارات سريعة
        window.$storage = {
            set: safeSetItem,
            get: safeGetItem,
            remove: safeRemoveItem,
            clear: safeClear,
            info: getStorageInfo,
            backup: createBackup,
            restore: restoreBackup,
            cleanup: cleanupOldData,
            validate: validateStoredData,
            export: exportData,
            import: importData
        };
    }

    // فحص التخزين عند التحميل
    document.addEventListener('DOMContentLoaded', function() {
        try {
            if (!isLocalStorageSupported()) {
                console.warn('تحذير: localStorage غير مدعوم في هذا المتصفح');
                return;
            }

            // فحص سلامة البيانات
            const validation = validateStoredData();
            if (!validation.valid) {
                console.warn('تم اكتشاف بيانات تالفة:', validation.errors);
            }

            // تنظيف البيانات القديمة
            cleanupOldData();

            // عرض معلومات التخزين
            const info = getStorageInfo();
            console.log('معلومات التخزين:', info);
        } catch (error) {
            console.error('خطأ في فحص التخزين:', error);
        }
    });

})();