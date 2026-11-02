async function cropScreenshot(elementId, plannerId) {

    // Cargar html2canvas si no está disponible
    if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`No se encontró ningún elemento con id="${elementId}"`);
        return;
    }


    const img = element.querySelector('.skin-portrait')
    element.innerHTML = '';
    element.style.border = '0'
    element.appendChild(img);
    element.className = ''
    element.style.width = '183px'
    element.style.height = '346px'

    const style = getComputedStyle(img);
    const scale = parseFloat(style.scale);
    const [, x, y] = style.transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,([^,]+),([^,]+)\)/) || [];
    img.style.transform = "none";
    img.style.margin = `${y * scale}px ${x * scale}px`;





    try {
        const canvas = await html2canvas(element, {
            useCORS: true,          // útil si hay imágenes de otros dominios
            scale: 1,               // mayor calidad (2x)
            backgroundColor: false,  // respeta transparencia si el div la tiene
            logging: false
        });

        // Convertir a JPG y descargar
        const link = document.createElement('a');
        link.download = `crop-${plannerId}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.92); // 0.92 = calidad
        link.click();

        console.log('✅ Captura guardada');

        element.remove()
    } catch (err) {
        console.error('Error al capturar:', err);
    }
}

export { cropScreenshot }


