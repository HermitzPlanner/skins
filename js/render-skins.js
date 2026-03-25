import { checkedCboxStyle, uncheckedCboxStyle, resetAll, revealIfElementMatchesEvent, findSkinByName, getColorList, checkedSkin, uncheckedSkin, getEditionFromTimestamp, showSection, drawSkinBackground, drawSkinBottomBackground, setLightness, missingElementCheck, getCharObject } from "./utils.js"

import { NO_EFFECT_SKINS, RESIZED_EVENT_REPOSITORY, SKIN_ICON_REPOSITORY, SKIN_PORTRAIT_REPOSITORY, CERT_SKINS } from "./constants.js";
import { viewer } from "./viewer.js";


export function renderSkins(data, event) {
    //if (event.nameEnglish.startsWith('Fashion')) {

    //    renderFashionSkins(data, event)

    //} else {
    event.skins.forEach((eventSkin, skinIndex) => {
        if (eventSkin.isBrand) {
            renderBrandLogos(skinIndex, eventSkin, event)
        } else {
            renderPlannerSkin(eventSkin, event, data, 'portrait-size')
            //document.getElementById("container-of-skins").append(skinContainer(event, eventSkin.name, data.skinsData, 'portrait', eventSkin.operator, eventSkin.isRerun, eventSkin.getFromPack, data.charData))
        }
    });
    //}
}

function createHoverEffect() {

}

function renderPlannerSkin(eventSkin, event, data) {

    const template = document.getElementById('planner-skin-template');
    const clone = template.content.cloneNode(true);

    const label = clone.querySelector('label')
    label.setAttribute('data-event', event.code)
    label.setAttribute('data-model', eventSkin.modelNameEnglish)
    label.setAttribute('data-eventName', event.nameEnglish)
    label.setAttribute('data-price', eventSkin.price)
    label.setAttribute('data-year', eventSkin.year)
    label.setAttribute(event.nameEnglish.includes("Fashion Review") ? 'data-is-fashion' : 'data-regular-skin', "true")
    label.addEventListener("mouseenter", function () {
        let angle = 90;
        let opacity = 0
        let colorIndex = 0

        const modelNameBorder = label.querySelector('.model-name.english')
        const effectOverlay = label.querySelector('.effect-overlay')

        label.style.boxShadow = `6px 6px 4px rgba(0, 0, 0, 0.7), -1px -1px 7px 0px ${eventSkin.colors[0]}`
        modelNameBorder.style.borderImage = `linear-gradient(${angle}deg, ${eventSkin.colors.join(', ')}) 1`;

        const interval = setInterval(() => {
            angle = (angle + 1) % 360;  // +5 cada ~30ms → ~2.4 segundos por vuelta
            opacity < 0.1 ? opacity = opacity + 0.005 : opacity = opacity
            label.style.borderImage = `linear-gradient(${angle}deg, ${eventSkin.colors.join(', ')}) 1`;
            modelNameBorder.style.borderImage = `linear-gradient(${angle}deg, ${eventSkin.colors.join(', ')}) 1`;

            effectOverlay.style.opacity = opacity
            effectOverlay.style.background = `linear-gradient(${angle}deg, ${eventSkin.colors.join(', ')})`

        }, 15);

        const interval2 = setInterval(() => {
            colorIndex = (colorIndex + 1) % eventSkin.colors.length
            //label.style.boxShadow = `6px 6px 4px rgba(0, 0, 0, 0.7), -0px -0px 12px 0px ${eventSkin.colors[colorIndex]}`; // // hsl(${hueArray[colorIndex]}, 100%, 50%) 
            label.style.boxShadow = `6px 6px 4px rgba(0, 0, 0, 0.7), -0px -0px 7px 0px ${eventSkin.colors[colorIndex]}`; // // hsl(${hueArray[colorIndex]}, 100%, 50%) 

        }, 1000);

        label.addEventListener("mouseleave", () => {
            clearInterval(interval);
            clearInterval(interval2);
            label.style.borderImage = eventSkin.borderGradient
            label.style.boxShadow = `6px 6px 4px rgba(0, 0, 0, 0.7)`;
            effectOverlay.style.opacity = 0
        }, { once: true });
    });
    label.style.borderImage = eventSkin.borderGradient

    const input = clone.querySelector('input')
    input.setAttribute('data-plannerId', eventSkin.plannerId)
    input.id = event.code + '-' + eventSkin.plannerId
    
    clone.querySelector('.skin-name.mandarin').textContent = eventSkin.name
    clone.querySelector('.skin-name.english').textContent = eventSkin.nameEnglish
    clone.querySelector('.model-name.english').textContent = eventSkin.modelNameEnglish
    clone.querySelector('.model-name.english').style.borderImage = eventSkin.borderGradient
    clone.querySelector('.planner-id').textContent = eventSkin.plannerId
    clone.querySelector('.skin-portrait').alt = eventSkin.portraitRepository
    clone.querySelector('.planner-skin-event-code').textContent = event.code
    clone.querySelector('.planner-skin-profession').src = eventSkin.professionImage
    clone.querySelector('.planner-skin-profession').style.background = eventSkin.linearGradientArraySliceTwo
    clone.querySelector('.skin-price').textContent = eventSkin.price
    clone.querySelector('.skin-price').style.background = eventSkin.linearGradientArraySliceTwo
    clone.querySelector('.skin-inspect').style.background = eventSkin.linearGradientDarkSliceTwo
    clone.querySelector('.effect-overlay').style.background = eventSkin.linearGradientArray

    if (eventSkin.price == 0) {
        clone.querySelector('.skin-price').remove()
        clone.querySelector('.planner-skin-profession').style.top = '0'
    }

    clone.querySelector('button').onclick = () => {
        showSection('viewer')
        viewer(eventSkin.plannerId, eventSkin.name, data.skinsData, data.charData);
    }

    // ────────✦───────✦───────✦────────
    // draw canvases and append
    // ────────✦───────✦───────✦────────

    drawSkinBackground(clone.querySelector('canvas'), eventSkin)
    drawSkinBottomBackground(clone.querySelector('.planner-skin-name-canvas'), eventSkin)

    document.getElementById('container-of-skins').append(clone)

    // ────────✦───────✦───────✦────────
    //  art = "立绘" icon = "头像" portrait = "半身像"
    // ────────✦───────✦───────✦────────

    const missingSkin = {
        ["立绘"]: eventSkin.modelName.replace("升变状态", "").replace(/（/g, "(").replace(/）/g, ")"),
        ["半身像"]: eventSkin.modelName.replace("升变状态", "").replace(/（/g, "(").replace(/）/g, ")"),
        ["头像"]: eventSkin.modelName.replace("升变状态", "").replace(/（/g, "(").replace(/）/g, ")"),
        "plannerId": eventSkin.plannerId
    }

    missingElementCheck(missingSkin, SKIN_PORTRAIT_REPOSITORY(eventSkin.plannerId))
}

function renderFashionSkins0(data, event) {
    let lastYear = 0
    function getYearFromTimestamp(timestamp) {

        return new Date(timestamp * 1000).getFullYear();
    }




    const fashionNumber = event.nameEnglish.split(' ').pop()
    const skinsData = data.skinsData.cnData.charSkins
    //const sortedDataSkins = Object.entries(skinsData)
    //    .sort(([, a], [, b]) => a.displaySkin.getTime - b.displaySkin.getTime)
    //    .map(([key, skin]) => skin);

    let counter = 0

    const sortedDataSkins = Object.entries(skinsData)
        .sort(([, a], [, b]) => b.displaySkin.getTime - a.displaySkin.getTime)
        .map(([key, skin]) => skin);

    Object.entries(sortedDataSkins).forEach(([key, value]) => {
        if (!value.isBuySkin) return
        const displaySkin = value.displaySkin
        if (displaySkin.skinName == '十字郡' || CERT_SKINS.includes(displaySkin.skinName)) return
        const getTime = displaySkin.getTime
        const year = getYearFromTimestamp(getTime)
        const edition = getEditionFromTimestamp(getTime);
        const skinGroupId = displaySkin.skinGroupId
        const brand = data.skinsData.cnData.brandList[skinGroupId?.split('#')[1]]?.brandCapitalName || 'CROSSOVER'
        const crossoverSkinsThatAreFashion = [
            '漆黑热浪',
            '无言狂响',
            '爆裂菲林',
            '乌萨斯IO79',
            '自由//失效',
            '惬意'
        ]
        if (brand == 'CROSSOVER' && !crossoverSkinsThatAreFashion.includes(displaySkin.skinName)) return

        let price = 0
        if (displaySkin.obtainApproach == '采购中心') {
            price = 18
            if (value.dynIllustId) price = 21
            if (value.dynEntranceId) price = 24
        }

        if (displaySkin.skinName == '惬意') price = 18

        if (price !== 18) return
        if (edition == 0) return
        if (edition > fashionNumber) return

        if (year !== lastYear) {
            //planner-brand-template
            const templateYear = document.getElementById('planner-brand-template');
            const cloneYear = templateYear.content.cloneNode(true);

            if (counter > 0) {
                cloneYear.querySelector('.break').style.outline = '1px dashed #ffffff38'
                cloneYear.querySelector('.break').style.margin = '15px 0'
            }
            counter++
            cloneYear.querySelector(".planner-brand-name").remove() //.textContent = "eventSkin.name"
            cloneYear.querySelector(".planner-brand-type").innerHTML = 'Year ' + (year - 2019) + '<br>' + year
            cloneYear.querySelector(".planner-brand-image").remove()
            //clone.querySelector(".planner-brand-image").src = `static/img/brands/${eventSkin.name}.png`
            cloneYear.querySelector('.planner-brand').style.setProperty('--bg-url', `url('')` /* `url('${bgLink2}.jpg')`*/)

            cloneYear.querySelector(".planner-brand").setAttribute('data-event', event.code)



            cloneYear.querySelector(".break").setAttribute('data-event', event.code)
            document.getElementById("container-of-skins").appendChild(cloneYear)
        }

        lastYear = year

        const skinName = displaySkin.skinName

        if (skinName == '守岁人') console.log(value)
        const plannerId = data.skinsData.plannerIdMap[skinName]
        const colors = getColorList(displaySkin.colorList)
        const darkColors = colors.map(color => setLightness(color, 0.10, 0.80));
        const gradientDirection = "to right" // "45deg"
        const modelNameEnglish = displaySkin.modelName

        const template = document.getElementById('planner-skin-template');
        const clone = template.content.cloneNode(true);

        // ────────✦───────✦───────✦────────✦────────✦────────✦────────✦────────✦────────
        // Copypasted from renderPlannerSkin, quick fix for now. merge both in the future
        // ────────✦───────✦───────✦────────✦────────✦────────✦────────✦────────✦────────

        clone.querySelector('label').setAttribute('data-event', event.code)
        clone.querySelector('label').setAttribute('data-model', eventSkin.modelNameEnglish)
        clone.querySelector('label').setAttribute('data-eventName', event.nameEnglish)
        clone.querySelector('label').setAttribute('data-price', eventSkin.price)
        clone.querySelector('label').style.borderImage = eventSkin.borderGradient
        clone.querySelector('label').addEventListener("mouseenter", function () {
            let angle = 90;
            let opacity = 0
            let colorIndex = 0

            const label = this;
            const modelNameBorder = label.querySelector('.model-name.english')
            const effectOverlay = label.querySelector('.effect-overlay')

            label.style.boxShadow = `6px 6px 4px rgba(0, 0, 0, 0.7), -1px -1px 7px 0px ${eventSkin.colors[0]}`
            modelNameBorder.style.borderImage = `linear-gradient(${angle}deg, ${eventSkin.colors.join(', ')}) 1`;

            const interval = setInterval(() => {
                angle = (angle + 1) % 360;  // +5 cada ~30ms → ~2.4 segundos por vuelta
                opacity < 0.1 ? opacity = opacity + 0.005 : opacity = opacity
                label.style.borderImage = `linear-gradient(${angle}deg, ${eventSkin.colors.join(', ')}) 1`;
                modelNameBorder.style.borderImage = `linear-gradient(${angle}deg, ${eventSkin.colors.join(', ')}) 1`;

                effectOverlay.style.opacity = opacity
                effectOverlay.style.background = `linear-gradient(${angle}deg, ${eventSkin.colors.join(', ')})`

            }, 15);

            const interval2 = setInterval(() => {
                colorIndex = (colorIndex + 1) % eventSkin.colors.length
                //label.style.boxShadow = `6px 6px 4px rgba(0, 0, 0, 0.7), -0px -0px 12px 0px ${eventSkin.colors[colorIndex]}`; // // hsl(${hueArray[colorIndex]}, 100%, 50%) 
                label.style.boxShadow = `6px 6px 4px rgba(0, 0, 0, 0.7), -0px -0px 7px 0px ${eventSkin.colors[colorIndex]}`; // // hsl(${hueArray[colorIndex]}, 100%, 50%) 

            }, 1000);

            label.addEventListener("mouseleave", () => {
                clearInterval(interval);
                clearInterval(interval2);
                label.style.borderImage = eventSkin.borderGradient
                label.style.boxShadow = `6px 6px 4px rgba(0, 0, 0, 0.7)`;
                effectOverlay.style.opacity = 0
            }, { once: true });
        });

        clone.querySelector('input').setAttribute('data-plannerId', eventSkin.plannerId)
        clone.querySelector('input').id = event.code + '-' + eventSkin.plannerId
        clone.querySelector('.skin-name.mandarin').textContent = eventSkin.name
        clone.querySelector('.skin-name.english').textContent = eventSkin.nameEnglish
        clone.querySelector('.model-name.english').textContent = eventSkin.modelNameEnglish
        clone.querySelector('.model-name.english').style.borderImage = eventSkin.borderGradient
        clone.querySelector('.planner-id').textContent = eventSkin.plannerId
        clone.querySelector('.skin-portrait').alt = eventSkin.portraitRepository
        clone.querySelector('.planner-skin-event-code').textContent = event.code
        clone.querySelector('.planner-skin-profession').src = eventSkin.professionImage
        clone.querySelector('.planner-skin-profession').style.background = eventSkin.linearGradientArraySliceTwo
        clone.querySelector('.skin-price').textContent = eventSkin.price
        clone.querySelector('.skin-price').style.background = eventSkin.linearGradientArraySliceTwo
        clone.querySelector('.skin-inspect').style.background = eventSkin.linearGradientDarkSliceTwo
        clone.querySelector('.effect-overlay').style.background = eventSkin.linearGradientArray

        if (eventSkin.price == 0) {
            clone.querySelector('.skin-price').remove()
            clone.querySelector('.planner-skin-profession').style.top = '0'
        }


        const eventSkin = {
            width: 180,
            height: 360,
            colors: colors
        }

        drawSkinBackground(clone.querySelector('canvas'), eventSkin)
        drawSkinBottomBackground(clone.querySelector('.planner-skin-name-canvas'), eventSkin)


        document.getElementById("container-of-skins").appendChild(clone);
    });

}
const fashionReviewArray = []
function renderFashionSkins(data, event) {
    let lastYear = 0
    function getYearFromTimestamp(timestamp) {

        return new Date(timestamp * 1000).getFullYear();
    }




    const fashionNumber = event.nameEnglish.split(' ').pop()
    const skinsData = data.skinsData.cnData.charSkins
    //const sortedDataSkins = Object.entries(skinsData)
    //    .sort(([, a], [, b]) => a.displaySkin.getTime - b.displaySkin.getTime)
    //    .map(([key, skin]) => skin);

    let counter = 0

    const sortedDataSkins = Object.entries(skinsData)
        .sort(([, a], [, b]) => b.displaySkin.getTime - a.displaySkin.getTime)
        .map(([key, skin]) => skin);

    Object.entries(sortedDataSkins).forEach(([key, value]) => {
        if (!value.isBuySkin) return
        const displaySkin = value.displaySkin
        if (displaySkin.skinName == '十字郡' || CERT_SKINS.includes(displaySkin.skinName)) return
        const getTime = displaySkin.getTime
        const year = getYearFromTimestamp(getTime)
        const edition = getEditionFromTimestamp(getTime);
        const skinGroupId = displaySkin.skinGroupId
        const brand = data.skinsData.cnData.brandList[skinGroupId?.split('#')[1]]?.brandCapitalName || 'CROSSOVER'
        const crossoverSkinsThatAreFashion = [
            '漆黑热浪',
            '无言狂响',
            '爆裂菲林',
            '乌萨斯IO79',
            '自由//失效',
            '惬意'
        ]
        if (brand == 'CROSSOVER' && !crossoverSkinsThatAreFashion.includes(displaySkin.skinName)) return

        let price = 0
        if (displaySkin.obtainApproach == '采购中心') {
            price = 18
            if (value.dynIllustId) price = 21
            if (value.dynEntranceId) price = 24
        }

        if (displaySkin.skinName == '惬意') price = 18

        if (price !== 18) return
        if (edition == 0) return
        if (edition > fashionNumber) return

        if (year !== lastYear) {
            //planner-brand-template
            const templateYear = document.getElementById('planner-brand-template');
            const cloneYear = templateYear.content.cloneNode(true);

            if (counter > 0) {
                cloneYear.querySelector('.break').style.outline = '1px dashed #ffffff38'
                cloneYear.querySelector('.break').style.margin = '15px 0'
            }
            counter++
            cloneYear.querySelector(".planner-brand-name").remove() //.textContent = "eventSkin.name"
            cloneYear.querySelector(".planner-brand-type").innerHTML = 'Year ' + (year - 2019) + '<br>' + year
            cloneYear.querySelector(".planner-brand-image").remove()
            //clone.querySelector(".planner-brand-image").src = `static/img/brands/${eventSkin.name}.png`
            cloneYear.querySelector('.planner-brand').style.setProperty('--bg-url', `url('')` /* `url('${bgLink2}.jpg')`*/)

            cloneYear.querySelector(".planner-brand").setAttribute('data-event', event.code)



            cloneYear.querySelector(".break").setAttribute('data-event', event.code)
            document.getElementById("container-of-skins").appendChild(cloneYear)
        }

        lastYear = year

        const skinName = displaySkin.skinName

        if (skinName == '守岁人') console.log(value)
        const plannerId = data.skinsData.plannerIdMap[skinName]
        const colors = getColorList(displaySkin.colorList)
        const darkColors = colors.map(color => setLightness(color, 0.10, 0.80));
        const gradientDirection = "to right" // "45deg"
        const modelNameEnglish = displaySkin.modelName
        const charObject = getCharObject(modelNameEnglish.toLowerCase(), data.charData)
        const brandCN = data.skinsData.cnData.brandList[skinGroupId?.split('#')[1]]?.brandName || '合作款'

        fashionReviewArray.push(`◆r【${brandCN.trim()}】系列 - ${skinName} - ${charObject.name}`)
        console.log("fashionReviewArray", fashionReviewArray)

        const template = document.getElementById('planner-skin-template');
        const clone = template.content.cloneNode(true);

        // ────────✦───────✦───────✦────────✦────────✦────────✦────────✦────────✦────────
        // Copypasted from renderPlannerSkin, quick fix for now. merge both in the future
        // ────────✦───────✦───────✦────────✦────────✦────────✦────────✦────────✦────────

        clone.querySelector('label').setAttribute('data-event', event.code)
        clone.querySelector('label').setAttribute('data-model', modelNameEnglish)
        clone.querySelector('label').setAttribute('data-eventName', event.nameEnglish)
        clone.querySelector('label').style.border = '0px solid'
        clone.querySelector('label').style.borderRadius = '10px'
        clone.querySelector('label').style.borderImage = `linear-gradient(${gradientDirection}, ${colors.join(', ')}) 1`
        clone.querySelector('label').setAttribute('data-price', NO_EFFECT_SKINS.includes(plannerId) ? '15' : data.skinsData.costMap[skinName])
        clone.querySelector('input').setAttribute('data-plannerId', plannerId)
        clone.querySelector('input').id = event.code + '-' + plannerId
        clone.querySelector('.skin-name.mandarin').textContent = skinName
        //clone.querySelector('.model-name.mandarin').textContent = modelName
        clone.querySelector('.model-name.english').textContent = modelNameEnglish
        clone.querySelector('.model-name.english').style.padding = '0'
        clone.querySelector('.model-name.english').style.color = '#fff'
        clone.querySelector('.model-name.english').style.border = '0px' // Image = `linear-gradient(to right, ${colors.join(', ')}) 1`
        clone.querySelector('.model-name.english').style.background = 'hsla(0, 0%, 0%, 0.75)'
        clone.querySelector('.planner-id').textContent = plannerId

        //clone.querySelector('.skin-portrait').style.position = 'relative'
        //clone.querySelector('.skin-portrait').style.transform = 'translateY(-20px)'
        const skinPortrait = clone.querySelector('.skin-portrait');

        if (skinPortrait) {
            skinPortrait.classList.remove('skin-portrait');
            skinPortrait.classList.add('skin-icon');
        }
        clone.querySelector('.skin-icon').alt = SKIN_ICON_REPOSITORY(plannerId)

        clone.querySelector('.planner-skin-event-code').textContent = event.code
        clone.querySelector('.skin-price').textContent = price
        clone.querySelector('.skin-price').style.background = `linear-gradient(${gradientDirection}, ${darkColors.slice(0, 2).join(', ')})`
        clone.querySelector('.skin-inspect').style.background = `linear-gradient(${gradientDirection}, ${darkColors.slice(-2).join(', ')})`


        clone.querySelector('.planner-skin-name-canvas').remove()
        //clone.querySelector('.planner-skin-name-canvas').style.bottom = '-9px'
        //clone.querySelector('.planner-skin-name-canvas').style.opacity = '0.8'
        clone.querySelector('button').onclick = () => {
            showSection('viewer')
            viewer(plannerId, skinName, data.skinsData, data.charData, edition);
            lastSection = 'planner'
        }

        const eventSkin = {
            width: 180,
            height: 360,
            colors: colors
        }

        drawSkinBackground(clone.querySelector('canvas'), eventSkin)
        //drawSkinBottomBackground(clone.querySelector('.planner-skin-name-canvas'), eventSkin)



        document.getElementById("container-of-skins").appendChild(clone);

    });
}

function renderBrandLogos(index, eventSkin, event) {
    const template = document.getElementById('planner-brand-template');
    const clone = template.content.cloneNode(true);
    const bgLink = `https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/event-bg/${event.code}`
    const bgLink2 = `https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/events/${event.code}`
    const outfitAmount = eventSkin.isMultiple ? "outfits" : "outfit";

    clone.querySelector(".planner-brand-name").textContent = eventSkin.name
    clone.querySelector(".planner-brand-type").innerHTML = eventSkin.isRerun ? `rerun <br> ${outfitAmount}` : `new <br> ${outfitAmount}`
    clone.querySelector(".planner-brand-image").src = `static/img/brands/${eventSkin.name}.png`
    clone.querySelector('.planner-brand').style.setProperty('--bg-url', `url('')` /* `url('${bgLink2}.jpg')`*/)

    clone.querySelector(".planner-brand").setAttribute('data-event', event.code)



    clone.querySelector(".break").setAttribute('data-event', event.code)

    let nextBrand = null;
    let i = index > 0 ? index - 1 : 0;

    while (i < event.skins.length) {
        if (event.skins[i].isBrand) {
            nextBrand = event.skins[i];
            break;
        }
        i--;
    }

    if (nextBrand !== null) {
        if (!eventSkin.isMultiple && !nextBrand.isMultiple && eventSkin.name !== nextBrand.name) {
            clone.querySelector(".break").remove()
        }
    }

    document.getElementById('container-of-skins').append(clone)
}
