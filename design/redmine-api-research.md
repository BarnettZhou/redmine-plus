# Redmine REST API 在 Chrome 插件中的应用研究

## 1. 研究概述

### 1.1 研究目标
分析 Redmine Python SDK 的功能和 Redmine REST API 能力，评估如何在 Chrome 插件中利用 REST API 实现更丰富功能（如新增 Issue、登记工时等）。

### 1.2 研究对象
- **Redmine Python SDK**: https://github.com/BarnettZhou/Redmine-SDK
- **Redmine REST API 文档**: https://www.redmine.org/projects/redmine/wiki/rest_api
- **当前 Chrome 插件**: Redmine Plus (Manifest V3)

---

## 2. Redmine Python SDK 分析

### 2.1 SDK 架构
SDK 是一个轻量级的 Python 封装库，核心文件：
- `client.py`: 主客户端，使用 `requests` 库进行 HTTP 请求
- `exceptions.py`: 自定义异常类
- `__init__.py`: 模块导出

### 2.2 SDK 功能清单

| 功能模块 | 方法 | 说明 |
|---------|------|------|
| **User** | `get_current_user()` | 获取当前用户信息 |
| **Project** | `list_projects()`, `get_project()`, `create_project()`, `update_project()`, `delete_project()` | 项目 CRUD |
| **Issue** | `list_issues()`, `get_issue()`, `create_issue()`, `update_issue()`, `delete_issue()` | 问题 CRUD |
| **Query** | `list_queries()` | 获取保存的查询 |
| **Tracker** | `list_trackers()` | 获取跟踪标签列表 |
| **Status** | `list_issue_statuses()` | 获取问题状态列表 |
| **Priority** | `list_priorities()` | 获取优先级列表 |
| **Time Entry** | `list_time_entries()`, `create_time_entry()` | 工时查询和登记 |
| **Attachment** | `upload_file()` | 文件上传 |
| **Wiki** | `list_wiki_pages()`, `get_wiki_page()`, `update_wiki_page()` | Wiki 操作 |
| **Search** | `search()` | 全局搜索 |
| **Custom Fields** | `list_custom_fields()` | 自定义字段列表 |

### 2.3 认证机制
SDK 使用 **API Key** 认证，通过 HTTP Header 传递：
```
X-Redmine-API-Key: your-api-key
Content-Type: application/json
Accept: application/json
```

---

## 3. Redmine REST API 详解

### 3.1 API 端点概览

| 资源 | 端点 | GET | POST | PUT | DELETE |
|------|------|-----|------|-----|--------|
| Issues | `/issues.json` | ✓ 列表 | ✓ 创建 | - | - |
| Issue | `/issues/{id}.json` | ✓ 详情 | - | ✓ 更新 | ✓ 删除 |
| Projects | `/projects.json` | ✓ 列表 | ✓ 创建 | - | - |
| Project | `/projects/{id}.json` | ✓ 详情 | - | ✓ 更新 | ✓ 删除 |
| Time Entries | `/time_entries.json` | ✓ 列表 | ✓ 创建 | - | - |
| Time Entry | `/time_entries/{id}.json` | ✓ 详情 | - | ✓ 更新 | ✓ 删除 |
| Users | `/users.json` | ✓ 列表 | ✓ 创建 | - | - |
| User | `/users/{id}.json` | ✓ 详情 | - | ✓ 更新 | ✓ 删除 |
| Trackers | `/trackers.json` | ✓ 列表 | - | - | - |
| Statuses | `/issue_statuses.json` | ✓ 列表 | - | - | - |
| Priorities | `/enumerations/issue_priorities.json` | ✓ 列表 | - | - | - |
| Queries | `/queries.json` | ✓ 列表 | - | - | - |
| Custom Fields | `/custom_fields.json` | ✓ 列表 | - | - | - |
| Uploads | `/uploads.json` | - | ✓ 上传 | - | - |

### 3.2 关键 API 请求/响应示例

#### 创建 Issue (POST /issues.json)
```json
{
  "issue": {
    "project_id": "myproject",
    "subject": "New Issue Title",
    "description": "Issue description",
    "tracker_id": 1,
    "status_id": 1,
    "priority_id": 2,
    "assigned_to_id": 5,
    "start_date": "2024-01-01",
    "due_date": "2024-12-31",
    "estimated_hours": 8.0,
    "done_ratio": 0,
    "custom_fields": [
      {"id": 1, "value": "custom value"}
    ]
  }
}
```

#### 登记工时 (POST /time_entries.json)
```json
{
  "time_entry": {
    "issue_id": 123,
    "project_id": "myproject",
    "hours": 4.5,
    "activity_id": 9,
    "comments": "Worked on feature X",
    "spent_on": "2024-01-15"
  }
}
```

#### 文件上传 (POST /uploads.json)
- Content-Type: `application/octet-stream`
- 返回 token，用于创建 Issue 时的附件关联

### 3.3 查询参数

**分页**：`limit` (默认 25, 最大 100), `offset`
**包含关联数据**：`include=journals,changesets,attachments`
**排序**：`sort=updated_on:desc`
**过滤**：`status_id=open`, `assigned_to_id=me`, `project_id=xxx`

---

## 4. Chrome 插件集成方案

### 4.1 技术可行性分析

| 能力 | 可行性 | 说明 |
|------|--------|------|
| 直接调用 REST API | ✅ 可行 | 使用原生 `fetch()` API |
| 认证方式 | ✅ 支持 | 通过 Header 传递 API Key |
| CORS 限制 | ⚠️ 注意 | 需要确保 Redmine 服务器允许跨域 |
| 文件上传 | ✅ 可行 | 使用 FormData 或 Blob |

### 4.2 需要在 manifest.json 中配置的权限

```json
{
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://redm.topcj.com/*"
  ]
}
```

### 4.3 配置需求

需要在插件选项页面添加：
- Redmine 服务器 URL
- API Key（用户可在 Redmine "我的账号" 页面获取）

---

## 5. 可实现的增强功能

### 5.1 快速创建 Issue 功能

**使用场景**：用户在浏览项目时，快速创建新问题，无需跳转到新页面。

**实现方式**：
1. 在问题列表页面添加"新建 Issue"按钮
2. 弹出模态框表单，包含：主题、描述、跟踪标签、优先级、指派给
3. 调用 `POST /issues.json` 创建
4. 成功后刷新列表或显示提示

**API 调用**：
```javascript
fetch('https://redm.topcj.com/issues.json', {
  method: 'POST',
  headers: {
    'X-Redmine-API-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    issue: {
      project_id: projectId,
      subject: subject,
      description: description,
      tracker_id: trackerId,
      priority_id: priorityId
    }
  })
})
```

### 5.2 快速登记工时功能

**使用场景**：在 Issue 列表或详情页直接登记工时，无需进入工时页面。

**实现方式**：
1. 在每行 Issue 后添加工时登记按钮
2. 或在右侧抽屉（现有功能）中添加工时登记表单
3. 表单包含：日期、工时、活动类型、备注
4. 调用 `POST /time_entries.json`

**API 调用**：
```javascript
fetch('https://redm.topcj.com/time_entries.json', {
  method: 'POST',
  headers: {
    'X-Redmine-API-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    time_entry: {
      issue_id: issueId,
      hours: hours,
      activity_id: activityId,
      comments: comments,
      spent_on: date
    }
  })
})
```

### 5.3 Issue 批量操作

**使用场景**：批量更新 Issue 状态、指派给、完成度等。

**实现方式**：
1. 在问题列表添加复选框
2. 添加批量操作工具栏（更改状态、指派给、完成度）
3. 循环调用 `PUT /issues/{id}.json`

### 5.4 增强 Issue 详情抽屉

**使用场景**：替换现有的 iframe 方式，使用 API 获取数据，实现更轻量级的预览。

**实现方式**：
1. 调用 `GET /issues/{id}.json?include=journals,attachments`
2. 使用自定义 UI 渲染 Issue 详情
3. 支持内联编辑和评论添加

### 5.5 智能搜索功能

**使用场景**：全局搜索 Redmine 内容。

**实现方式**：
1. 添加搜索框
2. 调用 `GET /search.json?q=keyword&scopes=issues,projects`
3. 展示搜索结果

### 5.6 今日工时面板

**使用场景**：显示用户今日已登记工时，快速补记。

**实现方式**：
1. 调用 `GET /time_entries.json?user_id=me&from=today&to=today`
2. 计算总工时，显示在顶部工具栏
3. 提供快速添加入口

---

## 6. 实现建议

### 6.1 代码架构建议

创建 `js/api/` 目录，封装 REST API 调用：

```
js/
  api/
    client.js      # 基础 HTTP 客户端
    issues.js      # Issue API 封装
    projects.js    # Project API 封装
    time_entries.js # 工时 API 封装
    enumerations.js # 枚举数据（tracker/status/priority）
```

### 6.2 核心 API Client 实现

```javascript
// js/api/client.js
class RedmineAPIClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'X-Redmine-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  }

  get(endpoint) { return this.request('GET', endpoint); }
  post(endpoint, data) { return this.request('POST', endpoint, data); }
  put(endpoint, data) { return this.request('PUT', endpoint, data); }
  delete(endpoint) { return this.request('DELETE', endpoint); }
}
```

### 6.3 配置管理

在 `js/default_config.js` 中添加 API 配置：

```javascript
const defaultConfig = {
  // ... 现有配置
  api: {
    enabled: false,  // 默认关闭，需要用户配置
    baseUrl: '',     // https://redm.topcj.com
    apiKey: ''       // 用户的 API Key
  }
};
```

### 6.4 优先级建议

| 优先级 | 功能 | 原因 |
|--------|------|------|
| P0 | 快速登记工时 | 高频操作，现有流程繁琐 |
| P1 | 快速创建 Issue | 提升工作效率 |
| P2 | 今日工时面板 | 随时掌握工作进度 |
| P3 | Issue 批量操作 | 管理效率提升 |
| P4 | 增强 Issue 详情 | 替代 iframe，体验更好 |

---

## 7. 风险评估

### 7.1 CORS 限制
- **问题**：如果 Redmine 服务器未配置 CORS，浏览器会拦截 API 请求
- **解决方案**：
  - 在后台脚本 (service worker) 中发起请求（Manifest V3 限制较多）
  - 请求服务器管理员配置 CORS 头
  - 使用简单请求（避免预检）

### 7.2 认证安全
- **问题**：API Key 存储在浏览器本地
- **建议**：使用 `chrome.storage.local` 存储，不向页面脚本暴露

### 7.3 权限扩展
- 需要确保新增权限不影响现有功能
- 建议采用渐进式权限申请

---

## 8. 结论

### 8.1 可行性结论
**在 Chrome 插件中使用 Redmine REST API 是完全可行的**，可以实现以下价值：

1. **效率提升**：快速登记工时、创建 Issue 等功能可大幅减少页面跳转
2. **体验优化**：API 驱动的 UI 比 iframe 嵌入更轻量、更流畅
3. **功能扩展**：批量操作、智能搜索等功能可显著提升管理能力

### 8.2 推荐实施路径

1. **第一阶段**：实现基础 API Client 和配置界面
2. **第二阶段**：开发快速登记工时功能（价值最高）
3. **第三阶段**：开发快速创建 Issue 功能
4. **第四阶段**：优化现有功能（如替换 iframe 方式）

### 8.3 参考资源

- Redmine Python SDK: `./redmine-sdk-study/`
- Redmine REST API: https://www.redmine.org/projects/redmine/wiki/rest_api
- Chrome Extension MV3: https://developer.chrome.com/docs/extensions/mv3/

---

*报告生成时间：2026-03-27*
