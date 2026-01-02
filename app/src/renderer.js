const content = document.getElementById("content");

let currentPage = null
async function loadPage(page)
{
    if (page == currentPage) { return } else { currentPage = page };

    const pagePath = `pages/${page}.html`
    const scriptPath = `scripts/${page}.js`

    try
    {
        const res = await fetch(pagePath)
        const html = await res.text();
        content.innerHTML = html;

        updateActiveNav(page);

        try { await import(`./${scriptPath}?cacheBust=${Date.now()}`); }
        catch (err) { console.log(`No JS for page ${page}:`, err.message); }
    }
    catch (err) { content.innerHTML = `<p>Error loading page.  ${err}</p>`; }
}

function updateActiveNav(page) {
    document.querySelectorAll("nav button").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-page") === page);
    });
}

loadPage("home");

document.querySelectorAll("nav button").forEach(btn => {
    btn.addEventListener("click", () => {
        const page = btn.getAttribute("data-page");
        loadPage(page);
    });
});