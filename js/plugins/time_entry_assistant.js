// 工时登记助手
// 根据页面上的.current-project文字内容自动选择#time_entry_custom_field_values_5的选项

function timeEntryAssistantInit(config) {
    // 查找当前项目名称
    const currentProjectEl = document.querySelector('.current-project');
    if (!currentProjectEl) {
        console.log('工时登记助手: 未找到.current-project元素');
        return;
    }

    const currentProjectName = currentProjectEl.textContent.trim();
    if (!currentProjectName) {
        console.log('工时登记助手: 当前项目名称为空');
        return;
    }

    console.log('工时登记助手: 当前项目名称为', currentProjectName);

    // 查找自定义字段下拉框
    const customFieldSelect = document.getElementById('time_entry_custom_field_values_5');
    if (!customFieldSelect) {
        console.log('工时登记助手: 未找到#time_entry_custom_field_values_5元素');
        return;
    }

    // 在配置中查找匹配的项目
    const matchedItem = config.items.find(item => item.project_name === currentProjectName);
    if (!matchedItem) {
        console.log('工时登记助手: 未找到匹配的项目配置', currentProjectName);
        return;
    }

    // 选择对应的选项
    const targetValue = matchedItem.custom_field_value;
    let found = false;

    for (let i = 0; i < customFieldSelect.options.length; i++) {
        if (customFieldSelect.options[i].value === targetValue) {
            customFieldSelect.selectedIndex = i;
            found = true;
            console.log('工时登记助手: 已选择选项', targetValue, customFieldSelect.options[i].text);
            break;
        }
    }

    if (!found) {
        console.log('工时登记助手: 未在下拉框中找到值为', targetValue, '的选项');
        return;
    }

    // 同步更新 Select2 容器的显示文本
    const select2Container = document.getElementById('select2-time_entry_custom_field_values_5-container');
    if (select2Container) {
        const selectedOption = customFieldSelect.options[customFieldSelect.selectedIndex];
        select2Container.innerText = selectedOption.text;
        console.log('工时登记助手: 已同步 Select2 显示文本为', selectedOption.text);
    }
}
