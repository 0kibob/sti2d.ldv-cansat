export async function init({ params } = {}) {

const portButton = document.getElementById("port-button");
const portButtonLabel = document.getElementById("current-port");
const refreshButton = document.getElementById("refresh-button");
const stopButton = document.getElementById("stop-button");

const nameInput = document.getElementById('mission-name');
const timeInput = document.getElementById('mission-time');
const dateInput = document.getElementById('mission-date');
const mapContainer = document.getElementById("map");

let leafletMap = null;
let positionMarker = null;
let selectedPosition = null;

function createLeafletMap() {
    if (!mapContainer || !window.L) return null;
    if (leafletMap) return leafletMap;

    leafletMap = L.map(mapContainer, { zoomControl: true }).setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(leafletMap);

    leafletMap.on('click', (e) => {
        const { lat, lng } = e.latlng;
        selectedPosition = { lat, lng, name: 'Selected position' };
        if (!positionMarker) {
            positionMarker = L.marker([lat, lng]).addTo(leafletMap);
        } else {
            positionMarker.setLatLng([lat, lng]);
        }
        positionMarker.bindPopup(selectedPosition.name).setPopupContent(selectedPosition.name);
        updateSelectedPositionName(selectedPosition);
        window.toast?.info('Position selected', `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    });

    return leafletMap;
}

async function reverseGeocodeLocation(lat, lon) {
    if (lat == null || lon == null) return null;

    try {
        const url = new URL('https://nominatim.openstreetmap.org/reverse');
        url.searchParams.set('format', 'jsonv2');
        url.searchParams.set('lat', lat);
        url.searchParams.set('lon', lon);
        url.searchParams.set('zoom', '10');
        url.searchParams.set('addressdetails', '1');

        const response = await fetch(url.toString(), {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) return null;

        const data = await response.json();
        if (!data) return null;
        if (typeof data.name === 'string' && data.name.trim()) return data.name.trim();

        const address = data.address || {};
        return address.road || address.neighbourhood || address.suburb || address.village || address.town || address.city || address.county || address.state || address.country || (typeof data.display_name === 'string' ? data.display_name.split(',')[0] : null);
    } catch (err) {
        console.warn('Reverse geocode failed', err);
        return null;
    }
}

async function updateSelectedPositionName(position) {
    const label = await reverseGeocodeLocation(position.lat, position.lng);
    if (!label) return;
    position.name = label;
    if (positionMarker) {
        positionMarker.bindPopup(label).setPopupContent(label);
    }
}

function getSavePositionName(position) {
    if (!position) return 'Selected position';
    if (position.name && position.name !== 'Selected position') return position.name;
    if (position.lat != null && position.lng != null) return `Position (${position.lat.toFixed(5)}, ${position.lng.toFixed(5)})`;
    return 'Selected position';
}

function setPositionOnMap(position, label = 'Selected position') {
    if (!position || !window.L || !mapContainer) return;
    createLeafletMap();

    const coords = [position.lat, position.lon];
    const markerLabel = position.name || label;

    if (!positionMarker) {
        positionMarker = L.marker(coords).addTo(leafletMap);
    } else {
        positionMarker.setLatLng(coords);
    }
    positionMarker.bindPopup(markerLabel).setPopupContent(markerLabel);
    leafletMap.setView(coords, 14);
}

function initializeMap() {
    createLeafletMap();
}

const durationLabel = document.getElementById("mission-duration");
const samplesLabel = document.getElementById("mission-samples");
const durationInterval = document.getElementById("mission-interval");

let currentPort = null;

const ChartClass = window.Chart;
if (ChartClass?.defaults?.elements?.line) {
    ChartClass.defaults.elements.line.borderWidth = 1;
}
const tempCtx = document.getElementById("tempChart")?.getContext("2d");
const presCtx = document.getElementById("presChart")?.getContext("2d");
const accelCtx = document.getElementById("accelChart")?.getContext("2d");
const gyroCtx = document.getElementById("gyroChart")?.getContext("2d");

function createChart(ctx, config) {
    return ctx && ChartClass ? new ChartClass(ctx, config) : null;
}

const tempChart = createChart(tempCtx, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Temperature",
            data: [],
            borderColor: "rgb(255,99,132)",
            backgroundColor: "rgba(255,99,132,0.2)",
            tension: 0.3,
            pointRadius: 2
        }]
    },
    options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { display: true, title: { display: true, text: 'Sample' } },
            y: { display: true, title: { display: true, text: 'Temperature' } }
        }
    }
});

const presChart = createChart(presCtx, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Pressure",
            data: [],
            borderColor: "rgb(54,162,235)",
            backgroundColor: "rgba(54,162,235,0.2)",
            tension: 0.3,
            pointRadius: 2
        }]
    },
    options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { display: true, title: { display: true, text: 'Sample' } },
            y: { display: true, title: { display: true, text: 'Pressure' } }
        }
    }
});

const accelChart = createChart(accelCtx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            { label: "Accel X", data: [], borderColor: "rgb(255,99,132)", backgroundColor: "rgba(255,99,132,0.2)", tension: 0.3, pointRadius: 0 },
            { label: "Accel Y", data: [], borderColor: "rgb(54,162,235)", backgroundColor: "rgba(54,162,235,0.2)", tension: 0.3, pointRadius: 0 },
            { label: "Accel Z", data: [], borderColor: "rgb(75,192,192)", backgroundColor: "rgba(75,192,192,0.2)", tension: 0.3, pointRadius: 0 }
        ]
    },
    options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { display: true, title: { display: true, text: 'Sample' } },
            y: { display: true, title: { display: true, text: 'Acceleration' } }
        }
    }
});

const gyroChart = createChart(gyroCtx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            { label: "Gyro X", data: [], borderColor: "rgb(153,102,255)", backgroundColor: "rgba(153,102,255,0.2)", tension: 0.3, pointRadius: 0 },
            { label: "Gyro Y", data: [], borderColor: "rgb(255,159,64)", backgroundColor: "rgba(255,159,64,0.2)", tension: 0.3, pointRadius: 0 },
            { label: "Gyro Z", data: [], borderColor: "rgb(255,205,86)", backgroundColor: "rgba(255,205,86,0.2)", tension: 0.3, pointRadius: 0 }
        ]
    },
    options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { display: true, title: { display: true, text: 'Sample' } },
            y: { display: true, title: { display: true, text: 'Rotation' } }
        }
    }
});

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
    if (mission.sensors.temperature) {
        if (tempChart) {
            const labels = mission.sensors.temperature.map((_, index) => index + 1);
            tempChart.data.labels = labels;
            tempChart.data.datasets[0].data = mission.sensors.temperature;
            tempChart.update();
        }
        // tempContainer.innerText = mission.sensors.temperature.join(", ");
    }
    if (mission.sensors.pressure) {
        if (presChart) {
            const labels = mission.sensors.pressure.map((_, index) => index + 1);
            presChart.data.labels = labels;
            presChart.data.datasets[0].data = mission.sensors.pressure;
            presChart.update();
        }
        // presContainer.innerText = mission.sensors.pressure.join(", ");
    }
    if (mission.sensors.accel) {
        if (accelChart) {
            const labels = mission.sensors.accel.map((_, index) => index + 1);
            accelChart.data.labels = labels;
            accelChart.data.datasets[0].data = mission.sensors.accel.map(v => v[0]);
            accelChart.data.datasets[1].data = mission.sensors.accel.map(v => v[1]);
            accelChart.data.datasets[2].data = mission.sensors.accel.map(v => v[2]);
            accelChart.update();
        }
        // accelContainer.innerText = mission.sensors.accel.map(v=>`x:${v[0]} y:${v[1]} z:${v[2]}`).join("\n");
    }
    if (mission.sensors.gyro) {
        if (gyroChart) {
            const labels = mission.sensors.gyro.map((_, index) => index + 1);
            gyroChart.data.labels = labels;
            gyroChart.data.datasets[0].data = mission.sensors.gyro.map(v => v[0]);
            gyroChart.data.datasets[1].data = mission.sensors.gyro.map(v => v[1]);
            gyroChart.data.datasets[2].data = mission.sensors.gyro.map(v => v[2]);
            gyroChart.update();
        }
        // gyroContainer.innerText = mission.sensors.gyro.map(v=>`x:${v[0]} y:${v[1]} z:${v[2]}`).join("\n");
    }

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

async function buildMissionForSave(liveMission) {
    const interval = parseInt(durationInterval.innerText) || 1;
    const samples = parseInt(samplesLabel.innerText) || 0;
    const name = nameInput.value?.trim();

    if (!name) throw new Error("Name required for mission");

    const datetime = dateInput.value && timeInput.value
        ? `${dateInput.value}T${timeInput.value}:00Z`
        : new Date().toISOString();

    let position = {};
    if (selectedPosition) {
        let positionName = selectedPosition.name && selectedPosition.name !== 'Selected position'
            ? selectedPosition.name
            : await reverseGeocodeLocation(selectedPosition.lat, selectedPosition.lng);
        if (!positionName) positionName = getSavePositionName(selectedPosition);
        position = {
            name: positionName,
            lat: selectedPosition.lat,
            lon: selectedPosition.lng
        };
    }

    return {
        metadata: {
            name: name,
            datetime,
            position,
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
        missionData = await buildMissionForSave(mission); // use live mission
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
        console.error('Mission save failed', err);
        window.toast.error(`Save failed: ${err.message}`);
    }
}

async function init() {
    const current = await window.serial.current();
    if (current) {
        portButtonLabel.textContent = current;
        currentPort = current;
    }
    await listAvailablePorts();
    initializeMap();
}

const confirmBtn = document.getElementById("confirm-button");
confirmBtn?.replaceWith(confirmBtn.cloneNode(true)); // remove old listener
document.getElementById("confirm-button")?.addEventListener("click", () => saveMission());

init()

}