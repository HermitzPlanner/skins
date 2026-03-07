import { gallerySkin } from "./fragments.js"
import { invis, visible, showSection } from "./utils.js"

export function gallery() {
    const gallerySvg = `<img class="svg" src="https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/gallery.svg" alt="Gallery SVG">`
    const plannerSvg = `<img class="svg" src="https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/planner.svg" alt="Gallery SVG">`

    const headerCheckbox = document.getElementById("header-gallery-checkbox")
    const headerGalleryDiv = document.getElementById('header-gallery-checkbox').nextElementSibling
    headerGalleryDiv.innerHTML = headerCheckbox.checked ? plannerSvg + 'Planner' : gallerySvg + 'Gallery'
    headerCheckbox.checked ? showSection('gallery') : showSection('main')
}

export function galleryLogic(data) {
    const skinsData = data.skinsData
    const charData = data.charData
    const search = document.getElementById('search2')
    const search3 = document.getElementById('search3')
    const brandData = skinsData.brands
    const artistsData = skinsData.artists
    //brandData.sort();
    brandData.forEach(brand => {
        search.innerHTML += `<option value="${brand}">${brand}</option>`
    });

    artistsData.forEach(artist => {
        search3.innerHTML += `<option value="${artist}">${artist}</option>`
    });

    let selectedBrand = ''

    search.addEventListener("change", brand => {
        selectedBrand = search.value
        revealItem()
    })

    let selectedArtist = ''

    search3.addEventListener("change", artist => {
        selectedArtist = search3.value
        revealItem()
    })


    const plannerIds = Object.entries(skinsData.plannerIdMap).map(([name, plannerId]) => ({ name, plannerId }));
    //debug(plannerIds)
    plannerIds.slice().reverse().forEach(plannerId => {
        // if (plannerId.plannerId.includes("amiya")) console.log(plannerId)
        document.getElementById('gallery-skins').append(gallerySkin(skinsData, plannerId, charData))
    });


    let searchTerm = ""

    document.getElementById('search').addEventListener('input', function () {
        searchTerm = this.value.toLowerCase().trim();
        //debug({ searchTerm })
        revealItem()
    });

    function revealItem() {

        const buttons = document.querySelectorAll('#gallery-skins button');

        buttons.forEach(button => {
            const itemName = button.querySelector('.gallery-name').textContent.toLowerCase().trim()
            itemName.includes(searchTerm) ? visible(button) : invis(button);
            // const itemName = container.querySelector('.h2').textContent.toLowerCase().trim();
            // const itemSlot = container.getAttribute('data-slot')
            // const itemRarity = container.getAttribute('data-rarity')
            // const itemCategory = container.getAttribute('data-category')

            // const labelElement = container.parentElement

            // itemName.includes(searchTerm) ? visible(labelElement) : invis(labelElement);

            // Look only for the current visible items

            /*
            if (button.classList.contains('show-block')) {
                const shouldBeVisible = (button.getAttribute('data-brand') == selectedBrand || selectedBrand == 'all' || selectedBrand == '')
                //need to check for
                //button.getAttribute('data-artist') == selectedArtist || selectedArtist == 'all' || selectedArtist == ''
                shouldBeVisible ? visible(button) : invis(button);
            }
            */

            if (button.classList.contains('show-block')) {
                const brandMatch = (
                    button.getAttribute('data-brand') === selectedBrand ||
                    selectedBrand === 'all' ||
                    selectedBrand === ''
                );

                const artistMatch = (
                    button.getAttribute('data-artist') === selectedArtist ||
                    selectedArtist === 'all' ||
                    selectedArtist === ''
                );

                const shouldBeVisible = brandMatch && artistMatch;

                shouldBeVisible ? visible(button) : invis(button);
            }

        });
    }
}