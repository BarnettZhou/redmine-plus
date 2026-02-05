let immersive_input_drawer_visible = false;
let markedRendererInitialized = false;

// 从附件列表中获取文件名到真实URL的映射
// 有两种获取方式，如果存在 .attachments table tr 则从表格中获取，否则从 .attachments_fields 中获取
function getAttachmentMap() {
    const map = {};
    document.querySelectorAll('.attachments table tr').forEach(tr => {
        const link = tr.querySelector('a.icon-attachment');
        if (link) {
            const fileName = link.innerText.trim();
            const realUrl = link.getAttribute('href');
            map[fileName] = realUrl;
        }
    });
    
    if (Object.keys(map).length === 0) {
        document.querySelectorAll('.attachments_fields span[id^="attachments_"]').forEach(span => {
            const filenameInput = span.querySelector('input.filename');
            const deleteLink = span.querySelector('a.remove-upload');
            if (filenameInput && deleteLink) {
                const fileName = filenameInput.value.trim();
                const href = deleteLink.getAttribute('href');
                const match = href.match(/\/attachments\/(\d+)\./);
                if (match && fileName) {
                    const id = match[1];
                    map[fileName] = `/attachments/download/${id}/${fileName}`;
                }
            }
        });
    }

    console.log('附件映射:', map);
    
    return map;
}

// 确保marked渲染器已初始化，用于处理图片渲染
function ensureMarkedRenderer() {
    if (markedRendererInitialized) return;
    
    const renderer = new marked.Renderer();
    renderer.image = function(obj) {
        const href = obj.href;
        const title = obj.title || "";
        const text = obj.text || "";

        const attachmentMap = getAttachmentMap();
        let finalHref = href;
        if (attachmentMap[href]) {
            finalHref = attachmentMap[href];
        }
        return `<img src="${finalHref}" alt="${text}" title="${title}" style="max-width:100%;">`;
    };
    marked.setOptions({ renderer: renderer });
    
    markedRendererInitialized = true;
}

function initImmersiveInputUI(mainEditor) {
    const controls = document.createElement('div');
    Object.assign(controls.style, {
        position: 'absolute', right: '10px', bottom: '5px', zIndex: '1001',
        display: 'flex', gap: '5px', alignItems: 'center'
    });

    const expandBtn = document.createElement('div');
    expandBtn.innerText = '⛶ 沉浸编写';
    Object.assign(expandBtn.style, {
        fontSize: '12px', background: '#f4f4f4', padding: '4px 10px',
        border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', 
        userSelect: 'none', color: '#333'
    });

    expandBtn.onclick = () => openImmersiveInputDrawer(mainEditor);

    controls.appendChild(expandBtn);
    mainEditor.parentElement.style.position = 'relative';
    mainEditor.parentElement.appendChild(controls);
}

function openImmersiveInputDrawer(mainEditor) {
    ensureMarkedRenderer();
    immersive_input_drawer_visible = true;
    
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.id = 'immersive_drawer_overlay';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: '10001', display: 'flex', justifyContent: 'flex-end'
    });

    // 创建侧边抽屉
    const drawer = document.createElement('div');
    Object.assign(drawer.style, {
        width: '1600px', maxWidth: '95vw', height: '100%', backgroundColor: '#fff',
        boxShadow: '-5px 0 15px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', 
        animation: 'slideIn 0.3s ease'
    });

    // 抽屉头部
    const header = document.createElement('div');
    Object.assign(header.style, {
        padding: '10px 20px', borderBottom: '1px solid #eee', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa'
    });
    header.innerHTML = `
        <div style="font-weight:bold; color:#333; font-size: 14px;">沉浸式 Markdown 编辑器 (左编辑 / 右预览)</div>
        <button id="close_drawer" style="padding:6px 16px; cursor:pointer; background:#2ecc71; color:white; border:none; border-radius:4px; font-weight:bold;">完成并同步</button>
    `;

    // 抽屉主体（左右分栏）
    const body = document.createElement('div');
    Object.assign(body.style, { flex: '1', display: 'flex', overflow: 'hidden' });

    // 左侧编辑器
    const dEditor = document.createElement('textarea');
    Object.assign(dEditor.style, {
        flex: '1', border: 'none', padding: '20px', fontSize: '15px', lineHeight: '1.6',
        resize: 'none', outline: 'none', borderRight: '1px solid #eee', fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        backgroundColor: '#fafafa'
    });
    dEditor.className = 'wiki-edit-deditor';
    dEditor.value = mainEditor.value;

    // 右侧预览区
    const dPreview = document.createElement('div');
    dPreview.className = 'wiki'; // 使用 Redmine 原生 Wiki 样式
    Object.assign(dPreview.style, {
        flex: '1', padding: '20px', overflowY: 'auto', backgroundColor: '#fff'
    });

    body.appendChild(dEditor);
    body.appendChild(dPreview);
    drawer.appendChild(header);
    drawer.appendChild(body);
    overlay.appendChild(drawer);
    document.body.appendChild(overlay);

    // 注入动画样式
    if (!document.getElementById('drawer_animation_style')) {
        const styleSheet = document.createElement("style");
        styleSheet.id = 'drawer_animation_style';
        styleSheet.innerText = `@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`;
        document.head.appendChild(styleSheet);
    }

    // 渲染预览函数
    const updatePreview = () => { 
        dPreview.innerHTML = marked.parse(dEditor.value); 
    };
    
    // 初始渲染
    updatePreview();

    // 监听输入事件
    dEditor.addEventListener('input', updatePreview);

    // 同步滚动
    dEditor.addEventListener('scroll', () => {
        const scrollPercent = dEditor.scrollTop / (dEditor.scrollHeight - dEditor.clientHeight);
        dPreview.scrollTop = scrollPercent * (dPreview.scrollHeight - dPreview.clientHeight);
    });

    // 关闭并同步回原页面
    document.getElementById('close_drawer').onclick = () => {
        mainEditor.value = dEditor.value;
        // 触发 input 事件确保原页面感知到内容变化
        mainEditor.dispatchEvent(new Event('input'));
        overlay.remove();
        immersive_input_drawer_visible = false;
    };

    // 聚焦编辑器
    dEditor.focus();
}