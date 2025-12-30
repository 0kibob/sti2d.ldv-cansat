async function get_missions()
{
    const container = document.getElementById('missions');
    container.innerHTML = '<span class="loader"></span>';

    try
    {
        const response = await fetch(`http://localhost:8000/gt_missions`);
        if (!response.ok) { throw new Error("Server error"); }
        const missions = await response.json();
        container.innerHTML = "";

        if (missions.length === 0)
        {
            container.innerHTML = '<p class="text-primary">No mission for now</p>';
            return;
        }

        console.log(missions);

        missions.forEach(mission => {
            const btn = document.createElement("button")
            btn.className = "w-full button bg-none border-1 r-md"
            btn.innerHTML = `
                <div class="flex flex-row justify-sb p-4 items-center">
                    <h2 class="text-primary">
                        ${mission.name ?? "Unnamed mission"}
                    </h2>

                    <div class="flex flex-row gap-2">
                        <p class="text-foreground">
                            ${mission.position ?? "Unknown"}
                        </p>
                        <hr class="text-foreground">
                        <p class="text-foreground">
                            ${mission.datetime ?? "No date"}
                        </p>
                    </div>
                </div>
            `;
            btn.onclick = () => { window.location.href = `/mission?id=${mission.id}`; };
            container.appendChild(btn)
        });
    }
    catch (error)
    {
        container.innerHTML = `
            <div class="flex flex-col gap-3 p-4 border-1 r-md">
                <h2 class="text-primary">⚠️ Unable to reach the server</h2>

                <p class="text-foreground size-md">
                    Please check your connection and try again.
                </p>

                <button class="bg-foreground text-background button size-md border-none r-md p-md" id="refresh">
                    Refresh
                </button>

                <p class="text-accent size-sm">
                    ${String(error)}
                </p>
            </div>
        `;

        document.getElementById("refresh").addEventListener("click", get_missions);

        // document.getElementById("refresh").onclick = get_missions;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    get_missions();
});