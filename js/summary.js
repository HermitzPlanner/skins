import { resetDiv, showSection, getNameWithPlannerId, findSkinByName, getColorList, drawSkinTopBackground, drawSkinBackground } from "./utils.js";
import { RESIZED_EVENT_REPOSITORY, SKIN_ICON_REPOSITORY } from "./constants.js";
import { viewer } from "./viewer.js";
//import { summaryRow } from "./fragments.js";

export function summary(data) {
    //document.getElementById('current-section').textContent = 'summary'

    const gallerySvg = `<img class="svg" src="https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/gallery.svg" alt="Gallery SVG">`
    const plannerSvg = `<img class="svg" src="https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/planner.svg" alt="Gallery SVG">`

    const headerCheckbox = document.getElementById("header-gallery-checkbox")
    const headerGalleryDiv = document.getElementById('header-gallery-checkbox').nextElementSibling
    headerGalleryDiv.innerHTML = plannerSvg + 'Planner' 
    headerCheckbox.checked = true
    
    resetDiv('summary');

    const container = document.getElementById('summary');

    const button = document.createElement('button')
    button.classList.add('toggle-button')
    button.style.width = "fit-content"
    button.style.margin = '10px auto'
    //button.style.marginTop = '10px'
    button.style.fontSize = '110%'
    button.onclick = () => showSection('planner');

    button.textContent = 'Back to planner'

    //container.append(button)

    const selectedSkins = [];
    document.querySelectorAll('input[name="skin-cbox"]').forEach(skinCbox => {
        if (skinCbox.checked) {
            selectedSkins.push({
                plannerId: skinCbox.getAttribute('data-plannerId'),
                eventId: skinCbox.parentElement.getAttribute('data-event'),
                modelName: skinCbox.parentElement.getAttribute('data-model'),
                eventName: skinCbox.parentElement.getAttribute('data-eventName'),
            });
        }
    });

    const groupedEvents = selectedSkins.reduce((acc, { plannerId, eventId, modelName, eventName }) => {
        if (!acc[eventId]) {
            acc[eventId] = {
                planners: [], // Store objects with plannerId and modelName
                eventName: eventName
            };
        }
        acc[eventId].planners.push({ plannerId, modelName });
        return acc;
    }, {});

    Object.entries(groupedEvents).forEach(([eventId, { planners, eventName }]) => {

        renderSummaryEvent(container, eventId, planners, eventName, data)




        //container.append(summaryRow(eventId, planners, eventName, data));
    });

    //debug(groupedEvents);
}

function renderSummaryEvent(container, eventId, planners, eventName, data) {
    const template = document.getElementById("summary-event-template")
    const clone = template.content.cloneNode(true)

    clone.querySelector('.summary-row').style.setProperty('--bg-url', `url('https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/events/${eventId}.jpg')`)
    clone.querySelector('.name').textContent = eventName
    clone.querySelector('img').src = RESIZED_EVENT_REPOSITORY(eventId)
    
    const calcsDiv = clone.querySelector('.calcs-div')
    calcsDiv.style.marginLeft = "0"
    calcsDiv.style.paddingLeft = '0'
    calcsDiv.style.borderLeft = 'none'
    //calcsDiv.style.filter = 'invert(1)'
    calcsDiv.style.position = 'absolute'
    calcsDiv.style.top = '107px'
    //calcsDiv.style.left = '211px'
    calcsDiv.style.flexDirection = 'row'
    calcsDiv.style.gap = '61px'
    calcsDiv.style.backdropFilter = 'blur(8px) brightness(0.5)' 

    clone.querySelectorAll('.calcs-row').forEach(element => {
        element.style.width = '100px'
        element.style.background = 'none'
        element.style.borderRadius = '0'
    });

    clone.querySelector('.span-expense').textContent = document.getElementById(`expense-${eventId}`).textContent
    clone.querySelector('.span-balance').textContent = document.getElementById(`balance-${eventId}`).textContent
    
    clone.querySelector('.income').remove()

    planners.forEach(planner => {
        renderSummarySkin(clone.querySelector('.summary-row'), planner, data)
    });

    container.append(clone)
}

function renderSummarySkin(eventRowClone, planner, data) {

    const skinName = getNameWithPlannerId(planner.plannerId, data)
    const skinObject = findSkinByName(data.skinsData.cnData, skinName)
    const colors = getColorList(skinObject.displaySkin.colorList)

    skinObject.colors = colors

    const template = document.getElementById("summary-skin-template")
    const clone = template.content.cloneNode(true)

    clone.querySelector('.name').textContent = planner.modelName
    clone.querySelector('.summary-icon').src = SKIN_ICON_REPOSITORY(planner.plannerId)
    clone.querySelector('.summary-skin').style.background = `linear-gradient(${'90deg'}, ${colors.join(', ')}) border-box, #ffffff padding-box`

    drawSkinTopBackground(clone.querySelector('.gallery-name-canvas'), skinObject)
    drawSkinBackground(clone.querySelector('.gallery-icon-canvas'), skinObject)

    const button = clone.querySelector('button')
    button.onclick = () => {
        document.getElementById("current-section").textContent = "summary"
        showSection('viewer')
        viewer(planner.plannerId, skinName, data.skinsData, data.charData);
    }

    eventRowClone.append(clone)
}
