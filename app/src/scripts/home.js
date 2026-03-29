export async function init({ params } = {}) {

const addButton = document.getElementById("add-button");
const importButton = document.getElementById("import-button");

addButton?.addEventListener('click', async () => {
    window.page.change('add');
});

importButton?.addEventListener('click', async () => {
    try {

        const result = await window.file.mission.open();
        if (!result) return;
        window.page.change('import', {"type": result.type, "data": result.data});
    }
    catch (err)
    {
        console.error(err);
        window.toast.error(`Error importing Mission.`);
    }
});

}