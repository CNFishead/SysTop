const { BrowserWindow } = require("electron");

class MainWindow extends BrowserWindow {
  constructor(file, isDev) {
    super({
      show: false,
      opacity: 0.9,
      title: "SysTop",
      width: isDev ? 800 : 500,
      height: 650,
      icon: "./assets/icons/icon.png",
      resizable: isDev ? true : false,
      backgroundColor: "white",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });
    this.loadFile(file);
    if (isDev) {
      this.webContents.openDevTools();
    }
  }
}

module.exports = MainWindow;
