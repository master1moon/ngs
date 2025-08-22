// مكتبة التحقق من صحة البيانات - محسّنة ومحدثة
(function() {
    'use strict';

    // قواعد التحقق من صحة البيانات
    const validationRules = {
        // قواعد الباقات
        package: {
            name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
            retailPrice: { required: true, type: 'number', min: 0 },
            wholesalePrice: { required: true, type: 'number', min: 0 },
            distributorPrice: { required: true, type: 'number', min: 0 },
            id: { required: true, type: 'string', pattern: /^[a-zA-Z0-9_-]+$/ }
        },
        
        // قواعد المخزون
        inventory: {
            packageId: { required: true, type: 'string' },
            quantity: { required: true, type: 'number', min: 0 },
            id: { required: true, type: 'string', pattern: /^[a-zA-Z0-9_-]+$/ }
        },
        
        // قواعد المحلات
        store: {
            name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
            priceType: { required: true, type: 'string', enum: ['retail', 'wholesale', 'distributor'] },
            id: { required: true, type: 'string', pattern: /^[a-zA-Z0-9_-]+$/ }
        },
        
        // قواعد المبيعات
        sale: {
            storeId: { required: true, type: 'string' },
            packageId: { required: true, type: 'string' },
            quantity: { required: true, type: 'number', min: 1 },
            total: { required: true, type: 'number', min: 0 },
            date: { required: true, type: 'string', pattern: /^\d{4}-\d{2}-\d{2}$/ },
            id: { required: true, type: 'string', pattern: /^[a-zA-Z0-9_-]+$/ }
        },
        
        // قواعد المدفوعات
        payment: {
            storeId: { required: true, type: 'string' },
            amount: { required: true, type: 'number', min: 0 },
            date: { required: true, type: 'string', pattern: /^\d{4}-\d{2}-\d{2}$/ },
            id: { required: true, type: 'string', pattern: /^[a-zA-Z0-9_-]+$/ }
        },
        
        // قواعد المصروفات
        expense: {
            type: { required: true, type: 'string', minLength: 1, maxLength: 50 },
            amount: { required: true, type: 'number', min: 0 },
            date: { required: true, type: 'string', pattern: /^\d{4}-\d{2}-\d{2}$/ },
            description: { required: false, type: 'string', maxLength: 200 },
            id: { required: true, type: 'string', pattern: /^[a-zA-Z0-9_-]+$/ }
        }
    };

    // دالة للتحقق من صحة قيمة واحدة
    function validateField(value, rule) {
        try {
            // التحقق من القيم المطلوبة
            if (rule.required && (value === null || value === undefined || value === '')) {
                return { valid: false, error: 'هذا الحقل مطلوب' };
            }

            // إذا كانت القيمة فارغة وغير مطلوبة، تعتبر صحيحة
            if (!rule.required && (value === null || value === undefined || value === '')) {
                return { valid: true };
            }

            // التحقق من النوع
            if (rule.type) {
                switch (rule.type) {
                    case 'string':
                        if (typeof value !== 'string') {
                            return { valid: false, error: 'يجب أن يكون النص' };
                        }
                        break;
                    case 'number':
                        if (typeof value !== 'number' || isNaN(value)) {
                            return { valid: false, error: 'يجب أن يكون رقماً' };
                        }
                        break;
                    case 'boolean':
                        if (typeof value !== 'boolean') {
                            return { valid: false, error: 'يجب أن يكون true أو false' };
                        }
                        break;
                    case 'array':
                        if (!Array.isArray(value)) {
                            return { valid: false, error: 'يجب أن يكون مصفوفة' };
                        }
                        break;
                    case 'object':
                        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                            return { valid: false, error: 'يجب أن يكون كائناً' };
                        }
                        break;
                }
            }

            // التحقق من الحد الأدنى للطول
            if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
                return { valid: false, error: `يجب أن يكون الطول على الأقل ${rule.minLength} حروف` };
            }

            // التحقق من الحد الأقصى للطول
            if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
                return { valid: false, error: `يجب أن يكون الطول على الأكثر ${rule.maxLength} حروف` };
            }

            // التحقق من الحد الأدنى للقيمة
            if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
                return { valid: false, error: `يجب أن تكون القيمة على الأقل ${rule.min}` };
            }

            // التحقق من الحد الأقصى للقيمة
            if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
                return { valid: false, error: `يجب أن تكون القيمة على الأكثر ${rule.max}` };
            }

            // التحقق من النمط
            if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
                return { valid: false, error: 'النمط غير صحيح' };
            }

            // التحقق من القيم المسموح بها
            if (rule.enum && !rule.enum.includes(value)) {
                return { valid: false, error: `يجب أن تكون القيمة واحدة من: ${rule.enum.join(', ')}` };
            }

            // التحقق من الدالة المخصصة
            if (rule.custom && typeof rule.custom === 'function') {
                try {
                    const customResult = rule.custom(value);
                    if (!customResult.valid) {
                        return customResult;
                    }
                } catch (error) {
                    console.error('خطأ في دالة التحقق المخصصة:', error);
                    return { valid: false, error: 'خطأ في التحقق من صحة البيانات' };
                }
            }

            return { valid: true };
        } catch (error) {
            console.error('خطأ في التحقق من الحقل:', error);
            return { valid: false, error: 'خطأ في التحقق من صحة البيانات' };
        }
    }

    // دالة للتحقق من صحة كائن واحد
    function validateObject(obj, rules) {
        try {
            if (!obj || typeof obj !== 'object') {
                return { valid: false, errors: ['الكائن غير صحيح'] };
            }

            const errors = [];
            const warnings = [];

            // التحقق من جميع الحقول المطلوبة
            for (const [fieldName, rule] of Object.entries(rules)) {
                try {
                    const value = obj[fieldName];
                    const result = validateField(value, rule);
                    
                    if (!result.valid) {
                        errors.push(`${fieldName}: ${result.error}`);
                    } else if (result.warning) {
                        warnings.push(`${fieldName}: ${result.warning}`);
                    }
                } catch (error) {
                    console.error(`خطأ في التحقق من الحقل ${fieldName}:`, error);
                    errors.push(`${fieldName}: خطأ في التحقق من صحة البيانات`);
                }
            }

            // التحقق من الحقول الإضافية غير المتوقعة
            const expectedFields = Object.keys(rules);
            const actualFields = Object.keys(obj);
            const extraFields = actualFields.filter(field => !expectedFields.includes(field));
            
            if (extraFields.length > 0) {
                warnings.push(`حقول إضافية غير متوقعة: ${extraFields.join(', ')}`);
            }

            return {
                valid: errors.length === 0,
                errors: errors,
                warnings: warnings
            };
        } catch (error) {
            console.error('خطأ في التحقق من الكائن:', error);
            return { valid: false, errors: ['خطأ في التحقق من صحة الكائن'] };
        }
    }

    // دالة للتحقق من صحة مصفوفة
    function validateArray(array, itemRules) {
        try {
            if (!Array.isArray(array)) {
                return { valid: false, errors: ['يجب أن تكون مصفوفة'] };
            }

            const errors = [];
            const warnings = [];
            let validItems = 0;

            array.forEach((item, index) => {
                try {
                    const result = validateObject(item, itemRules);
                    if (result.valid) {
                        validItems++;
                    } else {
                        errors.push(`العنصر ${index + 1}: ${result.errors.join(', ')}`);
                    }
                    if (result.warnings.length > 0) {
                        warnings.push(`العنصر ${index + 1}: ${result.warnings.join(', ')}`);
                    }
                } catch (error) {
                    console.error(`خطأ في التحقق من العنصر ${index + 1}:`, error);
                    errors.push(`العنصر ${index + 1}: خطأ في التحقق من صحة البيانات`);
                }
            });

            return {
                valid: errors.length === 0,
                errors: errors,
                warnings: warnings,
                validItems: validItems,
                totalItems: array.length
            };
        } catch (error) {
            console.error('خطأ في التحقق من المصفوفة:', error);
            return { valid: false, errors: ['خطأ في التحقق من صحة المصفوفة'] };
        }
    }

    // دالة للتحقق من صحة البيانات الكاملة
    function validateData(data) {
        try {
            if (!data || typeof data !== 'object') {
                return { valid: false, errors: ['البيانات غير صحيحة'] };
            }

            const results = {};
            let hasErrors = false;
            let totalErrors = 0;
            let totalWarnings = 0;

            // التحقق من الباقات
            if (Array.isArray(data.packages)) {
                results.packages = validateArray(data.packages, validationRules.package);
                if (!results.packages.valid) hasErrors = true;
                totalErrors += results.packages.errors.length;
                totalWarnings += results.packages.warnings.length;
            } else {
                results.packages = { valid: false, errors: ['يجب أن تكون مصفوفة'] };
                hasErrors = true;
                totalErrors++;
            }

            // التحقق من المخزون
            if (Array.isArray(data.inventory)) {
                results.inventory = validateArray(data.inventory, validationRules.inventory);
                if (!results.inventory.valid) hasErrors = true;
                totalErrors += results.inventory.errors.length;
                totalWarnings += results.inventory.warnings.length;
            } else {
                results.inventory = { valid: false, errors: ['يجب أن تكون مصفوفة'] };
                hasErrors = true;
                totalErrors++;
            }

            // التحقق من المحلات
            if (Array.isArray(data.stores)) {
                results.stores = validateArray(data.stores, validationRules.store);
                if (!results.stores.valid) hasErrors = true;
                totalErrors += results.stores.errors.length;
                totalWarnings += results.stores.warnings.length;
            } else {
                results.stores = { valid: false, errors: ['يجب أن تكون مصفوفة'] };
                hasErrors = true;
                totalErrors++;
            }

            // التحقق من المبيعات
            if (Array.isArray(data.sales)) {
                results.sales = validateArray(data.sales, validationRules.sale);
                if (!results.sales.valid) hasErrors = true;
                totalErrors += results.sales.errors.length;
                totalWarnings += results.sales.warnings.length;
            } else {
                results.sales = { valid: false, errors: ['يجب أن تكون مصفوفة'] };
                hasErrors = true;
                totalErrors++;
            }

            // التحقق من المدفوعات
            if (Array.isArray(data.payments)) {
                results.payments = validateArray(data.payments, validationRules.payment);
                if (!results.payments.valid) hasErrors = true;
                totalErrors += results.payments.errors.length;
                totalWarnings += results.payments.warnings.length;
            } else {
                results.payments = { valid: false, errors: ['يجب أن تكون مصفوفة'] };
                hasErrors = true;
                totalErrors++;
            }

            // التحقق من المصروفات
            if (Array.isArray(data.expenses)) {
                results.expenses = validateArray(data.expenses, validationRules.expense);
                if (!results.expenses.valid) hasErrors = true;
                totalErrors += results.expenses.errors.length;
                totalWarnings += results.expenses.warnings.length;
            } else {
                results.expenses = { valid: false, errors: ['يجب أن تكون مصفوفة'] };
                hasErrors = true;
                totalErrors++;
            }

            // التحقق من سلة المحذوفات
            if (Array.isArray(data.trash)) {
                results.trash = { valid: true, warnings: [] };
            } else {
                results.trash = { valid: false, errors: ['يجب أن تكون مصفوفة'] };
                hasErrors = true;
                totalErrors++;
            }

            return {
                valid: !hasErrors,
                results: results,
                totalErrors: totalErrors,
                totalWarnings: totalWarnings,
                summary: {
                    packages: results.packages.validItems || 0,
                    inventory: results.inventory.validItems || 0,
                    stores: results.stores.validItems || 0,
                    sales: results.sales.validItems || 0,
                    payments: results.payments.validItems || 0,
                    expenses: results.expenses.validItems || 0,
                    trash: data.trash ? data.trash.length : 0
                }
            };
        } catch (error) {
            console.error('خطأ في التحقق من البيانات الكاملة:', error);
            return { valid: false, errors: ['خطأ في التحقق من صحة البيانات الكاملة'] };
        }
    }

    // دالة لتنظيف البيانات
    function sanitizeData(data) {
        try {
            if (!data || typeof data !== 'object') {
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

            const sanitized = {};

            // تنظيف كل مصفوفة
            ['packages', 'inventory', 'stores', 'sales', 'payments', 'expenses', 'trash'].forEach(key => {
                if (Array.isArray(data[key])) {
                    sanitized[key] = data[key].filter(item => {
                        try {
                            return item && typeof item === 'object' && item.id;
                        } catch (error) {
                            console.warn('عنصر تالف في', key, ':', error);
                            return false;
                        }
                    });
                } else {
                    sanitized[key] = [];
                }
            });

            return sanitized;
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

    // دالة للتحقق من صحة التاريخ
    function validateDate(dateString) {
        try {
            if (!dateString || typeof dateString !== 'string') {
                return { valid: false, error: 'التاريخ غير صحيح' };
            }

            // التحقق من النمط
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                return { valid: false, error: 'صيغة التاريخ غير صحيحة (YYYY-MM-DD)' };
            }

            // التحقق من صحة التاريخ
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return { valid: false, error: 'تاريخ غير صحيح' };
            }

            // التحقق من أن التاريخ ليس في المستقبل البعيد
            const now = new Date();
            const maxDate = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate());
            if (date > maxDate) {
                return { valid: false, error: 'التاريخ في المستقبل البعيد' };
            }

            return { valid: true };
        } catch (error) {
            console.error('خطأ في التحقق من التاريخ:', error);
            return { valid: false, error: 'خطأ في التحقق من التاريخ' };
        }
    }

    // دالة للتحقق من صحة المبلغ
    function validateAmount(amount) {
        try {
            if (typeof amount !== 'number' || isNaN(amount)) {
                return { valid: false, error: 'المبلغ يجب أن يكون رقماً' };
            }

            if (amount < 0) {
                return { valid: false, error: 'المبلغ لا يمكن أن يكون سالباً' };
            }

            if (amount > 999999999) {
                return { valid: false, error: 'المبلغ كبير جداً' };
            }

            return { valid: true };
        } catch (error) {
            console.error('خطأ في التحقق من المبلغ:', error);
            return { valid: false, error: 'خطأ في التحقق من المبلغ' };
        }
    }

    // تصدير الدوال
    if (typeof window !== 'undefined') {
        window.DataValidator = {
            validateField,
            validateObject,
            validateArray,
            validateData,
            sanitizeData,
            validateDate,
            validateAmount,
            rules: validationRules
        };

        // اختصارات سريعة
        window.$validate = {
            field: validateField,
            object: validateObject,
            array: validateArray,
            data: validateData,
            sanitize: sanitizeData,
            date: validateDate,
            amount: validateAmount
        };
    }

})();