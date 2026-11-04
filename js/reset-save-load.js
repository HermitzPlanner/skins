document.getElementById('reset').addEventListener('click', () => {
    document.querySelectorAll('input[name="skin-cbox"]:checked') // input[name="reward-cbox"]:checked, 
        .forEach(checkbox => checkbox.click());
});

document.getElementById('save').addEventListener('click', () => {
    let checkedIds = Array.from(document.querySelectorAll('input[name="skin-cbox"]:checked'))
                          .map(cb => cb.id)
                          .join(',');

    let initialValue = document.getElementById('initial').value;

    // Primera línea: los IDs, segunda línea: el valor de #initial
    let content = checkedIds + '\n' + initialValue;

    let blob = new Blob([content], { type: 'text/plain' });
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
            let lines = e.target.result.split('\n');
            
            // Primera línea → IDs de los checkboxes
            let ids = (lines[0] || '').split(',');
            ids.forEach(id => {
                let checkbox = document.getElementById(id.trim());
                if (checkbox && !checkbox.checked) {
                    checkbox.click();
                }
            });

            // Segunda línea → valor del input #initial
            if (lines[1] !== undefined) {
                document.getElementById('initial').value = lines[1].trim();
            }
        };
        reader.readAsText(file);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
});