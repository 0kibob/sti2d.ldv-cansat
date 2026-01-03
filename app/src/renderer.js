import { loadPage } from './modules/pageLoader.js';
import { initSidebar } from './modules/sidebar.js';
import * as toast from './modules/toast.js';

window.toast = toast;

initSidebar(loadPage);
loadPage("home");
try { lucideAPI.loadIcons(); } catch (e) {}


// toast.make('Hello World', null, { timeout: 5000, type: 'success'})

// app version
const versionLabel = document.getElementById("version");
const version = await api.appVersion();
versionLabel.innerText = 'v.' + version;

