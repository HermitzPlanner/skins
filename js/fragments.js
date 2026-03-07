import { findSkinByName, showSection } from "./utils.js"
import { SKIN_ICON_REPOSITORY, RESIZED_EVENT_REPOSITORY } from "./constants.js"
import { viewer } from "./viewer.js"

const create = (parent, tag, text = "", classes = "", inputType = '') => {
    const e = document.createElement(tag)
    if (tag !== 'img') {
        e.innerHTML = text

    }
    if (tag === "img") {
        //e.src = text; // Only set src if valid
        e.alt = text; // Consider a more descriptive alt text
        e.loading = "lazy";

    }
    if (classes !== '') e.className = classes
    if (inputType !== '') e.type = inputType
    parent.append(e)

    return e
}

export const gallerySkin = (skinsData, data, charData) => {
    const skinName = data.name
    const skinObject = findSkinByName(skinsData.cnData, data.name)
    const button = document.createElement('button')
    //button.classList.add('show-block')
    const modelName = ""
    const modelNameEnglish = data.plannerId // skinObject.displaySkin.modelName
    //console.log(data.plannerId)
    const plannerId = data.plannerId
    const img = SKIN_ICON_REPOSITORY(plannerId)

    let skinGroupId = skinObject.displaySkin.skinGroupId.split('#')[1]
    if (skinGroupId == "as") skinGroupId = "ambienceSynesthesia"
    const brand = skinsData.cnData.brandList[skinGroupId]?.brandCapitalName || 'CROSSOVER'
    const artist = skinObject.displaySkin.drawerList.join(', ')

    button.setAttribute('data-brand', brand)
    button.setAttribute('data-artist', artist)

    create(button, 'div', modelNameEnglish, 'gallery-name')
    create(button, 'img', img)



    button.onclick = () => {
        showSection('viewer')
        viewer(plannerId, skinName, skinsData, charData);
    }

    // ====================================================
    //missingElementCheck(missingSkin, img)
    // ====================================================

    return button
}

export const summaryRow = (eventId, planners, eventName) => {
    const row = document.createElement('div')
    row.classList.add('summary-row')
    //create(row, 'div', eventId)

    const eventDiv = document.createElement('div')
    eventDiv.classList.add('summary-event')

    create(eventDiv, 'div', eventName, 'name')
    //create(eventDiv, 'img', eventrepo(eventId))
    const summaryEventImage = document.createElement("img")
    summaryEventImage.src = RESIZED_EVENT_REPOSITORY(eventId)

    eventDiv.append(summaryEventImage)

    row.append(eventDiv)

    planners.forEach(planner => {
        const skinDiv = document.createElement('div')
        skinDiv.classList.add('summary-skin')

        create(skinDiv, 'div', planner.modelName, 'name')
        const summarySkinImage = document.createElement("img")
        summarySkinImage.src = SKIN_ICON_REPOSITORY(planner.plannerId)
        skinDiv.append(summarySkinImage)
        //create(skinDiv, 'img', imgrepo('icon', planner.plannerId))


        row.append(skinDiv)
    });

    return row
}
