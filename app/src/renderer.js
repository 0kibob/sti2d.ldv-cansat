import { initLucideMutationObserver } from './modules/lucide.js';
import { initSidebar } from './modules/sidebar.js';
import { initSPA } from './modules/spa.js';

import * as toast from './modules/toast.js';
import * as dropdown from './modules/dropdown.js'

window.toast = toast;
window.dropdown = dropdown
window.loadPage = initSPA

initLucideMutationObserver();

initSidebar(initSPA);
initSPA("home")

// app version
const versionLabel = document.getElementById("version");
const version = await api.version();
versionLabel.innerText = 'v.' + version;

document.getElementById("sidebar-github")?.addEventListener("click", () => {
    window.api.openExternal("https://github.com/0kibob/sti2d.ldv-cansat");
});
