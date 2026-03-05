const { dialog } = require('electron/main');
const fs = require('fs').promises;

const PACKET_SIZE = 16;

async function openDialog(options = {}) {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        ...options
    });

    if (result.canceled) return null;
    return result.filePaths[0];
}

async function openSaveDialog(options = {}) {
    const result = await dialog.showSaveDialog({
        ...options
    });

    if (result.canceled) return null;
    return result.filePath;
}

async function readFile(path, encoding = 'utf8') {
    return fs.readFile(path, encoding);
}

async function writeFile(path, data, encoding = 'utf8') {
    return fs.writeFile(path, data, encoding);
}

async function readJson(path) {
    const content = await readFile(path);
    return JSON.parse(content);
}

async function writeJson(path, data) {
    return writeFile(path, JSON.stringify(data, null, 2));
}

function readScm(buffer) {

    const data = {
        temperature: [],
        pressure: [],
        accelX: [],
        accelY: [],
        accelZ: [],
        gyroX: [],
        gyroY: [],
        gyroZ: []
    };

    for (let offset = 0; offset < buffer.length; offset += PACKET_SIZE) {

        data.temperature.push(buffer.readInt16LE(offset + 0) / 100); // scaled
        data.pressure.push(buffer.readUInt16LE(offset + 2));

        data.accelX.push(buffer.readInt16LE(offset + 4));
        data.accelY.push(buffer.readInt16LE(offset + 6));
        data.accelZ.push(buffer.readInt16LE(offset + 8));

        data.gyroX.push(buffer.readInt16LE(offset + 10));
        data.gyroY.push(buffer.readInt16LE(offset + 12));
        data.gyroZ.push(buffer.readInt16LE(offset + 14));
    }

    return data;
}

async function open() {
    const path = await openDialog();
    if (!path) return null;
    try { return await readFile(path); }
    catch { return null; }
}

async function save(_event, path, data) {
    if (!path || !data) throw new Error('Missing path or data');
    await writeFile(path, data);
    return true;
}

async function openJson() {
    const path = await openDialog({
        filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (!path) return null;
    try { return await readJson(path); }
    catch { return null; }
}

async function saveJson(_event, path, data) {
    if (!path || !data) throw new Error('Missing path or data');
    await writeJson(path, data);
    return true;
}

async function downloadJson(_event, data, name) {
    const path = await openSaveDialog({
        defaultPath: `${name}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (!path) return null;
    await writeJson(path, data);
    return true
}

async function openScm() {
    const path = await openDialog({
        filters: [{ name: 'SampleCan Mission', extensions: ['scm'] }]
    });
    if (!path) return null;
    try { return readScm(await fs.readFile(path)); }
    catch { return null; }
}

module.exports = {
    handlers: {
        'file:open': open,
        'file:save': save,
        'file:json:open': openJson,
        'file:json:save': saveJson,
        'file:json:download': downloadJson,
        'file:scm:open': openScm
    }
};