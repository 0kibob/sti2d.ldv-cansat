export async function init({ params } = {}) {

const nameLabel = document.getElementById('mission-name');
const timeLabel = document.getElementById('mission-time');
const dateLabel = document.getElementById('mission-date');
const positionLabel = document.getElementById('mission-position');
const mapContainer = document.getElementById('map');
const durationLabel = document.getElementById('mission-duration');
const samplesLabel = document.getElementById('mission-samples');
const intervalLabel = document.getElementById('mission-interval');

const tempCtx = document.getElementById('tempChart')?.getContext('2d');
const presCtx = document.getElementById('presChart')?.getContext('2d');
const accelCtx = document.getElementById('accelChart')?.getContext('2d');
const gyroCtx = document.getElementById('gyroChart')?.getContext('2d');

const ChartClass = window.Chart;
if (ChartClass?.defaults?.elements?.line) {
    ChartClass.defaults.elements.line.borderWidth = 1;
}

function createChart(ctx, config) {
    return ctx && ChartClass ? new ChartClass(ctx, config) : null;
}

const tempChart = createChart(tempCtx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Temperature', data: [], borderColor: 'rgb(255,99,132)', backgroundColor: 'rgba(255,99,132,0.2)', tension: 0.3, pointRadius: 2 }] },
    options: { animation: false, responsive: true, maintainAspectRatio: false, scales: { x: { display: true, title: { display: true, text: 'Sample' } }, y: { display: true, title: { display: true, text: 'Temperature' } } } }
});

const presChart = createChart(presCtx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Pressure', data: [], borderColor: 'rgb(54,162,235)', backgroundColor: 'rgba(54,162,235,0.2)', tension: 0.3, pointRadius: 2 }] },
    options: { animation: false, responsive: true, maintainAspectRatio: false, scales: { x: { display: true, title: { display: true, text: 'Sample' } }, y: { display: true, title: { display: true, text: 'Pressure' } } } }
});

const accelChart = createChart(accelCtx, {
    type: 'line',
    data: { labels: [], datasets: [
        { label: 'Accel X', data: [], borderColor: 'rgb(255,99,132)', backgroundColor: 'rgba(255,99,132,0.2)', tension: 0.3, pointRadius: 0 },
        { label: 'Accel Y', data: [], borderColor: 'rgb(54,162,235)', backgroundColor: 'rgba(54,162,235,0.2)', tension: 0.3, pointRadius: 0 },
        { label: 'Accel Z', data: [], borderColor: 'rgb(75,192,192)', backgroundColor: 'rgba(75,192,192,0.2)', tension: 0.3, pointRadius: 0 }
    ] },
    options: { animation: false, responsive: true, maintainAspectRatio: false, scales: { x: { display: true, title: { display: true, text: 'Sample' } }, y: { display: true, title: { display: true, text: 'Acceleration' } } } }
});

const gyroChart = createChart(gyroCtx, {
    type: 'line',
    data: { labels: [], datasets: [
        { label: 'Gyro X', data: [], borderColor: 'rgb(153,102,255)', backgroundColor: 'rgba(153,102,255,0.2)', tension: 0.3, pointRadius: 0 },
        { label: 'Gyro Y', data: [], borderColor: 'rgb(255,159,64)', backgroundColor: 'rgba(255,159,64,0.2)', tension: 0.3, pointRadius: 0 },
        { label: 'Gyro Z', data: [], borderColor: 'rgb(255,205,86)', backgroundColor: 'rgba(255,205,86,0.2)', tension: 0.3, pointRadius: 0 }
    ] },
    options: { animation: false, responsive: true, maintainAspectRatio: false, scales: { x: { display: true, title: { display: true, text: 'Sample' } }, y: { display: true, title: { display: true, text: 'Rotation' } } } }
});

let leafletMap = null;
let positionMarker = null;

function createLeafletMap() {
    if (!mapContainer || !window.L) return null;
    if (leafletMap) return leafletMap;

    leafletMap = L.map(mapContainer, { zoomControl: true }).setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(leafletMap);

    return leafletMap;
}

function setPositionOnMap(position) {
    if (!position || position.lat == null || position.lon == null) return;
    createLeafletMap();

    const coords = [position.lat, position.lon];
    if (!positionMarker) {
        positionMarker = L.marker(coords).addTo(leafletMap);
    } else {
        positionMarker.setLatLng(coords);
    }
    leafletMap.setView(coords, 14);
    setTimeout(() => leafletMap.invalidateSize(), 150);
}

function formatPosition(position) {
    if (!position) return 'No position';
    if (typeof position === 'string') return position;
    if (position.lat != null && position.lon != null) {
        return `${position.name ?? 'Position'} (${position.lat.toFixed(5)}, ${position.lon.toFixed(5)})`;
    }
    return JSON.stringify(position);
}

function computeSampling(mission) {
    let interval = mission.sampling?.interval_sec ?? 1;
    let samples = mission.sampling?.total_samples ?? 0;
    if (!samples && mission.sensors) {
        const s = mission.sensors;
        if (s.temperature) samples = s.temperature.length;
        else if (s.pressure) samples = s.pressure.length;
        else if (s.accel) samples = s.accel.length;
        else if (s.gyro) samples = s.gyro.length;
    }
    return { interval, samples, duration: interval * samples };
}

function updateChart(chart, values) {
    if (!chart || !values) return;
    const labels = values.map((_, index) => index + 1);
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();
}

function updateVectorChart(chart, vectors) {
    if (!chart || !vectors) return;
    const labels = vectors.map((_, index) => index + 1);
    chart.data.labels = labels;
    chart.data.datasets[0].data = vectors.map(v => v[0]);
    chart.data.datasets[1].data = vectors.map(v => v[1]);
    chart.data.datasets[2].data = vectors.map(v => v[2]);
    chart.update();
}

function renderMission(mission) {
    nameLabel.textContent = mission.metadata?.name ?? mission.name ?? 'Unnamed mission';
    const dt = mission.metadata?.datetime ?? mission.datetime;
    if (dt) {
        timeLabel.textContent = dt?.substring(11, 16) ?? '-';
        dateLabel.textContent = dt?.substring(0, 10) ?? '-';
    }

    const position = mission.metadata?.position ?? mission.position;
    positionLabel.textContent = formatPosition(position);
    if (typeof position === 'object' && position?.lat != null && position?.lon != null) {
        setPositionOnMap(position);
    } else {
        createLeafletMap();
    }

    const sampling = computeSampling(mission);
    durationLabel.innerText = `${sampling.duration}s`;
    samplesLabel.innerText = sampling.samples;
    intervalLabel.innerText = `${sampling.interval}s`;

    if (mission.sensors?.temperature) updateChart(tempChart, mission.sensors.temperature);
    if (mission.sensors?.pressure) updateChart(presChart, mission.sensors.pressure);
    const accelValues = mission.sensors?.accel ?? mission.sensors?.acceleration;
    if (accelValues) updateVectorChart(accelChart, accelValues);
    if (mission.sensors?.gyro) updateVectorChart(gyroChart, mission.sensors.gyro);
}

function invalidParams() {
    window.toast?.error('No mission selected for viewing.');
}

if (!params?.id) {
    invalidParams();
    return;
}

createLeafletMap();

try {
    const url = `${window.api.getServerUrl()}/missions/get?id=${params.id}`;
    const response = await fetch(url);
    const result = await response.json();
    if (result.success && result.data) {
        renderMission(result.data);
    } else {
        window.toast?.error(`Failed to load Mission #${params.id}.`);
    }
} catch (err) {
    console.error(err);
    window.toast?.error(`Error loading Mission #${params.id}.`);
}
}
