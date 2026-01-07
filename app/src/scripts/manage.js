const refreshButton = document.getElementById("refresh-button");
const addButton = document.getElementById("add-button");
const importButton = document.getElementById("import-button");
const missionContainer = document.getElementById("missions-list");

const activeTabButton = document.getElementById("active-tab-button");
const trashTabButton = document.getElementById("trash-tab-button");

const tabs =
{
    active: activeTabButton,
    trash: trashTabButton
};

let currentTab = 'active';

function setActiveTab(tabName)
{
    if (currentTab === tabName) return;
    currentTab = tabName;

    Object.keys(tabs).forEach(key => {
        if (key === tabName) {
            tabs[key].classList.add('active');
        } else {
            tabs[key].classList.remove('active');
        }
    });

    loadMissionsForTab(tabName);
}

refreshButton?.addEventListener('click', () => { loadMissionsForTab(currentTab); });
addButton?.addEventListener('click', () => { window.page.change("add-mission") });
activeTabButton?.addEventListener('click', () => setActiveTab('active'));
trashTabButton?.addEventListener('click', () => setActiveTab('trash'));
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

async function loadMissionsForTab(tab)
{
    throwLoaderText();

    let url = 'http://localhost:8000/api/missions';
    if (tab === 'trash') { url = 'http://localhost:8000/api/missions/trash'; }

    try {
        const response = await fetch(url);
        const missions = await response.json();
        console.log(missions);

        if (missions.success === false || missions.data.length === 0) { throwNoMissionText(tab); return; }
        appendMissions(missions.data);
    }
    catch (err)
    {
        throwErrorText(err);
    }
}

// async function loadMissions()
// {
//     throwLoaderText();
//     try
//     {
//         const response = await fetch(`http://localhost:8000/api/missions`);
//         const missions = await response.json();
//         console.log(missions)
//         if (missions.success === false) { throwNoMissionText(); return; }
//         appendMissions(missions.data);
//     }
//     catch (err)
//     {
//         throwErrorText(err)
//     }
// }

function throwLoaderText()
{
    missionContainer.innerHTML = null

    const text = document.createElement("span");
    const containerText = document.createElement("div");
    text.className = "loader";
    containerText.className = "flex justify-center items-center flex-1";
    containerText.appendChild(text)

    missionContainer.appendChild(containerText);
}

function throwNoMissionText(tab)
{
    missionContainer.innerHTML = null;

    const text = document.createElement("p");
    text.className = "text-primary flex text-center justify-center items-center flex-1";

    if (tab === 'active') 
    {
        text.innerHTML = 'No missions yet. <br>Click "New Mission" to create one.';
    } 
    else if (tab === 'trash')
    {
        text.innerHTML = 'No deleted missions.';
    }

    missionContainer.appendChild(text);
}

function throwErrorText(error)
{
    missionContainer.innerHTML = null

    const text = document.createElement("p");
    text.className = "text-error flex flex-col gap-sm text-center justify-center items-center flex-1";
    text.innerHTML = `<i data-lucide="alert-triangle" class="lg"></i>Failed to load missions.<br>Please try again later.<br><br>${error}.`;

    missionContainer.appendChild(text);
}

function appendMissions(missions)
{
    missionContainer.innerHTML = null

    missions.forEach(mission => {
        const div = document.createElement("div");
        div.className = "border-1 r-sm p-sm flex flex-row gap-xs items-center";

        const name = document.createElement("p");
        name.className = "text-primary";
        name.textContent = mission.name;

        const tag = document.createElement("div");
        tag.className = "tag";
        tag.textContent = `id: ${mission.id}`;

        const flex = document.createElement("div");
        flex.className = "flex-1";

        const location = document.createElement("p");
        location.className = "text-muted-foreground";
        const date = new Date(mission.datetime);
        location.textContent = `${mission.position} - ${date.toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false
        })}`;

        const btn = document.createElement("button");
        btn.className = "icon border hover-accent";
        btn.setAttribute("aria-label", "More options");
        btn.innerHTML = '<i data-lucide="ellipsis"></i>';

        if (currentTab === 'active') 
        {
            window.dropdown.attach(btn, {
                items: [
                    {
                        content: 'View', icon: "eye",
                        onClick: () => window.page.change('view-mission', {"id": mission.id})
                    },
                    {
                        content: 'Delete', icon: "trash-2",
                        onClick: () => callMarkMission(mission.id)
                    }
            ]});
        } 
        else if (currentTab === 'trash')
        {
            window.dropdown.attach(btn, {
                items: [
                    {
                        content: 'Restore', icon: "archive-restore",
                        onClick: () => callRestoreMission(mission.id)
                    },
                    {
                        content: 'Delete', icon: "trash-2",
                        onClick: () => callDeleteMission(mission.id)
                    }
            ]});
        }

        div.append(name, tag, flex, location, btn);
        missionContainer.appendChild(div);
    });
}

async function callMarkMission(mission_id)
{
    try
    {
        let url = `http://localhost:8000/api/missions/mark?id=${mission_id}`;
        const response = await fetch(url, { method: 'GET', headers: { 'x-api-key': window.api.serverKey } });
        const result = await response.json();
        if (result.success) { window.toast.success(`Mission #${mission_id} mark as delete successfully.`); }
        else { window.toast.error(`Failed to remove Mission #${mission_id}.`); }
    }
    catch (err)
    {
        console.error(err);
        window.toast.error(`Error removing Mission #${mission_id}.`);
    }

    loadMissionsForTab(currentTab)
}

async function callDeleteMission(mission_id)
{
    try
    {
        let url = `http://localhost:8000/api/missions/delete?id=${mission_id}`;
        const response = await fetch(url, { method: 'GET', headers: { 'x-api-key': window.api.serverKey } });
        const result = await response.json();
        if (result.success) { window.toast.success(`Mission #${mission_id} remove successfully.`); }
        else { window.toast.error(`Failed to remove Mission #${mission_id}.`); }
    }
    catch (err)
    {
        console.error(err);
        window.toast.error(`Error removing Mission #${mission_id}.`);
    }

    loadMissionsForTab(currentTab)
}

async function callRestoreMission(mission_id)
{
    try
    {
        let url = `http://localhost:8000/api/missions/restore?id=${mission_id}`;
        const response = await fetch(url, { method: 'GET', headers: { 'x-api-key': window.api.serverKey } });
        const result = await response.json();
        if (result.success) { window.toast.success(`Mission #${mission_id} restore successfully.`); }
        else { window.toast.error(`Failed to restore Mission #${mission_id}.`); }
    }
    catch (err)
    {
        console.error(err);
        window.toast.error(`Error resotring Mission #${mission_id}.`);
    }

    loadMissionsForTab(currentTab)
}

loadMissionsForTab(currentTab)