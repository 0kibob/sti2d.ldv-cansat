const { dialog } = require('electron/main');
const fs = require('fs').promises;

async function openDialog(options = {}) {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        ...options
    });

    if (result.canceled) return null;
    return result.filePaths[0];
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

module.exports = {
    handlers: {
        'file:open': open,
        'file:save': save,
        'file:json:open': openJson,
        'file:json:save': saveJson
    }
};