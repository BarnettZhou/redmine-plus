// 加载配置
function loadConfig() {
    chrome.storage.local.get("redminePlusConfig", function(result) {
        const config = result.redminePlusConfig || defaultConfig;
        populateForm(config);
    });
}

// 填充表单
function populateForm(config) {
    // 基础设置
    const hostItemsContainer = document.getElementById('host-items');
    hostItemsContainer.innerHTML = '';
    let hosts = [];
    if (config.hosts && Array.isArray(config.hosts)) {
        hosts = config.hosts;
    } else if (config.host) {
        hosts = [config.host];
    }
    if (hosts.length > 0) {
        hosts.forEach(host => addHostItem(host));
    } else {
        addHostItem('127.0.0.1:8080');
    }

    // 项目快捷入口
    document.getElementById('project-shortcuts-switch').checked = config.project_shortcuts.enabled;
    document.getElementById('default-query-id').value = config.project_shortcuts.default_query_id || '';
    handleSwitchChange('project-shortcuts');

    // 清空现有项目列表
    const itemsContainer = document.getElementById('project-items');
    itemsContainer.innerHTML = '';

    // 添加入口列表
    if (config.project_shortcuts.items && config.project_shortcuts.items.length > 0) {
        config.project_shortcuts.items.forEach(item => {
            addProjectShortcutItem(item.name, item.project_key, item.query_id);
        });
    }

    // 工时登记助手
    const timeEntryAssistantEnabled = config.time_entry_assistant ? config.time_entry_assistant.enabled : true;
    document.getElementById('time-entry-assistant-switch').checked = timeEntryAssistantEnabled;
    handleSwitchChange('time-entry-assistant');

    // 清空现有映射列表
    const timeEntryItemsContainer = document.getElementById('time-entry-assistant-items');
    timeEntryItemsContainer.innerHTML = '';

    // 添加工时登记助手映射列表
    if (config.time_entry_assistant && config.time_entry_assistant.items && config.time_entry_assistant.items.length > 0) {
        config.time_entry_assistant.items.forEach(item => {
            addTimeEntryAssistantItem(item.project_name, item.custom_field_value);
        });
    }

    // 新建助手
    const issueCreationEnabled = config.issue_creation_assistant ? config.issue_creation_assistant.enabled : true;
    document.getElementById('issue-creation-assistant-switch').checked = issueCreationEnabled;
    handleSwitchChange('issue-creation-assistant');

    if (config.issue_creation_assistant && config.issue_creation_assistant.common_fields) {
        const cf = config.issue_creation_assistant.common_fields;
        document.getElementById('issue-creation-product-manager').value = cf.product_manager || '';
        document.getElementById('issue-creation-responsible-person').value = cf.responsible_person || '';
        document.getElementById('issue-creation-assigned-to').value = cf.assigned_to || '';
        document.getElementById('issue-creation-document-trace').value = cf.document_trace || '0';
    } else {
        document.getElementById('issue-creation-product-manager').value = '';
        document.getElementById('issue-creation-responsible-person').value = '';
        document.getElementById('issue-creation-assigned-to').value = '';
        document.getElementById('issue-creation-document-trace').value = '0';
    }

    const issueCreationItemsContainer = document.getElementById('issue-creation-assistant-items');
    issueCreationItemsContainer.innerHTML = '';
    if (config.issue_creation_assistant && config.issue_creation_assistant.project_mappings && config.issue_creation_assistant.project_mappings.length > 0) {
        config.issue_creation_assistant.project_mappings.forEach(item => {
            addIssueCreationAssistantItem(item.project_name, item.division);
        });
    }

    // 耗时快捷查询
    document.getElementById('time-tracking-shortcuts-switch').checked = config.time_tracking_shortcuts.enabled;
    handleSwitchChange('time-tracking-shortcuts');

    // 沉浸输入
    document.getElementById('immersive-writing-switch').checked = config.immersive_input.enabled;
    handleSwitchChange('immersive-writing');

    // issue快捷查看
    document.getElementById('issue-details-switch').checked = config.issue_details.enabled;
    handleSwitchChange('issue-details');

    // 时间报表图表
    const timeReportChartEnabled = config.time_report_chart ? config.time_report_chart.enabled : true;
    document.getElementById('time-report-chart-switch').checked = timeReportChartEnabled;
    handleSwitchChange('time-report-chart');

    updateSideNavStatus();
}

// 更新侧边导航状态
function updateSideNavStatus() {
    const navItems = document.querySelectorAll('#side-nav .side-nav-item');
    navItems.forEach(item => {
        const statusEl = item.querySelector('.side-nav-status');
        const switchId = item.dataset.switch;
        if (!switchId) {
            statusEl.textContent = '-';
            statusEl.className = 'side-nav-status';
            return;
        }
        const switchEl = document.getElementById(switchId);
        if (switchEl && switchEl.checked) {
            statusEl.textContent = 'on';
            statusEl.className = 'side-nav-status on';
        } else {
            statusEl.textContent = 'off';
            statusEl.className = 'side-nav-status off';
        }
    });
}

// 开关事件处理
function handleSwitchChange(card) {
    const switchElement = document.getElementById(`${card}-switch`);
    const cardContent = document.getElementById(`${card}-options`);
    const isEnabled = switchElement.checked;
    
    // 更新状态标签
    const statusBadge = document.getElementById(`${card}-status`);
    if (statusBadge) {
        if (isEnabled) {
            statusBadge.textContent = '已启用';
            statusBadge.className = 'status-badge active';
        } else {
            statusBadge.textContent = '已禁用';
            statusBadge.className = 'status-badge inactive';
        }
    }

    if (isEnabled) {
        cardContent.querySelector('.sub-options').style.display = 'block';
        cardContent.querySelector('.disabled-message').style.display = 'none';
        cardContent.classList.remove('disabled-overlay');
    } else {
        cardContent.querySelector('.sub-options').style.display = 'none';
        cardContent.querySelector('.disabled-message').style.display = 'block';
        cardContent.classList.add('disabled-overlay');
    }

    updateSideNavStatus();
}

// 设置事件监听器
function setupEventListeners() {
    // 添加服务地址
    document.getElementById('add-host-item').addEventListener('click', function() {
        addHostItem();
    });

    // 添加项目快捷入口
    document.getElementById('add-project-item').addEventListener('click', function() {
        addProjectShortcutItem();
    });

    // 保存设置
    document.getElementById('save-option').addEventListener('click', function(e) {
        e.preventDefault();
        saveConfig();
    });

    // 重置为默认设置
    document.getElementById('reset-option').addEventListener('click', function(e) {
        e.preventDefault();
        resetToDefault();
    });

    // 项目快捷入口开关事件
    document.getElementById('project-shortcuts-switch').addEventListener('change', function() {
        handleSwitchChange('project-shortcuts');
    });

    // 工时登记助手开关事件
    document.getElementById('time-entry-assistant-switch').addEventListener('change', function() {
        handleSwitchChange('time-entry-assistant');
    });

    // 添加工时登记助手映射项
    document.getElementById('add-time-entry-assistant-item').addEventListener('click', function() {
        addTimeEntryAssistantItem();
    });

    // 新建助手开关事件
    document.getElementById('issue-creation-assistant-switch').addEventListener('change', function() {
        handleSwitchChange('issue-creation-assistant');
    });

    // 添加新建助手映射项
    document.getElementById('add-issue-creation-assistant-item').addEventListener('click', function() {
        addIssueCreationAssistantItem();
    });

    // 耗时快捷查询开关事件
    document.getElementById('time-tracking-shortcuts-switch').addEventListener('change', function() {
        handleSwitchChange('time-tracking-shortcuts');
    });

    // 沉浸输入开关事件
    document.getElementById('immersive-writing-switch').addEventListener('change', function() {
        handleSwitchChange('immersive-writing');
    });

    // issue快捷查看开关事件
    document.getElementById('issue-details-switch').addEventListener('change', function() {
        handleSwitchChange('issue-details');
    });

    // 时间报表图表开关事件
    document.getElementById('time-report-chart-switch').addEventListener('change', function() {
        handleSwitchChange('time-report-chart');
    });

    // 侧边导航点击事件
    document.querySelectorAll('#side-nav .side-nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// 添加服务地址项
function addHostItem(value = '') {
    const itemsContainer = document.getElementById('host-items');

    const itemDiv = document.createElement('div');
    itemDiv.className = 'project-item';
    itemDiv.style.gridTemplateColumns = '1fr auto';

    itemDiv.innerHTML = `
        <input type="text" class="form-input" placeholder="例如：https://redm.example.com" value="${value}">
        <button class="btn btn-danger" title="删除">🗑️</button>
    `;

    itemDiv.querySelector('.btn-danger').addEventListener('click', function() {
        itemDiv.style.opacity = '0';
        itemDiv.style.transform = 'translateX(-10px)';
        setTimeout(() => itemDiv.remove(), 200);
    });

    itemsContainer.appendChild(itemDiv);

    itemDiv.style.opacity = '0';
    itemDiv.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        itemDiv.style.transition = 'all 0.2s';
        itemDiv.style.opacity = '1';
        itemDiv.style.transform = 'translateY(0)';
    }, 10);
}

// 添加项目快捷入口项
function addProjectShortcutItem(name = '', key = '', queryId = '') {
    const itemsContainer = document.getElementById('project-items');

    const itemDiv = document.createElement('div');
    itemDiv.className = 'project-item with-query';

    itemDiv.innerHTML = `
        <input type="text" class="form-input" placeholder="项目名称" value="${name}">
        <input type="text" class="form-input" placeholder="项目key" value="${key}">
        <input type="text" class="form-input" placeholder="查询ID" value="${queryId}">
        <button class="btn btn-danger" title="删除">🗑️</button>
    `;

    // 添加删除按钮事件
    itemDiv.querySelector('.btn-danger').addEventListener('click', function() {
        itemDiv.style.opacity = '0';
        itemDiv.style.transform = 'translateX(-10px)';
        setTimeout(() => itemDiv.remove(), 200);
    });
    
    itemsContainer.appendChild(itemDiv);
    
    // 入场动画
    itemDiv.style.opacity = '0';
    itemDiv.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        itemDiv.style.transition = 'all 0.2s';
        itemDiv.style.opacity = '1';
        itemDiv.style.transform = 'translateY(0)';
    }, 10);
}

// 添加工时登记助手映射项
function addTimeEntryAssistantItem(projectName = '', fieldValue = '') {
    const itemsContainer = document.getElementById('time-entry-assistant-items');

    const itemDiv = document.createElement('div');
    itemDiv.className = 'project-item';

    itemDiv.innerHTML = `
        <input type="text" class="form-input" placeholder="项目名称" value="${projectName}">
        <input type="text" class="form-input" placeholder="字段值" value="${fieldValue}">
        <button class="btn btn-danger" title="删除">🗑️</button>
    `;

    // 添加删除按钮事件
    itemDiv.querySelector('.btn-danger').addEventListener('click', function() {
        itemDiv.style.opacity = '0';
        itemDiv.style.transform = 'translateX(-10px)';
        setTimeout(() => itemDiv.remove(), 200);
    });
    
    itemsContainer.appendChild(itemDiv);
    
    // 入场动画
    itemDiv.style.opacity = '0';
    itemDiv.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        itemDiv.style.transition = 'all 0.2s';
        itemDiv.style.opacity = '1';
        itemDiv.style.transform = 'translateY(0)';
    }, 10);
}

// 添加新建助手映射项
function addIssueCreationAssistantItem(projectName = '', division = '') {
    const itemsContainer = document.getElementById('issue-creation-assistant-items');

    const itemDiv = document.createElement('div');
    itemDiv.className = 'project-item';

    itemDiv.innerHTML = `
        <input type="text" class="form-input" placeholder="项目名称" value="${projectName}">
        <input type="text" class="form-input" placeholder="事业部" value="${division}">
        <button class="btn btn-danger" title="删除">🗑️</button>
    `;

    // 添加删除按钮事件
    itemDiv.querySelector('.btn-danger').addEventListener('click', function() {
        itemDiv.style.opacity = '0';
        itemDiv.style.transform = 'translateX(-10px)';
        setTimeout(() => itemDiv.remove(), 200);
    });
    
    itemsContainer.appendChild(itemDiv);
    
    // 入场动画
    itemDiv.style.opacity = '0';
    itemDiv.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        itemDiv.style.transition = 'all 0.2s';
        itemDiv.style.opacity = '1';
        itemDiv.style.transform = 'translateY(0)';
    }, 10);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadConfig();
    setupEventListeners();
});

// 验证表单
function validateForm() {
    const errors = [];
    
    // 验证项目快捷入口
    const projectItems = document.querySelectorAll('#project-items .project-item');
    projectItems.forEach((item, index) => {
        const name = item.querySelector('input[placeholder="项目名称"]').value.trim();
        const key = item.querySelector('input[placeholder="项目key"]').value.trim();

        if (name && !key) {
            errors.push(`第${index + 1}个入口缺少项目Key`);
        }
        if (key && !name) {
            errors.push(`第${index + 1}个入口缺少名称`);
        }
    });

    // 验证工时登记助手
    const timeEntryItems = document.querySelectorAll('#time-entry-assistant-items .project-item');
    timeEntryItems.forEach((item, index) => {
        const projectName = item.querySelector('input[placeholder="项目名称"]').value.trim();
        const fieldValue = item.querySelector('input[placeholder="字段值"]').value.trim();

        if (projectName && !fieldValue) {
            errors.push(`工时登记：第${index + 1}个映射缺少字段值`);
        }
        if (fieldValue && !projectName) {
            errors.push(`工时登记：第${index + 1}个映射缺少项目名称`);
        }
    });

    // 验证新建助手项目映射
    const issueCreationItems = document.querySelectorAll('#issue-creation-assistant-items .project-item');
    issueCreationItems.forEach((item, index) => {
        const projectName = item.querySelector('input[placeholder="项目名称"]').value.trim();
        const division = item.querySelector('input[placeholder="事业部"]').value.trim();

        if (projectName && !division) {
            errors.push(`新建助手：第${index + 1}个映射缺少事业部`);
        }
        if (division && !projectName) {
            errors.push(`新建助手：第${index + 1}个映射缺少项目名称`);
        }
    });
    
    return errors;
}

// 保存配置
function saveConfig() {
    const errors = validateForm();

    if (errors.length > 0) {
        showMessage(errors.join('<br>'), 'error-message');
        return;
    }

    // 收集服务地址列表
    const hostItems = document.querySelectorAll('#host-items .project-item');
    const hosts = [];
    hostItems.forEach(item => {
        const val = item.querySelector('input').value.trim();
        if (val) hosts.push(val);
    });
    const finalHosts = hosts.length > 0 ? hosts : ['127.0.0.1:8080'];

    // 构建配置对象
    const config = {
        hosts: finalHosts,
        host: finalHosts[0], // 保留 host 字段以兼容旧版
        project_shortcuts: {
            enabled: document.getElementById('project-shortcuts-switch').checked,
            default_query_id: document.getElementById('default-query-id').value,
            items: []
        },
        time_tracking_shortcuts: {
            enabled: document.getElementById('time-tracking-shortcuts-switch').checked
        },
        immersive_input: {
            enabled: document.getElementById('immersive-writing-switch').checked
        },
        issue_details: {
            enabled: document.getElementById('issue-details-switch').checked
        },
        ai_completion: defaultConfig.ai_completion,
        time_report_chart: {
            enabled: document.getElementById('time-report-chart-switch').checked
        },
        time_entry_assistant: {
            enabled: document.getElementById('time-entry-assistant-switch').checked,
            items: []
        },
        issue_creation_assistant: {
            enabled: document.getElementById('issue-creation-assistant-switch').checked,
            common_fields: {
                product_manager: document.getElementById('issue-creation-product-manager').value.trim(),
                responsible_person: document.getElementById('issue-creation-responsible-person').value.trim(),
                assigned_to: document.getElementById('issue-creation-assigned-to').value.trim(),
                document_trace: document.getElementById('issue-creation-document-trace').value
            },
            project_mappings: []
        }
    };

    // 添加入口列表
    const projectItems = document.querySelectorAll('#project-items .project-item');
    console.log(projectItems);
    projectItems.forEach(item => {
        const name = item.querySelector('input[placeholder="项目名称"]').value.trim();
        const key = item.querySelector('input[placeholder="项目key"]').value.trim();
        const queryId = item.querySelector('input[placeholder="查询ID"]').value.trim();
        
        if (name && key) {
            config.project_shortcuts.items.push({
                name: name,
                project_key: key,
                query_id: queryId
            });
        }
    });

    // 添加工时登记助手映射项
    const timeEntryItems = document.querySelectorAll('#time-entry-assistant-items .project-item');
    timeEntryItems.forEach(item => {
        const projectName = item.querySelector('input[placeholder="项目名称"]').value.trim();
        const fieldValue = item.querySelector('input[placeholder="字段值"]').value.trim();
        
        if (projectName && fieldValue) {
            config.time_entry_assistant.items.push({
                project_name: projectName,
                custom_field_value: fieldValue
            });
        }
    });

    // 添加新建助手映射项
    const issueCreationItems = document.querySelectorAll('#issue-creation-assistant-items .project-item');
    issueCreationItems.forEach(item => {
        const projectName = item.querySelector('input[placeholder="项目名称"]').value.trim();
        const division = item.querySelector('input[placeholder="事业部"]').value.trim();
        
        if (projectName && division) {
            config.issue_creation_assistant.project_mappings.push({
                project_name: projectName,
                division: division
            });
        }
    });
    
    // 保存到chrome.storage.local
    chrome.storage.local.set({redminePlusConfig: config}, function() {
        showMessage('设置已保存', 'success-message');
    });
}

// 重置为默认设置
function resetToDefault() {
    if (confirm('确定要重置为默认设置吗？当前设置将被覆盖。')) {
        chrome.storage.local.set({redminePlusConfig: defaultConfig}, function() {
            loadConfig();
            showMessage('已重置为默认设置', 'success-message');
        });
    }
}

// 显示消息
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `
        <span style="font-size: 1.125rem;">${type === 'success-message' ? '✓' : '✕'}</span>
        <span>${message}</span>
    `;
    messageDiv.className = `message ${type === 'success-message' ? 'success' : 'error'}`;
    
    // 3秒后自动隐藏
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            messageDiv.style.display = 'none';
            messageDiv.className = 'hide';
        }, 300);
    }, 3000);
}