async function loadHTML(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo cargar ' + url);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(error);
        document.getElementById(elementId).innerHTML = '<p style="color:red">Error al cargar sección</p>';
    }
}

