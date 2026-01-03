const refreshButton = document.getElementById("refresh-button");
const missionContainer = document.getElementById("missions-list");

refreshButton?.addEventListener('click', () => {loadMissions();});

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

    try { lucideAPI.loadIcons(); } catch (e) {}
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
        
        div.append(name, tag, flex, location, btn);
        missionContainer.appendChild(div);
    });
}

loadMissions()