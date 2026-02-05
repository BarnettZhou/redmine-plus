// 页面美化插件 - 将 Redmine 页面改为现代、美观的样式

function initPageBeautify(config) {
    if (!config.enabled) return;
    
    console.log("[RedminePlus] 页面美化已启用");
    
    // 注入美化样式
    injectBeautifyStyles();
    
    // 执行页面优化
    beautifyPage();
    
    // 监听页面变化，处理动态加载的内容
    observePageChanges();
}

// 注入美化样式
function injectBeautifyStyles() {
    const style = document.createElement('style');
    style.id = 'redmine-plus-beautify';
    style.textContent = `
        /* ==================== 全局样式 ==================== */
        :root {
            --rp-primary: #4f46e5;
            --rp-primary-hover: #4338ca;
            --rp-primary-light: #e0e7ff;
            --rp-success: #10b981;
            --rp-warning: #f59e0b;
            --rp-error: #ef4444;
            --rp-bg: #f8fafc;
            --rp-card-bg: #ffffff;
            --rp-text: #1e293b;
            --rp-text-secondary: #64748b;
            --rp-border: #e2e8f0;
            --rp-shadow: 0 1px 3px rgba(0,0,0,0.1);
            --rp-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
            --rp-radius: 8px;
            --rp-radius-lg: 12px;
        }
        
        /* ==================== 顶部导航 ==================== */
        #top-menu {
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%) !important;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2) !important;
            border-bottom: none !important;
            padding: 0 20px !important;
        }
        
        #top-menu ul li a {
            color: rgba(255,255,255,0.9) !important;
            font-weight: 500 !important;
            padding: 12px 16px !important;
            transition: all 0.2s !important;
            border-radius: 6px !important;
            margin: 4px 2px !important;
        }
        
        #top-menu ul li a:hover {
            background: rgba(255,255,255,0.15) !important;
            color: #fff !important;
            transform: translateY(-1px) !important;
        }
        
        #loggedas {
            color: rgba(255,255,255,0.7) !important;
        }
        
        #loggedas a {
            color: #fff !important;
            font-weight: 600 !important;
        }
        
        /* ==================== 头部区域 ==================== */
        #header {
            background: var(--rp-card-bg) !important;
            box-shadow: var(--rp-shadow) !important;
            border-bottom: 1px solid var(--rp-border) !important;
            padding: 20px 30px !important;
        }
        
        #header h1 {
            font-size: 1.75rem !important;
            font-weight: 700 !important;
            color: var(--rp-text) !important;
            margin: 0 0 15px 0 !important;
        }
        
        #header .breadcrumbs {
            font-size: 0.875rem !important;
            color: var(--rp-text-secondary) !important;
        }
        
        #header .breadcrumbs a {
            color: var(--rp-primary) !important;
            font-weight: 500 !important;
        }
        
        #header .current-project {
            color: var(--rp-text) !important;
        }
        
        /* ==================== 主导航菜单 ==================== */
        #main-menu {
            background: transparent !important;
            border: none !important;
            margin-top: 15px !important;
        }
        
        #main-menu ul li a {
            background: transparent !important;
            color: var(--rp-text-secondary) !important;
            font-weight: 500 !important;
            padding: 10px 20px !important;
            border-radius: 8px 8px 0 0 !important;
            border: none !important;
            transition: all 0.2s !important;
        }
        
        #main-menu ul li a:hover {
            color: var(--rp-primary) !important;
            background: rgba(79, 70, 229, 0.05) !important;
        }
        
        #main-menu ul li a.selected,
        #main-menu ul li a.issues.selected {
            color: var(--rp-primary) !important;
            background: var(--rp-primary-light) !important;
            font-weight: 600 !important;
            box-shadow: inset 0 -2px 0 var(--rp-primary) !important;
        }
        
        /* 新建按钮 */
        #new-object {
            background: var(--rp-primary) !important;
            color: #fff !important;
            border-radius: 8px !important;
            font-weight: 600 !important;
            box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3) !important;
            transition: all 0.2s !important;
        }
        
        #new-object:hover {
            background: var(--rp-primary-hover) !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 8px rgba(79, 70, 229, 0.4) !important;
        }
        
        /* ==================== 主内容区域 ==================== */
        #main {
            background: var(--rp-bg) !important;
            padding: 20px !important;
        }
        
        #content {
            background: var(--rp-card-bg) !important;
            border-radius: var(--rp-radius-lg) !important;
            box-shadow: var(--rp-shadow) !important;
            padding: 25px !important;
            border: 1px solid var(--rp-border) !important;
        }
        
        /* ==================== 侧边栏 ==================== */
        #sidebar {
            background: var(--rp-card-bg) !important;
            border-radius: var(--rp-radius-lg) !important;
            box-shadow: var(--rp-shadow) !important;
            padding: 20px !important;
            border: 1px solid var(--rp-border) !important;
        }
        
        #sidebar h3 {
            font-size: 0.875rem !important;
            font-weight: 700 !important;
            color: var(--rp-text) !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            margin: 20px 0 12px 0 !important;
            padding-bottom: 8px !important;
            border-bottom: 2px solid var(--rp-primary-light) !important;
        }
        
        #sidebar h3:first-child {
            margin-top: 0 !important;
        }
        
        #sidebar ul.queries li {
            margin: 6px 0 !important;
        }
        
        #sidebar ul.queries li a {
            color: var(--rp-text-secondary) !important;
            padding: 8px 12px !important;
            border-radius: 6px !important;
            transition: all 0.2s !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
        }
        
        #sidebar ul.queries li a:hover {
            background: var(--rp-primary-light) !important;
            color: var(--rp-primary) !important;
        }
        
        #sidebar ul.queries li a.query.selected {
            background: var(--rp-primary) !important;
            color: #fff !important;
            font-weight: 600 !important;
        }
        
        /* ==================== 过滤器区域 ==================== */
        #query_form_with_buttons {
            background: var(--rp-bg) !important;
            border-radius: var(--rp-radius) !important;
            padding: 20px !important;
            margin-bottom: 20px !important;
        }
        
        fieldset.collapsible {
            background: var(--rp-card-bg) !important;
            border: 1px solid var(--rp-border) !important;
            border-radius: var(--rp-radius) !important;
            padding: 15px 20px !important;
            margin: 15px 0 !important;
        }
        
        fieldset.collapsible legend {
            font-weight: 600 !important;
            color: var(--rp-text) !important;
            padding: 0 12px !important;
            cursor: pointer !important;
        }
        
        /* ==================== 按钮样式 ==================== */
        input[type="button"],
        input[type="submit"],
        .btn,
        a.icon {
            background: var(--rp-primary) !important;
            color: #fff !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 10px 20px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
            text-decoration: none !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
        }
        
        input[type="button"]:hover,
        input[type="submit"]:hover,
        .btn:hover,
        a.icon:hover {
            background: var(--rp-primary-hover) !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3) !important;
        }
        
        input[type="button"].btn-secondary,
        a.icon-reload {
            background: #f1f5f9 !important;
            color: var(--rp-text) !important;
            border: 1px solid var(--rp-border) !important;
        }
        
        input[type="button"].btn-secondary:hover,
        a.icon-reload:hover {
            background: #e2e8f0 !important;
            box-shadow: none !important;
        }
        
        a.icon-del {
            background: #fee2e2 !important;
            color: var(--rp-error) !important;
        }
        
        a.icon-del:hover {
            background: var(--rp-error) !important;
            color: #fff !important;
        }
        
        /* ==================== 表格样式 ==================== */
        table.list {
            width: 100% !important;
            border-collapse: separate !important;
            border-spacing: 0 !important;
            border-radius: var(--rp-radius) !important;
            overflow: hidden !important;
            box-shadow: var(--rp-shadow) !important;
            margin: 20px 0 !important;
        }
        
        table.list th {
            background: linear-gradient(to bottom, #f8fafc, #f1f5f9) !important;
            color: var(--rp-text) !important;
            font-weight: 600 !important;
            padding: 14px 16px !important;
            text-align: left !important;
            border-bottom: 2px solid var(--rp-border) !important;
            font-size: 0.875rem !important;
        }
        
        table.list td {
            padding: 14px 16px !important;
            border-bottom: 1px solid var(--rp-border) !important;
            color: var(--rp-text) !important;
        }
        
        table.list tr:hover td {
            background: var(--rp-primary-light) !important;
        }
        
        table.list tr:last-child td {
            border-bottom: none !important;
        }
        
        /* 状态标签 */
        table.list td.status {
            font-weight: 600 !important;
        }
        
        /* 优先级样式 */
        table.list td.priority {
            font-weight: 600 !important;
        }
        
        /* ==================== 表单元素 ==================== */
        select,
        input[type="text"],
        input[type="password"],
        input[type="number"],
        textarea {
            border: 1px solid var(--rp-border) !important;
            border-radius: 8px !important;
            padding: 10px 14px !important;
            font-size: 0.875rem !important;
            transition: all 0.2s !important;
            background: var(--rp-card-bg) !important;
        }
        
        select:focus,
        input[type="text"]:focus,
        input[type="password"]:focus,
        input[type="number"]:focus,
        textarea:focus {
            outline: none !important;
            border-color: var(--rp-primary) !important;
            box-shadow: 0 0 0 3px var(--rp-primary-light) !important;
        }
        
        /* Select2 美化 */
        .select2-container--default .select2-selection--single {
            border: 1px solid var(--rp-border) !important;
            border-radius: 8px !important;
            height: 42px !important;
            display: flex !important;
            align-items: center !important;
        }
        
        .select2-container--default .select2-selection--single .select2-selection__rendered {
            line-height: 42px !important;
            padding-left: 14px !important;
        }
        
        .select2-container--default .select2-selection--single .select2-selection__arrow {
            height: 40px !important;
        }
        
        .select2-dropdown {
            border-radius: 8px !important;
            box-shadow: var(--rp-shadow-md) !important;
            border: 1px solid var(--rp-border) !important;
        }
        
        /* ==================== 分页器 ==================== */
        .pagination {
            display: flex !important;
            gap: 6px !important;
            margin: 20px 0 !important;
        }
        
        .pagination a,
        .pagination span {
            padding: 8px 14px !important;
            border-radius: 8px !important;
            border: 1px solid var(--rp-border) !important;
            color: var(--rp-text) !important;
            text-decoration: none !important;
            transition: all 0.2s !important;
        }
        
        .pagination a:hover {
            background: var(--rp-primary-light) !important;
            border-color: var(--rp-primary) !important;
            color: var(--rp-primary) !important;
        }
        
        .pagination .current {
            background: var(--rp-primary) !important;
            color: #fff !important;
            border-color: var(--rp-primary) !important;
            font-weight: 600 !important;
        }
        
        /* ==================== 问题详情页 ==================== */
        .issue {
            background: var(--rp-card-bg) !important;
            border: 1px solid var(--rp-border) !important;
            border-radius: var(--rp-radius-lg) !important;
            padding: 25px !important;
            margin: 20px 0 !important;
            box-shadow: var(--rp-shadow) !important;
        }
        
        .issue .subject h3 {
            font-size: 1.5rem !important;
            font-weight: 700 !important;
            color: var(--rp-text) !important;
            margin-bottom: 15px !important;
        }
        
        .issue .attributes {
            background: var(--rp-bg) !important;
            border-radius: var(--rp-radius) !important;
            padding: 20px !important;
            margin: 20px 0 !important;
        }
        
        .issue .attributes th {
            color: var(--rp-text-secondary) !important;
            font-weight: 500 !important;
            padding: 8px 0 !important;
        }
        
        .issue .attributes td {
            font-weight: 500 !important;
            color: var(--rp-text) !important;
            padding: 8px 0 !important;
        }
        
        /* ==================== 评论区域 ==================== */
        .journal {
            background: var(--rp-card-bg) !important;
            border: 1px solid var(--rp-border) !important;
            border-radius: var(--rp-radius) !important;
            padding: 20px !important;
            margin: 15px 0 !important;
            box-shadow: var(--rp-shadow) !important;
        }
        
        .journal h4 {
            font-size: 0.875rem !important;
            color: var(--rp-text-secondary) !important;
            margin-bottom: 12px !important;
            padding-bottom: 10px !important;
            border-bottom: 1px solid var(--rp-border) !important;
        }
        
        .journal h4 a {
            color: var(--rp-primary) !important;
            font-weight: 600 !important;
        }
        
        /* ==================== Tab 标签页 ==================== */
        .tabs ul {
            border-bottom: 2px solid var(--rp-border) !important;
            padding-bottom: 0 !important;
        }
        
        .tabs ul li a {
            background: transparent !important;
            color: var(--rp-text-secondary) !important;
            border: none !important;
            padding: 12px 20px !important;
            font-weight: 500 !important;
            transition: all 0.2s !important;
        }
        
        .tabs ul li a:hover {
            color: var(--rp-primary) !important;
        }
        
        .tabs ul li a.selected {
            color: var(--rp-primary) !important;
            border-bottom: 2px solid var(--rp-primary) !important;
            font-weight: 600 !important;
            background: transparent !important;
        }
        
        /* ==================== 提示信息 ==================== */
        .flash,
        .notice,
        .error,
        .warning {
            border-radius: var(--rp-radius) !important;
            padding: 16px 20px !important;
            margin: 20px 0 !important;
            font-weight: 500 !important;
            border: none !important;
        }
        
        .flash.notice {
            background: #d1fae5 !important;
            color: #065f46 !important;
        }
        
        .flash.error {
            background: #fee2e2 !important;
            color: #991b1b !important;
        }
        
        .flash.warning {
            background: #fef3c7 !important;
            color: #92400e !important;
        }
        
        /* ==================== 复选框和单选框 ==================== */
        input[type="checkbox"] {
            width: 18px !important;
            height: 18px !important;
            border-radius: 4px !important;
            border: 2px solid var(--rp-border) !important;
            cursor: pointer !important;
        }
        
        input[type="checkbox"]:checked {
            background: var(--rp-primary) !important;
            border-color: var(--rp-primary) !important;
        }
        
        /* ==================== 上下文菜单 ==================== */
        #context-menu {
            background: var(--rp-card-bg) !important;
            border-radius: var(--rp-radius) !important;
            box-shadow: var(--rp-shadow-md) !important;
            border: 1px solid var(--rp-border) !important;
            overflow: hidden !important;
        }
        
        #context-menu ul li a {
            padding: 10px 16px !important;
            transition: all 0.2s !important;
        }
        
        #context-menu ul li a:hover {
            background: var(--rp-primary-light) !important;
            color: var(--rp-primary) !important;
        }
        
        /* ==================== 搜索框 ==================== */
        #quick-search input[type="text"] {
            border-radius: 20px !important;
            padding: 8px 16px !important;
            border: 1px solid var(--rp-border) !important;
            background: var(--rp-card-bg) !important;
        }
        
        #quick-search input[type="text"]:focus {
            border-color: var(--rp-primary) !important;
            box-shadow: 0 0 0 3px var(--rp-primary-light) !important;
        }
        
        /* ==================== 下拉菜单 ==================== */
        .drdn-content {
            background: var(--rp-card-bg) !important;
            border-radius: var(--rp-radius) !important;
            box-shadow: var(--rp-shadow-md) !important;
            border: 1px solid var(--rp-border) !important;
            overflow: hidden !important;
        }
        
        .drdn-items a {
            padding: 10px 16px !important;
            transition: all 0.2s !important;
        }
        
        .drdn-items a:hover {
            background: var(--rp-primary-light) !important;
            color: var(--rp-primary) !important;
        }
        
        /* ==================== 甘特图优化 ==================== */
        .gantt-table {
            border-radius: var(--rp-radius) !important;
            overflow: hidden !important;
            box-shadow: var(--rp-shadow) !important;
        }
        
        /* ==================== 日历优化 ==================== */
        .cal {
            border-radius: var(--rp-radius) !important;
            overflow: hidden !important;
            box-shadow: var(--rp-shadow) !important;
        }
        
        .cal thead th {
            background: var(--rp-primary) !important;
            color: #fff !important;
            padding: 12px !important;
        }
        
        /* ==================== 响应式优化 ==================== */
        @media (max-width: 900px) {
            #main {
                flex-direction: column !important;
            }
            
            #sidebar {
                width: 100% !important;
                margin: 20px 0 0 0 !important;
            }
        }
        
        /* ==================== 滚动条美化 ==================== */
        ::-webkit-scrollbar {
            width: 8px !important;
            height: 8px !important;
        }
        
        ::-webkit-scrollbar-track {
            background: var(--rp-bg) !important;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1 !important;
            border-radius: 4px !important;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8 !important;
        }
        
        /* ==================== 加载动画 ==================== */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        #content {
            animation: fadeIn 0.3s ease-out !important;
        }
    `;
    document.head.appendChild(style);
}

// 执行页面美化优化
function beautifyPage() {
    // 添加平滑滚动
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // 优化表格行悬停效果
    enhanceTableRows();
    
    // 优化状态标签颜色
    enhanceStatusColors();
    
    // 优化优先级显示
    enhancePriorityDisplay();
    
    // 添加卡片阴影效果
    addCardEffects();
}

// 优化表格行
function enhanceTableRows() {
    const tables = document.querySelectorAll('table.list');
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.style.transition = 'background-color 0.2s';
        });
    });
}

// 优化状态颜色
function enhanceStatusColors() {
    const statusMap = {
        '新建': { bg: '#e0e7ff', text: '#3730a3', border: '#4f46e5' },
        '调研设计中': { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
        '待评审': { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
        '待开发': { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
        '开发中': { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
        '己提测': { bg: '#fce7f3', text: '#9d174d', border: '#ec4899' },
        '测试中': { bg: '#fce7f3', text: '#9d174d', border: '#ec4899' },
        '己完成': { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
        '已拒绝': { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
        '已关闭': { bg: '#f3f4f6', text: '#4b5563', border: '#6b7280' }
    };
    
    const statusCells = document.querySelectorAll('table.list td.status, .issue .status');
    statusCells.forEach(cell => {
        const status = cell.textContent.trim();
        if (statusMap[status]) {
            const style = statusMap[status];
            cell.style.cssText = `
                display: inline-block !important;
                padding: 4px 12px !important;
                border-radius: 20px !important;
                font-size: 0.75rem !important;
                font-weight: 600 !important;
                background: ${style.bg} !important;
                color: ${style.text} !important;
                border: 1px solid ${style.border} !important;
            `;
        }
    });
}

// 优化优先级显示
function enhancePriorityDisplay() {
    const priorityMap = {
        'P0': { color: '#dc2626', bg: '#fee2e2' },
        'P1': { color: '#ea580c', bg: '#ffedd5' },
        'P2': { color: '#ca8a04', bg: '#fef9c3' },
        'P3': { color: '#16a34a', bg: '#dcfce7' },
        'P4': { color: '#6b7280', bg: '#f3f4f6' }
    };
    
    const priorityCells = document.querySelectorAll('table.list td.priority');
    priorityCells.forEach(cell => {
        const text = cell.textContent.trim();
        for (const [key, style] of Object.entries(priorityMap)) {
            if (text.includes(key)) {
                cell.style.cssText = `
                    color: ${style.color} !important;
                    font-weight: 700 !important;
                `;
                break;
            }
        }
    });
}

// 添加卡片效果
function addCardEffects() {
    // 给主要容器添加过渡效果
    const containers = document.querySelectorAll('#content, .issue, .journal');
    containers.forEach(container => {
        container.style.transition = 'box-shadow 0.2s, transform 0.2s';
    });
}

// 监听页面变化
function observePageChanges() {
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            // 延迟执行，确保 DOM 已更新
            setTimeout(() => {
                enhanceStatusColors();
                enhancePriorityDisplay();
                enhanceTableRows();
            }, 100);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
