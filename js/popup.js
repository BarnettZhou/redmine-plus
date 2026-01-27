document.addEventListener('DOMContentLoaded', () => {
    const openOptionsBtn = document.getElementById('openOptionsBtn');
    
    openOptionsBtn.addEventListener('click', () => {
        chrome.tabs.create({
            url: 'options.html'
        });
    });
});