const debuglabel = document.getElementById("debug");

const mapContainer = document.getElementById("map")
const tempContainer = document.getElementById("temp")
const presContainer = document.getElementById("pres")
const accelContainer = document.getElementById("accel")
const gyroContainer = document.getElementById("gyro")

function makeDebugLabel(container, text) {
    const text = document.createElement("span");
    text.className = text;
    container.appendChild(text)
}

export default async function({ params }) {

    debuglabel.innerText = params.data
    console.log(params.type)

}