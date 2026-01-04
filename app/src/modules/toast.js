const container = document.getElementById('toast-container');

function iconForType(type)
{
    switch (type)
    {
        case 'success': return 'check-circle';
        case 'error': return 'x-circle';
        case 'info': default: return 'info';
    }
}

export function make(title, description = null, timeout = 3000, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.classList.add(`${type}`);

    const toast_icon = document.createElement('i')
    toast_icon.setAttribute("data-lucide", iconForType(type));

    const content_container = document.createElement('div');
    content_container.className = 'container';

    if (title)
    {
        const title_container = document.createElement('p');
        title_container.innerText = title;
        title_container.classList.add('title');
        content_container.appendChild(title_container);
    }

    if (description)
    {
        const description_container = document.createElement('p')
        description_container.innerText = description
        description_container.classList.add('description')
        content_container.appendChild(description_container)
    }

    toast.appendChild(toast_icon)
    toast.appendChild(content_container)
    toast.addEventListener('click', () => dismiss());

    function dismiss()
    {
        toast.classList.remove('visible');
        toast.remove()
    }

    container.appendChild(toast);

    const timer = setTimeout(() => dismiss(), timeout);
    return { dismiss: () => { clearTimeout(timer); dismiss(); } };
}

export const success = (title, description = null, timeout) =>
    make(title, description, timeout, 'success');

export const error = (title, description = null, timeout) =>
    make(title, description, timeout, 'error');

export const info = (title, description = null, timeout) =>
    make(title, description, timeout, 'info');

export default { make, success, error, info };