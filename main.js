const { app, Menu, ipcMain } = require("electron");
const Store = require("./Store");
const MainWindow = require("./MainWindow");
const AppTray = require("./AppTray");
const log = require("electron-log");
const path = require("path");

// Set env
process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

let mainWindow;

// Init store & defaults
const store = new Store({
  configName: "user-preferences",
  defaults: {
    settings: {
      cpuOverload: 80,
      alertFrequency: 1,
    },
  },
});

function createMainWindow() {
  mainWindow = new MainWindow("./app/index.html", isDev);
}

app.on("ready", () => {
  createMainWindow();
  // send defaults to renderer
  mainWindow.webContents.on("dom-ready", () => {
    mainWindow.webContents.send("settings:get", store.get("settings"));
  });
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // on close
  mainWindow.on("close", (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
    return true;
  });

  // Create tray icon
  const icon = path.join(__dirname, "assets/icons/tray_icon.png");
  // Create Tray
  const tray = new AppTray(icon, mainWindow, isMac);
});

// Get settings from renderer
ipcMain.on("settings:set", (event, arg) => {
  store.set("settings", arg);
  log.info("settings:set", arg);
  mainWindow.webContents.send("settings:get", store.get("settings"));
});

const menu = [
  ...(isMac ? [{ role: "appMenu" }] : []),
  {
    role: "fileMenu",
  },
  {
    label: "View",
    submenu: [
      {
        label: "Toggle Navigation",
        click: () => {
          mainWindow.webContents.send("toggle-navigation");
        },
      },
    ],
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.allowRendererProcessReuse = true;
