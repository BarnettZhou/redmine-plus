function initIssueDetail() {
    const drawer = document.createElement('div');
    Object.assign(drawer.style, {
        position: 'fixed',
        top: '0',
        right: '-1200px',
        width: '1200px',
        height: '100%',
        background: 'white',
        boxShadow: '-2px 0 5px rgba(0,0,0,0.2)',
        transition: 'right 0.3s',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
    });

    // 创建黑色遮罩
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 9998,
        display: 'none',
        pointerEvents: 'auto'
    });

    // 顶部工具栏
    const toolbar = document.createElement('div');
    Object.assign(toolbar.style, {
        padding: '10px',
        background: '#f5f5f5',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px'
    });

    // 左侧URL显示区域
    const urlDisplay = document.createElement('div');
    urlDisplay.style.cssText = `
        flex: 1;
        font-size: 14px;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 10px;
    `;

    // 右侧按钮区域
    const buttonGroup = document.createElement('div');
    buttonGroup.style.cssText = `
        display: flex;
        gap: 10px;
    `;

    // 刷新按钮
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = '刷新';
    refreshBtn.style.cssText = `
        padding: 5px 12px;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 14px;
    `;
    refreshBtn.onclick = () => {
        iframe.src = iframe.src;
        // 更新URL显示
        setTimeout(() => {
            urlDisplay.textContent = iframe.src;
        }, 100);
    };

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
        padding: 5px 12px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 14px;
    `;

    // iframe容器
    const iframeContainer = document.createElement('div');
    iframeContainer.style.flex = '1';
    iframeContainer.style.overflow = 'hidden';
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, {
        width: '100%',
        height: '100%',
        border: 'none'
    });

    // 组装工具栏
    buttonGroup.appendChild(refreshBtn);
    buttonGroup.appendChild(closeBtn);
    toolbar.appendChild(urlDisplay);
    toolbar.appendChild(buttonGroup);

    // 组装元素
    drawer.appendChild(toolbar);
    iframeContainer.appendChild(iframe);
    drawer.appendChild(iframeContainer);
    document.body.appendChild(drawer);
    document.body.appendChild(overlay);

    // 统一关闭函数
    function closeDrawer() {
        drawer.style.right = '-1200px';
        overlay.style.display = 'none';
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    }

    // 事件绑定
    closeBtn.onclick = closeDrawer;
    overlay.addEventListener('click', closeDrawer);

    // 点击外部关闭
    document.addEventListener('click', (e) => {
        if (!drawer.contains(e.target) && e.target !== drawer) {
            closeDrawer();
        }
    });

    // iframe加载完成后的处理 - 在抽屉外部执行的元素隐藏操作
    iframe.addEventListener('load', function() {
        try {
            const iframeDoc = this.contentDocument || this.contentWindow.document;

            // 创建并注入 CSS 样式来隐藏元素，避免页面加载时的闪烁
            const style = iframeDoc.createElement('style');
            style.textContent = `
                #top-menu { display: none !important; }
                #header { display: none !important; }
            `;
            iframeDoc.head.appendChild(style);

        } catch (e) {
            console.log('跨域限制，无法操作iframe内容');
        }
    });

    // 处理问题列表
    document.querySelectorAll('td.id a[href^="/issues/"]').forEach(a => {
        // 在替换 DOM 之前保存对父行元素的引用
        const currentRow = a.closest('tr');

        // 创建打开抽屉的函数
        const openDrawer = () => {
            const fullUrl = new URL(a.href, location.href).href;
            iframe.src = fullUrl;
            urlDisplay.textContent = fullUrl;
            drawer.style.right = '0';
            overlay.style.display = 'block';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';

            // 移除所有行的 context-menu-selection 类
            document.querySelectorAll('tr.context-menu-selection').forEach(tr => {
                tr.classList.remove('context-menu-selection');
            });

            // 为当前行添加 context-menu-selection 类
            if (currentRow) {
                currentRow.classList.add('context-menu-selection');
            }
        };

        // 为行添加双击事件
        if (currentRow) {
            currentRow.addEventListener('dblclick', openDrawer);
        }

        // 创建容器包裹原链接和按钮
        const container = document.createElement('div');
        container.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
        `;

        // 克隆原链接到容器中
        const clonedLink = a.cloneNode(true);

        const btn = document.createElement('button');
        btn.textContent = '打开';
        btn.style.cssText = `
            margin-left: 10px;
            padding: 2px 8px;
            font-size: 12px;
            cursor: pointer;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 3px;
            flex-shrink: 0;
        `;

        btn.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            openDrawer();
        };

        // 替换原有DOM结构
        container.appendChild(clonedLink);
        container.appendChild(btn);
        a.parentNode.replaceChild(container, a);
    });
}
