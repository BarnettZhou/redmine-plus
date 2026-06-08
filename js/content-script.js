(function() {

    console.log("content-scripts init");

    function extractHost(input) {
        if (!input) return '';
        let host = input.replace(/^https?:\/\//, '');
        host = host.split('/')[0];
        return host;
    }

    function isHostMatched(configHosts) {
        if (!configHosts) return false;
        const hosts = Array.isArray(configHosts) ? configHosts : [configHosts];
        return hosts.some(h => {
            const expected = extractHost(h);
            return expected && location.host === expected;
        });
    }

    function execApp(config) {
        if (!isHostMatched(config.hosts || config.host)) {
            console.log("Redmine Plus: 当前 host 不匹配，跳过执行");
            return;
        }

        // 添加项目快捷入口
        if (config.project_shortcuts.enabled) {
            projectShortcutsInit(config.project_shortcuts);
        }

        // 添加耗时快捷查询
        if (config.time_tracking_shortcuts.enabled) {
            timeTrackingShortcutsInit(config.time_tracking_shortcuts);
        }

        // 添加沉浸编写
        if (config.immersive_input.enabled) {
            const editor = document.getElementById("issue_description");
            if (editor) {
                console.log("找到编辑器元素:", editor);
                initImmersiveInputUI(editor);
            } else {
                console.log("未找到编辑器元素");
            }
        }

        // 添加issue快捷查看
        if (config.issue_details.enabled) {
            // 实现issue快捷查看
            initIssueDetail();
        }

        // 添加AI补全
        if (config.ai_completion && config.ai_completion.enabled) {
            // 实现AI补全
        }

        // 添加时间报表图表
        if (config.time_report_chart && config.time_report_chart.enabled) {
            timeReportChartInit(config.time_report_chart);
        }

        // 添加工时登记助手
        if (config.time_entry_assistant && config.time_entry_assistant.enabled) {
            timeEntryAssistantInit(config.time_entry_assistant);
        }
    }

    chrome.storage.local.get("redminePlusConfig", function(result) {
        const config = result.redminePlusConfig || defaultConfig;
        if (isHostMatched(config.hosts || config.host)) {
            execApp(config);
        }
    });

    // 监听 #all_attributes 等区域的动态刷新，重新注入功能入口
    function observeDynamicAttributes(config) {
        if (!isHostMatched(config.hosts || config.host)) return;
        const observer = new MutationObserver(function(mutations) {
            let shouldReinitImmersive = false;
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.matches && node.matches('textarea#issue_description')) {
                                shouldReinitImmersive = true;
                            } else if (node.querySelector && node.querySelector('textarea#issue_description')) {
                                shouldReinitImmersive = true;
                            }
                        }
                    }
                }
            }
            if (shouldReinitImmersive && config.immersive_input && config.immersive_input.enabled) {
                const editor = document.getElementById("issue_description");
                if (editor) {
                    // 避免重复注入：检查父元素是否已有沉浸编写按钮
                    const parent = editor.parentElement;
                    if (parent && !parent.querySelector('[data-redmine-plus-immersive]')) {
                        console.log("检测到新的编辑器元素，重新注入沉浸式输入入口");
                        initImmersiveInputUI(editor);
                    }
                }
            }
        });

        const target = document.getElementById('all_attributes') || document.body;
        observer.observe(target, { childList: true, subtree: true });
    }

    chrome.storage.local.get("redminePlusConfig", function(result) {
        const config = result.redminePlusConfig || defaultConfig;
        observeDynamicAttributes(config);
    });

})();