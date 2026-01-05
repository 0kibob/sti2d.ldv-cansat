const refreshButton = document.getElementById("refresh-button");
const addButton = document.getElementById("add-button");
const importButton = document.getElementById("import-button");
const missionContainer = document.getElementById("missions-list");

refreshButton?.addEventListener('click', () => { loadMissions(); });
addButton?.addEventListener('click', () => { window.page.change("add-mission") });
importButton?.addEventListener('click', () => { window.page.change("add-mission") });

async function loadMissions()
{
    throwLoaderText();
    try
    {
        const response = await fetch(`http://localhost:8000/gt_missions`);
        const missions = await response.json();
        if (missions.length === 0) { throwNoMissionText(); return; }
        appendMissions(missions);
    }
    catch
    {
        throwErrorText()
    }
}

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

function throwNoMissionText()
{
    missionContainer.innerHTML = null

    const text = document.createElement("p");
    text.className = "text-primary flex text-center justify-center items-center flex-1";
    text.innerHTML = 'No missions yet. <br>Click "New Mission" to create one.';
    
    missionContainer.appendChild(text);
}

function throwErrorText()
{
    missionContainer.innerHTML = null

    const text = document.createElement("p");
    text.className = "text-error flex flex-col gap-sm text-center justify-center items-center flex-1";
    text.innerHTML = '<i data-lucide="alert-triangle" class="lg"></i>Failed to load missions.<br>Please try again later.';

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

        window.dropdown.attach(btn, {
            items: [
                {
                    content: 'Edit',
                    icon: "pencil",
                    onClick: () => window.page.change('view-mission')
                },
                {
                    content: 'Delete',
                    icon: "trash-2",
                    // onClick: () => window.toast.error("Delete clicked")
                    onClick: () => callRemoveMission(mission.id)
                }
            ]
        });
        
        div.append(name, tag, flex, location, btn);
        missionContainer.appendChild(div);
    });
}

async function callRemoveMission(mission_id)
{
    try
    {
        const response = await fetch(`http://localhost:8000/rm_mission?m_id=${mission_id}&key=${window.api.serverKey}`);
        const result = await response.json();
        console.log(typeof result.success, result.success)
        if (result.success) { window.toast.success(`Mission #${mission_id} removed successfully.`); }
        else { window.toast.error(`Failed to remove Mission #${mission_id}.`); }
    }
    catch (err)
    {
        console.error(err);
        window.toast.error(`Error removing Mission #${mission_id}.`);
    }

    loadMissions()
}

loadMissions()