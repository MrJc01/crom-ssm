import { createIcons, icons } from 'lucide';

export class TitleBar {
    constructor() {
        this.elements = {
            container: document.getElementById('titlebar'),
            minimizeBtn: document.getElementById('win-minimize'),
            maximizeBtn: document.getElementById('win-maximize'),
            closeBtn: document.getElementById('win-close')
        };
        
        this.initEvents();
    }

    initEvents() {
        if (!this.elements.container) return;

        // Double click to toggle maximize
        this.elements.container.addEventListener('dblclick', (e) => {
            // Check if target is not a button to avoid conflict
            if (!e.target.closest('button')) {
                window.ssm.win.toggleMaximize();
            }
        });

        this.elements.minimizeBtn?.addEventListener('click', () => window.ssm.win.minimize());
        this.elements.maximizeBtn?.addEventListener('click', () => window.ssm.win.maximize());
        this.elements.closeBtn?.addEventListener('click', () => window.ssm.win.close());
    }
}
