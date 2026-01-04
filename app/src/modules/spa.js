const content = document.getElementById("content");
let currentPage = null;

export async function initSPA(page) {
    if (page == currentPage) { return } else { currentPage = page };

    const pagePath = `pages/${page}.html`;
    const scriptPath = `scripts/${page}.js`;

    try {
        const res = await fetch(pagePath);
        const html = await res.text();
        content.innerHTML = html;

        // notify nav about the page change
        document.dispatchEvent(new CustomEvent('pagechange', { detail: page }));

        // try { lucideAPI.loadIcons(); } catch (e) { }

        try { await import(`../${scriptPath}?cacheBust=${Date.now()}`); }
        catch (err) {}
    }
    catch (err) { content.innerHTML = `<p>Error loading page.  ${err}</p>`; }
}

export default { initSPA };