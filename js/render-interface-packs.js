import { isMobile } from "./main.js";
export function renderInterfacePacks(data, event) {

    if (!isMobile) {
const templateBreak = document.getElementById('planner-brand-template');
    const cloneBreak = templateBreak.content.cloneNode(true);
    const bgLink = `https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/event-bg/${event.code}`
    const bgLink2 = `https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/events/${event.code}`
    //const outfitAmount = eventSkin.isMultiple ? "outfits" : "outfit";
    //cloneBreak.querySelector(".planner-brand-name").textContent = eventSkin.name
    cloneBreak.querySelector(".planner-brand-image").remove()
    cloneBreak.querySelector(".planner-brand-type").innerHTML = `ui <br> pack`
    //cloneBreak.querySelector(".planner-brand-image").src = `static/img/brands/${eventSkin.name}.png`
    cloneBreak.querySelector('.planner-brand').style.setProperty('--bg-url', `url('')` /* `url('${bgLink2}.jpg')`*/)
    cloneBreak.querySelector(".planner-brand").setAttribute('data-event', event.code)
    cloneBreak.querySelector(".break").setAttribute('data-event', event.code)
    document.getElementById('container-of-skins').append(cloneBreak)
    }
    




    const template = document.getElementById('planner-skin-template');
    const clone = template.content.cloneNode(true);

    const label = clone.querySelector('label')
    label.id = event.code + "-interface-label"
    label.setAttribute('data-event', event.code)
    label.setAttribute('data-model', "interface")
    label.setAttribute('data-eventName', event.nameEnglish)
    label.style.width = "fit-content"
    label.style.height = "fit-content"

    const input = clone.querySelector('input')
    input.setAttribute('data-plannerId', event.code + "-interface")
    input.id = event.code + '-interface'

    const uiPacksrc = "https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/interfacePacks/resized/resized_" + event.code + "-interface.jpg"
    clone.querySelector('.skin-portrait').alt = uiPacksrc
    clone.querySelector('.skin-portrait').style.width = "unset"

    const isMoneyPack = /[¥$]/.test(event.interfacePackPrice)
    label.setAttribute('data-price', isMoneyPack ? 0 : event.interfacePackPrice)
    clone.querySelector('.skin-price').textContent = isMoneyPack ? "" : event.interfacePackPrice
    clone.querySelector('.skin-price').style.width = isMoneyPack ? "0" : "fit-content"

    clone.querySelector('.model-name.english').style.display = "none"
    clone.querySelector('.skin-inspect').style.display = "none"
clone.querySelector('.planner-skin-name-canvas').remove()


    document.getElementById('container-of-skins').append(clone)
}