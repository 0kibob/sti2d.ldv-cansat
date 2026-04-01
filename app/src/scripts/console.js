export async function init({ params } = {}) {

const portButton = document.getElementById("port-button");
const portButtonLabel = document.getElementById("current-port");
const refreshButton = document.getElementById("refresh-button");
const stopButton = document.getElementById("stop-button");
const copyButton = document.getElementById("copy-button");
const clearButton = document.getElementById("clear-button");
const consoleEl = document.getElementById("console");

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
        writeToConsole(`[Connected to port ${path}]`, { muted: true });
        window.toast.info("Connected to", path);
    }
    catch { window.toast.error("Failed to connected to", path); return }
}

async function init() {
    const current = await window.serial.current()
    if (current) {
        portButtonLabel.textContent = current;
        currentPort = current;
        writeToConsole(`[Connected to port ${current}]`, { muted: true });
    }
    await listAvailablePorts()
}


function writeToConsole(message, { muted } = {}) {
    const div = document.createElement("div");
    div.textContent = message;
    if (muted) div.classList.add("text-muted-foreground");
    consoleEl.appendChild(div);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

async function parseSensorData(buffer) {
    const PACKET_SIZE = await window.convert.size(); // 16
    if (buffer.length % PACKET_SIZE !== 0) return "Incomplete packet";

    const outputs = [];

    for (let offset = 0; offset < buffer.length; offset += PACKET_SIZE) {
        const slice = buffer.slice(offset, offset + PACKET_SIZE);
        const parsed = await window.convert.buffer(slice);

        const temp   = parsed.temperature[0];
        const pres   = parsed.pressure[0];
        const accel  = [parsed.accelX[0], parsed.accelY[0], parsed.accelZ[0]];
        const gyro   = [parsed.gyroX[0], parsed.gyroY[0], parsed.gyroZ[0]];

        outputs.push(`Temp: ${temp}, Pres: ${pres}, Accel: [${accel.join(',')}], Gyro: [${gyro.join(',')}]`);
    }

    return outputs.join("\n");
}

async function formatSerialData(data) {
    if (typeof data === 'string') {
        return data;
    }

    const bytes = data instanceof ArrayBuffer
        ? new Uint8Array(data)
        : ArrayBuffer.isView(data)
            ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
            : null;

    if (!bytes) {
        return String(data);
    }

    const text = new TextDecoder().decode(bytes);
    if (/^[\t\n\r -~]+$/.test(text)) {
        return text;
    }

    return await parseSensorData(bytes);
}

window.serial.on.data(async (data) => {
    writeToConsole(await formatSerialData(data));
});
window.serial.on.error((err) => { writeToConsole(`[Error] ${err}`, { muted: true }); });
window.serial.on.disconnect(async () => {
    window.toast.error("Disconnect from", currentPort);
    writeToConsole(`[Disconnected from port ${currentPort}]`, { muted: true });
    portButtonLabel.textContent = "Select Port";
    currentPort = null;
    setTimeout(listAvailablePorts, 200);
});

refreshButton?.addEventListener('click', () => listAvailablePorts());
stopButton?.addEventListener('click', () => window.serial.disconnect());
copyButton?.addEventListener('click', async () => {
    const text = Array.from(consoleEl.children).map(div => div.textContent).join('\n');
    await navigator.clipboard.writeText(text);
    window.toast.info("Console copied");
});
clearButton?.addEventListener('click', () => {
    consoleEl.innerHTML = '';
    window.toast.info("Console cleared");
});

init()

}