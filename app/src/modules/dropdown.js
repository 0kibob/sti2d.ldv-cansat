let activeDropdown = null;

export function attach(parent, { items = [], onOpen, onClose })
{
    function open() {
        // Close any existing dropdown
        if (activeDropdown) activeDropdown();

        const dropdownMenu = document.createElement("div");
        dropdownMenu.className = "dropdown-menu";

        items.forEach(item => {
            const element = document.createElement("button");
            element.className = "dropdown-item icon w-full";
            element.innerHTML = "";
            if (item.icon)
            {
                const elementIcon = document.createElement("i");
                elementIcon.setAttribute("data-lucide", item.icon);
                element.appendChild(elementIcon);
            }
            if (item.content)
            {
                const elementText = document.createElement("span");
                elementText.textContent = item.content;
                element.appendChild(elementText);
            }
 
            element.addEventListener("click", (e) => {
                e.stopPropagation();
                item.onClick?.();
                close();
            });

            dropdownMenu.appendChild(element);
        });

        // Attach as child (important for layout + scoping)
        // parent.parentElement.style.position ||= "relative";
        // parent.parentElement.appendChild(dropdownMenu);
        parent.style.position ||= "relative";
        parent.appendChild(dropdownMenu);

        function close() {
            document.removeEventListener("click", outsideClick);
            dropdownMenu.remove();
            activeDropdown = null;
            onClose?.();
        }

        function outsideClick(e) {
            if (!dropdownMenu.contains(e.target) && e.target !== parent) {
                close();
            }
        }

        // Delay so the click that opened it doesn't instantly close it
        setTimeout(() => document.addEventListener("click", outsideClick));
        activeDropdown = close;
        onOpen?.();
    }

    parent.addEventListener("click", (e) => {
        e.stopPropagation();
        open();
    });
}
