
export function initLucideMutationObserver()
{
    window.icons.lucide.render();

    const observer = new MutationObserver((mutations) => {
        const hasIcon = mutations.some(m => 
            Array.from(m.addedNodes).some(node => node.querySelector?.("i[data-lucide]"))
        );
        if (hasIcon) window.icons.lucide.render();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
};