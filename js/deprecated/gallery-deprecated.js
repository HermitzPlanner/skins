function gallery(headerCheckbox) {
    const gallerySvg = `<img class="svg" src="https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/gallery.svg" alt="Gallery SVG">`
    const plannerSvg = `<img class="svg" src="https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/planner.svg" alt="Gallery SVG">`

    headerGalleryDiv = getDiv('header-gallery-checkbox').nextElementSibling
    headerGalleryDiv.innerHTML = headerCheckbox.checked ? plannerSvg + 'Planner' : gallerySvg + 'Gallery'
    headerCheckbox.checked ? showSection('gallery') : showSection('main')
}