// 默认配置
const defaultConfig = {
    hosts: ["127.0.0.1:8080"],
    project_shortcuts: {
        enabled: true,
        default_query_id: "",
        items: [
            {
                "name": "其他",
                "project_key": "other_1",
                "query_id": ""
            },
        ]
    },
    time_tracking_shortcuts: {
        enabled: true
    },
    immersive_input: {
        enabled: true
    },
    issue_details: {
        enabled: true
    },
    ai_completion: {
        enabled: false
    },
    time_report_chart: {
        enabled: true
    },
    time_entry_assistant: {
        enabled: true,
        items: [
            {
                "project_name": "示例项目",
                "custom_field_value": "1"
            }
        ]
    },
    issue_creation_assistant: {
        enabled: true,
        common_fields: {
            product_manager: "",
            responsible_person: "",
            assigned_to: "",
            document_trace: "0"
        },
        project_mappings: [
            { project_name: "小草", division: "坤玑" },
            { project_name: "财道", division: "瑞麟" },
            { project_name: "常春藤", division: "坤玑" }
        ]
    }
};
