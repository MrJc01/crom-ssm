import Swal from 'sweetalert2';

const swalTheme = { background: '#1e293b', color: '#cbd5e1', confirmButtonColor: '#2563eb', cancelButtonColor: '#ef4444' };

export class ProcessManager {
    constructor() {
        this.connectionId = null;
        this.processCache = [];
        
        this.elements = {
            tableBody: document.getElementById('process-list-body'),
            refreshBtn: document.getElementById('refresh-processes-btn'),
            filterInput: document.getElementById('process-filter')
        };
        
        this.initEvents();
    }
    
    setConnectionId(id) {
        this.connectionId = id;
        this.processCache = [];
        this.render([]);
        if (id) {
             this.fetch();
        }
    }

    initEvents() {
        this.elements.refreshBtn.addEventListener('click', () => this.fetch());
        
        this.elements.filterInput.addEventListener('input', () => {
            this.render(this.processCache, this.elements.filterInput.value);
        });

        this.elements.tableBody.addEventListener('click', async (e) => {
            const btn = e.target.closest('.kill-btn');
            if (btn && this.connectionId) {
                const { pid, command } = btn.dataset;
                await this.killProcess(pid, command);
            }
        });
    }

    async fetch() {
        if (!this.connectionId) return;
        
        this.elements.tableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-500">Carregando processos...</td></tr>';
        
        try {
            const output = await window.ssm.processList(this.connectionId);
            this.processCache = this.parsePsOutput(output);
            this.render(this.processCache, this.elements.filterInput.value);
        } catch (error) {
            Swal.fire({ title: 'Erro', text: error.message, icon: 'error', ...swalTheme });
            this.elements.tableBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-red-500">Falha ao carregar.</td></tr>';
        }
    }

    parsePsOutput(output) {
        return output.trim().split('\n').slice(1).map(line => {
            const parts = line.trim().split(/\s+/);
            return {
                pid: parts[0],
                user: parts[1],
                cpu: parts[2],
                mem: parts[3],
                command: parts.slice(4).join(' ')
            };
        });
    }

    render(processes, filter = '') {
        const term = filter.toLowerCase();
        const filtered = processes.filter(p => 
            p.command.toLowerCase().includes(term) || p.pid.includes(term)
        );

        this.elements.tableBody.innerHTML = filtered.map(p => `
            <tr class="border-b border-slate-700 hover:bg-slate-800 transition-colors">
                <td class="p-3 text-slate-300 font-mono">${p.pid}</td>
                <td class="p-3 text-slate-300">${p.user}</td>
                <td class="p-3 text-slate-300">${p.cpu}%</td>
                <td class="p-3 text-slate-300">${p.mem}%</td>
                <td class="p-3 text-slate-300 font-mono break-all">${p.command}</td>
                <td class="p-3">
                    <button class="kill-btn bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors" 
                            data-pid="${p.pid}" data-command="${p.command}">
                        Encerrar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async killProcess(pid, command) {
        const result = await Swal.fire({
            title: 'Encerrar Processo?',
            text: `PID: ${pid} (${command})`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, Encerrar',
            cancelButtonText: 'Cancelar',
            ...swalTheme
        });

        if (result.isConfirmed) {
            try {
                await window.ssm.processKill(this.connectionId, pid);
                const toast = Swal.mixin({ toast: true, position: 'bottom-end', showConfirmButton: false, timer: 3000, ...swalTheme });
                toast.fire({ icon: 'success', title: 'Processo encerrado' });
                this.fetch();
            } catch (error) {
                Swal.fire({ title: 'Erro', text: error.message, icon: 'error', ...swalTheme });
            }
        }
    }
}
