# Redmine Plus - AI Agent Documentation

## Project Overview

Redmine Plus 是一个基于 Chrome Extension Manifest V3 的浏览器扩展，用于增强 Redmine 项目管理系统的使用体验。该扩展通过内容脚本注入到特定的 Redmine 实例（`https://redm.topcj.com/*`），提供以下增强功能：

- **项目快捷入口**: 在顶部导航栏添加自定义项目快捷链接
- **耗时跟踪快捷入口**: 快速访问本月/上月的时间报表
- **沉浸式 Markdown 编辑器**: 左右分栏、实时预览的无干扰编辑环境
- **问题详情抽屉查看**: 在侧滑抽屉中快速查看 Issue 详情

### Technology Stack

- **核心语言**: 纯 JavaScript (ES6+)
- **UI 技术**: HTML5 + CSS3 (原生实现，无框架依赖)
- **扩展平台**: Chrome Extension Manifest V3
- **存储机制**: Chrome Storage API (`chrome.storage.local`)
- **第三方库**: 
  - `marked.min.js` - Markdown 渲染库，用于沉浸式编辑器的实时预览

## Project Structure

```
redmine-plus/
├── manifest.json              # 扩展清单文件（Manifest V3）
├── popup.html                 # 扩展弹出窗口 UI（320px 宽度）
├── options.html               # 扩展设置页面（功能配置中心）
├── readme.md                  # 项目说明文件（当前为空）
├── .gitignore                 # Git 忽略规则
├── css/
│   ├── custom-style.css       # 自定义样式（问题详情高亮、选中行样式）
│   └── pico.min.css           # Pico CSS 框架（已包含但未在 manifest 中引用）
├── icons/
│   ├── icon-64.png            # 扩展图标 64px
│   └── icon-128.png           # 扩展图标 128px
└── js/
    ├── background.js          # Service Worker（当前为空文件）
    ├── content-script.js      # 内容脚本主入口，负责读取配置并按条件加载各插件
    ├── default_config.js      # 默认配置定义（全局变量 defaultConfig）
    ├── marked.min.js          # Markdown 解析库
    ├── popup.js               # 弹出窗口逻辑（打开设置页面）
    ├── options.js             # 设置页面逻辑（配置读写、表单验证）
    └── plugins/               # 功能插件目录
        ├── global_find.js     # 全局查找功能（预留，空文件未实现）
        ├── immersive_input.js # 沉浸式 Markdown 编辑器（左右分栏、实时预览）
        ├── issue_details.js   # 问题快捷查看（侧滑抽屉，iframe 加载详情）
        ├── project_shortcuts.js # 项目快捷入口（顶部导航栏添加自定义链接）
        └── time_tracking_shortcuts.js # 耗时跟踪快捷入口（本月/上月耗时和报表）
```

## Core Features

### 1. 项目快捷入口 (Project Shortcuts)

- **文件**: `js/plugins/project_shortcuts.js`
- **功能**: 在顶部导航栏（`#top-menu > ul`）添加自定义项目快捷链接
- **配置项**:
  - `enabled`: 是否启用
  - `default_query_id`: 默认查询 ID（留空则使用预设查询条件）
  - `items`: 项目列表，每项包含 `name`（显示名称）和 `project_key`（项目标识）
- **实现细节**:
  - 在项目链接前添加分隔符 `|`
  - 链接格式: `/projects/{project_key}/issues?query_id=...` 或默认查询参数
  - 默认查询参数包含状态为开放、跟踪类型为 2（Feature）的筛选条件

### 2. 耗时跟踪快捷入口 (Time Tracking Shortcuts)

- **文件**: `js/plugins/time_tracking_shortcuts.js`
- **功能**: 在顶部导航栏添加本月/上月耗时和报表快捷入口
- **预置链接**:
  - 本月耗时: 当前用户本月的时间条目列表
  - 本月报表: 按天分组的时间报表
  - 上月耗时: 当前用户上月的时间条目列表
  - 上月报表: 上月按天分组的时间报表

### 3. 沉浸式书写 (Immersive Input)

- **文件**: `js/plugins/immersive_input.js`
- **功能**: 为问题描述编辑器（`#issue_description`）提供全屏沉浸式 Markdown 编辑环境
- **特点**:
  - 左右分栏布局（左编辑/右预览）
  - 实时 Markdown 渲染（使用 marked 库）
  - 支持附件图片预览（自动从 `.attachments` 表格或 `.attachments_fields` 解析附件 URL）
  - 编辑器和预览区同步滚动
  - 抽屉宽度: 1600px（最大 95vw）
  - z-index: 10001
- **触发方式**: 编辑器右下角显示"⛶ 沉浸编写"按钮

### 4. 问题快捷查看 (Issue Details)

- **文件**: `js/plugins/issue_details.js`
- **功能**: 在 Issue 列表的 ID 列旁添加"打开"按钮，点击后在侧滑抽屉中查看详情
- **交互**:
  - 支持双击行打开
  - 通过 iframe 加载问题详情（抽屉宽度: 1200px，z-index: 9999）
  - iframe 加载完成后自动注入 CSS 隐藏顶部菜单（`#top-menu`）、头部（`#header`）和侧边栏（`#sidebar`）
  - 当前行高亮显示（添加 `detail-opened` 类，紫色背景 #614ba6）
  - 工具栏显示当前 URL，支持刷新按钮

### 5. AI 补全 (AI Completion)

- **状态**: UI 已完成，核心逻辑未实现
- **配置项**:
  - `api_service_address`: API 服务地址（如 OpenAI API）
  - `api_key`: API 密钥
  - `model_id`: 模型 ID
  - `max_tokens`: 最大 Tokens（默认 100）

## Configuration System

### 配置结构 (`js/default_config.js`)

```javascript
const defaultConfig = {
    project_shortcuts: {
        enabled: true,
        default_query_id: "",
        items: [
            { name: "其他", project_key: "other_1" }
        ]
    },
    time_tracking_shortcuts: { enabled: true },
    immersive_input: { enabled: true },
    issue_details: { enabled: true },
    ai_completion: {
        enabled: false,
        api_service_address: "",
        api_key: "",
        model_id: "",
        max_tokens: 100
    },
    time_report_chart: {
        enabled: true
    }
};
```

### 存储机制

- 使用 `chrome.storage.local` 持久化配置
- 存储键名: `redminePlusConfig`
- 配置变更后需刷新页面生效

### 配置验证 (options.js)

- 项目快捷入口: 验证每个项目项的名称和 key 不能单独为空
- AI 补全: 启用时验证 API 地址、API Key、模型 ID 必须填写
- API 地址格式验证: 使用 `new URL()` 进行验证

## Content Script 加载机制

### 注入顺序 (`manifest.json`)

内容脚本按以下顺序加载，确保依赖关系正确：

1. `js/default_config.js` - 默认配置（全局变量 defaultConfig）
2. `js/marked.min.js` - Markdown 解析库（全局变量 marked）
3. `js/chart.umd.min.js` - Chart.js 图表库（全局变量 Chart）
4. `js/plugins/issue_details.js` - 问题详情（全局函数 initIssueDetail）
5. `js/plugins/project_shortcuts.js` - 项目快捷入口（全局函数 projectShortcutsInit）
6. `js/plugins/time_tracking_shortcuts.js` - 耗时跟踪（全局函数 timeTrackingShortcutsInit）
7. `js/plugins/immersive_input.js` - 沉浸式输入（全局函数 initImmersiveInputUI）
8. `js/plugins/time_report_chart.js` - 时间报表图表（全局函数 timeReportChartInit）
9. `js/content-script.js` - 主入口（读取配置并调用各插件初始化函数）

### 执行时机

- `run_at: "document_end"` - DOM 加载完成后执行

### 插件初始化流程 (`content-script.js`)

```javascript
function execApp(config) {
    if (config.project_shortcuts.enabled) {
        projectShortcutsInit(config.project_shortcuts);
    }
    if (config.time_tracking_shortcuts.enabled) {
        timeTrackingShortcutsInit(config.time_tracking_shortcuts);
    }
    if (config.immersive_input.enabled) {
        const editor = document.getElementById("issue_description");
        if (editor) initImmersiveInputUI(editor);
    }
    if (config.issue_details.enabled) {
        initIssueDetail();
    }
    // AI 补全功能未实现
}
```

## Development Guidelines

### 代码风格

- 使用原生 JavaScript，不使用框架
- 函数命名采用驼峰式（如 `initIssueDetail`）
- 配置函数采用 `xxxInit` 命名（如 `projectShortcutsInit`）
- 使用 `console.log` 输出调试信息

### 样式规范

- 动态创建的 UI 元素使用内联样式（`Object.assign(element.style, {...})`）
- 抽屉/弹窗的 z-index 应高于 9999
- 沉浸式编辑器使用 `position: fixed` 遮罩层

### 添加新插件的步骤

1. 在 `js/plugins/` 目录创建新插件文件，暴露全局初始化函数
2. 在 `js/default_config.js` 添加默认配置
3. 在 `manifest.json` 的 `content_scripts.js` 数组中按依赖顺序添加插件路径
4. 在 `js/content-script.js` 的 `execApp` 函数中添加初始化逻辑
5. 在 `options.html` 添加对应的设置卡片（复制现有卡片结构）
6. 在 `js/options.js` 添加配置读写逻辑：
   - `populateForm()`: 填充表单值
   - `saveConfig()`: 收集并保存配置
   - `handleSwitchChange()`: 开关状态切换处理

## Build and Deployment

### 本地测试

1. 打开 Chrome/Edge 的扩展管理页面 (`chrome://extensions/`)
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目根目录

### 测试要点

- 各功能开关是否正常启用/禁用
- 配置保存后是否正确生效
- 沉浸式编辑器的 Markdown 渲染是否正确
- 问题详情抽屉的 iframe 加载是否正常
- 项目快捷入口链接是否正确生成

### 打包发布

1. 确保所有文件已保存
2. 删除开发相关文件：`.git/`、`RedmineCopilot.code-workspace`（如存在）
3. 将项目目录压缩为 ZIP 文件
4. 上传到 Chrome Web Store 或 Edge 加载项商店

### 版本管理

- 版本号定义在 `manifest.json` 的 `version` 字段
- 当前版本: `1.0.0`

## Permissions

### 所需权限 (`manifest.json`)

- `storage` - 本地存储配置
- `activeTab` - 访问当前标签页
- `tabs` - 标签页操作

### 主机权限

- `https://redm.topcj.com/*` - 目标 Redmine 实例

## Security Considerations

1. **API Key 存储**: AI 补全功能的 API Key 以明文存储在 `chrome.storage.local`，用户需谨慎使用
2. **内容安全策略**: 扩展未定义 CSP，依赖浏览器默认策略
3. **iframe 跨域**: 问题详情抽屉使用 iframe 加载同域内容，受同源策略保护
4. **CSS 注入**: 使用 `!important` 强制覆盖样式时需谨慎，可能影响 Redmine 原有功能

## Known Issues

1. `js/background.js` 当前为空文件，Service Worker 未实现任何功能
2. `js/plugins/global_find.js` 为空文件，全局查找功能预留但未实现
3. `css/pico.min.css` 已包含但未在 manifest 中引用
4. AI 补全功能仅完成了 UI，核心逻辑未实现
5. 时间报表图表功能需要页面包含 `#time-report` 表格才能正常工作

## CSS Variables Reference

设置页面和弹出窗口使用的 CSS 变量：

```css
:root {
  --primary-color: #4f46e5;      /* 主色调 */
  --primary-hover: #4338ca;      /* 悬停色 */
  --primary-light: #e0e7ff;      /* 浅色背景 */
  --success-color: #10b981;      /* 成功色 */
  --error-color: #ef4444;        /* 错误色 */
  --warning-color: #f59e0b;      /* 警告色 */
  --bg-color: #f8fafc;           /* 页面背景 */
  --card-bg: #ffffff;            /* 卡片背景 */
  --text-primary: #1e293b;       /* 主文字 */
  --text-secondary: #64748b;     /* 次要文字 */
  --border-color: #e2e8f0;       /* 边框色 */
}
```
