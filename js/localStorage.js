function saveSkinCheckboxes() {
    let checkedIds = Array.from(document.querySelectorAll('input[name="skin-cbox"]:checked'))
                          .map(cb => cb.id);
    localStorage.setItem('skinCheckboxes', JSON.stringify(checkedIds));
}

function loadSkinCheckboxes() {
    let savedIds = JSON.parse(localStorage.getItem('skinCheckboxes')) || [];
    debug({savedIds})
    document.querySelectorAll('input[name="skin-cbox"]').forEach(cb => {
        if (savedIds.includes(cb.id)) cb.click()
    });
}

function resetSkinCheckboxes() {
    document.querySelectorAll('input[name="skin-cbox"]:checked').forEach(cb => cb.click());
    localStorage.removeItem('skinCheckboxes'); // Clear storage on reset
}

// Attach event listener to all checkboxes for automatic saving
function setLocalStorage() {
    debug({localStorage})
    document.querySelectorAll('input[name="skin-cbox"]').forEach(cb => {
        cb.addEventListener('change', saveSkinCheckboxes);
    });

    loadSkinCheckboxes(); // Load checkboxes on page load
};
