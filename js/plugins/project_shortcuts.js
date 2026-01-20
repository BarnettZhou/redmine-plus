// 项目快捷方式实现
function projectShortcutsInit(projectShortcutsConfig) {
    // 获取目标菜单容器
    const targetMenu = document.querySelector('#top-menu > ul');

    const queryParams = projectShortcutsConfig.default_query_id ?
        `?query_id=${projectShortcutsConfig.default_query_id}`
        : `?set_filter=1&sort=cf_11,id:desc&f[]=status_id&op[status_id]=o&f[]=tracker_id&op[tracker_id]==&v[tracker_id][]=2`;

    // 批量创建菜单项
    if (targetMenu) {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = '|'
        li.appendChild(span)
        targetMenu.appendChild(li);

        projectShortcutsConfig.items.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');

            a.textContent = item.name;
            a.href = `/projects/${item.project_key}/issues` + queryParams;

            li.appendChild(a);
            targetMenu.appendChild(li);
        });
    }
}
