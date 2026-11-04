import { updateCalcs } from "./main.js";
function saveSkinCheckboxes() {
    let checkedIds = Array.from(document.querySelectorAll('input[name="skin-cbox"]:checked'))
                          .map(cb => cb.id);
    localStorage.setItem('skinCheckboxes', JSON.stringify(checkedIds));

    // Guardar también el valor de #initial
    localStorage.setItem('initialValue', document.getElementById('initial').value);
}

function loadSkinCheckboxes() {
    let savedIds = JSON.parse(localStorage.getItem('skinCheckboxes')) || [];
    
    document.querySelectorAll('input[name="skin-cbox"]').forEach(cb => {
        if (savedIds.includes(cb.id)) cb.click();
    });

    // Restaurar el valor de #initial
    const savedInitial = localStorage.getItem('initialValue');
    if (savedInitial !== null) {
        document.getElementById('initial').value = savedInitial;
        updateCalcs()
    }
}

function resetSkinCheckboxes() {
    document.querySelectorAll('input[name="skin-cbox"]:checked').forEach(cb => cb.click());
    localStorage.removeItem('skinCheckboxes');

    // Limpiar también el initial
    document.getElementById('initial').value = '';
    localStorage.removeItem('initialValue');
}

// Attach event listener to all checkboxes for automatic saving
export function setLocalStorage() {
    document.querySelectorAll('input[name="skin-cbox"]').forEach(cb => {
        cb.addEventListener('change', saveSkinCheckboxes);
    });

    // Guardar automáticamente cuando cambie el input #initial
    document.getElementById('initial').addEventListener('input', saveSkinCheckboxes);

    loadSkinCheckboxes(); // Load on page load
}