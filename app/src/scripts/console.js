const portButton = document.getElementById("port-button");
const portButtonLabel = document.getElementById("current-port");
const refreshButton = document.getElementById("refresh-button");
const copyButton = document.getElementById("copy-button");
const clearButton = document.getElementById("clear-button");
const consoleEl = document.getElementById("console");

let selectedPort = null;
let isSwitching = false;

async function loadPorts() {
    const ports = await window.serial.list();

    window.dropdown.attach(portButton, {
        left: true,
        items: ports.map(p => ({
            content: p.path,
            onClick: async () => {
                if (selectedPort === p.path) return;
                isSwitching = true;
                try {
                    await connectPort(p.path);
                } catch (err) {
                    console.error(err);
                } finally {
                    isSwitching = false;
                }
            }
        }))
    });
}

async function init() {
    const current = await window.serial.getCurrent();
    if (current) {
        selectedPort = current;
        portButtonLabel.textContent = current;
    }
    loadPorts();
}

function logMessage(message, { muted } = {}) {
    const div = document.createElement("div");
    div.textContent = message;
    if (muted) div.classList.add("text-muted-foreground");
    consoleEl.appendChild(div);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

async function connectPort(path) {
    await window.serial.connect(path);
    selectedPort = path;
    portButtonLabel.textContent = path;
    logMessage(`[Connected to port ${path}]`, { muted: true });
    window.toast.info("Connected to", path);
}

// Event listeners
refreshButton?.addEventListener('click', () => loadPorts());

copyButton?.addEventListener('click', async () => {
    const text = Array.from(consoleEl.children).map(div => div.textContent).join('\n');
    await navigator.clipboard.writeText(text);
    window.toast.info("Console copied");
});

clearButton?.addEventListener('click', () => {
    consoleEl.innerHTML = '';
    window.toast.info("Console cleared");
});

// Serial events
window.serial.onData((data) => {
    logMessage(data);
});

window.serial.onDisconnect(() => {
    if (isSwitching) return;
    logMessage(`[Disconnected from port ${selectedPort}]`, { muted: true });
    window.toast.error("Disconnect from", selectedPort);
    selectedPort = null;
    portButtonLabel.textContent = "Select Port";
    setTimeout(loadPorts, 200); // reload ports after short delay
});

window.serial.onError((err) => {
    logMessage(`[Error] ${err}`, { muted: true });
});

init();