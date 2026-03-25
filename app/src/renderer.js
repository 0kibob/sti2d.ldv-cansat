import { initLucideMutationObserver } from './modules/lucide.js';
import { initSidebar } from './modules/sidebar.js';
import { change } from './modules/page.js';

// import Chart from "../node_modules/chart.js/dist/chart.js";

import * as toast from './modules/toast.js';
import * as dropdown from './modules/dropdown.js'

window.toast = toast;
window.dropdown = dropdown
window.page ??= {};
window.page.change = change;
// window.chart = 

initLucideMutationObserver();
initSidebar(window.page.change);

window.page.change("home");