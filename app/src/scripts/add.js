export async function init({ params } = {}) {

const portButton = document.getElementById("port-button");
const portButtonLabel = document.getElementById("current-port");
const refreshButton = document.getElementById("refresh-button");
const stopButton = document.getElementById("stop-button");

const nameInput = document.getElementById('mission-name');
const timeInput = document.getElementById('mission-time');
const dateInput = document.getElementById('mission-date');
const mapContainer = document.getElementById("map");
const tempContainer = document.getElementById("temp");
const presContainer = document.getElementById("pres");
const accelContainer = document.getElementById("accel");
const gyroContainer = document.getElementById("gyro");

const durationLabel = document.getElementById("mission-duration");
const samplesLabel = document.getElementById("mission-samples");
const durationInterval = document.getElementById("mission-interval");

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

console.log(await window.convert.size())
window.serial.on.error((err) => { window.toast.error(`[Error] ${err}`); });
window.serial.on.disconnect(async () => {
    window.toast.error("Disconnect from", currentPort);
    portButtonLabel.textContent = "Select Port";
    currentPort = null;
    setTimeout(listAvailablePorts, 200);
});

refreshButton?.addEventListener('click', () => listAvailablePorts());
stopButton?.addEventListener('click', () => window.serial.disconnect());

let mission = {
    temperature: [],
    pressure: [],
    accelX: [],
    accelY: [],
    accelZ: [],
    gyroX: [],
    gyroY: [],
    gyroZ: []
};

window.serial.on.data(async (buffer) => {
    const PACKET_SIZE = await window.convert.size(); // 16
    if (buffer.length % PACKET_SIZE !== 0) return; // discard incomplete packets
    for (let offset = 0; offset < buffer.length; offset += PACKET_SIZE) {
        const slice = buffer.slice(offset, offset + PACKET_SIZE);
        const data = await window.convert.buffer(slice);
        mission.temperature.push(...data.temperature);
        mission.pressure.push(...data.pressure);
        mission.accelX.push(...data.accelX);
        mission.accelY.push(...data.accelY);
        mission.accelZ.push(...data.accelZ);
        mission.gyroX.push(...data.gyroX);
        mission.gyroY.push(...data.gyroY);
        mission.gyroZ.push(...data.gyroZ);
    }
    renderMission(toRenderMission(mission));
});


function toRenderMission(mission) {
    return {
        metadata: {}, // you can fill later
        sensors: {
            temperature: mission.temperature,
            pressure: mission.pressure,
            accel: mission.accelX.map((v, i) => [v, mission.accelY[i], mission.accelZ[i]]),
            gyro: mission.gyroX.map((v, i) => [v, mission.gyroY[i], mission.gyroZ[i]])
        }
    };
}

function renderMission(mission) {
    if (mission.sensors.temperature)
        tempContainer.innerText = mission.sensors.temperature.join(", ");
    if (mission.sensors.pressure)
        presContainer.innerText = mission.sensors.pressure.join(", ");
    if (mission.sensors.accel)
        accelContainer.innerText = mission.sensors.accel.map(v=>`x:${v[0]} y:${v[1]} z:${v[2]}`).join("\n");
    if (mission.sensors.gyro)
        gyroContainer.innerText = mission.sensors.gyro.map(v=>`x:${v[0]} y:${v[1]} z:${v[2]}`).join("\n");

    let interval = 1; // for live serial, assume 1s unless you change it
    let samples = 0;

    const s = mission.sensors;
    if (s.temperature?.length) samples = s.temperature.length;
    else if (s.pressure?.length) samples = s.pressure.length;
    else if (s.accel?.length) samples = s.accel.length;
    else if (s.gyro?.length) samples = s.gyro.length;

    const duration = samples * interval;

    durationLabel.innerText = `${duration}s`;
    samplesLabel.innerText = samples;
    durationInterval.innerText = `${interval}s`;
}

function buildMissionForSave(liveMission) {
    const interval = parseInt(durationInterval.innerText) || 1;
    const samples = parseInt(samplesLabel.innerText) || 0;
    const name = nameInput.value?.trim();

    if (!name) throw new Error("Name required for mission");

    const datetime = dateInput.value && timeInput.value
        ? `${dateInput.value}T${timeInput.value}:00Z`
        : new Date().toISOString();

    return {
        metadata: {
            name: name,
            datetime,
            position: {}, // optionally fill if you track position
        },
        sampling: { interval_sec: interval, total_samples: samples },
        sensors: {
            temperature: liveMission.temperature || [],
            pressure: liveMission.pressure || [],
            acceleration: liveMission.accelX.map((v, i) => [v, liveMission.accelY[i], liveMission.accelZ[i]]),
            gyro: liveMission.gyroX.map((v, i) => [v, liveMission.gyroY[i], liveMission.gyroZ[i]])
        }
    };
}

async function saveMission() {
    let missionData;
    try {
        missionData = buildMissionForSave(mission); // use live mission
    } catch (e) {
        window.toast.error(e.message);
        return;
    }

    try {
        const res = await fetch(`${window.api.getServerUrl()}/missions/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": window.api.serverKey },
            body: JSON.stringify(missionData)
        });

        const data = await res.json();

        if (data.success) {
            window.toast.success("Mission saved successfully.");
            window.page.change('home');
        } else {
            window.toast.error("Failed to save mission.");
        }
    } catch (err) {
        // network or other errors
        window.toast.error(`Save failed: ${err.message}`);
    }
}

async function init() {
    const current = await window.serial.current()
    if (current) {
        portButtonLabel.textContent = current;
        currentPort = current;
    }
    await listAvailablePorts()
}

const confirmBtn = document.getElementById("confirm-button");
confirmBtn?.replaceWith(confirmBtn.cloneNode(true)); // remove old listener
document.getElementById("confirm-button")?.addEventListener("click", () => saveMission());

init()

}