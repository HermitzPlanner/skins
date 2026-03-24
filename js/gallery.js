import { invis, visible, showSection, findSkinByName, getCharObject, drawSkinBackground, drawSkinTopBackground, getYearFromTimestamp } from "./utils.js"
import { SKIN_ICON_REPOSITORY } from "./constants.js"
import { viewer } from "./viewer.js"
import { getColorList } from "./utils.js"

export function gallery() {
    document.getElementById('current-section').textContent = 'gallery'
    const gallerySvg = `<img class="svg" src="https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/gallery.svg" alt="Gallery SVG">`
    const plannerSvg = `<img class="svg" src="https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/planner.svg" alt="Gallery SVG">`

    const headerCheckbox = document.getElementById("header-gallery-checkbox")
    const headerGalleryDiv = document.getElementById('header-gallery-checkbox').nextElementSibling
    headerGalleryDiv.innerHTML = headerCheckbox.checked ? plannerSvg + 'Planner' : gallerySvg + 'Gallery'
    headerCheckbox.checked ? showSection('gallery') : showSection('planner')
    //showSection(document.getElementById('current-section').textContent)

    const select = document.getElementById('gallery-year-filter');
    select.querySelector('option[value="2026"]').selected = true;
    select.dispatchEvent(new Event('change'))
}

export function galleryLogic(data) {
    const skinsData = data.skinsData
    const charData = data.charData

    // ────────✦───────✦───────✦────────
    //  Brands
    // ────────✦───────✦───────✦────────

    const brandFilter = document.getElementById('gallery-brand-filter')
    const brandData = skinsData.brands
    const brandArray = [...brandData]
    brandArray
        .sort()                    // ordena alfabéticamente (A → Z)
        .forEach(brand => {
            brandFilter.innerHTML += `<option value="${brand}">${brand}</option>`;
        });

    let selectedBrand = ''
    brandFilter.addEventListener("change", brand => {
        selectedBrand = brandFilter.value
        revealItem()
    })

    // ────────✦───────✦───────✦────────
    //  Artists
    // ────────✦───────✦───────✦────────

    const artistFilter = document.getElementById('gallery-artist-filter')
    const artistsData = skinsData.artists
    artistsData.forEach(artist => {
        artistFilter.innerHTML += `<option value="${artist}">${artist}</option>`
    });

    let selectedArtist = ''
    artistFilter.addEventListener("change", artist => {
        selectedArtist = artistFilter.value
        revealItem()
    })

    // ────────✦───────✦───────✦────────
    //  Rarity
    // ────────✦───────✦───────✦────────

    const rarityFilter = document.getElementById('gallery-rarity-filter')
    const raritiesData = ["TIER_1", "TIER_2", "TIER_3", "TIER_4", "TIER_5", "TIER_6"]
    raritiesData.forEach(rarity => {
        rarityFilter.innerHTML += `<option value="${rarity}">${rarity}</option>`
    });

    let selectedRarity = ''
    rarityFilter.addEventListener("change", rarity => {
        selectedRarity = rarityFilter.value
        revealItem()
    })

    // ────────✦───────✦───────✦────────
    //  Price
    // ────────✦───────✦───────✦────────

    const priceFilter = document.getElementById('gallery-price-filter')
    const pricesData = [0, 15, 18, 21, 24, '$30']
    pricesData.forEach(price => {
        priceFilter.innerHTML += `<option value="${price}">${price}</option>`
    });

    let selectedPrice = ''
    priceFilter.addEventListener("change", rarity => {
        selectedPrice = priceFilter.value
        revealItem()
    })

    // ────────✦───────✦───────✦────────
    //  year
    // ────────✦───────✦───────✦────────

    const yearFilter = document.getElementById('gallery-year-filter')
    // const yearsData = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
    // yearsData.forEach(year => {
    //     yearFilter.innerHTML += `<option value="${year}">${year}</option>`
    // });

    let selectedYear = ''
    yearFilter.addEventListener("change", rarity => {
        selectedYear = yearFilter.value
        revealItem()
    })


    const plannerIdMap = Object.entries(skinsData.plannerIdMap).map(([name, plannerId]) => ({ name, plannerId }));
    plannerIdMap.slice().reverse().forEach(plannerIdObject => {
        const skinName = plannerIdObject.name
        const plannerId = plannerIdObject.plannerId
        // if (plannerId.plannerId.includes("amiya")) console.log(plannerId)
        //document.getElementById('gallery-skins').append(gallerySkin(skinsData, plannerId, charData))
        const skinObject = findSkinByName(skinsData.cnData, plannerIdObject.name)
        const modelName = skinObject.displaySkin.modelName
        //console.log("data.charData", data.charData)
        const charObject = getCharObject(skinObject.displaySkin.modelName.toLowerCase(), data.charData)
        const colors = getColorList(skinObject.displaySkin.colorList)

        skinObject.colors = colors


        let skinGroupId = skinObject.displaySkin.skinGroupId.split('#')[1]
        if (skinGroupId == "as") skinGroupId = "ambienceSynesthesia"
        const brand = skinsData.cnData.brandList[skinGroupId]?.brandCapitalName || 'CROSSOVER'
        const artist = skinObject.displaySkin.drawerList.join(', ')
        const rarity = charObject.rarity
        const price = skinObject.price
        const year = getYearFromTimestamp(skinObject.displaySkin.getTime)


        const template = document.getElementById('gallery-skin-template');
        const clone = template.content.cloneNode(true);
        clone.querySelector('.gallery-name').textContent = modelName
        clone.querySelector('img').alt = SKIN_ICON_REPOSITORY(plannerId)

        drawSkinTopBackground(clone.querySelector('.gallery-name-canvas'), skinObject)
        drawSkinBackground(clone.querySelector('.gallery-icon-canvas'), skinObject)

        const button = clone.querySelector('button')
        button.setAttribute('data-brand', brand)
        button.setAttribute('data-artist', artist)
        button.setAttribute('data-rarity', rarity)
        button.setAttribute('data-price', price)
        button.setAttribute('data-year', year)
        //button.style.border = "1px solid"
        // linear-gradient(to right, #ff6b6b, #4ecdc4) border-box,  /* ← gradiente del borde */ #ffffff padding-box
        button.style.background = `linear-gradient(${'90deg'}, ${colors.join(', ')}) border-box, #ffffff padding-box`


        button.onclick = () => {
            showSection('viewer')
            viewer(plannerId, skinName, skinsData, charData);
        }

        document.getElementById('gallery-skins').append(clone)
    });


    let searchTerm = ""

    document.getElementById('gallery-search-bar').addEventListener('input', function () {
        searchTerm = this.value.toLowerCase().trim();
        //debug({ searchTerm })
        revealItem()
    });

    function revealItem() {

        const buttons = document.querySelectorAll('#gallery-skins button');

        buttons.forEach(button => {
            const itemName = button.querySelector('.gallery-name').textContent.toLowerCase().trim()
            itemName.includes(searchTerm) ? visible(button) : invis(button);

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

                const rarityMatch = (
                    button.getAttribute('data-rarity') === selectedRarity ||
                    selectedRarity === 'all' ||
                    selectedRarity === ''
                );

                const priceMatch = (
                    button.getAttribute('data-price') === selectedPrice ||
                    selectedPrice === 'all' ||
                    selectedPrice === ''
                );

                const yearMatch = (
                    button.getAttribute('data-year') === selectedYear ||
                    selectedYear === 'all' ||
                    selectedYear === ''
                );

                const shouldBeVisible = brandMatch && artistMatch && rarityMatch && priceMatch && yearMatch;

                shouldBeVisible ? visible(button) : invis(button);
            }

        });
    }
}