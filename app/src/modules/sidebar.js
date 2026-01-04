export function initSidebar(loadPage) {

    const sidebar = document.getElementById('sidebar');
    const sidebarNav = document.getElementById("sidebar-nav");
    const sidebarNavButton = sidebarNav.querySelectorAll("button");
    const sidebarChevron = document.getElementById("sidebar-chevron");

    sidebarNavButton.forEach(btn => {
        btn.addEventListener("click", () => {
            const page = btn.getAttribute("data-page");
            loadPage(page);
        });
    });

    document.addEventListener('pagechange', (e) => {
        const page = e.detail;
        sidebarNavButton.forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-page") === page);
        });
    });

    sidebarChevron?.addEventListener('click', () => {
        sidebar.classList.toggle("min-w-md");
        sidebar.classList.toggle("open");
    });
}

export default { initSidebar };