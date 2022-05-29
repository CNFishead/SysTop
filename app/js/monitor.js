const path = require("path");
const osu = require("node-os-utils");
const notifier = require("node-notifier");
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

// overload value
let cpuOverload;
// Alert Frequency
let alertFrequency;

// get settings and values
ipcRenderer.on("settings:get", (event, arg) => {
  // The + sign converts the string to a number
  cpuOverload = +arg.cpuOverload;
  alertFrequency = +arg.alertFrequency;
});

// check if nav is toggled
ipcRenderer.on("toggle-navigation", (event, arg) => {
  const nav = document.getElementById("nav");
  nav.classList.toggle("hide");
});

// Set model
document.getElementById("cpu-model").innerText = cpu.model();
// computer name
document.getElementById("comp-name").innerText = os.hostname();
// OS
document.getElementById("os").innerText = `${os.type()} | ${os.arch()}`;
// Total Memory
mem.info().then((info) => {
  document.getElementById("mem-total").innerText =
    Math.ceil(info.totalMemMb / 1024) + "GB";
});

// Run every 2 seconds
setInterval(() => {
  // CPU Usage
  cpu.usage().then((usage) => {
    document.getElementById("cpu-usage").innerText = usage + "%";
    document.getElementById("cpu-progress").style.width = usage + "%";
    if (usage >= cpuOverload) {
      document.getElementById("cpu-progress").style.background = "red";
    } else {
      document.getElementById("cpu-progress").style.background = "#30c88b";
    }

    // Check Overload
    if (usage >= cpuOverload && runNotify(alertFrequency)) {
      notifier.notify({
        title: "CPU Overload",
        message: `CPU Usage is ${usage}%`,
        icon: path.join(__dirname, "img", "icon.png"), // Absolute path (doesn't work on balloons)
        sound: true, // Only Notification Center or Windows Toasters
        wait: true, // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
        // New in latest version. See `example/macInput.js` for usage
        timeout: 5, // Takes precedence over wait if both are defined.
        appID: "SysTop Notify",
      });
      localStorage.setItem("lastNotify", +new Date());
    }
  });
  // CPU Free
  cpu.free().then((free) => {
    document.getElementById("cpu-free").innerText = free.toFixed(2) + "%";
  });

  // System Uptime
  document.getElementById("sys-uptime").innerText = secondsToTime(os.uptime());
}, 2000);

// Show Days, hours, mins, secs
function secondsToTime(seconds) {
  seconds = +seconds;
  var days = Math.floor(seconds / (3600 * 24));
  var hours = Math.floor((seconds % (3600 * 24)) / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);
  var seconds = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// check how much time has passed since last notification
function runNotify(alertFrequency) {
  let lastNotify = localStorage.getItem("lastNotify");
  if (lastNotify === null) {
    localStorage.setItem("lastNotify", +new Date());
    return true;
  } else if (lastNotify) {
    let timeDiff = +new Date() - lastNotify;
    if (timeDiff >= alertFrequency * 1000 * 60) {
      return true;
    }
  } else {
    return true;
  }
}
