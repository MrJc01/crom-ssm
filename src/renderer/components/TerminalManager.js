import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export class TerminalManager {
    constructor(connectionId) {
        this.connectionId = connectionId;
        this.sessions = new Map(); // id -> { term, fitAddon, tabEl, paneEl }
        this.activeSessionId = null;
        
        this.elements = {
            tabsList: document.getElementById('terminal-tabs-list'),
            panesContainer: document.getElementById('terminal-panes-container'),
            addTabBtn: null // Will be created dynamically
        };

        this.initResizeObserver();
        this.setupAddTabButton();
        
        // Listen for incoming data
        window.ssm.onTerminalData(({ id, data }) => {
            const session = this.sessions.get(id);
            if (session) session.term.write(data);
        });
    }

    setConnectionId(id) {
        this.connectionId = id;
    }

    setupAddTabButton() {
        // Only if it doesn't exist
        let btn = document.getElementById('add-terminal-tab-btn');
        if (!btn) {
            btn = document.createElement('li');
            btn.id = 'add-terminal-tab-btn';
            btn.textContent = '+';
            btn.className = 'cursor-pointer px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-t-md font-bold';
            btn.addEventListener('click', () => this.createSession());
            this.elements.tabsList.appendChild(btn);
        }
        this.elements.addTabBtn = btn;
    }

    initResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            if (this.activeSessionId) {
                this.fitActiveTerm();
            }
        });
        this.resizeObserver.observe(this.elements.panesContainer);
    }

    createSession() {
        if (!this.connectionId) return;

        const id = `term-${crypto.randomUUID()}`;
        const index = this.sessions.size + 1;

        // Create Tab
        const tabEl = document.createElement('li');
        tabEl.className = 'flex items-center px-3 py-2 bg-slate-800 text-slate-400 rounded-t-md cursor-pointer border border-slate-700 border-b-0 mr-1 hover:bg-slate-700 hover:text-white transition-colors terminal-tab';
        tabEl.dataset.id = id;
        tabEl.innerHTML = `
            <span>Terminal ${index}</span>
            <button class="ml-2 hover:text-red-400 transition-colors close-tab-btn">&times;</button>
        `;

        // Create Pane
        const paneEl = document.createElement('div');
        paneEl.className = 'w-full h-full hidden';
        
        // Init XTerm
        const term = new Terminal({
            cursorBlink: true,
            theme: {
                background: '#1e293b', // slate-800
                foreground: '#cbd5e1', // slate-300
            },
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: 13
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        
        // Mount
        this.elements.tabsList.insertBefore(tabEl, this.elements.addTabBtn);
        this.elements.panesContainer.appendChild(paneEl);
        term.open(paneEl);
        
        // Events
        term.onData(data => window.ssm.terminalWrite(id, data));
        
        tabEl.querySelector('.close-tab-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeSession(id);
        });
        tabEl.addEventListener('click', () => this.switchSession(id));

        // Store Session
        this.sessions.set(id, { id, term, fitAddon, tabEl, paneEl });

        // Backend Sync
        window.ssm.terminalCreate(this.connectionId, id);
        
        // Select
        this.switchSession(id);
    }

    closeSession(id) {
        const session = this.sessions.get(id);
        if (!session) return;

        window.ssm.terminalStop(id);
        session.term.dispose();
        session.tabEl.remove();
        session.paneEl.remove();
        this.sessions.delete(id);

        if (this.activeSessionId === id) {
            this.activeSessionId = null;
            // Activate next available
            const nextKey = this.sessions.keys().next().value;
            if (nextKey) this.switchSession(nextKey);
        }
    }

    switchSession(id) {
        this.activeSessionId = id;
        
        this.sessions.forEach((session, sessionId) => {
            const isActive = sessionId === id;
            session.paneEl.style.display = isActive ? 'block' : 'none';
            
            // Toggle CSS classes for active tab
            if (isActive) {
                session.tabEl.classList.add('bg-slate-700', 'text-white', 'border-slate-600');
                session.tabEl.classList.remove('bg-slate-800', 'text-slate-400');
            } else {
                session.tabEl.classList.remove('bg-slate-700', 'text-white', 'border-slate-600');
                session.tabEl.classList.add('bg-slate-800', 'text-slate-400');
            }
        });

        this.fitActiveTerm();
        const activeSession = this.sessions.get(id);
        if (activeSession) activeSession.term.focus();
    }

    fitActiveTerm() {
        if (!this.activeSessionId) return;
        const session = this.sessions.get(this.activeSessionId);
        if (session && session.fitAddon) {
            try {
                session.fitAddon.fit();
                // Avoid notifying backend if dimensions are 0 (hidden)
                if (session.term.cols > 0 && session.term.rows > 0) {
                     window.ssm.terminalResize(session.id, session.term.cols, session.term.rows);
                }
            } catch (e) {
                console.warn('Fit error:', e);
            }
        }
    }

    writeToActive(data) {
        if (this.activeSessionId) {
             window.ssm.terminalWrite(this.activeSessionId, data);
        }
    }
    
    destroyDefault() {
         // Create default session if none exist
         if (this.sessions.size === 0) {
             this.createSession();
         }
    }

    reset() {
        this.sessions.forEach((session, id) => {
            window.ssm.terminalStop(id);
            session.term.dispose();
        });
        this.sessions.clear();
        this.elements.tabsList.innerHTML = '';
        this.elements.panesContainer.innerHTML = '';
        this.setupAddTabButton();
        this.activeSessionId = null;
    }
}
