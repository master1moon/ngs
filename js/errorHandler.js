// مكتبة معالجة الأخطاء الشاملة - جديدة
(function() {
    'use strict';

    // أنواع الأخطاء
    const ErrorTypes = {
        VALIDATION: 'validation',
        STORAGE: 'storage',
        ENCRYPTION: 'encryption',
        NETWORK: 'network',
        DOM: 'dom',
        DATA: 'data',
        SECURITY: 'security',
        UNKNOWN: 'unknown'
    };

    // مستويات الخطأ
    const ErrorLevels = {
        INFO: 'info',
        WARNING: 'warning',
        ERROR: 'error',
        CRITICAL: 'critical'
    };

    // قائمة الأخطاء المسجلة
    let errorLog = [];
    const MAX_ERROR_LOG_SIZE = 100;

    // دالة لتحديد نوع الخطأ
    function classifyError(error) {
        try {
            const message = error.message || error.toString();
            const stack = error.stack || '';

            if (message.includes('validation') || message.includes('صحيح')) {
                return ErrorTypes.VALIDATION;
            }
            if (message.includes('storage') || message.includes('localStorage') || message.includes('IndexedDB')) {
                return ErrorTypes.STORAGE;
            }
            if (message.includes('encryption') || message.includes('crypto') || message.includes('تشفير')) {
                return ErrorTypes.ENCRYPTION;
            }
            if (message.includes('network') || message.includes('fetch') || message.includes('XMLHttpRequest')) {
                return ErrorTypes.NETWORK;
            }
            if (message.includes('DOM') || message.includes('element') || message.includes('querySelector')) {
                return ErrorTypes.DOM;
            }
            if (message.includes('data') || message.includes('JSON') || message.includes('parse')) {
                return ErrorTypes.DATA;
            }
            if (message.includes('security') || message.includes('XSS') || message.includes('أمان')) {
                return ErrorTypes.SECURITY;
            }

            return ErrorTypes.UNKNOWN;
        } catch (e) {
            return ErrorTypes.UNKNOWN;
        }
    }

    // دالة لتحديد مستوى الخطأ
    function classifyErrorLevel(error, type) {
        try {
            const message = error.message || error.toString();

            // الأخطاء الحرجة
            if (message.includes('critical') || message.includes('fatal') || 
                message.includes('خطير') || message.includes('حرج')) {
                return ErrorLevels.CRITICAL;
            }

            // أخطاء التحقق من صحة البيانات
            if (type === ErrorTypes.VALIDATION) {
                return ErrorLevels.WARNING;
            }

            // أخطاء التخزين
            if (type === ErrorTypes.STORAGE) {
                return ErrorLevels.ERROR;
            }

            // أخطاء التشفير
            if (type === ErrorTypes.ENCRYPTION) {
                return ErrorLevels.ERROR;
            }

            // أخطاء الشبكة
            if (type === ErrorTypes.NETWORK) {
                return ErrorLevels.WARNING;
            }

            // أخطاء DOM
            if (type === ErrorTypes.DOM) {
                return ErrorLevels.WARNING;
            }

            // أخطاء البيانات
            if (type === ErrorTypes.DATA) {
                return ErrorLevels.ERROR;
            }

            // أخطاء الأمان
            if (type === ErrorTypes.SECURITY) {
                return ErrorLevels.CRITICAL;
            }

            return ErrorLevels.ERROR;
        } catch (e) {
            return ErrorLevels.ERROR;
        }
    }

    // دالة لتسجيل الخطأ
    function logError(error, context = {}) {
        try {
            const errorInfo = {
                timestamp: new Date().toISOString(),
                type: classifyError(error),
                level: classifyErrorLevel(error, classifyError(error)),
                message: error.message || error.toString(),
                stack: error.stack || '',
                context: context,
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            // إضافة الخطأ إلى السجل
            errorLog.push(errorInfo);

            // الحفاظ على حجم السجل
            if (errorLog.length > MAX_ERROR_LOG_SIZE) {
                errorLog = errorLog.slice(-MAX_ERROR_LOG_SIZE);
            }

            // تسجيل في console
            const logMethod = errorInfo.level === ErrorLevels.CRITICAL ? 'error' : 
                             errorInfo.level === ErrorLevels.WARNING ? 'warn' : 'log';
            
            console[logMethod](`[${errorInfo.type.toUpperCase()}] ${errorInfo.message}`, errorInfo);

            // إرسال إشعار للمستخدم للأخطاء المهمة
            if (errorInfo.level === ErrorLevels.CRITICAL || errorInfo.level === ErrorLevels.ERROR) {
                showErrorNotification(errorInfo);
            }

            return errorInfo;
        } catch (e) {
            console.error('خطأ في تسجيل الخطأ:', e);
            return null;
        }
    }

    // دالة لعرض إشعار الخطأ
    function showErrorNotification(errorInfo) {
        try {
            if (window.showNotification) {
                const message = getErrorMessage(errorInfo);
                window.showNotification(message, 'error');
            } else {
                // fallback بسيط
                alert(`خطأ: ${errorInfo.message}`);
            }
        } catch (e) {
            console.error('خطأ في عرض إشعار الخطأ:', e);
        }
    }

    // دالة لترجمة رسائل الخطأ
    function getErrorMessage(errorInfo) {
        try {
            const messages = {
                [ErrorTypes.VALIDATION]: 'خطأ في التحقق من صحة البيانات',
                [ErrorTypes.STORAGE]: 'خطأ في حفظ أو قراءة البيانات',
                [ErrorTypes.ENCRYPTION]: 'خطأ في تشفير أو فك تشفير البيانات',
                [ErrorTypes.NETWORK]: 'خطأ في الاتصال بالشبكة',
                [ErrorTypes.DOM]: 'خطأ في واجهة المستخدم',
                [ErrorTypes.DATA]: 'خطأ في معالجة البيانات',
                [ErrorTypes.SECURITY]: 'خطأ أمني',
                [ErrorTypes.UNKNOWN]: 'خطأ غير معروف'
            };

            return messages[errorInfo.type] || 'حدث خطأ غير متوقع';
        } catch (e) {
            return 'حدث خطأ غير متوقع';
        }
    }

    // دالة لمعالجة الأخطاء غير المعالجة
    function handleUnhandledError(event) {
        try {
            const error = event.error || event.reason || new Error('خطأ غير معروف');
            logError(error, { source: 'unhandled' });
        } catch (e) {
            console.error('خطأ في معالجة الخطأ غير المعالج:', e);
        }
    }

    // دالة لمعالجة رفض الوعود
    function handleUnhandledRejection(event) {
        try {
            const error = event.reason || new Error('وعد مرفوض');
            logError(error, { source: 'unhandled-rejection' });
        } catch (e) {
            console.error('خطأ في معالجة الرفض غير المعالج:', e);
        }
    }

    // دالة لتنفيذ دالة مع معالجة الأخطاء
    function safeExecute(fn, context = {}) {
        try {
            return fn();
        } catch (error) {
            logError(error, context);
            return null;
        }
    }

    // دالة لتنفيذ دالة غير متزامنة مع معالجة الأخطاء
    async function safeExecuteAsync(fn, context = {}) {
        try {
            return await fn();
        } catch (error) {
            logError(error, context);
            return null;
        }
    }

    // دالة للحصول على سجل الأخطاء
    function getErrorLog() {
        return [...errorLog];
    }

    // دالة لمسح سجل الأخطاء
    function clearErrorLog() {
        errorLog = [];
    }

    // دالة لتصدير سجل الأخطاء
    function exportErrorLog() {
        try {
            const exportData = {
                errors: errorLog,
                exportInfo: {
                    timestamp: new Date().toISOString(),
                    totalErrors: errorLog.length,
                    version: '1.0'
                }
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `error-log-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('خطأ في تصدير سجل الأخطاء:', error);
        }
    }

    // دالة لفحص صحة التطبيق
    function healthCheck() {
        try {
            const health = {
                timestamp: new Date().toISOString(),
                localStorage: false,
                encryption: false,
                dom: false,
                data: false,
                errors: errorLog.length,
                criticalErrors: errorLog.filter(e => e.level === ErrorLevels.CRITICAL).length
            };

            // فحص localStorage
            try {
                localStorage.setItem('health-check', 'test');
                localStorage.removeItem('health-check');
                health.localStorage = true;
            } catch (e) {
                logError(e, { context: 'health-check-localStorage' });
            }

            // فحص التشفير
            try {
                if (window.DataEncryption && window.DataEncryption.isEncryptionSupported) {
                    health.encryption = window.DataEncryption.isEncryptionSupported();
                }
            } catch (e) {
                logError(e, { context: 'health-check-encryption' });
            }

            // فحص DOM
            try {
                const testElement = document.createElement('div');
                document.body.appendChild(testElement);
                document.body.removeChild(testElement);
                health.dom = true;
            } catch (e) {
                logError(e, { context: 'health-check-dom' });
            }

            // فحص البيانات
            try {
                if (window.data && typeof window.data === 'object') {
                    health.data = true;
                }
            } catch (e) {
                logError(e, { context: 'health-check-data' });
            }

            return health;
        } catch (error) {
            logError(error, { context: 'health-check' });
            return null;
        }
    }

    // دالة لإعادة تشغيل التطبيق
    function restartApp() {
        try {
            // حفظ البيانات الحالية
            if (window.saveData) {
                window.saveData();
            }

            // إعادة تحميل الصفحة
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            logError(error, { context: 'restart-app' });
            // إعادة تحميل مباشرة في حالة الفشل
            window.location.reload();
        }
    }

    // دالة لاسترداد البيانات من النسخة الاحتياطية
    function recoverFromBackup() {
        try {
            if (window.StorageManager && window.StorageManager.restoreBackup) {
                const backup = window.StorageManager.createBackup();
                if (backup) {
                    const success = window.StorageManager.restoreBackup(backup);
                    if (success) {
                        showErrorNotification({ message: 'تم استرداد البيانات بنجاح', type: ErrorTypes.DATA });
                        return true;
                    }
                }
            }
            return false;
        } catch (error) {
            logError(error, { context: 'recover-backup' });
            return false;
        }
    }

    // إعداد معالجات الأخطاء العالمية
    function setupGlobalErrorHandlers() {
        try {
            // معالج الأخطاء غير المعالجة
            window.addEventListener('error', handleUnhandledError);
            
            // معالج رفض الوعود
            window.addEventListener('unhandledrejection', handleUnhandledRejection);
            
            // معالج أخطاء التحميل
            window.addEventListener('load', () => {
                logError(new Error('تم تحميل التطبيق بنجاح'), { context: 'app-loaded' });
            });
            
            console.log('تم إعداد معالجات الأخطاء العالمية');
        } catch (error) {
            console.error('خطأ في إعداد معالجات الأخطاء العالمية:', error);
        }
    }

    // تصدير الدوال
    if (typeof window !== 'undefined') {
        window.ErrorHandler = {
            log: logError,
            safeExecute,
            safeExecuteAsync,
            getLog: getErrorLog,
            clearLog: clearErrorLog,
            exportLog: exportErrorLog,
            healthCheck,
            restart: restartApp,
            recover: recoverFromBackup,
            setup: setupGlobalErrorHandlers,
            types: ErrorTypes,
            levels: ErrorLevels
        };

        // اختصارات سريعة
        window.$error = {
            log: logError,
            safe: safeExecute,
            safeAsync: safeExecuteAsync,
            health: healthCheck,
            restart: restartApp,
            recover: recoverFromBackup
        };
    }

    // إعداد معالجات الأخطاء عند التحميل
    document.addEventListener('DOMContentLoaded', function() {
        try {
            setupGlobalErrorHandlers();
            
            // فحص صحة التطبيق
            setTimeout(() => {
                const health = healthCheck();
                if (health && health.criticalErrors > 0) {
                    showErrorNotification({ 
                        message: `تم اكتشاف ${health.criticalErrors} أخطاء حرجة`, 
                        type: ErrorTypes.UNKNOWN 
                    });
                }
            }, 2000);
        } catch (error) {
            console.error('خطأ في إعداد معالج الأخطاء:', error);
        }
    });

})();