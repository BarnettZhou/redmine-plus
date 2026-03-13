(function() {

    console.log("content-scripts init");
    
    function execApp(config) {

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
    }

    chrome.storage.local.get("redminePlusConfig", function(result) {
        const config = result.redminePlusConfig || defaultConfig;
        execApp(config);
    });


})();