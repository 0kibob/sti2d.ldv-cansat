import { initLucideMutationObserver } from './modules/lucide.js';
import { initSidebar } from './modules/sidebar.js';
import { change } from './modules/spa.js';

import * as toast from './modules/toast.js';
import * as dropdown from './modules/dropdown.js'

window.toast = toast;
window.dropdown = dropdown
window.page ??= {};
window.page.change = change;

initLucideMutationObserver();

initSidebar(window.page.change);
window.page.change("home")

// app version
const versionLabel = document.getElementById("version");
const version = await api.version();
versionLabel.innerText = 'v.' + version;

document.getElementById("sidebar-github")?.addEventListener("click", () => {
    window.api.openExternal("https://github.com/0kibob/sti2d.ldv-cansat");
});
