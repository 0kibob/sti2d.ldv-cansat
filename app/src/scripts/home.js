const addButton = document.getElementById("add-button");
const importButton = document.getElementById("import-button");

addButton?.addEventListener('click', () => { console.log(pageParams.test); });
importButton?.addEventListener('click', async () => {
    try {
        const result = await window.api.openJsonFile();
        if (!result) return; // user canceled
        window.page.change('add-mission', {"import": true, "data": JSON.stringify(result)});
    } 
    catch (err)
    {
        console.error(err);
        window.toast.error(`Error importing Mission.`);
    }
});
