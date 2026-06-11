// 新建助手
// 新建问题时自动填充通用字段和根据项目映射事业部

function issueCreationAssistantInit(config) {
    if (!config.common_fields && !config.project_mappings) {
        console.log('新建助手: 配置为空');
        return;
    }

    const commonFields = [
        { selector: '#issue_custom_field_values_3', value: config.common_fields.product_manager },
        { selector: '#issue_custom_field_values_17', value: config.common_fields.responsible_person },
        { selector: '#issue_assigned_to_id', value: config.common_fields.assigned_to },
        { selector: '#issue_custom_field_values_33', value: config.common_fields.document_trace }
    ];

    // 动态字段：项目 -> 事业部
    const currentProjectEl = document.querySelector('.current-project');
    let divisionValue = null;
    if (currentProjectEl && config.project_mappings) {
        const projectName = currentProjectEl.textContent.trim();
        const mapping = config.project_mappings.find(m => m.project_name === projectName);
        if (mapping) {
            divisionValue = mapping.division;
        }
    }

    if (divisionValue) {
        commonFields.push({ selector: '#issue_custom_field_values_4', value: divisionValue });
    }

    const targets = commonFields.filter(f => f.value !== '' && f.value !== null && f.value !== undefined);

    if (targets.length === 0) {
        console.log('新建助手: 没有需要填充的字段');
        return;
    }

    function setField(target) {
        const element = document.querySelector(target.selector);
        if (!element) return false;

        const targetValue = String(target.value);

        if (element.tagName === 'SELECT') {
            const option = [...element.options].find(opt => opt.value === targetValue || opt.text === targetValue);
            if (!option) {
                console.log('新建助手: 未找到选项', target.selector, targetValue);
                return false;
            }
            option.selected = true;
        } else {
            element.value = targetValue;
        }

        // 触发事件
        element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

        // 处理 Select2
        if (typeof jQuery === 'function') {
            const $el = jQuery(element);
            if ($el.data('select2')) {
                $el.trigger('change.select2');
                const container = $el.next('.select2-container').find('.select2-selection__rendered');
                if (container.length && element.tagName === 'SELECT') {
                    container.text(element.options[element.selectedIndex].text);
                }
            }
        }

        console.log('新建助手: 已设置', target.selector, targetValue);
        return true;
    }

    // 初始处理
    const pending = new Set(targets.map(t => t.selector));
    const timers = [];

    function process() {
        targets.forEach(target => {
            if (!pending.has(target.selector)) return;

            const timer = setInterval(() => {
                if (!pending.has(target.selector)) {
                    clearInterval(timer);
                    return;
                }
                const success = setField(target);
                if (success) {
                    pending.delete(target.selector);
                    clearInterval(timer);
                }
            }, 200);

            timers.push(timer);

            // 最大等待 10 秒后清理
            setTimeout(() => {
                if (pending.has(target.selector)) {
                    pending.delete(target.selector);
                    clearInterval(timer);
                }
            }, 10000);
        });
    }

    process();

    // 监听动态加载的表单元素
    const observer = new MutationObserver(() => {
        if (pending.size === 0) {
            observer.disconnect();
            return;
        }
        targets.forEach(target => {
            if (pending.has(target.selector)) {
                const success = setField(target);
                if (success) pending.delete(target.selector);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 页面卸载时清理
    window.addEventListener('unload', () => {
        timers.forEach(t => clearInterval(t));
        observer.disconnect();
    });
}
