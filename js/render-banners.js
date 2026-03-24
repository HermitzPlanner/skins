
import { getCharObjectWithName, drawSkinBackground, drawSkinBottomBackground, setLightness, missingElementCheck, getTopColors } from "./utils.js";
import { CHAR_ICON_REPOSITORY, CHAR_PORTRAIT_REPOSITORY, CHAR_PORTRAIT_REPOSITORY_2 } from "./constants.js";

export function renderBanners(data, event) {

    const sixStars = event.rateUps.sixStars
    if (sixStars) {
        sixStars.forEach(char => {
            if (char.includes("[限定]")) char.replace(" [限定]", "")
            const charObject = getCharObjectWithName(char, data.charData)
            charObject.colors = ["#ff4000", "#df7020", "#9f8060"]
            renderPlannerSkin(event, charObject)
        });
    }

    const fiveStars = event.rateUps.fiveStars
    if (fiveStars) {
        fiveStars.forEach(char => {
            const charObject = getCharObjectWithName(char, data.charData)
            charObject.colors = ["#ffaa00", "#dfbf20", "#b3aa80"]
            renderPlannerSkin(event, charObject)
        });
    }

    const fourStars = event.rateUps.fourStars
    if (fourStars) {
        fourStars.forEach(char => {
            const charObject = getCharObjectWithName(char, data.charData)
            charObject.colors = ["hsl(260, 100%, 50%)", "#7f20df", "#b380b3"]
            renderPlannerSkin(event, charObject)
        });
    }

}

function renderPlannerSkin(event, charObject, size = "portrait-size") { //eventSkin, event, data, size = "portrait-size"

    //console.log("charObject", charObject)

    const darkColors = charObject.colors.map(color => setLightness(color, 0.10, 0.80));
    const gradientDirection = "130deg" // "45deg"

    const rarityNumber = charObject.rarity.match(/\d+/)[0]
    const shortName = charObject.appellation.replace(" The ", " ").replace(" the ", " ")

    const template = document.getElementById('planner-skin-template');
    const clone = template.content.cloneNode(true);

    clone.querySelector('label').setAttribute('data-event', event.code)
    //clone.querySelector('label').setAttribute('data-model', charObject.modelNameEnglish)
    clone.querySelector('label').setAttribute('data-eventName', event.nameEnglish)
    clone.querySelector('label').style.borderImage = `linear-gradient(${gradientDirection}, ${charObject.colors.join(', ')}) 1`
    //clone.querySelector('label').setAttribute('data-price', NO_EFFECT_SKINS.includes(charObject.plannerId) ? '15' : data.skinsData.costMap[charObject.name])
    //clone.querySelector('input').setAttribute('data-plannerId', charObject.plannerId)
    //clone.querySelector('input').id = event.code + '-' + charObject.plannerId
    //clone.querySelector('.skin-name.mandarin').textContent = charObject.name
    //clone.querySelector('.skin-name.english').textContent = charObject.nameEnglish
    //clone.querySelector('.model-name.mandarin').textContent = charObject.modelName
    clone.querySelector('.model-name.english').textContent = shortName
    clone.querySelector('.model-name.english').style.borderImage = `linear-gradient(${gradientDirection}, ${charObject.colors.join(', ')}) 1`
    //clone.querySelector('.planner-id').textContent = charObject.plannerId
    clone.querySelector('.skin-portrait').alt = CHAR_PORTRAIT_REPOSITORY_2(charObject.name) // CHAR_PORTRAIT_REPOSITORY(charObject.potentialItemId.split("_").slice(1).join("_"))

    //clone.querySelector('.planner-skin-event-code').textContent = event.code
    clone.querySelector('.skin-price').innerHTML = `<img style="margin: -2px; height: 23px;" src="static/gacha_detail_hub/star_${rarityNumber}.png">`
    clone.querySelector('.skin-price').style.background = `linear-gradient(${gradientDirection}, ${charObject.colors.slice(0, 2).join(', ')})`
    clone.querySelector('.skin-price').style.padding = "0px"
    clone.querySelector('.skin-price').style.height = '19px'
    clone.querySelector('.skin-inspect').style.background = `linear-gradient(${gradientDirection}, ${darkColors.slice(-2).join(', ')})`
    //clone.querySelector('button').onclick = () => {
    //    showSection('viewer')
    //    viewer(charObject.plannerId, charObject.name, data.skinsData, data.charData);
    //    lastSection = 'planner'
    //}

    drawSkinBackground(clone.querySelector('canvas'), charObject)
    drawSkinBottomBackground(clone.querySelector('.planner-skin-name-canvas'), charObject)

    document.getElementById('container-of-skins').append(clone)

    /*
    const art = "立绘"
    const icon = "头像"
    const portrait = "半身像"
    */

    const missingSkin = {
        ["立绘"]: charObject.name,
        ["半身像"]: charObject.name,
        ["头像"]: charObject.name,
        "plannerId": charObject.name,
    }

    missingElementCheck(missingSkin, CHAR_PORTRAIT_REPOSITORY_2(charObject.name))
}