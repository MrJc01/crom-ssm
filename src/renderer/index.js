import './index.css';
import Swal from 'sweetalert2';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TerminalManager } from './components/TerminalManager';
import { FileManager } from './components/FileManager';
import { ProcessManager } from './components/ProcessManager';
import { TitleBar } from './components/TitleBar';

const swalTheme = { background: '#1e293b', color: '#cbd5e1', confirmButtonColor: '#2563eb', cancelButtonColor: '#ef4444' };

class AppController {
    constructor() {
        this.activeConnectionId = null;
        this.cleanupMetrics = null;

        // Components
        this.titleBar = new TitleBar();
        this.dashboard = new Dashboard();
        this.terminalManager = new TerminalManager(null);
        this.fileManager = new FileManager();
        this.processManager = new ProcessManager();
        
        this.sidebar = new Sidebar({
            onSelectConnection: (id) => this.selectConnection(id),
            onEditConnection: (conn) => this.openConnectionModal(conn),
            onDeleteConnection: (conn) => this.deleteConnection(conn),
            onSelectSnippet: (snippet) => this.executeSnippet(snippet),
            onEditSnippet: (snippet) => this.openSnippetModal(snippet),
            onDeleteSnippet: (snippet) => this.deleteSnippet(snippet)
        });

        // Global Event Listeners (Metrics)
        window.ssm.onMetricsUpdate((metrics) => {
            if (this.activeConnectionId) {
                this.dashboard.update(metrics);
            }
        });

        this.initTabs();
        this.initSettingsLogic();
        this.init();
    }

    initSettingsLogic() {
        const modal = document.getElementById('settings-modal');
        const openBtn = document.getElementById('main-settings-btn');
        const closeBtn = document.getElementById('close-settings-btn');
        const siteLink = document.getElementById('main-site-link');
        const donateBtn = document.getElementById('main-donate-btn');

        if (openBtn && modal) {
            openBtn.addEventListener('click', () => {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            });
        }

        const closeModal = () => {
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        if (siteLink) {
            siteLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.ssm.openExternal('https://ssm.crom.run');
            });
        }

        if (donateBtn) {
            donateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.ssm.openExternal('https://ssm.crom.run/donate');
            });
        }
    }

    initTabs() {
        const tabs = document.querySelectorAll('.tab-link');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => {
                    t.classList.remove('active', 'border-blue-500', 'text-white');
                    t.classList.add('border-transparent', 'text-slate-400');
                });

                // Add active class to clicked tab
                tab.classList.add('active', 'border-blue-500', 'text-white');
                tab.classList.remove('border-transparent', 'text-slate-400');

                // Hide all contents
                contents.forEach(c => c.classList.add('hidden'));

                // Show target content
                const targetId = tab.dataset.tab;
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    
                    // Specific component refreshes
                    if (targetId === 'terminal') {
                        this.terminalManager.fitActiveTerm();
                        this.terminalManager.activeSessionId && this.terminalManager.sessions.get(this.terminalManager.activeSessionId)?.term.focus();
                    }
                }
            });
        });
    }

    async init() {
        await this.loadConnections();
        await this.loadSnippets();
        this.selectConnection(null);
    }

    async loadConnections() {
        const connections = await window.ssm.listConnections();
        this.sidebar.renderConnections(connections, this.activeConnectionId);
    }
    
    async loadSnippets() {
        const snippets = await window.ssm.snippetsList();
        this.sidebar.renderSnippets(snippets);
    }

    async selectConnection(id) {
        // If clicking same connection, do nothing? Or refresh? Let's refresh/select.
        if (this.activeConnectionId) {
            this.sidebar.setConnectionStatus(this.activeConnectionId, 'inactive');
            window.ssm.stopMetrics();
            if (this.cleanupMetrics) { this.cleanupMetrics(); this.cleanupMetrics = null; }
        }

        this.activeConnectionId = id;
        this.sidebar.renderConnections(await window.ssm.listConnections(), id); // Re-render to update active state CSS
        
        // Propagate to components
        this.terminalManager.setConnectionId(id);
        this.fileManager.setConnectionId(id);
        this.processManager.setConnectionId(id);

        if (id) {
            this.sidebar.setConnectionStatus(id, 'loading');
            this.dashboard.init();
            window.ssm.startMetrics(id);
            // Terminal reset only on explicit connection change? 
            // The Manager handles multiple sessions. We might want to clear them or keep them.
            // For now, let's keep sessions but maybe focus or notify?
            // Actually, usually switching servers implies clearing old terminal sessions of previous server.
            // But here tabs are global? No, terminals are per connection context usually.
            // Let's destroy old sessions for simplicity as per previous logic.
            this.terminalManager.reset(); 
            this.terminalManager.destroyDefault(); // Start with one fresh terminal
            
        } else {
            this.dashboard.reset();
            this.terminalManager.reset();
        }
    }

    executeSnippet(snippet) {
         if (!this.activeConnectionId) {
            Swal.fire({ title: 'Sem Conexão', text: 'Selecione uma conexão e abra um terminal primeiro.', icon: 'info', ...swalTheme });
            return;
        }
        this.terminalManager.writeToActive(snippet.command + '\n');
    }

    // Modal Logic (kept here to avoid circular deps or complex manager extraction for now)
    async openConnectionModal(conn = null) {
        const isEditing = !!conn;
        // ... (SweetAlert logic adapted from original) ...
        // For brevity, using a simplified version or similar logic. 
        // I will copy the original huge HTML string logic but tailored with Tailwind classes if possible, 
        // OR just keep using swal-wide class and standard inputs, relying on index.css hacks or swalTheme.
        
        // Note: Tailwind classes inside SweetAlert HTML might not work if Swal renders outside app root (it does, in body).
        // Since I have index.css generated with Tailwind and it applies to body, it should work if we use utility classes.

        let validatedData = null;

        await Swal.fire({
            title: isEditing ? 'Editar Conexão' : 'Nova Conexão',
            html: `
                <form id="swal-form" class="flex flex-col gap-3 text-left">
                    <div>
                        <label class="text-sm text-slate-400">Nome</label>
                        <input id="swal-name" name="name" class="swal2-input bg-slate-800 border-slate-600 text-white focus:border-blue-500 w-full" placeholder="Meu Servidor" value="${conn?.name || ''}">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-sm text-slate-400">Host</label>
                            <input id="swal-host" name="host" class="swal2-input bg-slate-800 border-slate-600 text-white w-full" placeholder="192.168.1.1" value="${conn?.host || ''}">
                        </div>
                         <div>
                            <label class="text-sm text-slate-400">Usuário</label>
                            <input id="swal-user" name="user" class="swal2-input bg-slate-800 border-slate-600 text-white w-full" placeholder="root" value="${conn?.user || ''}">
                        </div>
                    </div>
                    <div>
                         <label class="text-sm text-slate-400">Autenticação</label>
                         <select id="swal-authMethod" name="authMethod" class="swal2-select bg-slate-800 border-slate-600 text-white w-full">
                            <option value="password" ${conn?.authMethod === 'password' ? 'selected' : ''}>Senha</option>
                            <option value="key" ${conn?.authMethod === 'key' ? 'selected' : ''}>Chave Privada</option>
                         </select>
                    </div>
                    <div id="swal-pass-group">
                        <label class="text-sm text-slate-400">Senha</label>
                        <input type="password" id="swal-password" name="password" class="swal2-input bg-slate-800 border-slate-600 text-white w-full" placeholder="${isEditing ? '(Deixar em branco)' : ''}">
                    </div>
                     <div id="swal-key-group" style="display:none">
                        <label class="text-sm text-slate-400">Caminho da Chave</label>
                        <input id="swal-keyPath" name="keyPath" class="swal2-input bg-slate-800 border-slate-600 text-white w-full" placeholder="/path/to/key" value="${conn?.keyPath || ''}">
                    </div>
                     <div>
                        <label class="text-sm text-slate-400">Serviços (separados por vírgula)</label>
                        <input id="swal-services" name="monitoredServices" class="swal2-input bg-slate-800 border-slate-600 text-white w-full" placeholder="nginx, docker" value="${(conn?.monitoredServices || []).join(', ')}">
                    </div>
                </form>
            `,
            showCancelButton: true,
            confirmButtonText: 'Testar & Salvar',
            cancelButtonText: 'Cancelar',
            width: '600px',
            ...swalTheme,
            didOpen: () => {
                const authMethod = document.getElementById('swal-authMethod');
                const passGroup = document.getElementById('swal-pass-group');
                const keyGroup = document.getElementById('swal-key-group');
                const toggle = () => {
                    if (authMethod.value === 'key') { passGroup.style.display = 'none'; keyGroup.style.display = 'block'; }
                    else { passGroup.style.display = 'block'; keyGroup.style.display = 'none'; }
                };
                authMethod.addEventListener('change', toggle);
                toggle();
            },
            preConfirm: async () => {
                 const form = document.getElementById('swal-form');
                 const formData = new FormData(form);
                 const data = Object.fromEntries(formData.entries());
                 
                 if (!data.name || !data.host || !data.user) {
                     Swal.showValidationMessage('Preencha os campos obrigatórios');
                     return false;
                 }
                 data.monitoredServices = data.monitoredServices.split(',').map(s => s.trim()).filter(Boolean);
                 if(isEditing) data.id = conn.id;

                 try {
                     await window.ssm.testConnection(data);
                     return data;
                 } catch (e) {
                     Swal.showValidationMessage('Falha na conexão: ' + e.message);
                     return false;
                 }
            }
        }).then(async (result) => {
            if (result.isConfirmed && result.value) {
                const { password, ...data } = result.value;
                try {
                    if (isEditing) {
                        await window.ssm.updateConnection(conn.id, data);
                        if (password) await window.ssm.setPassword(conn.id, password);
                    } else {
                        const newConn = await window.ssm.addConnection(data);
                        if (password) await window.ssm.setPassword(newConn.id, password);
                    }
                    this.loadConnections();
                    Swal.fire({ icon: 'success', title: 'Salvo!', timer: 1500, showConfirmButton: false, ...swalTheme });
                } catch (e) {
                    Swal.fire({ icon: 'error', title: 'Erro', text: e.message, ...swalTheme });
                }
            }
        });
    }

    deleteConnection(conn) {
        Swal.fire({
            title: 'Confirmar Exclusão',
            text: conn.name,
            icon: 'warning',
            showCancelButton: true,
            ...swalTheme
        }).then(async (r) => {
            if(r.isConfirmed) {
                await window.ssm.removeConnection(conn.id);
                if (this.activeConnectionId === conn.id) this.selectConnection(null);
                this.loadConnections();
            }
        });
    }

    async openSnippetModal(snippet = null) {
        const isEditing = !!snippet;
        const { value: formValues } = await Swal.fire({
            title: isEditing ? 'Editar Snippet' : 'Novo Snippet',
            html: `
                <input id="swal-snip-name" class="swal2-input bg-slate-800 text-white" placeholder="Nome" value="${snippet?.name || ''}">
                <textarea id="swal-snip-cmd" class="swal2-textarea bg-slate-800 text-white font-mono text-sm" placeholder="Comando">${snippet?.command || ''}</textarea>
            `,
            showCancelButton: true,
            preConfirm: () => {
                return [
                    document.getElementById('swal-snip-name').value,
                    document.getElementById('swal-snip-cmd').value
                ]
            },
            ...swalTheme
        });

        if (formValues) {
            const [name, command] = formValues;
            if (!name || !command) return;
            
            if (isEditing) await window.ssm.snippetUpdate({ ...snippet, name, command });
            else await window.ssm.snippetAdd({ name, command });
            
            this.loadSnippets();
        }
    }

    deleteSnippet(snippet) {
         Swal.fire({ title: 'Excluir?', text: snippet.name, icon: 'warning', showCancelButton: true, ...swalTheme })
            .then(async r => {
                if(r.isConfirmed) {
                    await window.ssm.snippetRemove(snippet.id);
                    this.loadSnippets();
                }
            });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AppController();
});