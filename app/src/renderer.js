import { initLucideMutationObserver } from './modules/lucide.js';
import { initSidebar } from './modules/sidebar.js';
import { change } from './modules/page.js';

import * as toast from './modules/toast.js';
import * as dropdown from './modules/dropdown.js'

window.toast = toast;
window.dropdown = dropdown
window.page ??= {};
window.page.change = change;

initLucideMutationObserver();
initSidebar(window.page.change);

window.page.change("home");