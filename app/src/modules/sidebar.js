export function initSidebar(loadPage)
{
    const sidebar = document.querySelector("[data-sidebar]")
    const buttons = document.querySelectorAll("[data-pagelink]")
    const toggles = document.querySelectorAll("[data-sidebar-toggle]")

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const page = btn.getAttribute("data-pagelink");
            loadPage(page);
        });
    });

    document.addEventListener('pagechange', (e) => {
        const { page, params } = e.detail;
        buttons.forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-pagelink") === page);
        });
    });

    toggles.forEach(btn => {
        btn.addEventListener("click", () => {
            const collapsed = sidebar.getAttribute("data-sidebar-state") === "collapsed";
            sidebar.setAttribute("data-sidebar-state", collapsed ? "expanded" : "collapsed");
        });
    });

}

export default { initSidebar };