const versionLabel = document.getElementById("version");
versionLabel.innerText = 'v.' + await window.api.version();

document.getElementById("github-redirect")?.addEventListener("click", () => {
    window.web.open("https://github.com/0kibob/sti2d.ldv-cansat");
});