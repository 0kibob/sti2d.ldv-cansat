export async function init({ params } = {}) {

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

let currentMission = null;
let currentType = params?.type;

// --- Helpers
function makeDebugLabel(container, text) {
    const span = document.createElement("span");
    span.className = text;
    container.appendChild(span);
}

makeDebugLabel(mapContainer, "f");

function importJson(data) {
    return {
        metadata: data.metadata,
        sensors: {
            temperature: data.sensors.temperature,
            pressure: data.sensors.pressure,
            accel: data.sensors.acceleration,
            gyro: data.sensors.gyro
        }
    }
}

function importScm(data) {
    return {
        metadata: {},
        sensors: {
            temperature: data.temperature,
            pressure: data.pressure,
            accel: data.accelX.map((v,i)=>[v,data.accelY[i],data.accelZ[i]]),
            gyro: data.gyroX.map((v,i)=>[v,data.gyroY[i],data.gyroZ[i]])
        }
    }
}

function computeSampling(mission, type, raw) {
    let interval = 1;
    let samples = 0;

    if (type === "json" && raw.sampling) {
        interval = raw.sampling.interval_sec ?? 1;
        samples = raw.sampling.total_samples ?? 0;
    } else {
        const s = mission.sensors;
        if (s.temperature) samples = s.temperature.length;
        else if (s.pressure) samples = s.pressure.length;
        else if (s.accel) samples = s.accel.length;
        else if (s.gyro) samples = s.gyro.length;
    }

    const duration = samples * interval;
    durationLabel.innerText = `${duration}s`;
    samplesLabel.innerText = samples;
    durationInterval.innerText = `${interval}s`;
}

function renderMission(mission) {
    currentMission = mission;

    if (mission.metadata?.name) nameInput.value = mission.metadata.name;
    if (mission.metadata?.datetime) {
        const dt = mission.metadata.datetime;
        timeInput.value = dt?.substring(11,16) ?? "";
        dateInput.value = dt?.substring(0,10) ?? "";
    }

    if (mission.metadata?.position)
        mapContainer.innerText = `${mission.metadata.position.name} (${mission.metadata.position.lat}, ${mission.metadata.position.lon})`;

    if (mission.sensors.temperature)
        tempContainer.innerText = mission.sensors.temperature.join(", ");
    if (mission.sensors.pressure)
        presContainer.innerText = mission.sensors.pressure.join(", ");
    if (mission.sensors.accel)
        accelContainer.innerText = mission.sensors.accel.map(v=>`x:${v[0]} y:${v[1]} z:${v[2]}`).join("\n");
    if (mission.sensors.gyro)
        gyroContainer.innerText = mission.sensors.gyro.map(v=>`x:${v[0]} y:${v[1]} z:${v[2]}`).join("\n");
}

function buildMissionForSave(type) {
    const interval = parseInt(durationInterval.innerText) || 1;
    const samples = parseInt(samplesLabel.innerText) || 0;
    let name = nameInput.value?.trim();

    if (type === "scm" && !name) throw new Error("Name required for SCM mission");

    let datetime = dateInput.value && timeInput.value
        ? `${dateInput.value}T${timeInput.value}:00Z`
        : new Date().toISOString();

    return {
        metadata: {
            name: name || "Unnamed mission",
            datetime,
            position: currentMission?.metadata?.position || { name: "Unknown", lat: null, lon: null }
        },
        sampling: { interval_sec: interval, total_samples: samples },
        sensors: {
            temperature: currentMission?.sensors.temperature || [],
            pressure: currentMission?.sensors.pressure || [],
            acceleration: currentMission?.sensors.accel || [],
            gyro: currentMission?.sensors.gyro || []
        }
    }
}

async function saveMission(type) {
    let mission;
    try { mission = buildMissionForSave(type); }
    catch (e) { alert(e.message); return; }

    const res = await fetch(`${window.api.getServerUrl()}/missions/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": window.api.serverKey },
        body: JSON.stringify(mission)
    });
    const data = await res.json();
    if (data.success) {
        window.toast.success(`Mission saved successfully.`);
        window.page.change('home');
    } else window.toast.error(`Failed to save mission.`);
}

// --- Page logic
if (!currentType) return;

let mission;
if (currentType === "json") mission = importJson(params.data);
if (currentType === "scm") mission = importScm(params.data);

computeSampling(mission, currentType, params.data);
renderMission(mission);

// --- Attach confirm button
const confirmBtn = document.getElementById("confirm-button");
confirmBtn?.replaceWith(confirmBtn.cloneNode(true)); // remove old listener
document.getElementById("confirm-button")?.addEventListener("click", () => saveMission(currentType));

}