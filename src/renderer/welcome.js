document.addEventListener('DOMContentLoaded', () => {
    // FOUC Prevention
    document.body.classList.add('loaded');

    const enterButton = document.getElementById('enter-app-btn');
    const donateButton = document.getElementById('donate-btn');
    const settingsButton = document.getElementById('settings-btn');
    const closeModalButton = document.getElementById('close-modal');
    const settingsModal = document.getElementById('settings-modal');
    const siteLink = document.getElementById('site-link');

    // Enter App
    if (enterButton) {
        enterButton.addEventListener('click', () => {
            if (window.ssm && window.ssm.enterApp) {
                window.ssm.enterApp();
            } else {
                console.error('SSM API not found');
            }
        });
    }

    // Donate
    if (donateButton) {
        donateButton.addEventListener('click', () => {
            if (window.ssm && window.ssm.openExternal) {
                window.ssm.openExternal('https://ssm.crom.run/donate');
            }
        });
    }

    // External Link in Settings
    if (siteLink) {
        siteLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.ssm && window.ssm.openExternal) {
                window.ssm.openExternal('https://ssm.crom.run');
            }
        });
    }

    // Open Settings Modal
    if (settingsButton && settingsModal) {
        settingsButton.addEventListener('click', () => {
            settingsModal.style.display = 'flex';
        });
    }

    // Close Settings Modal
    if (closeModalButton && settingsModal) {
        closeModalButton.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });
    }

    // Close on click outside
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
});
