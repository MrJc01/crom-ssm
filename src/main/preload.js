const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ssm', {
  // Navigation
  enterApp: () => ipcRenderer.send('navigate:to:main'),

  // ConnectionService methods
  listConnections: () => ipcRenderer.invoke('ssm:connections:list'),
  addConnection: (connectionData) => ipcRenderer.invoke('ssm:connections:add', connectionData),
  updateConnection: (id, connectionData) => ipcRenderer.invoke('ssm:connections:update', id, connectionData),
  removeConnection: (id) => ipcRenderer.invoke('ssm:connections:remove', id),
  setPassword: (id, password) => ipcRenderer.invoke('ssm:connections:setPassword', id, password),

  // SSHService methods
  testConnection: (connectionData) => ipcRenderer.invoke('ssm:ssh:test', connectionData),

  // SFTPService methods
  sftpList: (connectionId, remotePath) => ipcRenderer.invoke('ssm:sftp:list', connectionId, remotePath),
  sftpReadFile: (connectionId, remotePath) => ipcRenderer.invoke('ssm:sftp:readFile', connectionId, remotePath),
  sftpReadFileAsBase64: (connectionId, remotePath) => ipcRenderer.invoke('ssm:sftp:readFileAsBase64', connectionId, remotePath),
  sftpWriteFile: (connectionId, remotePath, content) => ipcRenderer.invoke('ssm:sftp:writeFile', connectionId, remotePath, content),
  sftpDeleteFile: (connectionId, remotePath) => ipcRenderer.invoke('ssm:sftp:deleteFile', connectionId, remotePath),
  sftpDeleteDir: (connectionId, remotePath) => ipcRenderer.invoke('ssm:sftp:deleteDir', connectionId, remotePath),
  sftpCreateDir: (connectionId, remotePath) => ipcRenderer.invoke('ssm:sftp:createDir', connectionId, remotePath),
  sftpDownloadFile: (connectionId, remotePath) => ipcRenderer.invoke('ssm:sftp:downloadFile', connectionId, remotePath),
  sftpUploadFile: (connectionId, remotePath) => ipcRenderer.invoke('ssm:sftp:uploadFile', connectionId, remotePath),
  sftpRename: (connectionId, oldPath, newPath) => ipcRenderer.invoke('ssm:sftp:rename', connectionId, oldPath, newPath),

  // MetricsService methods
  startMetrics: (connectionId) => ipcRenderer.send('ssm:metrics:start', connectionId),
  stopMetrics: () => ipcRenderer.send('ssm:metrics:stop'),
  onMetricsUpdate: (callback) => {
    const channel = 'ssm:metrics:update';
    const listener = (event, data) => callback(data);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },

  // TerminalService methods
  terminalCreate: (connectionId, terminalId) => ipcRenderer.send('ssm:terminal:create', connectionId, terminalId),
  terminalStop: (terminalId) => ipcRenderer.send('ssm:terminal:stop', terminalId),
  terminalWrite: (terminalId, data) => ipcRenderer.send('ssm:terminal:write', terminalId, data),
  terminalResize: (terminalId, cols, rows) => ipcRenderer.send('ssm:terminal:resize', terminalId, { cols, rows }),
  onTerminalData: (callback) => {
    const channel = 'ssm:terminal:data';
    const listener = (event, data) => callback(data);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },

  // ProcessService methods
  processList: (connectionId) => ipcRenderer.invoke('ssm:process:list', connectionId),
  processKill: (connectionId, pid) => ipcRenderer.invoke('ssm:process:kill', connectionId, pid),

  // SnippetService methods
  snippetsList: () => ipcRenderer.invoke('ssm:snippets:list'),
  snippetAdd: (snippet) => ipcRenderer.invoke('ssm:snippets:add', snippet),
  snippetUpdate: (snippet) => ipcRenderer.invoke('ssm:snippets:update', snippet),
  snippetRemove: (id) => ipcRenderer.invoke('ssm:snippets:remove', id),

  // Window Controls
  win: {
    minimize: () => ipcRenderer.invoke('win/minimize'),
    maximize: () => ipcRenderer.invoke('win/maximize'),
    close: () => ipcRenderer.invoke('win/close'),
    toggleMaximize: () => ipcRenderer.invoke('win/toggleMaximize')
  }
});