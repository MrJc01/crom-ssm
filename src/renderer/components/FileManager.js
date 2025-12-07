import * as monaco from 'monaco-editor';
import Swal from 'sweetalert2';
import { createIcons, icons } from 'lucide';

const swalTheme = { background: '#1e293b', color: '#cbd5e1', confirmButtonColor: '#2563eb', cancelButtonColor: '#ef4444' };

export class FileManager {
    constructor() {
        this.connectionId = null;
        this.currentPath = '/';
        this.currentOpenFile = null;
        
        this.elements = {
             fileList: document.getElementById('file-list'),
             currentPath: document.getElementById('current-path'),
             editorContainer: document.getElementById('editor-container'),
             saveBtn: document.getElementById('save-file-btn'),
             fileName: document.getElementById('open-file-name'),
             editorView: document.getElementById('editor-view'),
             mediaView: document.getElementById('media-view'),
             loading: document.getElementById('loading-overlay')
        };
        
        this.MEDIA_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'mp4', 'webm', 'ogg', 'ico'];
        this.BINARY_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'mp4', 'webm', 'ogg', 'ico', 'bmp', 'tif', 'tiff', 'mov', 'avi', 'mkv', 'mp3', 'wav', 'flac', 'aac', 'woff', 'woff2', 'ttf', 'eot', 'otf', 'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'exe', 'dll', 'so', 'a', 'lib', 'jar', 'war', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'iso', 'dmg', 'bin'];

        this.initEditor();
        this.initEvents();
    }

    setConnectionId(id) {
        this.connectionId = id;
        this.reset();
        if (id) {
            this.navigate('/');
        } else {
             this.elements.fileList.innerHTML = '<li class="p-4 text-center text-slate-500">Selecione uma conexão.</li>';
        }
    }

    initEditor() {
        this.editor = monaco.editor.create(this.elements.editorContainer, {
            value: '// Selecione um arquivo para editar',
            language: 'plaintext',
            theme: 'vs-dark',
            automaticLayout: true,
            readOnly: true,
            minimap: { enabled: false }
        });

        this.editor.onDidChangeModelContent(() => {
            if (this.currentOpenFile) {
                this.elements.saveBtn.disabled = false;
                this.elements.saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });
    }

    initEvents() {
        // File Click
        this.elements.fileList.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if (!li) return;
            
            const path = li.dataset.path;
            const type = li.dataset.type;

            if (type === 'dir' || li.classList.contains('parent-dir')) {
                this.navigate(path);
            } else {
                this.openFile(path);
            }
        });

        // Save
        this.elements.saveBtn.addEventListener('click', () => this.saveCurrentFile());
        
        // Context Menu (Simplified for now - using SweetAlert for actions)
        this.elements.fileList.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        
        // Shortcuts
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (!this.elements.saveBtn.disabled) this.saveCurrentFile();
            }
        });
    }

    async navigate(path) {
        if (!this.connectionId) return;
        this.showLoader();
        this.elements.fileList.innerHTML = '';
        
        try {
            const files = await window.ssm.sftpList(this.connectionId, path);
            this.currentPath = path;
            this.elements.currentPath.textContent = path;
            
            let html = '';
            if (path !== '/') {
                const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
                html += `<li class="p-2 cursor-pointer hover:bg-slate-700 rounded text-yellow-400 font-bold parent-dir" data-path="${parentPath}">..</li>`;
            }

            files.sort((a, b) => b.isDirectory - a.isDirectory || a.name.localeCompare(b.name));

            files.forEach(file => {
                 const icon = file.isDirectory 
                    ? '<i data-lucide="folder" class="w-4 h-4 mr-2 text-yellow-500 inline"></i>' 
                    : '<i data-lucide="file" class="w-4 h-4 mr-2 text-slate-400 inline"></i>';
                 
                 const fullPath = path.endsWith('/') ? path + file.name : path + '/' + file.name;
                 
                 html += `
                    <li class="p-2 cursor-pointer hover:bg-slate-700 rounded text-slate-300 flex items-center whitespace-nowrap overflow-hidden text-ellipsis"
                        data-path="${fullPath}" data-name="${file.name}" data-type="${file.isDirectory ? 'dir' : 'file'}">
                        ${icon} ${file.name}
                    </li>
                 `;
            });
            
            this.elements.fileList.innerHTML = html;
            createIcons({ icons });

        } catch (error) {
             Swal.fire({ title: 'Erro', text: error.message, icon: 'error', ...swalTheme });
        } finally {
            this.hideLoader();
        }
    }

    async openFile(filePath) {
        const fileName = filePath.split('/').pop();
        const extension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
        
        if (this.MEDIA_EXTENSIONS.includes(extension)) {
             await this.openMedia(filePath, extension);
        } else if (this.BINARY_EXTENSIONS.includes(extension)) {
             Swal.fire({ title: 'Binário', text: 'Arquivo não suportado para edição.', icon: 'info', ...swalTheme });
        } else {
             await this.openText(filePath, extension);
        }
    }

    async openText(filePath, extension) {
        this.showView(this.elements.editorView);
        this.elements.fileName.textContent = 'Carregando...';
        this.editor.setValue('Carregando...');
        
        try {
            const content = await window.ssm.sftpReadFile(this.connectionId, filePath);
            this.currentOpenFile = filePath;
            this.elements.fileName.textContent = filePath;
            
            this.editor.setValue(content);
            this.editor.updateOptions({ readOnly: false });
            
            const language = monaco.languages.getLanguages().find(l => l.extensions?.includes(`.${extension}`))?.id || 'plaintext';
            monaco.editor.setModelLanguage(this.editor.getModel(), language);
            
            this.elements.saveBtn.disabled = true;
            this.elements.saveBtn.classList.add('opacity-50', 'cursor-not-allowed');

        } catch (error) {
            this.editor.setValue(`Erro: ${error.message}`);
        }
    }

    async openMedia(filePath, extension) {
        this.showView(this.elements.mediaView);
        this.elements.mediaView.innerHTML = '<p class="text-slate-400">Carregando mídia...</p>';
        try {
            const base64 = await window.ssm.sftpReadFileAsBase64(this.connectionId, filePath);
            const mime = extension === 'svg' ? 'image/svg+xml' : `image/${extension}`;
            this.elements.mediaView.innerHTML = `<img src="data:${mime};base64,${base64}" class="max-w-full max-h-full object-contain">`;
            this.currentOpenFile = null;
            this.elements.fileName.textContent = filePath;
        } catch (e) {
            this.elements.mediaView.innerHTML = `<p class="text-red-400">Erro: ${e.message}</p>`;
        }
    }
    
    async saveCurrentFile() {
        if (!this.currentOpenFile || !this.connectionId) return;
        const content = this.editor.getValue();
        
        try {
            await window.ssm.sftpWriteFile(this.connectionId, this.currentOpenFile, content);
            this.elements.saveBtn.disabled = true;
            this.elements.saveBtn.classList.add('opacity-50', 'cursor-not-allowed');
            
            // Optional: Toast
            const toast = Swal.mixin({ toast: true, position: 'bottom-end', showConfirmButton: false, timer: 3000, ...swalTheme });
            toast.fire({ icon: 'success', title: 'Arquivo salvo' });
            
        } catch (e) {
             Swal.fire({ title: 'Erro ao Salvar', text: e.message, icon: 'error', ...swalTheme });
        }
    }

    handleContextMenu(e) {
        e.preventDefault();
        // Implement custom context menu or SweetAlert Actions
        // For brevity, defaulting to "Actions" dialog
        const target = e.target.closest('li');
        const path = target?.dataset.path || this.currentPath;
        const name = target?.dataset.name;
        const type = target?.dataset.type;
        
        Swal.fire({
            title: name || 'Ações da Pasta',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Upload',
            denyButtonText: 'Nova Pasta',
            cancelButtonText: 'Cancelar',
             ...swalTheme
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Upload
               const res = await window.ssm.sftpUploadFile(this.connectionId, this.currentPath);
               if(res.success) this.navigate(this.currentPath);
            } else if (result.isDenied) {
                // New Folder
                const { value } = await Swal.fire({ input: 'text', title: 'Nome da Pasta', ...swalTheme });
                if (value) {
                    await window.ssm.sftpCreateDir(this.connectionId, (this.currentPath.endsWith('/') ? this.currentPath : this.currentPath + '/') + value);
                    this.navigate(this.currentPath);
                }
            }
        });
        
        // More complex context menu logic can be added here if compatible with DOM-based menu
    }

    reset() {
        this.currentPath = '/';
        this.elements.currentPath.textContent = '/';
        this.elements.fileList.innerHTML = '';
        this.showView(this.elements.editorView);
        this.editor.setValue('// Selecione um arquivo');
        this.editor.updateOptions({ readOnly: true });
        this.elements.saveBtn.disabled = true;
        this.currentOpenFile = null;
    }

    showView(view) {
        this.elements.editorView.style.display = 'none';
        this.elements.mediaView.style.display = 'none';
        view.style.display = 'flex';
    }
    
    showLoader() { this.elements.loading?.classList.remove('hidden'); }
    hideLoader() { this.elements.loading?.classList.add('hidden'); }
}
