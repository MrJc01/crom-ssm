const { ipcMain, BrowserWindow } = require('electron');

function registerWindowHandlers(mainWindow) {
    ipcMain.handle('win/minimize', () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win) win.minimize();
    });

    ipcMain.handle('win/maximize', () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win) {
            if (win.isMaximized()) {
                win.unmaximize();
            } else {
                win.maximize();
            }
        }
    });

    ipcMain.handle('win/close', () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win) win.close();
    });

    ipcMain.handle('win/toggleMaximize', () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win) {
             if (win.isMaximized()) win.unmaximize();
             else win.maximize();
        }
    });
}

module.exports = { registerWindowHandlers };
