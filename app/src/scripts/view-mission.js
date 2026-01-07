const debuglabel = document.getElementById("debug");

export default async function({ params }) {

    // If we came here via Import, an imported mission may be in sessionStorage
    const imported = sessionStorage.getItem('importedMission');
    if ((!params || !params.id) && imported) {
        try {
            const data = JSON.parse(imported);
            debuglabel.innerText = JSON.stringify(data, null, 2);
            // Clear imported data so it doesn't persist unintentionally
            sessionStorage.removeItem('importedMission');
            return;
        } catch (err) {
            console.error('Failed to parse imported mission', err);
            window.toast.error('Imported file is not valid JSON.');
            sessionStorage.removeItem('importedMission');
            return;
        }
    }

    try
    {
        let url = `http://localhost:8000/api/missions/get?id=${params.id}`;
        const response = await fetch(url);
        const result = await response.json();
        console.log(result)
        if (result.success)
        {
            debuglabel.innerText = JSON.stringify(result.data)
        }
        else { window.toast.error(`Failed to load Mission #${params.id}.`); }
    }
    catch (err)
    {
        console.error(err);
        window.toast.error(`Error loading Mission #${params.id}.`);
    }

}
