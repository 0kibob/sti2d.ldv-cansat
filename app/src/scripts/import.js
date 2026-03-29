export async function init({ params } = {}) {

const nameInput = document.getElementById('mission-name');
const timeInput = document.getElementById('mission-time');
const dateInput = document.getElementById('mission-date');
const mapContainer = document.getElementById("map");

let leafletMap = null;
let positionMarker = null;
let selectedPosition = null;

const durationLabel = document.getElementById("mission-duration");
const samplesLabel = document.getElementById("mission-samples");
const durationInterval = document.getElementById("mission-interval");

let currentMission = null;
let currentType = params?.type;

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
            pointRadius: 1
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
            pointRadius: 1
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


// --- Map helpers
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
        setPositionOnMap(mission.metadata.position, 'Imported position');

    if (mission.sensors.temperature && tempChart) {
        const tempLabels = mission.sensors.temperature.map((_, index) => index + 1);
        tempChart.data.labels = tempLabels;
        tempChart.data.datasets[0].data = mission.sensors.temperature;
        tempChart.update();
    }

    if (mission.sensors.pressure && presChart) {
        const presLabels = mission.sensors.pressure.map((_, index) => index + 1);
        presChart.data.labels = presLabels;
        presChart.data.datasets[0].data = mission.sensors.pressure;
        presChart.update();
    }

    if (mission.sensors.accel && accelChart) {
        const accelLabels = mission.sensors.accel.map((_, index) => index + 1);
        accelChart.data.labels = accelLabels;
        accelChart.data.datasets[0].data = mission.sensors.accel.map(v => v[0]);
        accelChart.data.datasets[1].data = mission.sensors.accel.map(v => v[1]);
        accelChart.data.datasets[2].data = mission.sensors.accel.map(v => v[2]);
        accelChart.update();
    }

    if (mission.sensors.gyro && gyroChart) {
        const gyroLabels = mission.sensors.gyro.map((_, index) => index + 1);
        gyroChart.data.labels = gyroLabels;
        gyroChart.data.datasets[0].data = mission.sensors.gyro.map(v => v[0]);
        gyroChart.data.datasets[1].data = mission.sensors.gyro.map(v => v[1]);
        gyroChart.data.datasets[2].data = mission.sensors.gyro.map(v => v[2]);
        gyroChart.update();
    }

    // if (mission.sensors.accel && !accelChart)
    //     accelContainer.innerText = mission.sensors.accel.map(v=>`x:${v[0]} y:${v[1]} z:${v[2]}`).join("\n");
    // if (mission.sensors.gyro && !gyroChart)
    //     gyroContainer.innerText = mission.sensors.gyro.map(v=>`x:${v[0]} y:${v[1]} z:${v[2]}`).join("\n");
}

// function renderMission(mission) {
//     currentMission = mission;

//     // update inputs
//     if (mission.metadata?.name) nameInput.value = mission.metadata.name;
//     if (mission.metadata?.datetime) {
//         const dt = mission.metadata.datetime;
//         timeInput.value = dt?.substring(11,16) ?? "";
//         dateInput.value = dt?.substring(0,10) ?? "";
//     }

//     // update sensor divs
//     mapContainer.innerText = mission.metadata?.position
//         ? `${mission.metadata.position.name} (${mission.metadata.position.lat}, ${mission.metadata.position.lon})` : "";

//     // update charts
//     if (mission.sensors.temperature) {
//         tempChart.data.labels = mission.sensors.temperature.map((_, i) => i);
//         tempChart.data.datasets[0].data = mission.sensors.temperature;
//         tempChart.update();
//     }
//     if (mission.sensors.pressure) {
//         presChart.data.labels = mission.sensors.pressure.map((_, i) => i);
//         presChart.data.datasets[0].data = mission.sensors.pressure;
//         presChart.update();
//     }
// }

async function buildMissionForSave(type) {
    const interval = parseInt(durationInterval.innerText) || 1;
    const samples = parseInt(samplesLabel.innerText) || 0;
    let name = nameInput.value?.trim();

    if (type === "scm" && !name) throw new Error("Name required for SCM mission");

    let position = currentMission?.metadata?.position || {};
    if (selectedPosition) {
        let positionName = selectedPosition.name && selectedPosition.name !== 'Selected position'
            ? selectedPosition.name
            : await reverseGeocodeLocation(selectedPosition.lat, selectedPosition.lng);
        if (!positionName) positionName = getSavePositionName(selectedPosition);
        position = { name: positionName, lat: selectedPosition.lat, lon: selectedPosition.lng };
    }

    let datetime = dateInput.value && timeInput.value
        ? `${dateInput.value}T${timeInput.value}:00Z`
        : new Date().toISOString();

    return {
        metadata: {
            name: name || "Unnamed mission",
            datetime,
            position
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
    try { mission = await buildMissionForSave(type); }
    catch (e) { console.error('Mission save validation failed', e); window.toast?.error(e.message); return; }

    try {
        const res = await fetch(`${window.api.getServerUrl()}/missions/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": window.api.serverKey },
            body: JSON.stringify(mission)
        });
        const data = await res.json();
        if (data.success) {
            window.toast.success(`Mission saved successfully.`);
            window.page.change('home');
        } else {
            console.error('Mission save failed', data);
            window.toast.error(`Failed to save mission.`);
        }
    } catch (err) {
        console.error('Mission save request failed', err);
        window.toast.error(`Save failed: ${err.message}`);
    }
}

// --- Page logic
initializeMap();
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