const content = document.getElementById("content");
let currentPage = null;

export async function change(page, params = {}, options = {})
{
    if (page == currentPage) { return } else { currentPage = page };

    const pagePath = `pages/${page}.html`;
    const scriptPath = `scripts/${page}.js`;

    try
    {
        const res = await fetch(pagePath);
        const html = await res.text();
        content.innerHTML = html;

        // notify sidebar about the page change
        document.dispatchEvent(new CustomEvent('pagechange', { detail: {page, params}}));

        try
        {
            const module = await import(`../${scriptPath}?v=${Date.now()}`);
            if (module.default) { module.default({ params, options }); }
        } catch (err) {}
    }
    catch (err) { content.innerHTML = `<p>Error loading page.  ${err}</p>`; }
}

export default { change };