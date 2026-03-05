const addButton = document.getElementById("add-button");
const importButton = document.getElementById("import-button");

addButton?.addEventListener('click', async () => {
    // console.log(await window.file.scm.open())
});



// importButton?.addEventListener('click', async () => {
//     try {
//         const result = await window.file.json.open();
//         if (!result) return; // user canceled
//         window.page.change('import', {"type": true, "data": JSON.stringify(result)});
//     } 
//     catch (err)
//     {
//         console.error(err);
//         window.toast.error(`Error importing Mission.`);
//     }
// });



importButton?.addEventListener('click', async () => {
    try {

        const result = await window.file.mission.open();
        if (!result) return;
        window.page.change('import', {"type": result.type, "data": result});
    }
    catch (err)
    {
        console.error(err);
        window.toast.error(`Error importing Mission.`);
    }
});