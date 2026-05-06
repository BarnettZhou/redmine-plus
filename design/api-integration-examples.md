# Redmine API 集成代码示例

本文档提供在 Chrome 插件中集成 Redmine REST API 的具体代码实现。

---

## 1. 基础 API Client

### 1.1 创建 API Client 类

```javascript
// js/api/redmine-client.js

/**
 * Redmine API Client
 * 封装 Redmine REST API 调用
 */
class RedmineClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  /**
   * 基础请求方法
   */
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

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (response.status === 204) {
        return null; // No content
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Redmine API Error:', error);
      throw error;
    }
  }

  // HTTP 方法快捷方式
  get(endpoint) { return this.request('GET', endpoint); }
  post(endpoint, data) { return this.request('POST', endpoint, data); }
  put(endpoint, data) { return this.request('PUT', endpoint, data); }
  delete(endpoint) { return this.request('DELETE', endpoint); }
}
```

### 1.2 Issues API

```javascript
// js/api/issues-api.js

/**
 * Issue 相关 API
 */
class IssuesAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * 获取 Issue 列表
   * @param {Object} params - 查询参数
   */
  async list(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.project_id) queryParams.set('project_id', params.project_id);
    if (params.status_id) queryParams.set('status_id', params.status_id);
    if (params.assigned_to_id) queryParams.set('assigned_to_id', params.assigned_to_id);
    if (params.tracker_id) queryParams.set('tracker_id', params.tracker_id);
    if (params.limit) queryParams.set('limit', params.limit);
    if (params.offset) queryParams.set('offset', params.offset);
    if (params.sort) queryParams.set('sort', params.sort);

    const query = queryParams.toString();
    return this.client.get(`/issues.json${query ? '?' + query : ''}`);
  }

  /**
   * 获取单个 Issue
   * @param {number} issueId - Issue ID
   * @param {string[]} include - 包含的关联数据 (journals, changesets, attachments)
   */
  async get(issueId, include = []) {
    const params = include.length ? `?include=${include.join(',')}` : '';
    return this.client.get(`/issues/${issueId}.json${params}`);
  }

  /**
   * 创建 Issue
   * @param {Object} issueData - Issue 数据
   */
  async create(issueData) {
    return this.client.post('/issues.json', { issue: issueData });
  }

  /**
   * 更新 Issue
   * @param {number} issueId - Issue ID
   * @param {Object} issueData - 更新的数据
   */
  async update(issueId, issueData) {
    return this.client.put(`/issues/${issueId}.json`, { issue: issueData });
  }

  /**
   * 删除 Issue
   * @param {number} issueId - Issue ID
   */
  async delete(issueId) {
    return this.client.delete(`/issues/${issueId}.json`);
  }
}
```

### 1.3 Time Entries API

```javascript
// js/api/time-entries-api.js

/**
 * 工时登记相关 API
 */
class TimeEntriesAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * 获取工时列表
   * @param {Object} params - 查询参数
   */
  async list(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.project_id) queryParams.set('project_id', params.project_id);
    if (params.issue_id) queryParams.set('issue_id', params.issue_id);
    if (params.user_id) queryParams.set('user_id', params.user_id);
    if (params.from) queryParams.set('from', params.from);
    if (params.to) queryParams.set('to', params.to);
    if (params.limit) queryParams.set('limit', params.limit);
    if (params.offset) queryParams.set('offset', params.offset);

    const query = queryParams.toString();
    return this.client.get(`/time_entries.json${query ? '?' + query : ''}`);
  }

  /**
   * 创建工时登记
   * @param {Object} timeEntryData - 工时数据
   */
  async create(timeEntryData) {
    return this.client.post('/time_entries.json', { time_entry: timeEntryData });
  }

  /**
   * 更新工时登记
   * @param {number} entryId - 工时记录 ID
   * @param {Object} timeEntryData - 更新的数据
   */
  async update(entryId, timeEntryData) {
    return this.client.put(`/time_entries/${entryId}.json`, { time_entry: timeEntryData });
  }

  /**
   * 删除工时登记
   * @param {number} entryId - 工时记录 ID
   */
  async delete(entryId) {
    return this.client.delete(`/time_entries/${entryId}.json`);
  }

  /**
   * 获取今日工时（快捷方法）
   * @param {string} userId - 用户 ID，默认 'me'
   */
  async getTodayEntries(userId = 'me') {
    const today = new Date().toISOString().split('T')[0];
    return this.list({
      user_id: userId,
      from: today,
      to: today,
      limit: 100
    });
  }

  /**
   * 计算今日总工时
   * @param {string} userId - 用户 ID
   */
  async getTodayTotalHours(userId = 'me') {
    const result = await this.getTodayEntries(userId);
    const entries = result.time_entries || [];
    return entries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
  }
}
```

### 1.4 Projects API

```javascript
// js/api/projects-api.js

/**
 * 项目相关 API
 */
class ProjectsAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * 获取项目列表
   */
  async list(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.set('limit', params.limit);
    if (params.offset) queryParams.set('offset', params.offset);
    if (params.include) queryParams.set('include', params.include.join(','));

    const query = queryParams.toString();
    return this.client.get(`/projects.json${query ? '?' + query : ''}`);
  }

  /**
   * 获取单个项目
   */
  async get(projectId, include = []) {
    const params = include.length ? `?include=${include.join(',')}` : '';
    return this.client.get(`/projects/${projectId}.json${params}`);
  }
}
```

### 1.5 Enumerations API（枚举数据）

```javascript
// js/api/enumerations-api.js

/**
 * 枚举数据 API（跟踪标签、状态、优先级等）
 */
class EnumerationsAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * 获取跟踪标签列表
   */
  async getTrackers() {
    const result = await this.client.get('/trackers.json');
    return result.trackers || [];
  }

  /**
   * 获取问题状态列表
   */
  async getIssueStatuses() {
    const result = await this.client.get('/issue_statuses.json');
    return result.issue_statuses || [];
  }

  /**
   * 获取优先级列表
   */
  async getPriorities() {
    const result = await this.client.get('/enumerations/issue_priorities.json');
    return result.issue_priorities || [];
  }

  /**
   * 获取活动时间类型
   */
  async getTimeEntryActivities() {
    const result = await this.client.get('/enumerations/time_entry_activities.json');
    return result.time_entry_activities || [];
  }

  /**
   * 获取查询列表
   */
  async getQueries(projectId = null) {
    const params = projectId ? `?project_id=${projectId}` : '';
    const result = await this.client.get(`/queries.json${params}`);
    return result.queries || [];
  }
}
```

---

## 2. API 初始化与管理

```javascript
// js/api/index.js

// 全局 API 实例
let redmineClient = null;
let issuesAPI = null;
let timeEntriesAPI = null;
let projectsAPI = null;
let enumerationsAPI = null;

/**
 * 初始化 Redmine API
 * @param {Object} config - 配置对象 { baseUrl, apiKey }
 */
function initRedmineAPI(config) {
  if (!config.baseUrl || !config.apiKey) {
    console.warn('Redmine API 未配置');
    return false;
  }

  redmineClient = new RedmineClient(config.baseUrl, config.apiKey);
  issuesAPI = new IssuesAPI(redmineClient);
  timeEntriesAPI = new TimeEntriesAPI(redmineClient);
  projectsAPI = new ProjectsAPI(redmineClient);
  enumerationsAPI = new EnumerationsAPI(redmineClient);

  console.log('Redmine API 已初始化');
  return true;
}

/**
 * 获取 API 实例
 */
function getRedmineAPI() {
  return {
    client: redmineClient,
    issues: issuesAPI,
    timeEntries: timeEntriesAPI,
    projects: projectsAPI,
    enumerations: enumerationsAPI,
    isReady: () => redmineClient !== null
  };
}
```

---

## 3. UI 组件示例

### 3.1 快速登记工时弹窗

```javascript
// js/components/quick-time-entry.js

/**
 * 创建快速登记工时弹窗
 * @param {number} issueId - Issue ID
 * @param {string} issueSubject - Issue 主题（用于显示）
 */
function createQuickTimeEntryModal(issueId, issueSubject) {
  // 创建遮罩
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: '10000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  // 创建弹窗
  const modal = document.createElement('div');
  Object.assign(modal.style, {
    background: 'white',
    padding: '24px',
    borderRadius: '8px',
    width: '400px',
    maxWidth: '90%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  });

  modal.innerHTML = `
    <h3 style="margin: 0 0 16px 0; font-size: 18px;">登记工时</h3>
    <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">
      Issue: #${issueId} ${issueSubject}
    </p>
    <form id="time-entry-form">
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px; font-size: 14px;">日期</label>
        <input type="date" id="spent-on" value="${new Date().toISOString().split('T')[0]}"
          style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px; font-size: 14px;">工时（小时）</label>
        <input type="number" id="hours" step="0.5" min="0.5" max="24" required
          style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px; font-size: 14px;">活动类型</label>
        <select id="activity-id" required
          style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="">请选择...</option>
          <option value="9">开发</option>
          <option value="10">测试</option>
          <option value="11">文档</option>
          <option value="12">设计</option>
          <option value="13">会议</option>
          <option value="14">其他</option>
        </select>
      </div>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 4px; font-size: 14px;">备注</label>
        <input type="text" id="comments" placeholder="工作内容描述"
          style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button type="button" id="cancel-btn"
          style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">
          取消
        </button>
        <button type="submit"
          style="padding: 8px 16px; border: none; background: #4CAF50; color: white; border-radius: 4px; cursor: pointer;">
          提交
        </button>
      </div>
    </form>
    <div id="form-message" style="margin-top: 12px; font-size: 14px;"></div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // 事件处理
  const form = modal.querySelector('#time-entry-form');
  const cancelBtn = modal.querySelector('#cancel-btn');
  const messageDiv = modal.querySelector('#form-message');

  cancelBtn.onclick = () => overlay.remove();
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  form.onsubmit = async (e) => {
    e.preventDefault();

    const api = getRedmineAPI();
    if (!api.isReady()) {
      messageDiv.textContent = 'API 未配置，请在扩展选项中设置';
      messageDiv.style.color = 'red';
      return;
    }

    const data = {
      issue_id: issueId,
      hours: parseFloat(document.getElementById('hours').value),
      activity_id: parseInt(document.getElementById('activity-id').value),
      comments: document.getElementById('comments').value,
      spent_on: document.getElementById('spent-on').value
    };

    try {
      const result = await api.timeEntries.create(data);
      messageDiv.textContent = '工时登记成功！';
      messageDiv.style.color = 'green';
      setTimeout(() => overlay.remove(), 1500);
    } catch (error) {
      messageDiv.textContent = '登记失败: ' + error.message;
      messageDiv.style.color = 'red';
    }
  };
}
```

### 3.2 快速创建 Issue 弹窗

```javascript
// js/components/quick-create-issue.js

/**
 * 创建快速 Issue 弹窗
 * @param {string} projectId - 项目 ID
 */
function createQuickIssueModal(projectId) {
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: '10000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const modal = document.createElement('div');
  Object.assign(modal.style, {
    background: 'white',
    padding: '24px',
    borderRadius: '8px',
    width: '600px',
    maxWidth: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  });

  modal.innerHTML = `
    <h3 style="margin: 0 0 16px 0; font-size: 18px;">新建 Issue</h3>
    <form id="create-issue-form">
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px; font-size: 14px;">主题 *</label>
        <input type="text" id="subject" required
          style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      <div style="display: flex; gap: 12px; margin-bottom: 12px;">
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 4px; font-size: 14px;">跟踪标签</label>
          <select id="tracker-id"
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="1">错误</option>
            <option value="2">功能</option>
            <option value="3">支持</option>
          </select>
        </div>
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 4px; font-size: 14px;">优先级</label>
          <select id="priority-id"
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="1">低</option>
            <option value="2" selected>普通</option>
            <option value="3">高</option>
            <option value="4">紧急</option>
            <option value="5">立即</option>
          </select>
        </div>
      </div>
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px; font-size: 14px;">描述</label>
        <textarea id="description" rows="5"
          style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
      </div>
      <div style="display: flex; gap: 12px; margin-bottom: 12px;">
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 4px; font-size: 14px;">指派给</label>
          <input type="text" id="assigned-to" placeholder="用户 ID"
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 4px; font-size: 14px;">预计工时</label>
          <input type="number" id="estimated-hours" step="0.5" min="0"
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
      </div>
      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 4px; font-size: 14px;">开始日期</label>
          <input type="date" id="start-date"
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 4px; font-size: 14px;">截止日期</label>
          <input type="date" id="due-date"
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button type="button" id="cancel-btn"
          style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">
          取消
        </button>
        <button type="submit"
          style="padding: 8px 16px; border: none; background: #4CAF50; color: white; border-radius: 4px; cursor: pointer;">
          创建
        </button>
      </div>
    </form>
    <div id="form-message" style="margin-top: 12px; font-size: 14px;"></div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // 事件处理
  const form = modal.querySelector('#create-issue-form');
  const cancelBtn = modal.querySelector('#cancel-btn');
  const messageDiv = modal.querySelector('#form-message');

  cancelBtn.onclick = () => overlay.remove();
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  form.onsubmit = async (e) => {
    e.preventDefault();

    const api = getRedmineAPI();
    if (!api.isReady()) {
      messageDiv.textContent = 'API 未配置，请在扩展选项中设置';
      messageDiv.style.color = 'red';
      return;
    }

    const data = {
      project_id: projectId,
      subject: document.getElementById('subject').value,
      description: document.getElementById('description').value,
      tracker_id: parseInt(document.getElementById('tracker-id').value),
      priority_id: parseInt(document.getElementById('priority-id').value)
    };

    const assignedTo = document.getElementById('assigned-to').value;
    if (assignedTo) data.assigned_to_id = parseInt(assignedTo);

    const estimatedHours = document.getElementById('estimated-hours').value;
    if (estimatedHours) data.estimated_hours = parseFloat(estimatedHours);

    const startDate = document.getElementById('start-date').value;
    if (startDate) data.start_date = startDate;

    const dueDate = document.getElementById('due-date').value;
    if (dueDate) data.due_date = dueDate;

    try {
      const result = await api.issues.create(data);
      messageDiv.innerHTML = `创建成功！<a href="/issues/${result.issue.id}" target="_blank">查看 Issue #${result.issue.id}</a>`;
      messageDiv.style.color = 'green';
      form.reset();
      setTimeout(() => overlay.remove(), 2000);
    } catch (error) {
      messageDiv.textContent = '创建失败: ' + error.message;
      messageDiv.style.color = 'red';
    }
  };
}
```

---

## 4. 今日工时面板

```javascript
// js/components/today-hours-panel.js

/**
 * 在顶部菜单显示今日工时
 */
async function initTodayHoursPanel() {
  const api = getRedmineAPI();
  if (!api.isReady()) return;

  // 获取今日工时
  try {
    const totalHours = await api.timeEntries.getTodayTotalHours();

    // 创建显示元素
    const panel = document.createElement('div');
    panel.id = 'today-hours-panel';
    panel.innerHTML = `
      <span style="color: ${totalHours >= 8 ? '#4CAF50' : '#ff9800'};">
        今日工时: ${totalHours.toFixed(1)}h
      </span>
    `;
    Object.assign(panel.style, {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      marginLeft: '10px',
      background: '#f5f5f5',
      borderRadius: '4px',
      fontSize: '13px',
      fontWeight: 'bold'
    });

    // 插入到顶部菜单
    const topMenu = document.querySelector('#top-menu > ul');
    if (topMenu) {
      const li = document.createElement('li');
      li.appendChild(panel);
      topMenu.appendChild(li);
    }
  } catch (error) {
    console.error('获取今日工时失败:', error);
  }
}
```

---

## 5. 配置界面示例

```javascript
// js/options.js 中添加 API 配置部分

// 在页面加载时添加 API 配置表单
function addAPIConfigSection() {
  const container = document.querySelector('.container');

  const section = document.createElement('div');
  section.className = 'section';
  section.innerHTML = `
    <h2>Redmine API 配置</h2>
    <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
      配置 API 后可以使用快速登记工时、快速创建 Issue 等功能。
      API Key 可在 Redmine "我的账号" 页面获取。
    </p>

    <div class="form-group">
      <label>
        <input type="checkbox" id="api-enabled"> 启用 API 功能
      </label>
    </div>

    <div class="form-group">
      <label for="api-base-url">Redmine URL</label>
      <input type="url" id="api-base-url" placeholder="https://redm.topcj.com">
    </div>

    <div class="form-group">
      <label for="api-key">API Key</label>
      <input type="password" id="api-key" placeholder="your-api-key">
    </div>

    <div class="form-group">
      <button type="button" id="test-api-btn" class="btn-secondary">测试连接</button>
      <span id="test-result" style="margin-left: 10px; font-size: 14px;"></span>
    </div>
  `;

  container.appendChild(section);

  // 测试连接按钮
  document.getElementById('test-api-btn').onclick = async () => {
    const baseUrl = document.getElementById('api-base-url').value;
    const apiKey = document.getElementById('api-key').value;
    const resultSpan = document.getElementById('test-result');

    if (!baseUrl || !apiKey) {
      resultSpan.textContent = '请填写完整信息';
      resultSpan.style.color = 'red';
      return;
    }

    resultSpan.textContent = '测试中...';
    resultSpan.style.color = '#666';

    try {
      const client = new RedmineClient(baseUrl, apiKey);
      const user = await client.get('/users/current.json');
      resultSpan.textContent = `连接成功！当前用户: ${user.user.login}`;
      resultSpan.style.color = 'green';
    } catch (error) {
      resultSpan.textContent = '连接失败: ' + error.message;
      resultSpan.style.color = 'red';
    }
  };
}
```

---

## 6. 使用示例

### 在 content-script.js 中集成

```javascript
// js/content-script.js

(function() {
    console.log("content-scripts init");

    function execApp(config) {
        // 初始化 Redmine API
        if (config.api && config.api.enabled && config.api.baseUrl && config.api.apiKey) {
            initRedmineAPI(config.api);

            // 添加今日工时面板
            initTodayHoursPanel();
        }

        // 添加工时登记按钮到 Issue 列表
        if (config.api && config.api.enabled) {
            addTimeEntryButtonsToIssueList();
        }

        // 其他现有功能...
    }

    /**
     * 在 Issue 列表添加工时登记按钮
     */
    function addTimeEntryButtonsToIssueList() {
        document.querySelectorAll('td.id a[href^="/issues/"]').forEach(a => {
            const issueId = a.textContent.replace('#', '');
            const subject = a.closest('tr')?.querySelector('td.subject a')?.textContent || '';

            const btn = document.createElement('button');
            btn.textContent = '记工时';
            btn.className = 'quick-time-entry-btn';
            Object.assign(btn.style, {
                marginLeft: '8px',
                padding: '2px 8px',
                fontSize: '11px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
            });

            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                createQuickTimeEntryModal(issueId, subject);
            };

            a.parentNode.appendChild(btn);
        });
    }

    chrome.storage.local.get("redminePlusConfig", function(result) {
        const config = result.redminePlusConfig || defaultConfig;
        execApp(config);
    });
})();
```

---

## 7. manifest.json 更新

```json
{
  "manifest_version": 3,
  "name": "Redmine Plus",
  "version": "1.1.0",
  "description": "增强Redmine使用体验 - 支持API集成",

  "content_scripts": [
    {
      "matches": ["https://redm.topcj.com/*"],
      "css": ["css/custom-style.css"],
      "js": [
        "js/default_config.js",
        "js/marked.min.js",
        "js/chart.umd.min.js",
        "js/api/redmine-client.js",
        "js/api/issues-api.js",
        "js/api/time-entries-api.js",
        "js/api/projects-api.js",
        "js/api/enumerations-api.js",
        "js/api/index.js",
        "js/components/quick-time-entry.js",
        "js/components/quick-create-issue.js",
        "js/components/today-hours-panel.js",
        "js/plugins/issue_details.js",
        "js/plugins/project_shortcuts.js",
        "js/plugins/time_tracking_shortcuts.js",
        "js/plugins/immersive_input.js",
        "js/plugins/time_report_chart.js",
        "js/content-script.js"
      ],
      "run_at": "document_end"
    }
  ],

  "permissions": [
    "storage",
    "activeTab"
  ],

  "host_permissions": [
    "https://redm.topcj.com/*"
  ],

  "options_page": "options.html"
}
```

---

*文档生成时间：2026-03-27*
