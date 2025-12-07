import { createIcons, icons } from 'lucide';

export class Sidebar {
    constructor({ onSelectConnection, onEditConnection, onDeleteConnection, onSelectSnippet, onEditSnippet, onDeleteSnippet }) {
        this.callbacks = {
            onSelectConnection,
            onEditConnection,
            onDeleteConnection,
            onSelectSnippet,
            onEditSnippet,
            onDeleteSnippet
        };

        this.elements = {
            connectionsList: document.getElementById('connections-list'),
            snippetsList: document.getElementById('snippets-list'),
            tabs: document.querySelectorAll('.sidebar-tab-link'),
            tabContents: document.querySelectorAll('.sidebar-tab-content'),
            addConnectionBtn: document.getElementById('add-new-connection-btn'),
            addSnippetBtn: document.getElementById('add-new-snippet-btn')
        };
        
        this.initEventListeners();
    }

    initEventListeners() {
        // Tab switching
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.elements.tabs.forEach(t => t.classList.remove('active', 'bg-slate-700', 'text-white'));
                tab.classList.add('active', 'bg-slate-700', 'text-white');
                
                this.elements.tabContents.forEach(c => c.classList.add('hidden'));
                const targetId = tab.dataset.stab;
                document.getElementById(targetId).classList.remove('hidden');
            });
        });

        // Add Buttons
        this.elements.addConnectionBtn?.addEventListener('click', () => this.callbacks.onEditConnection(null));
        this.elements.addSnippetBtn?.addEventListener('click', () => this.callbacks.onEditSnippet(null));
    }

    renderConnections(connections, activeId) {
        if (!this.elements.connectionsList) return;
        this.elements.connectionsList.innerHTML = '';

        connections.forEach(conn => {
            const li = document.createElement('li');
            const isActive = conn.id === activeId;
            // Tailwind classes
            li.className = `flex items-center justify-between p-3 mb-2 rounded-md cursor-pointer transition-colors text-sm group ${
                isActive 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`;
            li.dataset.id = conn.id;

            // Status Dot (Placeholder structure, status updated separately or here)
            const statusDot = `<div class="w-2 h-2 rounded-full mr-3 bg-slate-500 connection-status-dot" data-status-id="${conn.id}"></div>`;
            const label = `<span class="truncate flex-1" title="${conn.user}@${conn.host}">${conn.name}</span>`;
            
            // Actions (Edit/Delete) - visible on hover or active
            const actions = `
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="p-1 hover:text-blue-300 text-slate-400 edit-btn" title="Editar">
                        <i data-lucide="pencil" class="w-3 h-3"></i>
                    </button>
                    <button class="p-1 hover:text-red-300 text-slate-400 delete-btn" title="Excluir">
                         <i data-lucide="trash-2" class="w-3 h-3"></i>
                    </button>
                </div>
            `;

            li.innerHTML = `${statusDot}${label}${actions}`;

            // Events
            li.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (target?.classList.contains('edit-btn')) {
                    this.callbacks.onEditConnection(conn);
                } else if (target?.classList.contains('delete-btn')) {
                    this.callbacks.onDeleteConnection(conn);
                } else {
                    this.callbacks.onSelectConnection(conn.id);
                }
            });

            this.elements.connectionsList.appendChild(li);
        });

        createIcons({ icons });
    }

    setConnectionStatus(id, status) {
        const dot = this.elements.connectionsList.querySelector(`.connection-status-dot[data-status-id="${id}"]`);
        if (dot) {
            dot.className = `w-2 h-2 rounded-full mr-3 connection-status-dot`; // Reset
            switch (status) {
                case 'active': dot.classList.add('bg-emerald-500'); break;
                case 'inactive': dot.classList.add('bg-slate-500'); break;
                case 'loading': dot.classList.add('bg-yellow-500', 'animate-pulse'); break;
                case 'error': dot.classList.add('bg-red-500'); break;
                default: dot.classList.add('bg-slate-500');
            }
        }
    }

    renderSnippets(snippets) {
        if (!this.elements.snippetsList) return;
        
        if (snippets.length === 0) {
            this.elements.snippetsList.innerHTML = `<li class="text-xs text-slate-500 text-center p-4">Nenhum snippet salvo.</li>`;
            return;
        }

        this.elements.snippetsList.innerHTML = snippets.map(s => `
            <li class="flex items-center justify-between p-3 mb-2 rounded-md bg-slate-800 hover:bg-slate-750 transition-colors text-sm group" data-id="${s.id}">
                <div class="flex flex-col overflow-hidden mr-2">
                    <span class="font-medium text-slate-300 truncate">${s.name}</span>
                    <span class="text-xs text-slate-500 truncate font-mono">${s.command}</span>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button class="p-1 hover:text-green-400 text-slate-400 exec-btn" title="Executar">
                        <i data-lucide="play" class="w-3 h-3"></i>
                    </button>
                    <button class="p-1 hover:text-blue-400 text-slate-400 edit-btn" title="Editar">
                        <i data-lucide="pencil" class="w-3 h-3"></i>
                    </button>
                    <button class="p-1 hover:text-red-400 text-slate-400 delete-btn" title="Excluir">
                         <i data-lucide="trash-2" class="w-3 h-3"></i>
                    </button>
                </div>
            </li>
        `).join('');

        // Attach events via delegation
        this.elements.snippetsList.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                const id = li.dataset.id;
                const snippet = snippets.find(s => s.id === id);
                if (!snippet || !target) return;

                if (target.classList.contains('exec-btn')) {
                     this.callbacks.onSelectSnippet(snippet);
                } else if (target.classList.contains('edit-btn')) {
                    this.callbacks.onEditSnippet(snippet);
                } else if (target.classList.contains('delete-btn')) {
                    this.callbacks.onDeleteSnippet(snippet);
                }
            });
        });
        
        createIcons({ icons });
    }
}
