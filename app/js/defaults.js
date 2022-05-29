const { ipcRenderer } = require("electron");

ipcRenderer.on("settings:get", (event, arg) => {
  // Get settings from store
  document.getElementById("cpu-overload").value = arg.cpuOverload;
  document.getElementById("alert-frequency").value = arg.alertFrequency;
});

// submit settings
document.getElementById("settings-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const cpuOverload = document.getElementById("cpu-overload").value;
  const alertFrequency = document.getElementById("alert-frequency").value;

  // send settings to main process
  ipcRenderer.send("settings:set", {
    cpuOverload,
    alertFrequency,
  });
  showAlert("Settings saved!");
});

// Show alert for settings
function showAlert(msg) {
  const alert = document.getElementById("alert");
  alert.classList.remove("hide");
  alert.classList.add("alert");
  alert.innerText = msg;

  setTimeout(() => alert.classList.add("hide"), 3000);
}
