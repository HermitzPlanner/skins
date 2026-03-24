import { findSkinByName, showSection, getNameWithPlannerId } from "./utils.js"
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

export const summaryRow = (eventId, planners, eventName, data) => {
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
        const skinName = getNameWithPlannerId(planner.plannerId, data)
        console.log("planner.modelName", planner)
        const skinDiv = document.createElement('div')
        skinDiv.classList.add('summary-skin')
        skinDiv.style.position = 'relative'

        create(skinDiv, 'div', planner.modelName, 'name')
        const summarySkinImage = document.createElement("img")
        summarySkinImage.className = "summary-icon"
        summarySkinImage.src = SKIN_ICON_REPOSITORY(planner.plannerId)
        skinDiv.append(summarySkinImage)

        const button = document.createElement("button")
        button.className = 'skin-inspect'
        button.style.background = "linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(24, 24, 24, 0.8))";
        button.style.top = "30px"

        const inspectImg = document.createElement("img")
        inspectImg.src = "https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/search.svg"
        inspectImg.className = "skin-inspect-img"

        button.append(inspectImg)

        button.onclick = () => {
            document.getElementById("current-section").textContent = "summary"
            showSection('viewer')
            viewer(planner.plannerId, skinName, data.skinsData, data.charData);
            lastSection = 'planner'
        }


        skinDiv.append(button)
        //create(skinDiv, 'img', imgrepo('icon', planner.plannerId))


        row.append(skinDiv)
    });

    return row
}
