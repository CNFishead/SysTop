const { Tray, app, Menu } = require("electron");

class AppTray extends Tray {
  constructor(icon, mainWindow, isMac) {
    super(icon);
    this.mainWindow = mainWindow;

    this.setToolTip("SysTop");
    // create event listeners
    this.on("click", () => {
      if (this.mainWindow.isVisible()) {
        this.mainWindow.hide();
      } else {
        this.mainWindow.show();
      }
    });
    this.on("right-click", () => {
      const contextMenu = Menu.buildFromTemplate([
        {
          label: "Quit",
          click: async () => {
            app.isQuiting = true;
            // Quit the app
            await app.quit();
            if (!isMac) {
              app.exit();
            }
          },
        },
      ]);
      this.popUpContextMenu(contextMenu);
    });
  }
}

module.exports = AppTray;
