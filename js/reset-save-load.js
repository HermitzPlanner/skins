document.getElementById('reset').addEventListener('click', () => {
    document.querySelectorAll('input[name="skin-cbox"]:checked') // input[name="reward-cbox"]:checked, 
        .forEach(checkbox => checkbox.click());
});

document.getElementById('save').addEventListener('click', () => {
    let checkedIds = Array.from(document.querySelectorAll('input[name="skin-cbox"]:checked')) // input[name="reward-cbox"]:checked, 
                          .map(cb => cb.id)
                          .join(',');

    debug({checkedIds})

    let blob = new Blob([checkedIds], { type: 'text/plain' });
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'checkboxes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

document.getElementById('load').addEventListener('click', () => {
    
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'text/plain';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', (event) => {
        document.getElementById('reset').click(); // Reset first

        let file = event.target.files[0];
        if (!file) return;

        let reader = new FileReader();
        reader.onload = function(e) {
            let ids = e.target.result.split(',');
            debug({ids})
            ids.forEach(id => {
                let checkbox = document.getElementById(id.trim());
                if (checkbox && !checkbox.checked) {
                    checkbox.click();
                }
            });
        };
        reader.readAsText(file);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
});