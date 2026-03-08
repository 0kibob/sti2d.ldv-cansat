const nameInput = document.getElementById('mission-name')
const timeInput = document.getElementById('mission-time')
const dateInput = document.getElementById('mission-date')
const mapContainer = document.getElementById("map")
const tempContainer = document.getElementById("temp")
const presContainer = document.getElementById("pres")
const accelContainer = document.getElementById("accel")
const gyroContainer = document.getElementById("gyro")

const durationLabel = document.getElementById("mission-duration")
const samplesLabel = document.getElementById("mission-samples")
const durationInterval = document.getElementById("mission-interval")

function makeDebugLabel(container, text) {
    const span = document.createElement("span");
    span.className = text;
    container.appendChild(span);
}

makeDebugLabel(mapContainer, "f")

export default async function({ params }) {
    console.log(params.type)
    let mission
    if (params.type === "json") { mission = importJson(params.data) }
    if (params.type === "scm") { mission = importScm(params.data) }
    renderMission(mission)
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

function renderMission(mission) {

    if (mission.metadata?.name)
        nameInput.value = mission.metadata.name

    if (mission.metadata?.datetime)
        timeInput.value = mission.metadata.datetime.substring(11,16)

    if (mission.metadata?.position)
        mapContainer.innerText =
            `${mission.metadata.position.name} (${mission.metadata.position.lat}, ${mission.metadata.position.lon})`

    if (mission.sensors.temperature)
        tempContainer.innerText = mission.sensors.temperature.join(", ")

    if (mission.sensors.pressure)
        presContainer.innerText = mission.sensors.pressure.join(", ")
        

    if (mission.sensors.accel)
        accelContainer.innerText =
            mission.sensors.accel.map(v=>`x:${v[0]} y:${v[1]} z:${v[2]}`).join("\n")

    if (mission.sensors.gyro)
        gyroContainer.innerText =
            mission.sensors.gyro.map(v=>`x:${v[0]} y:${v[1]} z:${v[2]}`).join("\n")
}