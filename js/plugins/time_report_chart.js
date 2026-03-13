// 时间报表图表生成插件
function timeReportChartInit(config) {
    // 只在时间报表页面执行
    if (!window.location.pathname.includes('/time_entries/report')) {
        return;
    }

    console.log('Time Report Chart: 初始化');

    // 添加生成图表按钮
    addChartButton();
}

// 添加生成图表按钮
function addChartButton() {
    console.log('Time Report Chart: 添加按钮');
    const buttonsContainer = document.querySelector('p.buttons');
    if (!buttonsContainer) {
        console.log('Time Report Chart: 未找到按钮容器');
        return;
    }

    const saveButton = buttonsContainer.querySelector('a.icon-save');
    if (!saveButton) {
        console.log('Time Report Chart: 未找到保存查询按钮');
        return;
    }

    const chartButton = document.createElement('a');
    chartButton.href = '#';
    chartButton.textContent = '📊 生成图表';
    chartButton.className = 'icon icon-chart';
    Object.assign(chartButton.style, {
        marginLeft: '8px',
        padding: '6px 12px',
        backgroundColor: '#4f46e5',
        color: 'white',
        borderRadius: '4px',
        textDecoration: 'none',
        display: 'inline-block'
    });

    chartButton.addEventListener('click', function(e) {
        e.preventDefault();
        generateChart();
    });

    saveButton.after(chartButton);
    console.log('Time Report Chart: 按钮已添加');
}

// 解析报表数据
function parseReportData() {
    const table = document.getElementById('time-report');
    if (!table) {
        console.log('Time Report Chart: 未找到报表表格');
        return null;
    }

    const tbody = table.querySelector('tbody');
    if (!tbody) {
        console.log('Time Report Chart: 未找到表格主体');
        return null;
    }

    const rows = tbody.querySelectorAll('tr');
    const data = {
        users: [],
        projects: new Set(),
        hasProjectColumn: false,
        userData: {}  // { userName: { total: 0, projects: { projectName: 0 } } }
    };

    let currentUser = null;

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) return;

        // 检查是否是用户行（第一列有 user active 链接）
        const userLink = cells[0].querySelector('a.user.active');
        
        if (userLink) {
            // 这是用户汇总行
            currentUser = userLink.textContent.trim();
            data.users.push(currentUser);
            data.userData[currentUser] = {
                total: 0,
                projects: {}
            };

            // 获取总工时（最后一列）
            const totalCell = cells[cells.length - 1];
            const totalHours = parseHours(totalCell);
            data.userData[currentUser].total = totalHours;
        } else if (currentUser && cells[1]) {
            // 这是项目明细行（第一列为空，第二列为项目名）
            const projectLink = cells[1].querySelector('a[href^="/projects/"]');
            if (projectLink) {
                const projectName = projectLink.textContent.trim();
                data.projects.add(projectName);
                data.hasProjectColumn = true;

                // 获取项目工时（最后一列）
                const totalCell = cells[cells.length - 1];
                const projectHours = parseHours(totalCell);
                data.userData[currentUser].projects[projectName] = projectHours;
            }
        }
    });

    console.log('Time Report Chart: 解析完成', {
        userCount: data.users.length,
        projectCount: data.projects.size,
        hasProjectColumn: data.hasProjectColumn
    });

    return data;
}

// 解析工时数值
function parseHours(cell) {
    if (!cell) return 0;
    
    const intSpan = cell.querySelector('.hours-int');
    const decSpan = cell.querySelector('.hours-dec');
    
    if (intSpan && decSpan) {
        const intPart = parseFloat(intSpan.textContent) || 0;
        const decPart = parseFloat('0' + decSpan.textContent) || 0;
        return intPart + decPart;
    }
    
    // 备用解析方式
    const text = cell.textContent.trim();
    const match = text.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
}

// 生成图表
function generateChart() {
    const data = parseReportData();
    if (!data || data.users.length === 0) {
        alert('未找到报表数据，请确保页面已加载完成');
        return;
    }

    // 创建 Modal
    const modal = createChartModal();
    document.body.appendChild(modal);

    // 渲染图表
    renderChart(data);
}

// 创建图表 Modal
function createChartModal() {
    // 遮罩层
    const overlay = document.createElement('div');
    overlay.id = 'time-report-chart-modal';
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

    // Modal 容器
    const container = document.createElement('div');
    Object.assign(container.style, {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    });

    // 头部
    const header = document.createElement('div');
    Object.assign(header.style, {
        padding: '16px 24px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    });

    const title = document.createElement('h3');
    title.textContent = '📊 工时统计图表';
    Object.assign(title.style, {
        margin: '0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937'
    });

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    Object.assign(closeBtn.style, {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#6b7280',
        padding: '4px 8px',
        borderRadius: '4px'
    });
    closeBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.backgroundColor = '#f3f4f6');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.backgroundColor = 'transparent');

    header.appendChild(title);
    header.appendChild(closeBtn);

    // 图表区域
    const chartContainer = document.createElement('div');
    Object.assign(chartContainer.style, {
        padding: '24px',
        flex: '1',
        minHeight: '500px',
        position: 'relative'
    });

    const canvas = document.createElement('canvas');
    canvas.id = 'time-report-chart-canvas';
    chartContainer.appendChild(canvas);

    // 底部说明
    const footer = document.createElement('div');
    Object.assign(footer.style, {
        padding: '12px 24px',
        borderTop: '1px solid #e5e7eb',
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'center'
    });
    footer.textContent = '数据来源于当前时间报表页面';

    container.appendChild(header);
    container.appendChild(chartContainer);
    container.appendChild(footer);
    overlay.appendChild(container);

    // 点击遮罩关闭
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeModal();
        }
    });

    // ESC 键关闭
    document.addEventListener('keydown', handleEscKey);

    return overlay;
}

// 关闭 Modal
function closeModal() {
    const modal = document.getElementById('time-report-chart-modal');
    if (modal) {
        modal.remove();
    }
    document.removeEventListener('keydown', handleEscKey);
    
    // 销毁图表实例
    if (window.timeReportChartInstance) {
        window.timeReportChartInstance.destroy();
        window.timeReportChartInstance = null;
    }
}

// ESC 键处理
function handleEscKey(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}

// 渲染图表
function renderChart(data) {
    const ctx = document.getElementById('time-report-chart-canvas').getContext('2d');

    // 准备数据
    const labels = data.users;
    const projects = Array.from(data.projects);

    let datasets;
    let options;

    if (data.hasProjectColumn && projects.length > 0) {
        // 堆叠柱状图 - 按项目区分
        const colors = generateColors(projects.length);
        
        datasets = projects.map((project, index) => ({
            label: project,
            data: data.users.map(user => data.userData[user].projects[project] || 0),
            backgroundColor: colors[index],
            borderColor: colors[index],
            borderWidth: 1
        }));

        options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '用户工时统计（按项目堆叠）',
                    font: { size: 16 }
                },
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        footer: function(tooltipItems) {
                            let total = 0;
                            tooltipItems.forEach(function(tooltipItem) {
                                total += tooltipItem.parsed.y;
                            });
                            return '总计: ' + total.toFixed(2) + ' 小时';
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: '用户'
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: '工时（小时）'
                    },
                    beginAtZero: true
                }
            }
        };
    } else {
        // 普通柱状图 - 只显示用户总工时
        datasets = [{
            label: '总工时',
            data: data.users.map(user => data.userData[user].total),
            backgroundColor: 'rgba(79, 70, 229, 0.8)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 1
        }];

        options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '用户工时统计',
                    font: { size: 16 }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '用户'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '工时（小时）'
                    },
                    beginAtZero: true
                }
            }
        };
    }

    // 创建图表
    window.timeReportChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: options
    });
}

// 生成颜色数组
function generateColors(count) {
    const baseColors = [
        'rgba(79, 70, 229, 0.8)',   // 靛蓝
        'rgba(16, 185, 129, 0.8)',  // 翠绿
        'rgba(245, 158, 11, 0.8)',  // 琥珀
        'rgba(239, 68, 68, 0.8)',   // 红色
        'rgba(59, 130, 246, 0.8)',  // 蓝色
        'rgba(139, 92, 246, 0.8)',  // 紫色
        'rgba(236, 72, 153, 0.8)',  // 粉色
        'rgba(14, 165, 233, 0.8)',  // 天蓝
        'rgba(99, 102, 241, 0.8)',  // 紫罗兰
        'rgba(34, 197, 94, 0.8)',   // 绿色
        'rgba(249, 115, 22, 0.8)',  // 橙色
        'rgba(168, 85, 247, 0.8)'   // 紫红
    ];

    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
}
