export async function init({ params } = {}) {

const portButton = document.getElementById("port-button");
const portButtonLabel = document.getElementById("current-port");
const refreshButton = document.getElementById("refresh-button");

let currentPort = null;

async function listAvailablePorts() {
    const ports = await window.serial.list();
    window.dropdown.attach(portButton, {
        left: true,
        items: ports.map(p => ({
            content: p.path,
            onClick: async () => await selectPort(p.path)
        }))
    });
}

async function selectPort(path) {
    if (await window.serial.current() === path) { return }
    try {
        await window.serial.connect(path);
        currentPort = path;
        portButtonLabel.textContent = path;
        window.toast.info("Connected to", path);
    }
    catch { window.toast.error("Failed to connected to", path); return }
}

async function init() {
    const current = await window.serial.current()
    if (current) {
        portButtonLabel.textContent = current;
        currentPort = current;
    }
    await listAvailablePorts()
}

window.serial.on.data((data) => { writeToConsole(data); });
window.serial.on.error((err) => { writeToConsole(`[Error] ${err}`, { muted: true }); });
window.serial.on.disconnect(async () => {
    window.toast.error("Disconnect from", currentPort);
    portButtonLabel.textContent = "Select Port";
    currentPort = null;
    setTimeout(listAvailablePorts, 200);
});

refreshButton?.addEventListener('click', () => listAvailablePorts());

init()

}