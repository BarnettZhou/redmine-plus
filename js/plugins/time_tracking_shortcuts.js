// 耗时快捷查询实现
function timeTrackingShortcutsInit(timeTrackingShortcutsConfig) {
    // 获取目标菜单容器
    const targetMenu = document.querySelector('#top-menu > ul');


    const toolItems = [
        {
            text:"本月耗时",
            href:"/time_entries?utf8=%E2%9C%93&c%5B%5D=project&c%5B%5D=spent_on&c%5B%5D=user&c%5B%5D=activity&c%5B%5D=issue&c%5B%5D=comments&c%5B%5D=hours&f%5B%5D=spent_on&f%5B%5D=user_id&f%5B%5D=&group_by=&op%5Bspent_on%5D=m&op%5Buser_id%5D=%3D&set_filter=1&sort=spent_on%3Adesc&t%5B%5D=hours&t%5B%5D=&utf8=%E2%9C%93&v%5Buser_id%5D%5B%5D=me"
        },
        {
            text:"本月报表",
            href:"/time_entries/report?utf8=%E2%9C%93&criteria%5B%5D=user&set_filter=1&sort=spent_on%3Adesc&f%5B%5D=spent_on&op%5Bspent_on%5D=m&f%5B%5D=user_id&op%5Buser_id%5D=%3D&v%5Buser_id%5D%5B%5D=me&f%5B%5D=&c%5B%5D=project&c%5B%5D=spent_on&c%5B%5D=user&c%5B%5D=activity&c%5B%5D=issue&c%5B%5D=comments&c%5B%5D=hours&group_by=&t%5B%5D=hours&t%5B%5D=&columns=day&criteria%5B%5D=&encoding=GB18030"
        },
        {
            text:"上月耗时",
            href:"/time_entries?utf8=%E2%9C%93&set_filter=1&sort=id%3Adesc&f%5B%5D=spent_on&op%5Bspent_on%5D=lm&f%5B%5D=user_id&op%5Buser_id%5D=%3D&v%5Buser_id%5D%5B%5D=me&f%5B%5D=&c%5B%5D=project&c%5B%5D=spent_on&c%5B%5D=user&c%5B%5D=activity&c%5B%5D=issue&c%5B%5D=comments&c%5B%5D=hours&group_by=&t%5B%5D=hours&t%5B%5D="
        },
        {
            text:"上月报表",
            href:"/time_entries/report?utf8=%E2%9C%93&criteria%5B%5D=user&set_filter=1&sort=spent_on%3Adesc&f%5B%5D=spent_on&op%5Bspent_on%5D=lm&f%5B%5D=user_id&op%5Buser_id%5D=%3D&v%5Buser_id%5D%5B%5D=me&f%5B%5D=&c%5B%5D=project&c%5B%5D=spent_on&c%5B%5D=user&c%5B%5D=activity&c%5B%5D=issue&c%5B%5D=comments&c%5B%5D=hours&group_by=&t%5B%5D=hours&t%5B%5D=&columns=day&criteria%5B%5D=&encoding=GB18030",
        },
    ];

    if (targetMenu) {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = '|'
        li.appendChild(span)
        targetMenu.appendChild(li);

        toolItems.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');

            a.textContent = item.text;
            a.href = item.href;

            li.appendChild(a);
            targetMenu.appendChild(li);
        });
    }
}