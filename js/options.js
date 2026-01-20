// 默认配置
const defaultConfig = {
    project_shortcuts: {
        enabled: true,
        default_query_id: "",
        items: []
    },
    time_tracking_shortcuts: {
        enabled: true
    },
    immersive_input: {
        enabled: true
    },
    issue_details: {
        enabled: true
    },
    ai_completion: {
        enabled: true,
        api_service_address: '',
        api_key: '',
        model_id: '',
        max_tokens: 100,
        temperature: 0.2,
        top_p: 0.5
    }
};

// 加载配置
function loadConfig() {
    chrome.storage.local.get("redminePlusConfig", function(result) {
        const config = result.redminePlusConfig || defaultConfig;
        populateForm(config);
    });
}

// 填充表单
function populateForm(config) {
    // 项目快捷入口
    document.getElementById('project-shortcuts-switch').checked = config.project_shortcuts.enabled;
    document.getElementById('default-query-id').value = config.project_shortcuts.default_query_id || '';
    handleSwitchChange('project-shortcuts');

    // 清空现有项目列表
    const itemsContainer = document.getElementById('project-items');
    itemsContainer.innerHTML = '';

    // 添加项目列表
    if (config.project_shortcuts.items && config.project_shortcuts.items.length > 0) {
        config.project_shortcuts.items.forEach(item => {
            addProjectShortcutItem(item.name, item.project_key);
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

    // AI补全
    document.getElementById('ai-completion-switch').checked = config.ai_completion.enabled;
    document.getElementById('api-service-address').value = config.ai_completion.api_service_address;
    document.getElementById('api-key').value = config.ai_completion.api_key;
    document.getElementById('model-id').value = config.ai_completion.model_id;
    document.getElementById('max-tokens').value = config.ai_completion.max_tokens;
    handleSwitchChange('ai-completion');
}

// 开关事件处理
function handleSwitchChange(card) {
    const switchElement = document.getElementById(`${card}-switch`);
    const cardContent = document.getElementById(`${card}-options`);
    const isEnabled = switchElement.checked;

    console.log(isEnabled);

    if (isEnabled) {
        cardContent.getElementsByClassName('sub-options')[0].classList.toggle('hide', false);
        cardContent.getElementsByClassName('disabled-message')[0].classList.toggle('hide', true);
    } else {
        cardContent.getElementsByClassName('sub-options')[0].classList.toggle('hide', true);
        cardContent.getElementsByClassName('disabled-message')[0].classList.toggle('hide', false);
    }
}

// 设置事件监听器
function setupEventListeners() {
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
    document.getElementById('reset-option').addEventListener('click', function() {
        e.preventDefault();
        resetToDefault();
    });

    // 项目快捷入口开关事件
    document.getElementById('project-shortcuts-switch').addEventListener('change', function() {
        handleSwitchChange('project-shortcuts');
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

    // AI补全开关事件
    document.getElementById('ai-completion-switch').addEventListener('change', function() {
        handleSwitchChange('ai-completion');
    });
}

// 添加项目快捷入口项
function addProjectShortcutItem(name = '', key = '') {
    const itemsContainer = document.getElementById('project-items');

    const itemDiv = document.createElement('div');
    itemDiv.className = 'project-item grid';

    itemDiv.innerHTML = `
        <input type="text" placeholder="项目名称" value="${name}">
        <input type="text" placeholder="项目key" value="${key}">
        <button class="delete-btn outline">删除</button>
    `;

    // 添加删除按钮事件
    itemDiv.querySelector('.delete-btn').addEventListener('click', function() {
        itemDiv.remove();
    });
    
    itemsContainer.appendChild(itemDiv);
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
            errors.push(`第${index + 1}个项目缺少项目Key`);
        }
        if (key && !name) {
            errors.push(`第${index + 1}个项目缺少名称`);
        }
    });
    
    // 验证AI补全配置
    const aiEnabled = document.getElementById('ai-completion-switch').checked;
    if (aiEnabled) {
        const apiService = document.getElementById('api-service-address').value.trim();
        const apiKey = document.getElementById('api-key').value.trim();
        const modelId = document.getElementById('model-id').value.trim();

        if (!apiService) {
            errors.push('AI补全已启用，但未填写API服务地址');
        }
        if (!apiKey) {
            errors.push('AI补全已启用，但未填写API Key');
        }
        if (!modelId) {
            errors.push('AI补全已启用，但未填写模型ID');
        }
        
        // 验证URL格式
        if (apiService && !isValidUrl(apiService)) {
            errors.push('API服务地址格式不正确');
        }
    }
    
    return errors;
}

// 验证URL格式
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

// 保存配置
function saveConfig() {
    const errors = validateForm();

    if (errors.length > 0) {
        showMessage(errors.join('<br>'), 'error-message');
        return;
    }

    // 构建配置对象
    const config = {
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
        ai_completion: {
            enabled: document.getElementById('ai-completion-switch').checked,
            api_service_address: document.getElementById('api-service-address').value.trim(),
            api_key: document.getElementById('api-key').value.trim(),
            model_id: document.getElementById('model-id').value.trim(),
            max_tokens: parseInt(document.getElementById('max-tokens').value) || 100,
        }
    };

    // 添加项目快捷入口项
    const projectItems = document.querySelectorAll('#project-items .project-item');
    console.log(projectItems);
    projectItems.forEach(item => {
        const name = item.querySelector('input[placeholder="项目名称"]').value.trim();
        const key = item.querySelector('input[placeholder="项目key"]').value.trim();
        
        if (name && key) {
            config.project_shortcuts.items.push({
                name: name,
                project_key: key
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
    messageDiv.innerHTML = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // 3秒后自动隐藏消息
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}