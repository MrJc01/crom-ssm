import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export class Dashboard {
    constructor() {
        this.elements = {
            welcome: document.getElementById('dashboard-welcome'),
            content: document.getElementById('dashboard-content'),
            uptime: document.getElementById('uptime-text'),
            cpuText: document.getElementById('cpu-text'),
            memText: document.getElementById('mem-text'),
            diskText: document.getElementById('disk-text'),
            sysOs: document.getElementById('sys-os'),
            sysKernel: document.getElementById('sys-kernel'),
            sysArch: document.getElementById('sys-arch'),
            sysCpu: document.getElementById('sys-cpu'),
            netIn: document.getElementById('net-in'),
            netOut: document.getElementById('net-out'),
            servicesList: document.getElementById('services-list-body'),
            cpuCanvas: document.getElementById('cpuChart'),
            memCanvas: document.getElementById('memChart'),
            diskCanvas: document.getElementById('diskChart')
        };

        this.charts = {
            cpu: null,
            mem: null,
            disk: null
        };
        
        this.MAX_HISTORICAL_POINTS = 12; // 60s
    }

    reset() {
        this.elements.welcome.style.display = 'block';
        this.elements.content.style.display = 'none';
        this.clearCharts();
    }

    init() {
         this.elements.welcome.style.display = 'none';
         this.elements.content.style.display = 'grid';
         this.initCharts();
    }

    clearCharts() {
        if (this.charts.cpu) this.charts.cpu.destroy();
        if (this.charts.mem) this.charts.mem.destroy();
        if (this.charts.disk) this.charts.disk.destroy();
        this.charts = { cpu: null, mem: null, disk: null };
    }

    initCharts() {
        this.clearCharts();
        
        const createLineChart = (ctx, label, color) => {
            const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.clientHeight);
            gradient.addColorStop(0, `${color}40`);
            gradient.addColorStop(1, `${color}00`);
            
            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label,
                        data: [],
                        borderColor: color,
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.3,
                        fill: true,
                        backgroundColor: gradient
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, max: 100, display: false },
                        x: { display: false }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        };

        const createDoughnutChart = (ctx, data, colors) => new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Used', 'Free'],
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });

        if (this.elements.cpuCanvas) {
            this.charts.cpu = createLineChart(this.elements.cpuCanvas.getContext('2d'), 'CPU Usage', '#61afef');
        }
        if (this.elements.memCanvas) {
            this.charts.mem = createLineChart(this.elements.memCanvas.getContext('2d'), 'Memory Usage', '#98c379');
        }
        if (this.elements.diskCanvas) {
            this.charts.disk = createDoughnutChart(this.elements.diskCanvas.getContext('2d'), [0, 100], ['#e06c75', '#3a3f4b']);
        }
    }

    updateLineChart(chart, value) {
        if (!chart) return;
        const now = new Date().toLocaleTimeString();
        chart.data.labels.push(now);
        chart.data.datasets[0].data.push(value);
        if (chart.data.labels.length > this.MAX_HISTORICAL_POINTS) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
        chart.update('none');
    }

    update(metrics) {
        if (metrics.status === 'error') {
            this.elements.uptime.textContent = `Erro: ${metrics.message}`;
            return;
        }

        const { uptime, memory, disk, cpu, system, network, services } = metrics.data;

        // Text Updates
        this.elements.uptime.textContent = uptime;
        this.elements.cpuText.textContent = `${cpu}%`;
        const memUsagePercent = ((memory.used / memory.total) * 100).toFixed(1);
        this.elements.memText.textContent = `${memory.used} / ${memory.total} MB`;
        this.elements.diskText.textContent = `${disk.used} / ${disk.total} (${disk.percent})`;
        
        this.elements.sysOs.textContent = system.os;
        this.elements.sysKernel.textContent = system.kernel;
        this.elements.sysArch.textContent = system.arch;
        this.elements.sysCpu.textContent = system.cpu;
        
        this.elements.netIn.textContent = `${network.in} KB/s`;
        this.elements.netOut.textContent = `${network.out} KB/s`;

        // Chart Updates
        this.updateLineChart(this.charts.cpu, cpu);
        this.updateLineChart(this.charts.mem, memUsagePercent);

        if (this.charts.disk) {
            const diskPercent = parseInt(disk.percent.replace('%', ''));
            this.charts.disk.data.datasets[0].data = [diskPercent, 100 - diskPercent];
            this.charts.disk.update('none');
        }

        // Services
        if (services && services.length > 0) {
            this.elements.servicesList.innerHTML = services.map(s => `
                <div class="service-item flex items-center mb-1 text-sm bg-slate-800 p-2 rounded">
                    <span class="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0 ${this.getServiceStatusColor(s.status)}"></span>
                    <span class="text-slate-300">${s.name}</span>
                </div>
            `).join('');
        } else {
            this.elements.servicesList.innerHTML = '<p class="text-slate-500">Nenhum serviço monitorado.</p>';
        }
    }

    getServiceStatusColor(status) {
        status = status.trim();
        if (status === 'active') return 'bg-green-500';
        if (status === 'failed') return 'bg-red-500';
        return 'bg-slate-500';
    }
}
